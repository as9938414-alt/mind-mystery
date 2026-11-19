import type { CandidateRecord } from './types.ts';

const PRIMES_UP_TO_1000 = (() => {
  const sieve = new Array<boolean>(1001).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i * i <= 1000; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= 1000; j += i) sieve[j] = false;
    }
  }
  const set = new Set<number>();
  for (let i = 2; i <= 1000; i++) if (sieve[i]) set.add(i);
  return set;
})();

const SQUARES_UP_TO_1000 = new Set<number>(
  Array.from({ length: 32 }, (_, i) => (i + 1) * (i + 1)).filter((n) => n <= 1000)
);

function digitSum(n: number): number {
  let s = 0;
  let x = n;
  while (x > 0) {
    s += x % 10;
    x = Math.floor(x / 10);
  }
  return s;
}

export function generateNumberCandidates(rangeLabel: string | null): {
  candidates: CandidateRecord[];
  min: number;
  max: number;
} {
  const max = rangeLabel && rangeLabel.includes('1000') ? 1000 : 100;
  const min = 1;
  const candidates: CandidateRecord[] = [];
  for (let n = min; n <= max; n++) {
    const ds = digitSum(n);
    candidates.push({
      id: `number_${n}`,
      category: 'number',
      industry: rangeLabel || '1–100',
      name: `${n}`,
      subtitle: `${n % 2 === 0 ? 'Even' : 'Odd'}${PRIMES_UP_TO_1000.has(n) ? ' · Prime' : ''}${
        SQUARES_UP_TO_1000.has(n) ? ' · Perfect Square' : ''
      } · Digit sum ${ds}`,
      releaseYear: null,
      endYear: null,
      decade: null,
      era: null,
      popularityPrior: 1.0,
      verified: true,
      attributes: {
        num_value: n,
        parity: n % 2 === 0 ? 'even' : 'odd',
        is_prime: PRIMES_UP_TO_1000.has(n) ? 'yes' : 'no',
        is_square: SQUARES_UP_TO_1000.has(n) ? 'yes' : 'no',
        mult_3: n % 3 === 0 ? 'yes' : 'no',
        mult_5: n % 5 === 0 ? 'yes' : 'no',
        mult_7: n % 7 === 0 ? 'yes' : 'no',
        digit_sum_even: ds % 2 === 0 ? 'yes' : 'no',
        digit_sum_gt_9: ds > 9 ? 'yes' : 'no',
        keywords: `${n}`,
      },
    });
  }
  return { candidates, min, max };
}

const MONTHS = [
  { num: 1, name: 'January', days: 31, season: 'winter' },
  { num: 2, name: 'February', days: 29, season: 'winter' },
  { num: 3, name: 'March', days: 31, season: 'spring' },
  { num: 4, name: 'April', days: 30, season: 'spring' },
  { num: 5, name: 'May', days: 31, season: 'spring' },
  { num: 6, name: 'June', days: 30, season: 'summer' },
  { num: 7, name: 'July', days: 31, season: 'summer' },
  { num: 8, name: 'August', days: 31, season: 'summer' },
  { num: 9, name: 'September', days: 30, season: 'autumn' },
  { num: 10, name: 'October', days: 31, season: 'autumn' },
  { num: 11, name: 'November', days: 30, season: 'autumn' },
  { num: 12, name: 'December', days: 31, season: 'winter' },
];

export function generateDobCandidates(yearRangeLabel: string | null): CandidateRecord[] {
  const candidates: CandidateRecord[] = [];
  let doy = 0;
  for (const m of MONTHS) {
    const halfOfYear = m.num <= 6 ? 'jan_jun' : 'jul_dec';
    const quarter =
      m.num <= 3 ? 'Q1_Jan_Mar' : m.num <= 6 ? 'Q2_Apr_Jun' : m.num <= 9 ? 'Q3_Jul_Sep' : 'Q4_Oct_Dec';
    const monthPosInQuarter = ((m.num - 1) % 3) === 0 ? 'first_month' : ((m.num - 1) % 3) === 1 ? 'second_month' : 'third_month';

    for (let d = 1; d <= m.days; d++) {
      doy++;
      const dayHalf = d <= 15 ? 'first_15' : 'after_15';
      const dayQuarter = d <= 8 ? '1_8' : d <= 15 ? '9_15' : d <= 23 ? '16_23' : '24_31';
      candidates.push({
        id: `dob_${m.num}_${d}`,
        category: 'dob',
        industry: yearRangeLabel || 'Any / Skip Birth Year',
        name: `${d} ${m.name}`,
        subtitle:
          yearRangeLabel && !yearRangeLabel.startsWith('Any')
            ? `Birth-year range ${yearRangeLabel} · ${m.season[0].toUpperCase() + m.season.slice(1)} birthday`
            : `Calendar date · ${m.season[0].toUpperCase() + m.season.slice(1)}`,
        releaseYear: null,
        endYear: null,
        decade: null,
        era: null,
        popularityPrior: m.num === 2 && d === 29 ? 0.25 : 1.0,
        verified: true,
        attributes: {
          month_num: m.num,
          day_num: d,
          doy,
          half_of_year: halfOfYear,
          quarter,
          month_in_quarter: monthPosInQuarter,
          season: m.season,
          day_half: dayHalf,
          day_quarter: dayQuarter,
          day_parity: d % 2 === 0 ? 'even' : 'odd',
          day_mod4: `r${d % 4}`,
          keywords: `${d} ${m.name.toLowerCase()}`,
        },
      });
    }
  }
  return candidates;
}

export function evaluateDynamicAttribute(candidate: CandidateRecord, attributeKey: string): string | null {
  // Number dynamic range splits: num_gt_50 -> 'yes' | 'no'
  if (attributeKey.startsWith('num_gt_')) {
    const threshold = Number(attributeKey.slice('num_gt_'.length));
    const val = Number(candidate.attributes.num_value);
    if (Number.isNaN(threshold) || Number.isNaN(val)) return null;
    return val > threshold ? 'yes' : 'no';
  }
  // DOB dynamic day splits: dob_day_gt_12 -> 'yes' | 'no'
  if (attributeKey.startsWith('dob_day_gt_')) {
    const threshold = Number(attributeKey.slice('dob_day_gt_'.length));
    const val = Number(candidate.attributes.day_num);
    if (Number.isNaN(threshold) || Number.isNaN(val)) return null;
    return val > threshold ? 'yes' : 'no';
  }
  // DOB dynamic month splits: dob_month_gt_6 -> 'yes' | 'no'
  if (attributeKey.startsWith('dob_month_gt_')) {
    const threshold = Number(attributeKey.slice('dob_month_gt_'.length));
    const val = Number(candidate.attributes.month_num);
    if (Number.isNaN(threshold) || Number.isNaN(val)) return null;
    return val > threshold ? 'yes' : 'no';
  }
  // Dynamic release/debut year splits for media & sports: year_gt_2015 -> 'yes' | 'no'
  if (attributeKey.startsWith('year_gt_')) {
    const threshold = Number(attributeKey.slice('year_gt_'.length));
    const yr = candidate.releaseYear;
    if (Number.isNaN(threshold) || yr === null || yr === undefined) return null;
    return yr > threshold ? 'yes' : 'no';
  }
  // Universal name-based tie-breakers (used after domain attributes to disambiguate close candidates)
  if (attributeKey === 'name_alpha_half') {
    const ch = candidate.name.trim().replace(/^[^a-zA-Z]+/, '').toUpperCase().charAt(0);
    if (!ch || ch < 'A' || ch > 'Z') return null;
    return ch <= 'M' ? 'a_m' : 'n_z';
  }
  if (attributeKey === 'name_alpha_quarter') {
    const ch = candidate.name.trim().replace(/^[^a-zA-Z]+/, '').toUpperCase().charAt(0);
    if (!ch || ch < 'A' || ch > 'Z') return null;
    if (ch <= 'F') return 'a_f';
    if (ch <= 'M') return 'g_m';
    if (ch <= 'S') return 'n_s';
    return 't_z';
  }
  if (attributeKey === 'name_word_count') {
    const words = candidate.name.trim().split(/\s+/).filter(Boolean).length;
    return words === 1 ? 'single' : 'multi';
  }
  const raw = candidate.attributes[attributeKey];
  if (raw === undefined || raw === null) return null;
  return String(raw);
}
