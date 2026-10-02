import { MISS_LIMIT, missesUsed } from '../lib/gameLogic';
import type { PuzzleProgress } from '../lib/types';

interface ScoreDisplayProps {
  score: number;
  consensusPercent: number;
  progress: PuzzleProgress;
}

/** One mark per allowed miss, filled as the player spends them. */
function MissTrack({ progress }: { progress: PuzzleProgress }) {
  const misses = progress.guesses.filter((guess) => guess.outcome === 'miss');
  const spent = missesUsed(progress);

  return (
    <ol className="miss-track" aria-label={`Misses: ${spent} of ${MISS_LIMIT}`}>
      {Array.from({ length: MISS_LIMIT }, (_, index) => {
        const guess = misses[index];
        return (
          <li
            key={index}
            className={`miss-track__mark miss-track__mark--${guess ? 'spent' : 'open'}`}
            title={guess ? `Miss ${index + 1}: ${guess.raw}` : `Miss ${index + 1}: unused`}
          >
            <span aria-hidden="true">{guess ? '✕' : '·'}</span>
            <span className="sr-only">
              {guess ? `Miss ${index + 1}: ${guess.raw}` : `Miss ${index + 1}: unused`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function ScoreDisplay({ score, consensusPercent, progress }: ScoreDisplayProps) {
  return (
    <section className="scoreline" aria-label="Your progress">
      <div className="scoreline__stat">
        <span className="scoreline__label">Score</span>
        <span className="scoreline__value">{score}</span>
      </div>

      <div className="scoreline__stat">
        <span className="scoreline__label">Consensus</span>
        <span className="scoreline__value">
          {consensusPercent}
          <span className="scoreline__unit">%</span>
        </span>
      </div>

      <div className="scoreline__stat scoreline__stat--track">
        <span className="scoreline__label">Misses</span>
        <MissTrack progress={progress} />
      </div>
    </section>
  );
}
