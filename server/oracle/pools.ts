import { CATEGORY_INDUSTRIES } from '../../src/types.ts';
import { generateDobCandidates } from './deterministicPools.ts';
import { ACTOR_CANDIDATES } from './seed/actors.ts';
import {
  ANIMAL_CANDIDATES,
  COLOUR_CANDIDATES,
  FOOD_CANDIDATES,
  PLACE_CANDIDATES,
  WEATHER_CANDIDATES,
  WORD_CANDIDATES,
} from './seed/general.ts';
import { MOVIE_CANDIDATES } from './seed/movies.ts';
import { SINGER_CANDIDATES } from './seed/singers.ts';
import { SONG_CANDIDATES } from './seed/songs.ts';
import { SPORTS_CANDIDATES } from './seed/sports.ts';
import type { CandidateRecord, CategoryId } from './types.ts';

const VALID_ERAS = new Set(['classic', '90s', '2000s', '2010s', '2020s']);

function isValid(c: CandidateRecord): boolean {
  if (!c.id || !c.name || !c.category) return false;
  if (c.releaseYear !== null) {
    if (c.releaseYear < 1900 || c.releaseYear > 2027) return false;
    if (!c.era || !VALID_ERAS.has(c.era)) return false;
  }
  return Boolean(c.attributes) && Object.keys(c.attributes).length >= 4;
}

const ALL: CandidateRecord[] = [
  ...MOVIE_CANDIDATES,
  ...ACTOR_CANDIDATES,
  ...SONG_CANDIDATES,
  ...SINGER_CANDIDATES,
  ...SPORTS_CANDIDATES,
  ...FOOD_CANDIDATES,
  ...PLACE_CANDIDATES,
  ...COLOUR_CANDIDATES,
  ...ANIMAL_CANDIDATES,
  ...WEATHER_CANDIDATES,
  ...WORD_CANDIDATES,
].filter(isValid);

const byKey = new Map<string, CandidateRecord[]>();
for (const c of ALL) {
  for (const key of [`${c.category}|*`, `${c.category}|${c.industry ?? '*'}`]) {
    const list = byKey.get(key) ?? [];
    if (!list.includes(c)) list.push(c);
    byKey.set(key, list);
  }
}

/** Categories the offline Oracle can read without any AI call. */
export const ORACLE_CATEGORIES: CategoryId[] = [
  'movie',
  'actor',
  'song',
  'singer',
  'sports_person',
  'food',
  'place',
  'colour',
  'animal',
  'weather',
  'word',
  'dob',
];

export function isOracleCategory(cat: CategoryId): boolean {
  return ORACLE_CATEGORIES.includes(cat);
}

/** Resolves the industry: a valid choice, or a random one for categories that are split by industry. */
export function resolveIndustry(cat: CategoryId, industry?: string | null): string | null {
  const options = CATEGORY_INDUSTRIES[cat];
  if (!options || options.length === 0) return null;
  if (industry && options.includes(industry)) return industry;
  return options[Math.floor(Math.random() * options.length)];
}

export function loadPool(cat: CategoryId, industry: string | null): CandidateRecord[] {
  if (cat === 'dob') return generateDobCandidates(industry);
  return byKey.get(`${cat}|${industry ?? '*'}`) ?? byKey.get(`${cat}|*`) ?? [];
}

export function oracleStats() {
  return { candidates: ALL.length };
}
