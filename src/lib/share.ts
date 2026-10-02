/**
 * Shareable results.
 *
 * The share text shows the *shape* of a round — which guesses landed and how
 * valuable they were — without ever naming an answer, so posting it cannot
 * spoil the puzzle for anyone.
 */

import { pointsForPosition } from './gameLogic';
import type { PuzzleProgress, ScheduledPuzzle } from './types';

/** Top-third of the board, the answers that really are the consensus. */
const STRONG_POSITION_LIMIT = 3;

export type GuessTier = 'strong' | 'modest' | 'missed';

export interface ShareMark {
  tier: GuessTier;
  points: number;
  square: string;
  /** Spoken description, since the squares mean nothing to a screen reader. */
  label: string;
}

export function tierForPosition(answerIndex: number | null): GuessTier {
  if (answerIndex === null) return 'missed';
  return answerIndex < STRONG_POSITION_LIMIT ? 'strong' : 'modest';
}

const SQUARES: Record<GuessTier, string> = {
  strong: '\u{1F7E9}',
  modest: '\u{1F7E8}',
  missed: '\u2B1C',
};

const TIER_LABELS: Record<GuessTier, string> = {
  strong: 'Top answer',
  modest: 'Lower answer',
  missed: 'Not on the board',
};

/** One mark per guess, in the order the player made them. */
export function buildShareMarks(progress: PuzzleProgress): ShareMark[] {
  return progress.guesses.map((guess) => {
    const tier = tierForPosition(guess.outcome === 'hit' ? guess.answerIndex : null);
    const points = guess.outcome === 'hit' && guess.answerIndex !== null
      ? pointsForPosition(guess.answerIndex)
      : 0;
    return {
      tier,
      points,
      square: SQUARES[tier],
      label: `${TIER_LABELS[tier]}, ${points} points`,
    };
  });
}

export function buildShareText(puzzle: ScheduledPuzzle, progress: PuzzleProgress): string {
  const marks = buildShareMarks(progress);
  const total = marks.reduce((sum, mark) => sum + mark.points, 0);
  const rows = marks.map((mark) => `${mark.square} ${mark.points}`);

  return [`Consensus #${puzzle.number}`, '', ...rows, '', `${total} points`].join('\n');
}

export type ShareOutcome = 'shared' | 'copied' | 'failed';

/** Prefers the native share sheet on mobile, falls back to the clipboard. */
export async function shareResult(text: string, title = 'Consensus'): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (error) {
      // A user-cancelled share sheet is not an error worth reporting.
      if (error instanceof DOMException && error.name === 'AbortError') return 'shared';
    }
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return 'copied';
    }
  } catch {
    // Fall through to the manual path below.
  }

  return 'failed';
}
