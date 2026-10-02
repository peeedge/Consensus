/**
 * One command to get Consensus running.
 *
 * Checks the Node version, installs dependencies only when they are missing or
 * out of date, then starts the dev server.
 *
 *   node scripts/bootstrap.mjs            install if needed, then `npm run dev`
 *   node scripts/bootstrap.mjs --check    also typecheck and run the unit tests
 *   node scripts/bootstrap.mjs --build    build and preview instead of dev
 *   node scripts/bootstrap.mjs --no-open  do not open a browser
 *   node scripts/bootstrap.mjs --install  install and stop
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCKFILE = path.join(ROOT, 'package-lock.json');
const MODULES = path.join(ROOT, 'node_modules');
/** Records which lockfile the current `node_modules` was installed from. */
const STAMP = path.join(MODULES, '.consensus-bootstrap');

// npm is a .cmd shim on Windows, which Node will not spawn without a shell.
const NPM = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const USE_SHELL = process.platform === 'win32';

const args = new Set(process.argv.slice(2));
const flags = {
  help: args.has('--help') || args.has('-h'),
  check: args.has('--check'),
  build: args.has('--build'),
  installOnly: args.has('--install'),
  open: !args.has('--no-open'),
};

const style = {
  dim: (text) => `\u001b[2m${text}\u001b[0m`,
  bold: (text) => `\u001b[1m${text}\u001b[0m`,
  green: (text) => `\u001b[32m${text}\u001b[0m`,
  red: (text) => `\u001b[31m${text}\u001b[0m`,
};

function step(message) {
  console.log(`\n${style.bold('›')} ${message}`);
}

function ok(message) {
  console.log(`  ${style.green('✓')} ${message}`);
}

function fail(message, hint) {
  console.error(`\n${style.red('✗')} ${message}`);
  if (hint) console.error(`  ${style.dim(hint)}`);
  process.exit(1);
}

function run(args, { label }) {
  const result = spawnSync(NPM, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: USE_SHELL,
  });

  if (result.error) {
    fail(`Could not run \`npm ${args.join(' ')}\`.`, result.error.message);
  }
  // A dev server stopped with Ctrl+C is a normal exit, not a failure.
  if (result.signal === 'SIGINT' || result.signal === 'SIGTERM') {
    process.exit(0);
  }
  if (result.status !== 0) {
    fail(`${label} failed.`, `\`npm ${args.join(' ')}\` exited with code ${result.status}.`);
  }
  return result;
}

function readRequiredNodeRange() {
  const require = createRequire(import.meta.url);
  return require(path.join(ROOT, 'package.json')).engines?.node ?? '>=22.12.0';
}

/** Compares against the lowest version in a `>=x.y.z` style range. */
function checkNodeVersion() {
  const range = readRequiredNodeRange();
  const minimum = range.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!minimum) return;

  const required = minimum.slice(1, 4).map(Number);
  const current = process.versions.node.split('.').map(Number);

  for (let i = 0; i < 3; i += 1) {
    if (current[i] > required[i]) break;
    if (current[i] < required[i]) {
      fail(
        `Node ${process.versions.node} is too old — Consensus needs ${range}.`,
        'Install a newer Node from https://nodejs.org and run this again.',
      );
    }
  }

  ok(`Node ${process.versions.node}`);
}

function lockfileHash() {
  if (!existsSync(LOCKFILE)) return null;
  return createHash('sha256').update(readFileSync(LOCKFILE)).digest('hex');
}

function installIfNeeded() {
  const hash = lockfileHash();
  const installed = existsSync(MODULES);
  const stamped = existsSync(STAMP) ? readFileSync(STAMP, 'utf8').trim() : null;

  if (installed && hash && stamped === hash) {
    ok('Dependencies are up to date');
    return;
  }

  // `npm ci` is the reproducible choice, but it deletes node_modules first,
  // which fails on Windows if a dev server still holds a native binding open.
  // Only use it for a clean tree; otherwise `npm install` reconciles in place.
  let command;
  if (!installed) {
    console.log(`  ${style.dim('No node_modules yet — installing from the lockfile.')}`);
    command = hash ? ['ci'] : ['install'];
  } else if (stamped === null) {
    console.log(`  ${style.dim('First run here — checking the existing install.')}`);
    command = ['install'];
  } else {
    console.log(`  ${style.dim('package-lock.json has changed — updating.')}`);
    command = ['install'];
  }

  run(command, { label: 'Dependency install' });

  // Re-read the lockfile: `npm install` may have rewritten it, and stamping the
  // pre-install hash would make every later run think it was out of date.
  const settled = lockfileHash();
  if (settled) writeFileSync(STAMP, settled);
  ok('Dependencies installed');
}

function printHelp() {
  console.log(`
${style.bold('Consensus — bootstrap')}

  node scripts/bootstrap.mjs [options]

  ${style.bold('--check')}     typecheck and run the unit tests before starting
  ${style.bold('--build')}     build for production and preview it, instead of the dev server
  ${style.bold('--install')}   install dependencies and stop
  ${style.bold('--no-open')}   do not open a browser
  ${style.bold('--help')}      show this
`);
}

function main() {
  if (flags.help) {
    printHelp();
    return;
  }

  console.log(style.bold('\nConsensus'));
  console.log(style.dim('A daily survey puzzle. Setting up…'));

  step('Checking your toolchain');
  checkNodeVersion();

  step('Checking dependencies');
  installIfNeeded();

  if (flags.installOnly) {
    console.log(`\n${style.green('Ready.')} Start it with ${style.bold('npm start')}.\n`);
    return;
  }

  if (flags.check) {
    step('Typechecking');
    run(['run', 'typecheck'], { label: 'Typecheck' });
    ok('No type errors');

    step('Running unit tests');
    run(['test'], { label: 'Unit tests' });
    ok('Tests passed');
  }

  if (flags.build) {
    step('Building for production');
    run(['run', 'build'], { label: 'Build' });
    ok('Built to dist/');

    step('Serving the production build');
    console.log(style.dim('  Press Ctrl+C to stop.\n'));
    run(['run', 'preview', '--', ...(flags.open ? ['--open'] : [])], { label: 'Preview server' });
    return;
  }

  step('Starting the dev server');
  console.log(style.dim('  Press Ctrl+C to stop.\n'));
  run(['run', 'dev', '--', ...(flags.open ? ['--open'] : [])], { label: 'Dev server' });
}

main();
