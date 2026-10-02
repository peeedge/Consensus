/**
 * The seam between the app and its puzzle source.
 *
 * Today everything resolves synchronously from the local `PUZZLES` array, but
 * the functions are the only place that knows that. Pointing Consensus at an
 * API or database means reimplementing this module (returning promises) and
 * leaving the components untouched.
 */

import { daysBetween, isValidDateKey, todayKey } from '../lib/dateUtils';
import type { ScheduledPuzzle } from '../lib/types';
import { PUZZLES, PUZZLE_EPOCH } from './puzzles';

if (import.meta.env.DEV) {
  PUZZLES.forEach((puzzle, index) => {
    const total = puzzle.answers.reduce((sum, answer) => sum + answer.percentage, 0);
    if (total !== 100) {
      console.warn(`Puzzle "${puzzle.id}" percentages sum to ${total}, expected 100.`);
    }
    if (puzzle.answers.length < 6 || puzzle.answers.length > 8) {
      console.warn(`Puzzle "${puzzle.id}" has ${puzzle.answers.length} answers, expected 6-8.`);
    }
    const descending = puzzle.answers.every(
      (answer, i) => i === 0 || answer.percentage <= puzzle.answers[i - 1].percentage,
    );
    if (!descending) {
      console.warn(`Puzzle "${puzzle.id}" answers are not ordered most-popular first.`);
    }
    if (daysBetween(PUZZLE_EPOCH, puzzle.date) !== index) {
      console.warn(`Puzzle "${puzzle.id}" date ${puzzle.date} does not match its position.`);
    }
  });
}

/** Edition number shown to the player, e.g. "Consensus #24". Starts at 1. */
export function editionNumberFor(dateKey: string): number {
  return Math.max(1, daysBetween(PUZZLE_EPOCH, dateKey) + 1);
}

/**
 * Resolves a calendar date to an edition. Dates beyond the end of the
 * catalogue cycle back through it, so the game never runs dry in the prototype
 * while edition numbers keep counting up.
 */
export function getPuzzleForDate(dateKey: string): ScheduledPuzzle {
  const offset = daysBetween(PUZZLE_EPOCH, dateKey);
  const count = PUZZLES.length;
  const index = ((offset % count) + count) % count;
  const puzzle = PUZZLES[index];

  return {
    ...puzzle,
    number: editionNumberFor(dateKey),
    servedDate: dateKey,
  };
}

export function getTodaysPuzzle(now: Date = new Date()): ScheduledPuzzle {
  return getPuzzleForDate(todayKey(now));
}

/** Every past edition the player could already have seen, newest first. */
export function getArchive(now: Date = new Date()): ScheduledPuzzle[] {
  const elapsed = daysBetween(PUZZLE_EPOCH, todayKey(now));
  if (elapsed <= 0) return [];

  const todaysId = getTodaysPuzzle(now).id;
  const newest = Math.min(elapsed, PUZZLES.length) - 1;

  const archive: ScheduledPuzzle[] = [];
  for (let index = newest; index >= 0; index -= 1) {
    const puzzle = PUZZLES[index];
    if (puzzle.id === todaysId) continue;
    archive.push({ ...puzzle, number: index + 1, servedDate: puzzle.date });
  }
  return archive;
}

/** Looks up a specific edition by puzzle id, for deep links into the archive. */
export function getPuzzleById(id: string, now: Date = new Date()): ScheduledPuzzle | null {
  const index = PUZZLES.findIndex((puzzle) => puzzle.id === id);
  if (index === -1) return null;

  const today = getTodaysPuzzle(now);
  if (today.id === id) return today;

  return {
    ...PUZZLES[index],
    number: index + 1,
    servedDate: PUZZLES[index].date,
  };
}

export function getPuzzleCount(): number {
  return PUZZLES.length;
}

export { isValidDateKey };
