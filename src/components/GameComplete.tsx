import { useCountdownToNextPuzzle } from '../hooks/useCountdown';
import { summarize } from '../lib/gameLogic';
import type { PuzzleProgress, ScheduledPuzzle } from '../lib/types';
import { ShareResult } from './ShareResult';

interface GameCompleteProps {
  puzzle: ScheduledPuzzle;
  progress: PuzzleProgress;
  /** Only today's edition counts down to a new puzzle. */
  isToday: boolean;
  streakDays: number;
}

export function GameComplete({ puzzle, progress, isToday, streakDays }: GameCompleteProps) {
  const summary = summarize(puzzle, progress);
  const countdown = useCountdownToNextPuzzle(isToday);
  const misses = progress.guesses.filter((guess) => guess.outcome === 'miss');

  return (
    <section className="complete" aria-labelledby="complete-heading">
      <h2 className="complete__heading" id="complete-heading">
        {isToday ? "Today's consensus" : 'Consensus revealed'}
      </h2>

      <p className="complete__message">{summary.message}</p>

      <dl className="complete__stats">
        <div className="complete__stat">
          <dt>Your score</dt>
          <dd className="complete__figure">{summary.score}</dd>
          <p className="complete__caption">out of a possible {summary.maxScore}</p>
        </div>

        <div className="complete__stat">
          <dt>You found</dt>
          <dd className="complete__figure">
            {summary.found}
            <span className="complete__of"> of {summary.total}</span>
          </dd>
          <p className="complete__caption">answers on the board</p>
        </div>

        <div className="complete__stat">
          <dt>You got</dt>
          <dd className="complete__figure">
            {summary.consensusPercent}
            <span className="complete__of">%</span>
          </dd>
          <p className="complete__caption">of the 100 responses</p>
        </div>
      </dl>

      {misses.length > 0 ? (
        <p className="complete__misses">
          <span className="complete__misses-label">Not on the board:</span>{' '}
          {misses.map((guess) => guess.raw).join(', ')}
        </p>
      ) : null}

      <ShareResult puzzle={puzzle} progress={progress} />

      <footer className="complete__footer">
        {isToday ? (
          <p className="complete__next">
            Tomorrow&rsquo;s puzzle in <time className="complete__clock">{countdown}</time>
          </p>
        ) : (
          <p className="complete__next">This is an edition from the archive.</p>
        )}

        {streakDays > 0 ? (
          <p className="complete__streak">
            Current streak: {streakDays} {streakDays === 1 ? 'day' : 'days'}
          </p>
        ) : null}
      </footer>
    </section>
  );
}
