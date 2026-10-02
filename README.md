# Consensus

A daily survey puzzle. One question goes out to a hypothetical survey of 100
people; six to eight responses make the board. Correct guesses are free; three
incorrect ones end the round. The aim is to predict the crowd — starting with
the most popular answers.

The question is never *what is true*, it is *what would everyone else say*.

## Running it

One command, from a fresh clone:

```bat
bootstrap.bat          :: Windows - also works by double-clicking it
```

```powershell
.\bootstrap.ps1        # Windows, from PowerShell
```

```bash
./bootstrap.sh         # macOS and Linux
```

```bash
npm start              # anywhere, if you already have Node
```

They all do the same thing: check your Node version, install dependencies only
if they are missing or out of date, then start the dev server and open it. Add
`--check` to typecheck and run the unit tests first, `--build` to build and
preview the production bundle instead, or `--help` for the rest.

`bootstrap.bat` is a thin wrapper around `bootstrap.ps1` for people who would
rather not touch PowerShell. It bypasses the execution policy so a locked-down
machine cannot block it, and holds the window open on failure so a double-click
that goes wrong is readable instead of vanishing.

Consensus needs **Node 22.12 or newer**; the bootstrap says so plainly rather
than failing halfway through an install.

### Everything else

| Script | What it does |
| --- | --- |
| `npm start` | Bootstrap: install if needed, then run the dev server |
| `npm run dev` | Vite dev server on http://localhost:5173 |
| `npm run build` | Typecheck, then build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests for matching, scoring, dates and streaks |
| `npm run smoke` | Plays a full round in a real browser against a running dev server |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc` with no emit |

`npm run smoke` drives Microsoft Edge by default because it ships with Windows.
Set `SMOKE_CHANNEL=chrome`, or `SMOKE_CHANNEL=bundled` after
`npx playwright install chromium`, to use something else. Screenshots are
written to `screenshots/`.

## How the code is laid out

```
src/
  lib/            pure logic, no React
    types.ts          the domain model
    answerMatching.ts how a typed guess resolves to a board answer
    gameLogic.ts      guesses, scoring, round completion
    storage.ts        localStorage persistence and streaks
    dateUtils.ts      local-calendar date handling
    share.ts          spoiler-free result text
  data/
    puzzles.ts            the puzzle catalogue
    puzzleRepository.ts   the seam between the app and its puzzle source
  state/          app-wide persisted state
  hooks/          countdown, hash routing
  components/     the UI
  styles/         design tokens and component styles
scripts/
  bootstrap.mjs   one-command local setup
  smoke-test.mjs  plays a full round in a real browser
```

Everything under `lib/` is free of React and the DOM, so the rules can be read
and tested on their own. `npm test` covers them directly.

### Answer matching

Players should not have to type a canonical string. A guess is run through four
stages, strictest first, and the stage that accepted it is recorded so the
behaviour stays inspectable:

1. **exact** — identical once lowercased, de-punctuated, de-accented, stripped
   of articles and singularised (`"My Phone-Chargers!"` → `phone charger`)
2. **compact** — identical with spaces removed (`sun glasses` → `sunglasses`)
3. **contains** — the guess contains every word of the answer plus a little
   context (`cell phone charger` → `phone charger`), but a bare `phone` will
   never stand in for a two-word answer
4. **fuzzy** — a bounded Damerau-Levenshtein distance that scales with word
   length, to forgive typos (`sunscreem` → `sunscreen`)

There is no model or API involved: the same guess always resolves the same way.
A test asserts that every canonical answer and alias in the catalogue resolves
back to its own answer, and that no term is ever claimed by two answers on the
same board.

### Puzzle scheduling

Puzzles carry explicit dates, running one per day from `PUZZLE_EPOCH`. Dates past
the end of the catalogue cycle back through it so the prototype never runs dry,
while the edition number keeps counting up. Rollover happens at *local*
midnight, and the app re-checks on window focus so a machine waking from sleep
still lands on the right day.

### Replacing the data source

`data/puzzleRepository.ts` is the only module that knows puzzles come from a
local array. Pointing Consensus at a database or an API means reimplementing
that module's functions to return promises; nothing in `components/` reads the
catalogue directly.

## Scoring

Board position is worth 100, 80, 60, 45, 30, 20, 10 and 5 points. Clearing the
whole board is a perfect round. Alongside the score the game reports your
*consensus*: the share of the 100 responses your answers account for. Four
modest answers can be worth less than one everybody gave.

Only a miss spends one of the three strikes. Finding an answer, naming one you
already have, or submitting an empty field costs nothing.

## Persistence

Progress, scores, the streak and settings live in `localStorage` under one
versioned key. Reads are defensive — a corrupt or outdated payload degrades to a
fresh state rather than throwing — and storage being unavailable (private
browsing, blocked cookies) is tolerated silently.

Only the day's puzzle affects the streak. Archive puzzles are there to play at
your leisure.

## A note on the survey figures

The percentages are written for the puzzle. They are not collected from real
respondents, and the game says so in its footer.
