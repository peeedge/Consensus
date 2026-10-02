/**
 * Core domain types for Consensus.
 *
 * These are intentionally transport-agnostic: the shapes below describe what a
 * puzzle *is*, not where it came from. Swapping the local data file for a REST
 * endpoint or database only requires a new implementation of the repository in
 * `src/data/puzzleRepository.ts`.
 */

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleAnswer {
  /** Canonical display form, e.g. "phone charger". */
  answer: string;
  /** Additional accepted spellings and synonyms. */
  aliases: string[];
  /** Share of the hypothetical 100-person survey. */
  percentage: number;
}

export interface Puzzle {
  id: string;
  /** Local calendar date this puzzle is scheduled for, as YYYY-MM-DD. */
  date: string;
  question: string;
  difficulty: Difficulty;
  category: string;
  /** Ordered most-popular first. */
  answers: PuzzleAnswer[];
}

/** A puzzle plus its scheduling metadata, as handed to the UI. */
export interface ScheduledPuzzle extends Puzzle {
  /** Monotonically increasing edition number, e.g. "Consensus #24". */
  number: number;
  /** The date this edition is being served for (may differ from `date` when cycling). */
  servedDate: string;
}

export type GuessOutcome = 'hit' | 'miss';

export interface GuessRecord {
  /** Exactly what the player typed. */
  raw: string;
  outcome: GuessOutcome;
  /** Index into `Puzzle.answers` when the guess was a hit. */
  answerIndex: number | null;
  /** The accepted term the guess resolved to, for transparency. */
  matchedTerm: string | null;
  /** Which matching stage accepted it, for transparency. */
  matchedVia: MatchStrategy | null;
}

export type MatchStrategy =
  | 'exact'
  | 'compact'
  | 'contains'
  | 'fuzzy';

export interface MatchResult {
  answerIndex: number;
  matchedTerm: string;
  strategy: MatchStrategy;
  /** Edit distance used, 0 for non-fuzzy strategies. Lower is a better match. */
  distance: number;
}

export type GameStatus = 'in-progress' | 'complete';

export interface PuzzleProgress {
  puzzleId: string;
  /** Indices into `Puzzle.answers`, in the order the player found them. */
  revealed: number[];
  guesses: GuessRecord[];
  status: GameStatus;
  /** Epoch ms, set when the game ended. */
  completedAt: number | null;
}

export interface GameSummary {
  score: number;
  maxScore: number;
  found: number;
  total: number;
  /** Share of the survey the player's answers represent, 0-100. */
  consensusPercent: number;
  guessesUsed: number;
  missesUsed: number;
  missesAllowed: number;
  message: string;
}

export interface StreakState {
  current: number;
  longest: number;
  /** Last daily puzzle date (YYYY-MM-DD) the player completed. */
  lastCompletedDate: string | null;
}

export interface Settings {
  /** Player-level override; the OS `prefers-reduced-motion` setting also applies. */
  reduceMotion: boolean;
}
