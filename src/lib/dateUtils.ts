/**
 * Date helpers.
 *
 * Everything here works in the player's *local* calendar day. A puzzle rolls
 * over at local midnight, which is what people expect from a daily puzzle.
 */

const MS_PER_DAY = 86_400_000;

/** Formats a Date as a local YYYY-MM-DD key (not UTC — `toISOString` would shift days). */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Parses a YYYY-MM-DD key into local midnight. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function todayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Whole calendar days from `from` to `to`. Negative when `to` precedes `from`. */
export function daysBetween(from: string, to: string): number {
  const a = fromDateKey(from).getTime();
  const b = fromDateKey(to).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

export function isValidDateKey(key: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  return !Number.isNaN(fromDateKey(key).getTime());
}

/** Milliseconds remaining until the next local midnight. */
export function msUntilNextDay(now: Date = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/** Renders a duration as `H:MM:SS`, for the "next puzzle in…" countdown. */
export function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

const LONG_DATE = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

const SHORT_DATE = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
});

export function formatLongDate(key: string): string {
  return LONG_DATE.format(fromDateKey(key));
}

export function formatShortDate(key: string): string {
  return SHORT_DATE.format(fromDateKey(key));
}
