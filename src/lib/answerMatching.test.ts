import { describe, expect, it } from 'vitest';

import { PUZZLES } from '../data/puzzles';
import { matchGuess, normalize, singularize } from './answerMatching';
import type { Puzzle } from './types';

function puzzle(id: string): Puzzle {
  const found = PUZZLES.find((entry) => entry.id === id);
  if (!found) throw new Error(`No puzzle ${id}`);
  return found;
}

const vacation = puzzle('vacation-forget');
const beach = puzzle('beach-bring');
const losing = puzzle('lose-at-home');

function indexOf(target: Puzzle, guess: string): number | null {
  return matchGuess(target, guess)?.answerIndex ?? null;
}

describe('normalize', () => {
  it('strips case, punctuation and padding', () => {
    expect(normalize('  Phone-Charger!! ')).toBe('phone charger');
  });

  it('drops leading articles and possessives', () => {
    expect(normalize('my phone charger')).toBe('phone charger');
    expect(normalize('The Toothbrush')).toBe('toothbrush');
  });

  it('folds accents and ampersands', () => {
    expect(normalize('café')).toBe('cafe');
    expect(normalize('salt & pepper')).toBe('salt and pepper');
  });

  it('never returns an empty string for a stop-word-only guess', () => {
    expect(normalize('the')).toBe('the');
  });
});

describe('singularize', () => {
  it.each([
    ['chargers', 'charger'],
    ['keys', 'key'],
    ['batteries', 'battery'],
    ['glasses', 'glass'],
    ['dishes', 'dish'],
    ['knives', 'knife'],
    ['children', 'child'],
    ['bus', 'bus'],
    ['dress', 'dress'],
  ])('%s -> %s', (input, expected) => {
    expect(singularize(input)).toBe(expected);
  });
});

describe('matchGuess', () => {
  it('matches the canonical answer', () => {
    expect(indexOf(vacation, 'phone charger')).toBe(0);
  });

  it('matches a declared alias', () => {
    expect(indexOf(vacation, 'charging cable')).toBe(0);
  });

  it('is case and punctuation insensitive', () => {
    expect(indexOf(vacation, '  TOOTHBRUSH.  ')).toBe(1);
  });

  it('handles plural variants', () => {
    expect(indexOf(vacation, 'chargers')).toBe(0);
    expect(indexOf(vacation, 'passports')).toBe(2);
  });

  it('ignores spacing differences', () => {
    expect(indexOf(vacation, 'sun glasses')).toBe(6);
    expect(indexOf(vacation, 'tooth brush')).toBe(1);
  });

  it('accepts a more specific phrasing of the same answer', () => {
    expect(indexOf(vacation, 'cell phone charger')).toBe(0);
  });

  it('forgives small misspellings', () => {
    expect(indexOf(vacation, 'sunscreem')).toBe(3);
    expect(indexOf(beach, 'umbrela')).toBe(2);
  });

  it('rejects answers that are not on the board', () => {
    expect(indexOf(vacation, 'snorkel')).toBeNull();
    expect(indexOf(vacation, 'a reason to come home')).toBeNull();
  });

  it('does not let a bare word stand in for a two-word answer', () => {
    expect(indexOf(vacation, 'phone')).toBeNull();
  });

  it('keeps near-identical answers on the same board apart', () => {
    expect(indexOf(losing, 'phone')).toBe(1);
    expect(indexOf(losing, 'phone charger')).toBe(6);
    expect(indexOf(losing, 'my keys')).toBe(0);
  });

  it('reports which rule accepted the guess', () => {
    expect(matchGuess(vacation, 'phone charger')?.strategy).toBe('exact');
    expect(matchGuess(vacation, 'phonecharger')?.strategy).toBe('compact');
    expect(matchGuess(vacation, 'cell phone charger')?.strategy).toBe('contains');
    expect(matchGuess(vacation, 'sunscreem')?.strategy).toBe('fuzzy');
  });

  it('returns null for blank input', () => {
    expect(matchGuess(vacation, '   ')).toBeNull();
  });

  it('is deterministic', () => {
    const first = matchGuess(beach, 'suncream');
    const second = matchGuess(beach, 'suncream');
    expect(first).toEqual(second);
  });
});

describe('puzzle catalogue', () => {
  it('has at least twenty puzzles', () => {
    expect(PUZZLES.length).toBeGreaterThanOrEqual(20);
  });

  it.each(PUZZLES.map((entry) => [entry.id, entry] as const))(
    '%s is well formed',
    (_id, entry) => {
      const total = entry.answers.reduce((sum, answer) => sum + answer.percentage, 0);
      expect(total).toBe(100);
      expect(entry.answers.length).toBeGreaterThanOrEqual(6);
      expect(entry.answers.length).toBeLessThanOrEqual(8);

      const percentages = entry.answers.map((answer) => answer.percentage);
      expect([...percentages].sort((a, b) => b - a)).toEqual(percentages);
    },
  );

  it('has unique ids and dates', () => {
    expect(new Set(PUZZLES.map((entry) => entry.id)).size).toBe(PUZZLES.length);
    expect(new Set(PUZZLES.map((entry) => entry.date)).size).toBe(PUZZLES.length);
  });

  it('never maps one accepted term onto two different answers', () => {
    for (const entry of PUZZLES) {
      const owners = new Map<string, number>();
      entry.answers.forEach((answer, index) => {
        for (const term of [answer.answer, ...answer.aliases]) {
          const key = normalize(term);
          const existing = owners.get(key);
          expect(
            existing === undefined || existing === index,
            `"${term}" is claimed by two answers in ${entry.id}`,
          ).toBe(true);
          owners.set(key, index);
        }
      });
    }
  });

  it('resolves every canonical answer and alias back to its own answer', () => {
    for (const entry of PUZZLES) {
      entry.answers.forEach((answer, index) => {
        for (const term of [answer.answer, ...answer.aliases]) {
          expect(
            matchGuess(entry, term)?.answerIndex,
            `"${term}" in ${entry.id} should resolve to answer ${index}`,
          ).toBe(index);
        }
      });
    }
  });
});
