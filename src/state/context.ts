import { createContext, useContext } from 'react';

import type { SubmitResult } from '../lib/gameLogic';
import type { PuzzleProgress, ScheduledPuzzle, Settings, StreakState } from '../lib/types';

export interface GameStateValue {
  /** Local calendar day, refreshed automatically at midnight. */
  today: string;
  progressById: Record<string, PuzzleProgress>;
  streak: StreakState;
  /** Streak as displayed: zero once a day has been missed. */
  streakDays: number;
  settings: Settings;
  getProgress: (puzzle: ScheduledPuzzle) => PuzzleProgress;
  submit: (puzzle: ScheduledPuzzle, guess: string) => SubmitResult;
  giveUp: (puzzle: ScheduledPuzzle) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetEverything: () => void;
}

export const GameStateContext = createContext<GameStateValue | null>(null);

export function useGameState(): GameStateValue {
  const value = useContext(GameStateContext);
  if (!value) {
    throw new Error('useGameState must be used inside <GameStateProvider>.');
  }
  return value;
}
