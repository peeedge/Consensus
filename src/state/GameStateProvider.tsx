import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { msUntilNextDay, todayKey } from '../lib/dateUtils';
import { concede, reconcileProgress, submitGuess } from '../lib/gameLogic';
import type { SubmitResult } from '../lib/gameLogic';
import {
  activeStreak,
  createInitialState,
  loadState,
  recordDailyCompletion,
  saveState,
} from '../lib/storage';
import type { PersistedState } from '../lib/storage';
import type { PuzzleProgress, ScheduledPuzzle, Settings } from '../lib/types';
import { GameStateContext } from './context';
import type { GameStateValue } from './context';

export function GameStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [today, setToday] = useState<string>(() => todayKey());

  // Persist after every change. Writing the whole blob is cheap at this size
  // and keeps the stored shape consistent.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Roll the puzzle over at local midnight without needing a page reload.
  useEffect(() => {
    const timer = window.setTimeout(() => setToday(todayKey()), msUntilNextDay() + 500);
    return () => window.clearTimeout(timer);
  }, [today]);

  // A laptop waking from sleep fires no timer, so re-check on focus too.
  useEffect(() => {
    const sync = () => setToday(todayKey());
    window.addEventListener('focus', sync);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.removeEventListener('focus', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  const getProgress = useCallback(
    (puzzle: ScheduledPuzzle): PuzzleProgress =>
      reconcileProgress(puzzle, state.progress[puzzle.id]),
    [state.progress],
  );

  const commit = useCallback((puzzle: ScheduledPuzzle, next: PuzzleProgress) => {
    setState((previous) => {
      const streak =
        next.status === 'complete' &&
        previous.progress[puzzle.id]?.status !== 'complete' &&
        puzzle.servedDate === todayKey()
          ? recordDailyCompletion(previous.streak, puzzle.servedDate)
          : previous.streak;

      return {
        ...previous,
        progress: { ...previous.progress, [puzzle.id]: next },
        streak,
      };
    });
  }, []);

  const submit = useCallback(
    (puzzle: ScheduledPuzzle, guess: string): SubmitResult => {
      const current = getProgress(puzzle);
      const result = submitGuess(puzzle, current, guess);
      // Rejected submissions (empty input, a repeat, a finished round) return
      // the same object and leave nothing to persist.
      if (result.progress !== current) {
        commit(puzzle, result.progress);
      }
      return result;
    },
    [commit, getProgress],
  );

  const giveUp = useCallback(
    (puzzle: ScheduledPuzzle) => {
      const current = getProgress(puzzle);
      commit(puzzle, concede(current));
    },
    [commit, getProgress],
  );

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((previous) => ({ ...previous, settings: { ...previous.settings, ...patch } }));
  }, []);

  const resetEverything = useCallback(() => {
    setState(createInitialState());
  }, []);

  const value = useMemo<GameStateValue>(
    () => ({
      today,
      progressById: state.progress,
      streak: state.streak,
      streakDays: activeStreak(state.streak),
      settings: state.settings,
      getProgress,
      submit,
      giveUp,
      updateSettings,
      resetEverything,
    }),
    [
      today,
      state.progress,
      state.streak,
      state.settings,
      getProgress,
      submit,
      giveUp,
      updateSettings,
      resetEverything,
    ],
  );

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}
