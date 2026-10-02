import { useEffect, useState } from 'react';

import { buildShareMarks, buildShareText, shareResult } from '../lib/share';
import type { PuzzleProgress, ScheduledPuzzle } from '../lib/types';

interface ShareResultProps {
  puzzle: ScheduledPuzzle;
  progress: PuzzleProgress;
}

const MESSAGES = {
  shared: 'Shared.',
  copied: 'Copied to clipboard.',
  failed: 'Copying is blocked here — select the result above instead.',
} as const;

export function ShareResult({ puzzle, progress }: ShareResultProps) {
  const marks = buildShareMarks(progress);
  const text = buildShareText(puzzle, progress);
  const [status, setStatus] = useState<keyof typeof MESSAGES | null>(null);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleShare = async () => {
    setStatus(await shareResult(text, `Consensus #${puzzle.number}`));
  };

  return (
    <section className="share" aria-labelledby="share-heading">
      <h3 className="share__heading" id="share-heading">
        Your result
      </h3>

      <div className="share__card">
        <p className="share__title">Consensus #{puzzle.number}</p>
        <ol className="share__marks">
          {marks.map((mark, index) => (
            <li key={index} className={`share__mark share__mark--${mark.tier}`}>
              <span className="share__square" aria-hidden="true">
                {mark.square}
              </span>
              <span className="share__points" aria-hidden="true">
                {mark.points}
              </span>
              <span className="sr-only">{`Guess ${index + 1}: ${mark.label}`}</span>
            </li>
          ))}
        </ol>
        <p className="share__total">
          {marks.reduce((sum, mark) => sum + mark.points, 0)} points
        </p>
      </div>

      <p className="share__note">No answers are included, so it is safe to post.</p>

      <button type="button" className="button button--primary" onClick={handleShare}>
        Share result
      </button>

      <p className="share__status" role="status" aria-live="polite">
        {status ? MESSAGES[status] : null}
      </p>
    </section>
  );
}
