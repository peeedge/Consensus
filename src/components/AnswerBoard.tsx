import { pointsForPosition } from '../lib/gameLogic';
import type { Puzzle, PuzzleProgress } from '../lib/types';
import { AnswerRow } from './AnswerRow';

interface AnswerBoardProps {
  puzzle: Puzzle;
  progress: PuzzleProgress;
}

export function AnswerBoard({ puzzle, progress }: AnswerBoardProps) {
  const revealed = new Set(progress.revealed);
  const latest = progress.revealed.at(-1) ?? null;
  const complete = progress.status === 'complete';
  const peakPercentage = Math.max(...puzzle.answers.map((answer) => answer.percentage));

  return (
    <section className="board" aria-labelledby="board-heading">
      <div className="board__header">
        <h2 className="board__heading" id="board-heading">
          The board
        </h2>
        <p className="board__legend">
          {progress.revealed.length} of {puzzle.answers.length} found
        </p>
      </div>

      <ol className="board__list">
        {puzzle.answers.map((answer, index) => (
          <AnswerRow
            key={answer.answer}
            position={index}
            answer={answer}
            revealed={revealed.has(index)}
            disclosed={complete && !revealed.has(index)}
            isLatest={!complete && index === latest}
            peakPercentage={peakPercentage}
            points={pointsForPosition(index)}
          />
        ))}
      </ol>
    </section>
  );
}
