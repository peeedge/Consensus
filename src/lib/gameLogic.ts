/**
 * Pure game rules. Nothing here touches React, storage or the DOM, so the whole
 * rule set can be reasoned about (and tested) on its own.
 */

import { matchGuess } from './answerMatching';
import type {
  GameSummary,
  GuessRecord,
  Puzzle,
  PuzzleProgress,
} from './types';

/** Guesses allowed per puzzle. Repeats and empty input never cost a guess. */
export const GUESS_LIMIT = 5;

/** Points by board position, rewarding reading the crowd over merely being valid. */
export const POSITION_POINTS = [100, 80, 60, 45, 30, 20, 10, 5] as const;

/** The most anyone can score: the five highest-value positions. */
export const MAX_SCORE = POSITION_POINTS.slice(0, GUESS_LIMIT).reduce(
  (total, points) => total + points,
  0,
);

export function pointsForPosition(index: number): number {
  return POSITION_POINTS[index] ?? 0;
}

export function createProgress(puzzleId: string): PuzzleProgress {
  return {
    puzzleId,
    revealed: [],
    guesses: [],
    status: 'in-progress',
    completedAt: null,
  };
}

export function guessesUsed(progress: PuzzleProgress): number {
  return progress.guesses.length;
}

export function guessesRemaining(progress: PuzzleProgress): number {
  return Math.max(0, GUESS_LIMIT - guessesUsed(progress));
}

export function scoreOf(progress: PuzzleProgress): number {
  return progress.revealed.reduce((total, index) => total + pointsForPosition(index), 0);
}

export function consensusPercentOf(puzzle: Puzzle, progress: PuzzleProgress): number {
  return progress.revealed.reduce(
    (total, index) => total + (puzzle.answers[index]?.percentage ?? 0),
    0,
  );
}

/** The ceiling a player can still reach for, used to end the game early when moot. */
function allAnswersFound(puzzle: Puzzle, progress: PuzzleProgress): boolean {
  return progress.revealed.length >= puzzle.answers.length;
}

export type SubmitResult =
  | { kind: 'hit'; answerIndex: number; points: number; progress: PuzzleProgress }
  | { kind: 'miss'; progress: PuzzleProgress }
  | { kind: 'duplicate'; answerIndex: number; progress: PuzzleProgress }
  | { kind: 'empty'; progress: PuzzleProgress }
  | { kind: 'finished'; progress: PuzzleProgress };

/**
 * Applies one guess and returns the next progress value. Always returns a new
 * object on a state change so React sees the update.
 */
export function submitGuess(
  puzzle: Puzzle,
  progress: PuzzleProgress,
  rawGuess: string,
  now: number = Date.now(),
): SubmitResult {
  if (progress.status === 'complete') {
    return { kind: 'finished', progress };
  }

  const trimmed = rawGuess.trim();
  if (!trimmed) {
    return { kind: 'empty', progress };
  }

  const match = matchGuess(puzzle, trimmed);

  // Finding the same answer twice is a slip, not a wrong answer: it costs nothing.
  if (match && progress.revealed.includes(match.answerIndex)) {
    return { kind: 'duplicate', answerIndex: match.answerIndex, progress };
  }

  const guess: GuessRecord = match
    ? {
        raw: trimmed,
        outcome: 'hit',
        answerIndex: match.answerIndex,
        matchedTerm: match.matchedTerm,
        matchedVia: match.strategy,
      }
    : {
        raw: trimmed,
        outcome: 'miss',
        answerIndex: null,
        matchedTerm: null,
        matchedVia: null,
      };

  const revealed = match ? [...progress.revealed, match.answerIndex] : progress.revealed;
  const guesses = [...progress.guesses, guess];

  const next: PuzzleProgress = {
    ...progress,
    revealed,
    guesses,
    status: 'in-progress',
    completedAt: null,
  };

  const exhausted = guesses.length >= GUESS_LIMIT;
  if (exhausted || allAnswersFound(puzzle, next)) {
    next.status = 'complete';
    next.completedAt = now;
  }

  if (match) {
    return {
      kind: 'hit',
      answerIndex: match.answerIndex,
      points: pointsForPosition(match.answerIndex),
      progress: next,
    };
  }
  return { kind: 'miss', progress: next };
}

/** Ends the game early at the player's request. */
export function concede(progress: PuzzleProgress, now: number = Date.now()): PuzzleProgress {
  if (progress.status === 'complete') return progress;
  return { ...progress, status: 'complete', completedAt: now };
}

/** Closing line, keyed off how much of the crowd the player actually captured. */
export function performanceMessage(consensusPercent: number, found: number): string {
  if (found === 0) return 'The crowd went somewhere you did not.';
  if (consensusPercent >= 80) return 'You are the consensus.';
  if (consensusPercent >= 65) return 'Unusually well calibrated.';
  if (consensusPercent >= 50) return 'You read the room.';
  if (consensusPercent >= 35) return 'Comfortably in the majority.';
  if (consensusPercent >= 20) return 'A few steps off the centre.';
  return 'You think for yourself.';
}

export function summarize(puzzle: Puzzle, progress: PuzzleProgress): GameSummary {
  const consensusPercent = consensusPercentOf(puzzle, progress);
  const found = progress.revealed.length;

  return {
    score: scoreOf(progress),
    maxScore: MAX_SCORE,
    found,
    total: puzzle.answers.length,
    consensusPercent,
    guessesUsed: guessesUsed(progress),
    guessesAllowed: GUESS_LIMIT,
    message: performanceMessage(consensusPercent, found),
  };
}

/** Repairs progress loaded from storage so a data change can never crash the UI. */
export function reconcileProgress(
  puzzle: Puzzle,
  progress: PuzzleProgress | undefined,
): PuzzleProgress {
  if (!progress || progress.puzzleId !== puzzle.id) {
    return createProgress(puzzle.id);
  }

  const seen = new Set<number>();
  const revealed = progress.revealed.filter((index) => {
    const valid = Number.isInteger(index) && index >= 0 && index < puzzle.answers.length;
    if (!valid || seen.has(index)) return false;
    seen.add(index);
    return true;
  });

  const guesses = progress.guesses.slice(0, GUESS_LIMIT);

  return {
    puzzleId: puzzle.id,
    revealed,
    guesses,
    status: progress.status === 'complete' ? 'complete' : 'in-progress',
    completedAt: progress.completedAt ?? null,
  };
}
