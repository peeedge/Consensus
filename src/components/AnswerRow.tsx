import type { CSSProperties } from 'react';

import type { PuzzleAnswer } from '../lib/types';

interface AnswerRowProps {
  position: number;
  answer: PuzzleAnswer;
  revealed: boolean;
  /** Revealed only because the game ended, rather than guessed. */
  disclosed: boolean;
  /** The row that just animated in, so only it plays the reveal. */
  isLatest: boolean;
  /** Largest percentage on the board, used to scale the tint bar. */
  peakPercentage: number;
  points: number;
}

export function AnswerRow({
  position,
  answer,
  revealed,
  disclosed,
  isLatest,
  peakPercentage,
  points,
}: AnswerRowProps) {
  const rank = String(position + 1).padStart(2, '0');
  const visible = revealed || disclosed;
  const barWidth = peakPercentage > 0 ? (answer.percentage / peakPercentage) * 100 : 0;

  const classes = [
    'board__row',
    visible ? 'board__row--visible' : 'board__row--hidden',
    disclosed ? 'board__row--disclosed' : '',
    isLatest ? 'board__row--latest' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Rows disclosed together at the end of a round stagger down the board; a
  // single guessed row has no delay because it is the only one animating.
  const stagger = { '--position': disclosed ? position : 0 } as CSSProperties;

  // The visual row is split across three columns, which reads badly aloud, so
  // it is hidden from assistive tech in favour of one written-out sentence.
  return (
    <li className={classes} style={stagger}>
      <span className="board__visual" aria-hidden="true">
        {visible ? (
          <span className="board__bar" style={{ inlineSize: `${barWidth}%` }} />
        ) : null}

        <span className="board__rank">{rank}</span>

        <span className="board__answer">
          {visible ? (
            <>
              <span className="board__text">{answer.answer}</span>
              {disclosed ? <span className="board__tag">missed</span> : null}
            </>
          ) : (
            <span className="board__blank" />
          )}
        </span>

        <span className="board__percentage">
          {visible ? (
            <>
              <span className="board__number">{answer.percentage}</span>
              <span className="board__unit">%</span>
            </>
          ) : (
            <span className="board__number board__number--empty">&mdash;</span>
          )}
        </span>
      </span>

      <span className="sr-only">
        {visible
          ? `Position ${position + 1}: ${answer.answer}, ${answer.percentage} percent of the survey, worth ${points} points.${
              disclosed ? ' You did not find this one.' : ' You found this one.'
            }`
          : `Position ${position + 1}: not yet revealed, worth ${points} points.`}
      </span>
    </li>
  );
}
