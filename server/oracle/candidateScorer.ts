import type { CandidateRecord, ConfidenceLabel, RankedCandidate } from './types.ts';
import { evaluateDynamicAttribute } from './deterministicPools.ts';

export const NOT_SURE_VALUE = '__not_sure__';
export const MISMATCH_MULTIPLIER = 0.08;
export const MATCH_MULTIPLIER = 1.0;

export function initializeScores(candidates: CandidateRecord[]): Record<string, number> {
  const scores: Record<string, number> = {};
  let sum = 0;
  for (const c of candidates) {
    const prior = Math.max(0.01, c.popularityPrior || 1.0);
    scores[c.id] = prior;
    sum += prior;
  }
  if (sum <= 0) return scores;
  for (const id of Object.keys(scores)) {
    scores[id] /= sum;
  }
  return scores;
}

export function normalizeScores(scores: Record<string, number>): Record<string, number> {
  let sum = 0;
  for (const v of Object.values(scores)) {
    sum += v;
  }
  if (sum <= 0) {
    const ids = Object.keys(scores);
    const uniform = ids.length > 0 ? 1 / ids.length : 0;
    const reset: Record<string, number> = {};
    for (const id of ids) reset[id] = uniform;
    return reset;
  }
  const next: Record<string, number> = {};
  for (const [id, v] of Object.entries(scores)) {
    next[id] = v / sum;
  }
  return next;
}

export function applyAnswerToScores(
  candidates: CandidateRecord[],
  currentScores: Record<string, number>,
  attributeKey: string,
  answerValue: string
): Record<string, number> {
  if (answerValue === NOT_SURE_VALUE) {
    return { ...currentScores };
  }

  const next: Record<string, number> = {};
  for (const c of candidates) {
    const base = currentScores[c.id] ?? 0;
    const candidateVal = evaluateDynamicAttribute(c, attributeKey);
    if (candidateVal === null) {
      // Unknown attribute on candidate: mild neutral factor
      next[c.id] = base * 0.5;
    } else if (candidateVal === answerValue) {
      next[c.id] = base * MATCH_MULTIPLIER;
    } else {
      next[c.id] = base * MISMATCH_MULTIPLIER;
    }
  }
  return normalizeScores(next);
}


export function getConfidenceLabel(confidencePct: number): ConfidenceLabel {
  if (confidencePct < 40) return 'Wild guess';
  if (confidencePct < 70) return 'Educated guess';
  return 'Strong match';
}

export interface ScoringSnapshot {
  ranked: RankedCandidate[];
  topCandidate: RankedCandidate;
  runnersUp: RankedCandidate[];
  candidatesRemaining: number;
  topScorePct: number;
  confidencePct: number;
  confidenceLabel: ConfidenceLabel;
  shouldEarlyStop: boolean;
  rangeMin?: number;
  rangeMax?: number;
}

export function computeScoringSnapshot(
  candidates: CandidateRecord[],
  scores: Record<string, number>,
  questionCount: number
): ScoringSnapshot {
  const sorted = [...candidates]
    .map((c) => ({
      candidate: c,
      score: scores[c.id] ?? 0,
    }))
    .sort((a, b) => b.score - a.score);

  const top1 = sorted[0];
  const top2 = sorted[1];
  const topScore = top1 ? top1.score : 0;
  const secondScore = top2 ? top2.score : 0;

  // Remaining candidates = plausible contenders within 10% of the leader's probability
  const plausibleThreshold = Math.max(topScore * 0.12, 1e-6);
  const plausible = sorted.filter((s) => s.score >= plausibleThreshold);
  const candidatesRemaining = Math.max(1, plausible.length);

  // Honest confidence: top candidate normalized score reduced when runner-up is close
  const closenessRatio = topScore > 0 ? Math.min(1, secondScore / topScore) : 1;
  const adjustedConfidence = topScore * (1 - 0.38 * closenessRatio);
  const confidencePct = Math.max(1, Math.min(99, Math.round(adjustedConfidence * 100)));
  const topScorePct = Math.max(1, Math.min(99, Math.round(topScore * 100)));
  const confidenceLabel = getConfidenceLabel(confidencePct);

  // Early stop at question 7..9 if top candidate holds >= 70% score and leads runner-up by 3x
  const shouldEarlyStop =
    questionCount >= 7 &&
    questionCount <= 9 &&
    topScore >= 0.7 &&
    (secondScore <= 1e-9 || topScore >= 3.0 * secondScore);

  const ranked: RankedCandidate[] = sorted.slice(0, 4).map(({ candidate, score }) => ({
    id: candidate.id,
    name: candidate.name,
    subtitle: candidate.subtitle,
    category: candidate.category,
    industry: candidate.industry,
    releaseYear: candidate.releaseYear,
    endYear: candidate.endYear,
    decade: candidate.decade,
    era: candidate.era,
    scorePct: Math.max(1, Math.min(99, Math.round(score * 100))),
    posterUrl: candidate.posterUrl ?? null,
    attributes: candidate.attributes,
  }));

  let rangeMin: number | undefined;
  let rangeMax: number | undefined;
  if (candidates[0]?.category === 'number') {
    const plausibleNums = plausible.map((p) => Number(p.candidate.attributes.num_value)).filter((n) => !Number.isNaN(n));
    if (plausibleNums.length > 0) {
      rangeMin = Math.min(...plausibleNums);
      rangeMax = Math.max(...plausibleNums);
    }
  }

  return {
    ranked,
    topCandidate: ranked[0],
    runnersUp: ranked.slice(1, 4),
    candidatesRemaining,
    topScorePct,
    confidencePct,
    confidenceLabel,
    shouldEarlyStop,
    rangeMin,
    rangeMax,
  };
}
