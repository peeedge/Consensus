import { describe, expect, it } from 'vitest';

import { PUZZLES } from '../data/puzzles';
import {
  GUESS_LIMIT,
  MAX_SCORE,
  createProgress,
  reconcileProgress,
  submitGuess,
  summarize,
} from './gameLogic';
import type { Puzzle, PuzzleProgress } from './types';

const vacation = PUZZLES.find((entry) => entry.id === 'vacation-forget') as Puzzle;

function play(guesses: string[]): PuzzleProgress {
  return guesses.reduce(
    (progress, guess) => submitGuess(vacation, progress, guess).progress,
    createProgress(vacation.id),
  );
}

describe('submitGuess', () => {
  it('reveals a matched answer and awards its position points', () => {
    const result = submitGuess(vacation, createProgress(vacation.id), 'phone charger');
    expect(result.kind).toBe('hit');
    if (result.kind !== 'hit') return;
    expect(result.points).toBe(100);
    expect(result.progress.revealed).toEqual([0]);
  });

  it('records a miss without revealing anything', () => {
    const result = submitGuess(vacation, createProgress(vacation.id), 'snorkel');
    expect(result.kind).toBe('miss');
    expect(result.progress.revealed).toEqual([]);
    expect(result.progress.guesses).toHaveLength(1);
  });

  it('does not charge a guess for a repeat', () => {
    const after = play(['toothbrush']);
    const result = submitGuess(vacation, after, 'tooth brush');
    expect(result.kind).toBe('duplicate');
    expect(result.progress).toBe(after);
    expect(result.progress.guesses).toHaveLength(1);
  });

  it('does not charge a guess for empty input', () => {
    const start = createProgress(vacation.id);
    const result = submitGuess(vacation, start, '   ');
    expect(result.kind).toBe('empty');
    expect(result.progress).toBe(start);
  });

  it('ends the round once the guess limit is spent', () => {
    const progress = play(['nope one', 'nope two', 'nope three', 'nope four', 'nope five']);
    expect(progress.guesses).toHaveLength(GUESS_LIMIT);
    expect(progress.status).toBe('complete');
    expect(progress.completedAt).not.toBeNull();
  });

  it('refuses further guesses once complete', () => {
    const finished = play(['a', 'b', 'c', 'd', 'e']);
    expect(submitGuess(vacation, finished, 'phone charger').kind).toBe('finished');
  });

  it('ends the round early when the whole board is found', () => {
    const six = PUZZLES.find((entry) => entry.answers.length === 6);
    if (!six) return;
    const progress = six.answers.reduce(
      (acc, answer) => submitGuess(six, acc, answer.answer).progress,
      createProgress(six.id),
    );
    expect(progress.status).toBe('complete');
  });
});

describe('summarize', () => {
  it('totals points, finds and survey share', () => {
    const progress = play(['phone charger', 'toothbrush', 'sunscreen', 'wallet', 'snorkel']);
    const summary = summarize(vacation, progress);

    expect(summary.score).toBe(100 + 80 + 45 + 5);
    expect(summary.found).toBe(4);
    expect(summary.total).toBe(8);
    expect(summary.consensusPercent).toBe(31 + 21 + 11 + 3);
    expect(summary.guessesUsed).toBe(GUESS_LIMIT);
    expect(summary.message).toBeTruthy();
  });

  it('caps a perfect round at the maximum score', () => {
    const progress = play([
      'phone charger',
      'toothbrush',
      'passport',
      'sunscreen',
      'medication',
    ]);
    expect(summarize(vacation, progress).score).toBe(MAX_SCORE);
  });

  it('has a distinct message for finding nothing', () => {
    const progress = play(['a', 'b', 'c', 'd', 'e']);
    const summary = summarize(vacation, progress);
    expect(summary.score).toBe(0);
    expect(summary.consensusPercent).toBe(0);
    expect(summary.message).toMatch(/crowd/i);
  });
});

describe('reconcileProgress', () => {
  it('starts fresh when nothing is stored', () => {
    expect(reconcileProgress(vacation, undefined).revealed).toEqual([]);
  });

  it('starts fresh when the stored progress is for another puzzle', () => {
    const other = { ...createProgress('something-else'), revealed: [0] };
    expect(reconcileProgress(vacation, other).revealed).toEqual([]);
  });

  it('drops out-of-range and duplicated indices', () => {
    const corrupt: PuzzleProgress = {
      ...createProgress(vacation.id),
      revealed: [0, 0, 99, -1, 2],
    };
    expect(reconcileProgress(vacation, corrupt).revealed).toEqual([0, 2]);
  });

  it('never keeps more guesses than the limit', () => {
    const corrupt: PuzzleProgress = {
      ...createProgress(vacation.id),
      guesses: Array.from({ length: 12 }, () => ({
        raw: 'x',
        outcome: 'miss' as const,
        answerIndex: null,
        matchedTerm: null,
        matchedVia: null,
      })),
    };
    expect(reconcileProgress(vacation, corrupt).guesses).toHaveLength(GUESS_LIMIT);
  });
});
