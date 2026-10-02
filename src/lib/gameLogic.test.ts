import { describe, expect, it } from 'vitest';

import { PUZZLES } from '../data/puzzles';
import {
  MISS_LIMIT,
  createProgress,
  maxScoreFor,
  missesRemaining,
  missesUsed,
  reconcileProgress,
  submitGuess,
  summarize,
} from './gameLogic';
import type { Puzzle, PuzzleProgress } from './types';

const vacation = PUZZLES.find((entry) => entry.id === 'vacation-forget') as Puzzle;

function play(guesses: string[], puzzle: Puzzle = vacation): PuzzleProgress {
  return guesses.reduce(
    (progress, guess) => submitGuess(puzzle, progress, guess).progress,
    createProgress(puzzle.id),
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
    expect(missesUsed(result.progress)).toBe(1);
  });

  it('does not spend a miss on a correct answer', () => {
    const progress = play(['phone charger', 'toothbrush', 'passport']);
    expect(missesUsed(progress)).toBe(0);
    expect(missesRemaining(progress)).toBe(MISS_LIMIT);
    expect(progress.status).toBe('in-progress');
  });

  it('does not spend a miss on a repeat', () => {
    const after = play(['toothbrush']);
    const result = submitGuess(vacation, after, 'tooth brush');
    expect(result.kind).toBe('duplicate');
    expect(result.progress).toBe(after);
    expect(missesUsed(result.progress)).toBe(0);
  });

  it('does not spend a miss on empty input', () => {
    const start = createProgress(vacation.id);
    const result = submitGuess(vacation, start, '   ');
    expect(result.kind).toBe('empty');
    expect(result.progress).toBe(start);
  });

  it('lets a good run continue well past three guesses', () => {
    const progress = play([
      'phone charger',
      'nope one',
      'toothbrush',
      'passport',
      'nope two',
      'sunscreen',
      'medication',
    ]);
    expect(progress.guesses).toHaveLength(7);
    expect(progress.revealed).toHaveLength(5);
    expect(missesUsed(progress)).toBe(2);
    expect(progress.status).toBe('in-progress');
  });

  it('ends the round on the third miss', () => {
    const progress = play(['phone charger', 'nope one', 'nope two', 'nope three']);
    expect(missesUsed(progress)).toBe(MISS_LIMIT);
    expect(missesRemaining(progress)).toBe(0);
    expect(progress.status).toBe('complete');
    expect(progress.completedAt).not.toBeNull();
  });

  it('refuses further guesses once complete', () => {
    const finished = play(['a', 'b', 'c']);
    expect(finished.status).toBe('complete');
    expect(submitGuess(vacation, finished, 'phone charger').kind).toBe('finished');
  });

  it('ends the round when the whole board is cleared without a miss', () => {
    const progress = play(vacation.answers.map((answer) => answer.answer));
    expect(progress.status).toBe('complete');
    expect(progress.revealed).toHaveLength(vacation.answers.length);
    expect(missesUsed(progress)).toBe(0);
  });
});

describe('maxScoreFor', () => {
  it('is the sum of every position on the board', () => {
    expect(maxScoreFor(vacation)).toBe(100 + 80 + 60 + 45 + 30 + 20 + 10 + 5);
  });

  it('scales down for a shorter board', () => {
    const seven = PUZZLES.find((entry) => entry.answers.length === 7) as Puzzle;
    expect(maxScoreFor(seven)).toBe(100 + 80 + 60 + 45 + 30 + 20 + 10);
  });
});

describe('summarize', () => {
  it('totals points, finds and survey share', () => {
    const progress = play(['phone charger', 'toothbrush', 'snorkel', 'wallet', 'kayak', 'yeti']);
    const summary = summarize(vacation, progress);

    expect(summary.score).toBe(100 + 80 + 5);
    expect(summary.found).toBe(3);
    expect(summary.total).toBe(8);
    expect(summary.consensusPercent).toBe(31 + 21 + 3);
    expect(summary.missesUsed).toBe(MISS_LIMIT);
    expect(summary.guessesUsed).toBe(6);
    expect(summary.message).toBeTruthy();
  });

  it('reports a cleared board as a perfect score', () => {
    const progress = play(vacation.answers.map((answer) => answer.answer));
    const summary = summarize(vacation, progress);

    expect(summary.score).toBe(maxScoreFor(vacation));
    expect(summary.score).toBe(summary.maxScore);
    expect(summary.consensusPercent).toBe(100);
    expect(summary.message).toMatch(/clean sweep/i);
  });

  it('has a distinct message for finding nothing', () => {
    const progress = play(['a', 'b', 'c']);
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

  it('caps guesses at what a real round could produce', () => {
    const corrupt: PuzzleProgress = {
      ...createProgress(vacation.id),
      guesses: Array.from({ length: 40 }, () => ({
        raw: 'x',
        outcome: 'miss' as const,
        answerIndex: null,
        matchedTerm: null,
        matchedVia: null,
      })),
    };
    expect(reconcileProgress(vacation, corrupt).guesses).toHaveLength(
      vacation.answers.length + MISS_LIMIT,
    );
  });
});
