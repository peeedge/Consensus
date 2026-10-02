/**
 * End-to-end smoke test: plays a full round in a real browser, checks the
 * numbers add up, exercises persistence, the archive, How to play and the
 * mobile layout, and fails on any console error.
 *
 * Usage: start the dev server, then `npm run smoke`.
 * Screenshots land in `screenshots/`.
 */

import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from 'playwright';

const BASE_URL = process.env.SMOKE_URL ?? 'http://localhost:5173/';
const SHOTS = path.resolve('screenshots');
/** Falls back to an installed Chromium when no Playwright build is present. */
const CHANNEL = process.env.SMOKE_CHANNEL ?? 'msedge';

const problems = [];
const notes = [];

function check(condition, message) {
  if (condition) {
    notes.push(`  ok   ${message}`);
  } else {
    problems.push(`  FAIL ${message}`);
  }
  return condition;
}

async function shoot(page, name, fullPage = true) {
  const file = path.join(SHOTS, `${name}.png`);
  await page.screenshot({ path: file, fullPage });
  return file;
}

async function guess(page, text) {
  await page.fill('#guess', text);
  await page.press('#guess', 'Enter');
  await page.waitForTimeout(220);
  // The input unmounts on the guess that ends the round, so there may be no
  // feedback line left to read.
  if ((await page.locator('#guess-feedback').count()) === 0) return '';
  return (await page.locator('#guess-feedback').innerText()).replace(/\s+/g, ' ').trim();
}

async function hasHorizontalOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && (rect.right > doc.clientWidth + 1 || rect.left < -1)) {
        offenders.push(`${el.tagName.toLowerCase()}.${el.className || '(no class)'}`);
      }
    }
    return {
      scrolls: doc.scrollWidth > doc.clientWidth + 1,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      offenders: offenders.slice(0, 8),
    };
  });
}

async function run() {
  await rm(SHOTS, { recursive: true, force: true });
  await mkdir(SHOTS, { recursive: true });

  const browser = await chromium.launch(CHANNEL === 'bundled' ? {} : { channel: CHANNEL });
  const context = await browser.newContext({ viewport: { width: 1280, height: 960 } });
  context.setDefaultTimeout(10_000);
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      consoleErrors.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`));

  // ---- 1. Initial load ----
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.question__prompt');
  const question = await page.locator('.question__prompt').innerText();
  check(question.length > 10, `question renders: "${question}"`);
  check(
    (await page.locator('.board__row').count()) >= 6,
    `board renders ${await page.locator('.board__row').count()} rows`,
  );
  await shoot(page, '01-desktop-start');

  // ---- 2. Play a round ----
  // Today's board: keys 27, phone 21, the remote 18, glasses 12, socks 9,
  // chapstick 7, phone charger 6. Three misses end the round; hits are free.
  const missesLeft = () => page.locator('#guess-help').innerText();

  const feedback1 = await guess(page, 'keys');
  check(/on the board/i.test(feedback1), `hit on "keys" -> ${feedback1}`);
  check(
    (await missesLeft()).includes('3 misses left'),
    'a correct answer does not spend a miss',
  );
  await shoot(page, '02-desktop-first-reveal');

  const feedback2 = await guess(page, 'my phone');
  check(
    /on the board\./i.test(feedback2) && !/not on/i.test(feedback2),
    `hit on "my phone" -> ${feedback2}`,
  );

  const feedback3 = await guess(page, 'banana');
  check(/not on the board/i.test(feedback3), `miss on "banana" -> ${feedback3}`);
  check((await missesLeft()).includes('2 misses left'), 'a miss is counted');

  const feedback4 = await guess(page, 'tv remote');
  check(!/not on/i.test(feedback4), `hit on "tv remote" -> ${feedback4}`);

  await guess(page, 'sunglasses');
  check((await missesLeft()).includes('One miss left'), 'the counter reaches "One miss left"');
  check(
    (await page.locator('.miss-track__mark--spent').count()) === 2,
    'the miss track shows two spent marks',
  );

  // A fifth guess would have ended the old five-guess round; here play goes on.
  const feedback6 = await guess(page, 'socks');
  check(!/not on/i.test(feedback6), `still playing on guess six -> ${feedback6}`);

  await guess(page, 'helicopter');
  await page.waitForSelector('.complete', { timeout: 3000 });
  check(true, 'round ends on the third miss');

  // ---- 3. Summary numbers ----
  const figures = await page.locator('.complete__figure').allInnerTexts();
  check(figures[0]?.trim() === '270', `score is 270 (saw "${figures[0]?.trim()}")`);
  check(/4\s*of\s*7/.test(figures[1] ?? ''), `found 4 of 7 (saw "${figures[1]?.replace(/\s+/g, ' ')}")`);
  check(/^75/.test(figures[2]?.trim() ?? ''), `consensus is 75% (saw "${figures[2]?.trim()}")`);
  const ceiling = await page.locator('.complete__caption').first().innerText();
  check(ceiling.includes('345'), `the ceiling is the whole board, 345 (saw "${ceiling}")`);

  const shareMarks = await page.locator('.share__mark').count();
  check(shareMarks === 7, `share card has one mark per guess, 7 (saw ${shareMarks})`);
  const shareTotal = await page.locator('.share__total').innerText();
  check(shareTotal.includes('270'), `share total says 270 (saw "${shareTotal}")`);
  const shareText = await page.locator('.share__card').innerText();
  check(
    !/keys|phone|remote/i.test(shareText),
    'share card does not leak any answer text',
  );
  const countdown = await page.locator('.complete__clock').innerText();
  check(/^\d+:\d{2}:\d{2}$/.test(countdown), `countdown renders (saw "${countdown}")`);
  check(
    (await page.locator('.board__row--disclosed').count()) === 3,
    'unfound answers are disclosed at the end',
  );
  await shoot(page, '03-desktop-complete');

  // ---- 4. Persistence ----
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.complete');
  const afterReload = await page.locator('.complete__figure').first().innerText();
  check(afterReload.trim() === '270', `score survives a reload (saw "${afterReload.trim()}")`);
  check(
    (await page.locator('#guess').count()) === 0,
    'the input is gone once the round is over',
  );
  const streak = await page.locator('.masthead__streak-value').innerText();
  check(streak.includes('1 day'), `streak starts at 1 day (saw "${streak}")`);

  // ---- 5. Archive ----
  await page.click('a[href="#/archive"]');
  await page.waitForSelector('.archive__list');
  const archiveCount = await page.locator('.archive__item').count();
  check(archiveCount >= 20, `archive lists ${archiveCount} past editions`);
  check(
    (await page.locator('.archive__score--locked').count()) === archiveCount,
    'every unplayed archive entry reads "Not started"',
  );
  await shoot(page, '04-desktop-archive');

  await page.locator('.archive__link').first().click();
  await page.waitForSelector('.question__prompt');
  check(
    (await page.locator('.board__row--visible').count()) === 0,
    'an archive puzzle opens with a blank board',
  );
  check((await page.locator('#guess').count()) === 1, 'an archive puzzle is playable');
  const archiveFeedback = await guess(page, 'zzzz nonsense');
  check(/not on the board/i.test(archiveFeedback), 'archive puzzles accept guesses');

  // ---- 6. How to play ----
  await page.click('a[href="#/how-to-play"]');
  await page.waitForSelector('.how');
  check((await page.locator('.how__point').count()) === 8, 'scoring table lists 8 positions');
  await page.locator('#reduce-motion').check();
  check(await page.locator('#reduce-motion').isChecked(), 'reduce-motion toggles on');
  check(
    (await page.getAttribute('html', 'data-reduce-motion')) === 'true',
    'reduce-motion reaches the document',
  );
  await page.locator('#reduce-motion').uncheck();
  await shoot(page, '05-desktop-how-to-play');

  // ---- 7. Keyboard focus ----
  await page.click('a[href="#/"]');
  await page.waitForSelector('.question__prompt');
  await page.evaluate(() => document.body.focus());
  const focusReport = [];
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        label: (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 28),
        outline: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
        boxShadow: style.boxShadow !== 'none',
      };
    });
    if (info) focusReport.push(info);
  }
  const unfocusable = focusReport.filter((item) => !item.outline && !item.boxShadow);
  check(
    unfocusable.length === 0,
    `every tab stop has a visible focus ring (${focusReport.length} checked)`,
  );
  if (unfocusable.length > 0) {
    problems.push(`       no indicator on: ${unfocusable.map((i) => `${i.tag} "${i.label}"`).join(', ')}`);
  }

  // ---- 8. Mobile ----
  const phone = await browser.newContext({
    ...devices['iPhone 13'],
    hasTouch: true,
  });
  const mobile = await phone.newPage();
  mobile.on('pageerror', (error) => consoleErrors.push(`mobile pageerror: ${error.message}`));
  await mobile.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await mobile.waitForSelector('.question__prompt');

  const overflowStart = await hasHorizontalOverflow(mobile);
  check(
    !overflowStart.scrolls,
    `no horizontal scroll on mobile (${overflowStart.scrollWidth} vs ${overflowStart.clientWidth})`,
  );
  if (overflowStart.offenders.length > 0) {
    problems.push(`       wide elements: ${overflowStart.offenders.join(', ')}`);
  }

  const inputBox = await mobile.locator('#guess').boundingBox();
  check((inputBox?.height ?? 0) >= 44, `answer input is ${Math.round(inputBox?.height ?? 0)}px tall`);
  const submitBox = await mobile.locator('.answer-input .button').boundingBox();
  check((submitBox?.height ?? 0) >= 44, `submit button is ${Math.round(submitBox?.height ?? 0)}px tall`);
  const navBox = await mobile.locator('.masthead__link').first().boundingBox();
  check((navBox?.height ?? 0) >= 40, `nav links are ${Math.round(navBox?.height ?? 0)}px tall`);
  const questionSize = await mobile.evaluate(
    () => parseFloat(getComputedStyle(document.querySelector('.question__prompt')).fontSize),
  );
  check(questionSize >= 28, `question is ${questionSize}px on mobile`);
  await shoot(mobile, '06-mobile-start');

  for (const term of ['keys', 'remote', 'glasses', 'socks', 'chapstick']) {
    await mobile.fill('#guess', term);
    await mobile.press('#guess', 'Enter');
    await mobile.waitForTimeout(150);
  }
  await mobile.waitForSelector('.complete');
  const overflowEnd = await hasHorizontalOverflow(mobile);
  check(!overflowEnd.scrolls, 'no horizontal scroll on the mobile summary');
  await shoot(mobile, '07-mobile-complete');

  // ---- 9. Console cleanliness ----
  check(
    consoleErrors.length === 0,
    `console is clean (${consoleErrors.length} messages)`,
  );
  consoleErrors.forEach((entry) => problems.push(`       ${entry}`));

  await browser.close();

  console.log('\nConsensus smoke test\n');
  console.log(notes.join('\n'));
  if (problems.length > 0) {
    console.log('\nProblems:');
    console.log(problems.join('\n'));
    console.log(`\n${problems.length} problem(s).`);
    process.exitCode = 1;
  } else {
    console.log('\nAll checks passed.');
  }
  console.log(`\nScreenshots: ${SHOTS}`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
