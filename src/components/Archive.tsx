import { getArchive } from '../data/puzzleRepository';
import { ROUTE_PATHS } from '../hooks/useRoute';
import { formatShortDate } from '../lib/dateUtils';
import { MAX_SCORE, scoreOf } from '../lib/gameLogic';
import type { PuzzleProgress, ScheduledPuzzle } from '../lib/types';
import { useGameState } from '../state/context';

type ArchiveStatus = 'locked' | 'in-progress' | 'complete';

function statusOf(progress: PuzzleProgress | undefined): ArchiveStatus {
  if (!progress || progress.guesses.length === 0) return 'locked';
  return progress.status === 'complete' ? 'complete' : 'in-progress';
}

function ArchiveEntry({
  puzzle,
  progress,
}: {
  puzzle: ScheduledPuzzle;
  progress: PuzzleProgress | undefined;
}) {
  const status = statusOf(progress);

  return (
    <li className={`archive__item archive__item--${status}`}>
      <a className="archive__link" href={ROUTE_PATHS.puzzle(puzzle.id)}>
        <span className="archive__number">No. {puzzle.number}</span>
        <span className="archive__question">{puzzle.question}</span>

        <span className="archive__meta">
          <span className="archive__date">{formatShortDate(puzzle.date)}</span>
          <span className="archive__dot" aria-hidden="true">
            ·
          </span>
          <span className={`archive__difficulty archive__difficulty--${puzzle.difficulty}`}>
            {puzzle.difficulty}
          </span>
          <span className="archive__dot" aria-hidden="true">
            ·
          </span>
          {status === 'complete' && progress ? (
            <span className="archive__score">
              {scoreOf(progress)} / {MAX_SCORE} points
            </span>
          ) : status === 'in-progress' ? (
            <span className="archive__score">In progress</span>
          ) : (
            <span className="archive__score archive__score--locked">Not started</span>
          )}
        </span>
      </a>
    </li>
  );
}

export function Archive() {
  const { progressById } = useGameState();
  const puzzles = getArchive();

  const played = puzzles.filter((puzzle) => statusOf(progressById[puzzle.id]) === 'complete');

  return (
    <section className="archive" aria-labelledby="archive-heading">
      <header className="page-header">
        <h1 className="page-header__title" id="archive-heading">
          Archive
        </h1>
        <p className="page-header__lede">
          Past editions, newest first. Answers stay hidden until you play.
        </p>
        {puzzles.length > 0 ? (
          <p className="page-header__note">
            {played.length} of {puzzles.length} completed
          </p>
        ) : null}
      </header>

      {puzzles.length === 0 ? (
        <p className="empty-state">
          Nothing here yet. Past editions appear the day after they run.
        </p>
      ) : (
        <ol className="archive__list">
          {puzzles.map((puzzle) => (
            <ArchiveEntry key={puzzle.id} puzzle={puzzle} progress={progressById[puzzle.id]} />
          ))}
        </ol>
      )}
    </section>
  );
}
