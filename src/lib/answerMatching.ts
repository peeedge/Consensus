/**
 * Deterministic answer matching.
 *
 * No network, no model, no randomness: the same guess against the same puzzle
 * always resolves the same way, and `matchGuess` reports *which* rule accepted
 * a guess so the behaviour stays inspectable.
 *
 * Guesses are run through four stages, strictest first:
 *   1. exact    — normalised forms are identical
 *   2. compact  — identical once spaces are removed ("sun glasses" → "sunglasses")
 *   3. contains — the guess contains every word of the target ("cell phone charger")
 *   4. fuzzy    — small edit distance, to forgive typos ("sunscreem")
 */

import type { MatchResult, MatchStrategy, Puzzle } from './types';

/** Words that carry no meaning in a one-line survey answer. */
const STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'my',
  'your',
  'our',
  'their',
  'his',
  'her',
  'its',
  'some',
  'any',
  'that',
  'this',
  'these',
  'those',
]);

/** Regional and common misspellings folded onto one form, applied per word. */
const SPELLING_VARIANTS: Record<string, string> = {
  colour: 'color',
  favourite: 'favorite',
  flavour: 'flavor',
  grey: 'gray',
  jewellery: 'jewelry',
  pyjamas: 'pajamas',
  pjs: 'pajamas',
  practise: 'practice',
  theatre: 'theater',
  travelling: 'traveling',
  tyre: 'tire',
  mum: 'mom',
  mummy: 'mom',
  mobile: 'phone',
  cellphone: 'phone',
  cell: 'phone',
  telly: 'tv',
  television: 'tv',
  fridge: 'refrigerator',
  photograph: 'photo',
  picture: 'photo',
  pic: 'photo',
  recieve: 'receive',
  definately: 'definitely',
  seperate: 'separate',
};

/** Plurals that simple suffix rules get wrong. */
const IRREGULAR_PLURALS: Record<string, string> = {
  children: 'child',
  men: 'man',
  women: 'woman',
  people: 'person',
  teeth: 'tooth',
  feet: 'foot',
  mice: 'mouse',
  geese: 'goose',
  knives: 'knife',
  leaves: 'leaf',
  shelves: 'shelf',
  wives: 'wife',
  lives: 'life',
  halves: 'half',
  loaves: 'loaf',
  scarves: 'scarf',
  thieves: 'thief',
};

/** Words ending in `s` that are already singular. */
const ALWAYS_SINGULAR = new Set([
  'glass',
  'dress',
  'class',
  'pants',
  'shorts',
  'jeans',
  'news',
  'bus',
  'gas',
  'kiss',
  'boss',
  'stress',
  'chess',
  'mess',
  'less',
  'this',
  'is',
  'his',
  'was',
  'has',
  'as',
  'us',
  'yes',
  'plus',
  'bonus',
  'series',
  'species',
]);

/** Reduces a single word to a comparable stem. */
export function singularize(word: string): string {
  if (IRREGULAR_PLURALS[word]) return IRREGULAR_PLURALS[word];
  if (word.length <= 3) return word;
  if (ALWAYS_SINGULAR.has(word)) return word;

  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('sses')) return word.slice(0, -2);
  if (/(ch|sh|x|z|s)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith('ss') || word.endsWith('us') || word.endsWith('is')) return word;
  if (word.endsWith('s')) return word.slice(0, -1);
  return word;
}

/** Strips accents, punctuation and casing, leaving lowercase words and spaces. */
function clean(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[''`\u2018\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Splits a phrase into meaningful, stemmed words. */
export function tokenize(input: string): string[] {
  const cleaned = clean(input);
  if (!cleaned) return [];

  const words = cleaned
    .split(' ')
    .map((word) => SPELLING_VARIANTS[word] ?? word)
    .map(singularize)
    .map((word) => SPELLING_VARIANTS[word] ?? word)
    .filter((word) => word.length > 0 && !STOP_WORDS.has(word));

  // A guess made entirely of stop words ("the") still deserves a comparison.
  return words.length > 0 ? words : cleaned.split(' ');
}

/** Canonical comparison key: stemmed words joined by single spaces. */
export function normalize(input: string): string {
  return tokenize(input).join(' ');
}

/** Space-insensitive key, so "sun glasses" and "sunglasses" agree. */
function compact(input: string): string {
  return normalize(input).replace(/ /g, '');
}

/** Damerau-Levenshtein distance, bounded so long mismatches bail out early. */
export function editDistance(a: string, b: string, max = 3): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;

  const rows = a.length + 1;
  const cols = b.length + 1;
  let prevPrev: number[] = [];
  let prev: number[] = Array.from({ length: cols }, (_, i) => i);
  let current: number[] = new Array(cols);

  for (let i = 1; i < rows; i += 1) {
    current = new Array(cols);
    current[0] = i;
    let rowMin = current[0];

    for (let j = 1; j < cols; j += 1) {
      const substitution = a[i - 1] === b[j - 1] ? 0 : 1;
      let value = Math.min(
        prev[j] + 1,
        current[j - 1] + 1,
        prev[j - 1] + substitution,
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        value = Math.min(value, prevPrev[j - 2] + 1);
      }
      current[j] = value;
      if (value < rowMin) rowMin = value;
    }

    if (rowMin > max) return max + 1;
    prevPrev = prev;
    prev = current;
  }

  return prev[cols - 1];
}

/** How much misspelling to forgive, based on how long the word is. */
function fuzzyTolerance(length: number): number {
  if (length <= 4) return 0;
  if (length <= 7) return 1;
  return 2;
}

interface Candidate {
  answerIndex: number;
  /** The original accepted term, for display. */
  term: string;
  normalized: string;
  compact: string;
  tokens: Set<string>;
  percentage: number;
}

/** Flattens a puzzle's canonical answers and aliases into comparable candidates. */
function buildCandidates(puzzle: Puzzle): Candidate[] {
  const candidates: Candidate[] = [];

  puzzle.answers.forEach((answer, answerIndex) => {
    const terms = [answer.answer, ...answer.aliases];
    const seen = new Set<string>();

    for (const term of terms) {
      const normalized = normalize(term);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      candidates.push({
        answerIndex,
        term,
        normalized,
        compact: compact(term),
        tokens: new Set(tokenize(term)),
        percentage: answer.percentage,
      });
    }
  });

  return candidates;
}

const candidateCache = new WeakMap<Puzzle, Candidate[]>();

function getCandidates(puzzle: Puzzle): Candidate[] {
  let candidates = candidateCache.get(puzzle);
  if (!candidates) {
    candidates = buildCandidates(puzzle);
    candidateCache.set(puzzle, candidates);
  }
  return candidates;
}

const STRATEGY_RANK: Record<MatchStrategy, number> = {
  exact: 0,
  compact: 1,
  contains: 2,
  fuzzy: 3,
};

interface ScoredMatch extends MatchResult {
  termLength: number;
  percentage: number;
}

/** Orders matches best-first: strictest rule, then closest, then most specific, then most popular. */
function compareMatches(a: ScoredMatch, b: ScoredMatch): number {
  const byStrategy = STRATEGY_RANK[a.strategy] - STRATEGY_RANK[b.strategy];
  if (byStrategy !== 0) return byStrategy;
  if (a.distance !== b.distance) return a.distance - b.distance;
  if (a.termLength !== b.termLength) return b.termLength - a.termLength;
  if (a.percentage !== b.percentage) return b.percentage - a.percentage;
  return a.answerIndex - b.answerIndex;
}

/** Resolves a raw guess to an answer index, or null when nothing matches. */
export function matchGuess(puzzle: Puzzle, rawGuess: string): MatchResult | null {
  const guessNormalized = normalize(rawGuess);
  if (!guessNormalized) return null;

  const guessCompact = guessNormalized.replace(/ /g, '');
  const guessTokens = tokenize(rawGuess);
  const guessTokenSet = new Set(guessTokens);
  const matches: ScoredMatch[] = [];

  const record = (candidate: Candidate, strategy: MatchStrategy, distance: number) => {
    matches.push({
      answerIndex: candidate.answerIndex,
      matchedTerm: candidate.term,
      strategy,
      distance,
      termLength: candidate.normalized.length,
      percentage: candidate.percentage,
    });
  };

  for (const candidate of getCandidates(puzzle)) {
    if (candidate.normalized === guessNormalized) {
      record(candidate, 'exact', 0);
      continue;
    }

    if (candidate.compact === guessCompact) {
      record(candidate, 'compact', 0);
      continue;
    }

    // "cell phone charger" should reach "phone charger", but a bare "phone"
    // must not: every word of the target has to appear in the guess, and the
    // guess may only add a little extra context.
    if (
      candidate.tokens.size > 0 &&
      guessTokens.length > candidate.tokens.size &&
      guessTokens.length - candidate.tokens.size <= 3
    ) {
      let containsAll = true;
      for (const token of candidate.tokens) {
        if (!guessTokenSet.has(token)) {
          containsAll = false;
          break;
        }
      }
      if (containsAll) {
        record(candidate, 'contains', guessTokens.length - candidate.tokens.size);
        continue;
      }
    }

    const tolerance = fuzzyTolerance(
      Math.max(candidate.compact.length, guessCompact.length),
    );
    if (tolerance > 0) {
      const distance = editDistance(guessCompact, candidate.compact, tolerance);
      if (distance <= tolerance) {
        record(candidate, 'fuzzy', distance);
      }
    }
  }

  if (matches.length === 0) return null;

  const [{ answerIndex, matchedTerm, strategy, distance }] = matches.sort(compareMatches);
  return { answerIndex, matchedTerm, strategy, distance };
}
