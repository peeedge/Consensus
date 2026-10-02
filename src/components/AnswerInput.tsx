import type { FormEvent, RefObject } from 'react';

export type FeedbackTone = 'hit' | 'miss' | 'neutral';

export interface Feedback {
  /** Changes on every submission so a repeated message still re-announces. */
  id: number;
  tone: FeedbackTone;
  text: string;
}

interface AnswerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  /** Owned by the parent so it can refocus the field after a guess lands. */
  inputRef: RefObject<HTMLInputElement | null>;
  disabled: boolean;
  remaining: number;
  feedback: Feedback | null;
}

const TONE_PREFIX: Record<FeedbackTone, string> = {
  hit: 'On the board',
  miss: 'Not on the board',
  neutral: '',
};

export function AnswerInput({
  value,
  onChange,
  onSubmit,
  inputRef,
  disabled,
  remaining,
  feedback,
}: AnswerInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  const prefix = feedback ? TONE_PREFIX[feedback.tone] : '';

  return (
    <form className="answer-input" onSubmit={handleSubmit} noValidate>
      <div className="answer-input__field">
        <label className="answer-input__label" htmlFor="guess">
          Your answer
        </label>
        <input
          ref={inputRef}
          id="guess"
          name="guess"
          className="answer-input__control"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="What would most people say?"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={60}
          disabled={disabled}
          aria-describedby="guess-help guess-feedback"
        />
      </div>

      <button type="submit" className="button button--primary" disabled={disabled}>
        Submit
      </button>

      <p className="answer-input__help" id="guess-help">
        {remaining === 1 ? 'Last guess' : `${remaining} guesses left`}
      </p>

      <p
        className={`answer-input__feedback answer-input__feedback--${feedback?.tone ?? 'idle'}`}
        id="guess-feedback"
        role="status"
        aria-live="polite"
      >
        {feedback ? (
          <span key={feedback.id}>
            {prefix ? <strong className="answer-input__prefix">{prefix}.</strong> : null}
            {prefix ? ' ' : ''}
            {feedback.text}
          </span>
        ) : null}
      </p>
    </form>
  );
}
