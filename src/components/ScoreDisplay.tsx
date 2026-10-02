import { GUESS_LIMIT } from '../lib/gameLogic';
import type { PuzzleProgress } from '../lib/types';

interface ScoreDisplayProps {
  score: number;
  consensusPercent: number;
  progress: PuzzleProgress;
}

/** One mark per allowed guess: filled when used, with a hit/miss glyph. */
function GuessTrack({ progress }: { progress: PuzzleProgress }) {
  const marks = Array.from({ length: GUESS_LIMIT }, (_, index) => progress.guesses[index] ?? null);

  return (
    <ol className="guess-track" aria-label="Guesses used">
      {marks.map((guess, index) => {
        const state = guess ? guess.outcome : 'open';
        return (
          <li
            key={index}
            className={`guess-track__mark guess-track__mark--${state}`}
            title={guess ? `Guess ${index + 1}: ${guess.raw}` : `Guess ${index + 1}: unused`}
          >
            <span aria-hidden="true">{guess ? (guess.outcome === 'hit' ? '✓' : '✕') : '·'}</span>
            <span className="sr-only">
              {guess
                ? `Guess ${index + 1}: ${guess.raw}, ${guess.outcome === 'hit' ? 'on the board' : 'not on the board'}`
                : `Guess ${index + 1}: unused`}
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
        <span className="scoreline__label">Guesses</span>
        <GuessTrack progress={progress} />
      </div>
    </section>
  );
}
