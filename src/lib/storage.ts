/**
 * localStorage persistence.
 *
 * Everything is kept under one versioned key and read defensively: a corrupt,
 * truncated or outdated payload degrades to a fresh state rather than throwing.
 * Private-browsing modes that reject writes are tolerated silently.
 */

import { addDays, isValidDateKey, todayKey } from './dateUtils';
import type { GuessOutcome, PuzzleProgress, Settings, StreakState } from './types';

const STORAGE_KEY = 'consensus:state:v1';
const SCHEMA_VERSION = 1;

export interface PersistedState {
  version: number;
  /** Keyed by puzzle id. */
  progress: Record<string, PuzzleProgress>;
  streak: StreakState;
  settings: Settings;
}

export function createInitialState(): PersistedState {
  return {
    version: SCHEMA_VERSION,
    progress: {},
    streak: { current: 0, longest: 0, lastCompletedDate: null },
    settings: { reduceMotion: false },
  };
}

function storage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    // Access itself throws when cookies/storage are blocked.
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeProgress(value: unknown): PuzzleProgress | null {
  if (!isRecord(value) || typeof value.puzzleId !== 'string') return null;

  const revealed = Array.isArray(value.revealed)
    ? value.revealed.filter((index): index is number => Number.isInteger(index))
    : [];

  const guesses = Array.isArray(value.guesses)
    ? value.guesses.flatMap((guess) => {
        if (!isRecord(guess) || typeof guess.raw !== 'string') return [];
        const outcome: GuessOutcome = guess.outcome === 'hit' ? 'hit' : 'miss';
        return [
          {
            raw: guess.raw,
            outcome,
            answerIndex: Number.isInteger(guess.answerIndex)
              ? (guess.answerIndex as number)
              : null,
            matchedTerm: typeof guess.matchedTerm === 'string' ? guess.matchedTerm : null,
            matchedVia:
              typeof guess.matchedVia === 'string'
                ? (guess.matchedVia as PuzzleProgress['guesses'][number]['matchedVia'])
                : null,
          },
        ];
      })
    : [];

  return {
    puzzleId: value.puzzleId,
    revealed,
    guesses,
    status: value.status === 'complete' ? 'complete' : 'in-progress',
    completedAt: typeof value.completedAt === 'number' ? value.completedAt : null,
  };
}

function sanitize(raw: unknown): PersistedState {
  const fresh = createInitialState();
  if (!isRecord(raw) || raw.version !== SCHEMA_VERSION) return fresh;

  const progress: Record<string, PuzzleProgress> = {};
  if (isRecord(raw.progress)) {
    for (const [key, value] of Object.entries(raw.progress)) {
      const entry = sanitizeProgress(value);
      if (entry) progress[key] = entry;
    }
  }

  const streak = { ...fresh.streak };
  if (isRecord(raw.streak)) {
    if (Number.isInteger(raw.streak.current)) streak.current = Math.max(0, raw.streak.current as number);
    if (Number.isInteger(raw.streak.longest)) streak.longest = Math.max(0, raw.streak.longest as number);
    if (typeof raw.streak.lastCompletedDate === 'string' && isValidDateKey(raw.streak.lastCompletedDate)) {
      streak.lastCompletedDate = raw.streak.lastCompletedDate;
    }
  }

  const settings = { ...fresh.settings };
  if (isRecord(raw.settings) && typeof raw.settings.reduceMotion === 'boolean') {
    settings.reduceMotion = raw.settings.reduceMotion;
  }

  return { version: SCHEMA_VERSION, progress, streak, settings };
}

export function loadState(): PersistedState {
  const store = storage();
  if (!store) return createInitialState();

  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    return sanitize(JSON.parse(raw));
  } catch {
    return createInitialState();
  }
}

export function saveState(state: PersistedState): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or storage disabled; progress stays in memory for this session.
  }
}

export function clearState(): void {
  const store = storage();
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    // Nothing useful to do here.
  }
}

/**
 * Advances the streak after the player finishes *today's* puzzle. Archive
 * puzzles deliberately do not count, so the streak stays an honest record of
 * showing up each day.
 */
export function recordDailyCompletion(streak: StreakState, dateKey: string): StreakState {
  if (streak.lastCompletedDate === dateKey) return streak;

  const continuing = streak.lastCompletedDate === addDays(dateKey, -1);
  const current = continuing ? streak.current + 1 : 1;

  return {
    current,
    longest: Math.max(streak.longest, current),
    lastCompletedDate: dateKey,
  };
}

/**
 * The streak as it should be *displayed*. A stored streak goes stale the
 * moment a day is skipped, so missing yesterday reads as zero without needing
 * a background job to reset it.
 */
export function activeStreak(streak: StreakState, now: Date = new Date()): number {
  const today = todayKey(now);
  if (!streak.lastCompletedDate) return 0;
  if (streak.lastCompletedDate === today) return streak.current;
  if (streak.lastCompletedDate === addDays(today, -1)) return streak.current;
  return 0;
}
