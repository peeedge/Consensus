import { useEffect, useRef, useState } from 'react';

import {
  consensusPercentOf,
  guessesRemaining,
  pointsForPosition,
  scoreOf,
} from '../lib/gameLogic';
import type { ScheduledPuzzle } from '../lib/types';
import { useGameState } from '../state/context';
import { AnswerBoard } from './AnswerBoard';
import { AnswerInput } from './AnswerInput';
import type { Feedback } from './AnswerInput';
import { GameComplete } from './GameComplete';
import { Question } from './Question';
import { ScoreDisplay } from './ScoreDisplay';

/**
 * Rendered with `key={puzzle.id}`, so moving between editions remounts this
 * component and resets its transient state without any cleanup logic.
 */
export function DailyPuzzle({ puzzle }: { puzzle: ScheduledPuzzle }) {
  const { getProgress, submit, giveUp, today, streakDays } = useGameState();
  const progress = getProgress(puzzle);

  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [confirmingReveal, setConfirmingReveal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const completeRef = useRef<HTMLDivElement>(null);

  const isToday = puzzle.servedDate === today;
  const complete = progress.status === 'complete';
  const remaining = guessesRemaining(progress);
  const score = scoreOf(progress);
  const consensusPercent = consensusPercentOf(puzzle, progress);

  // True when this puzzle was already finished on arrival, so the summary only
  // steals focus for a round the player actually just ended.
  const startedComplete = useRef(complete);

  useEffect(() => {
    if (complete && !startedComplete.current) {
      completeRef.current?.focus();
    }
  }, [complete]);

  const announce = (tone: Feedback['tone'], text: string) => {
    setFeedback({ id: Date.now(), tone, text });
  };

  const clearInput = () => {
    setGuess('');
    // Keep the player typing without reaching for the field again.
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    const result = submit(puzzle, guess);

    switch (result.kind) {
      case 'hit': {
        const answer = puzzle.answers[result.answerIndex];
        announce(
          'hit',
          `${answer.answer} — ${answer.percentage} of 100 said it. Position ${
            result.answerIndex + 1
          }, ${pointsForPosition(result.answerIndex)} points.`,
        );
        clearInput();
        break;
      }
      case 'miss': {
        announce('miss', 'Nobody surveyed gave that answer.');
        clearInput();
        break;
      }
      case 'duplicate': {
        announce(
          'neutral',
          `You already found ${puzzle.answers[result.answerIndex].answer}. That one is free.`,
        );
        clearInput();
        break;
      }
      case 'empty': {
        announce('neutral', 'Type an answer first.');
        break;
      }
      case 'finished': {
        announce('neutral', 'This round is already over.');
        break;
      }
    }
  };

  return (
    <article className="puzzle">
      <Question puzzle={puzzle} />

      {complete ? null : (
        <AnswerInput
          value={guess}
          onChange={setGuess}
          onSubmit={handleSubmit}
          inputRef={inputRef}
          disabled={complete}
          remaining={remaining}
          feedback={feedback}
        />
      )}

      <ScoreDisplay score={score} consensusPercent={consensusPercent} progress={progress} />

      <AnswerBoard puzzle={puzzle} progress={progress} />

      {complete ? (
        <div className="complete__anchor" ref={completeRef} tabIndex={-1}>
          <GameComplete
            puzzle={puzzle}
            progress={progress}
            isToday={isToday}
            streakDays={streakDays}
          />
        </div>
      ) : (
        <div className="puzzle__concede">
          {confirmingReveal ? (
            <p className="puzzle__confirm">
              <span>End the round and reveal the rest?</span>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => {
                  setConfirmingReveal(false);
                  giveUp(puzzle);
                }}
              >
                Yes, reveal
              </button>
              <button
                type="button"
                className="button button--quiet"
                onClick={() => setConfirmingReveal(false)}
              >
                Keep playing
              </button>
            </p>
          ) : (
            <button
              type="button"
              className="button button--quiet"
              onClick={() => setConfirmingReveal(true)}
            >
              Give up and reveal the board
            </button>
          )}
        </div>
      )}
    </article>
  );
}
