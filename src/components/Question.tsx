import { formatLongDate } from '../lib/dateUtils';
import type { ScheduledPuzzle } from '../lib/types';

const DIFFICULTY_LABEL = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
} as const;

export function Question({ puzzle }: { puzzle: ScheduledPuzzle }) {
  return (
    <header className="question">
      <p className="question__meta">
        <span className="question__edition">No. {puzzle.number}</span>
        <span className="question__divider" aria-hidden="true">
          /
        </span>
        <span>{formatLongDate(puzzle.servedDate)}</span>
      </p>

      <h1 className="question__prompt">{puzzle.question}</h1>

      <p className="question__tags">
        <span className="tag">{puzzle.category}</span>
        <span className={`tag tag--${puzzle.difficulty}`}>
          {DIFFICULTY_LABEL[puzzle.difficulty]}
        </span>
      </p>

      <p className="question__brief">
        100 people answered. Name the responses they gave most often.
      </p>
    </header>
  );
}
