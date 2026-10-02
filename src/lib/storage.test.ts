import { describe, expect, it } from 'vitest';

import { addDays, daysBetween, formatCountdown, toDateKey } from './dateUtils';
import { activeStreak, recordDailyCompletion } from './storage';
import type { StreakState } from './types';

const base: StreakState = { current: 0, longest: 0, lastCompletedDate: null };

describe('dateUtils', () => {
  it('formats a local date without drifting across timezones', () => {
    expect(toDateKey(new Date(2026, 9, 2, 23, 30))).toBe('2026-10-02');
    expect(toDateKey(new Date(2026, 0, 1, 0, 15))).toBe('2026-01-01');
  });

  it('adds days across month boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });

  it('counts whole days between dates', () => {
    expect(daysBetween('2026-09-09', '2026-10-02')).toBe(23);
    expect(daysBetween('2026-10-02', '2026-09-09')).toBe(-23);
  });

  it('formats a countdown', () => {
    expect(formatCountdown(3 * 3600_000 + 4 * 60_000 + 5000)).toBe('3:04:05');
    expect(formatCountdown(-1)).toBe('0:00:00');
  });
});

describe('streaks', () => {
  it('starts at one', () => {
    expect(recordDailyCompletion(base, '2026-10-02').current).toBe(1);
  });

  it('extends on consecutive days', () => {
    const day1 = recordDailyCompletion(base, '2026-10-01');
    const day2 = recordDailyCompletion(day1, '2026-10-02');
    expect(day2.current).toBe(2);
    expect(day2.longest).toBe(2);
  });

  it('resets after a missed day but remembers the best run', () => {
    let streak = recordDailyCompletion(base, '2026-10-01');
    streak = recordDailyCompletion(streak, '2026-10-02');
    streak = recordDailyCompletion(streak, '2026-10-05');
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(2);
  });

  it('ignores a second completion on the same day', () => {
    const once = recordDailyCompletion(base, '2026-10-02');
    expect(recordDailyCompletion(once, '2026-10-02')).toBe(once);
  });

  it('displays zero once a day has been skipped', () => {
    const now = new Date(2026, 9, 5);
    expect(activeStreak({ current: 4, longest: 4, lastCompletedDate: '2026-10-05' }, now)).toBe(4);
    expect(activeStreak({ current: 4, longest: 4, lastCompletedDate: '2026-10-04' }, now)).toBe(4);
    expect(activeStreak({ current: 4, longest: 4, lastCompletedDate: '2026-10-03' }, now)).toBe(0);
    expect(activeStreak(base, now)).toBe(0);
  });
});
