/**
 * Types for the offline "Oracle" deduction engine (Bayesian scoring over a curated,
 * attribute-tagged candidate database). Ported from the MIND-MYSTERY sibling project.
 */
import type { PredictionCategoryId } from '../../src/types.ts';

export type CategoryId = PredictionCategoryId;

export type MediaEra = 'classic' | '90s' | '2000s' | '2010s' | '2020s';

export type ConfidenceLabel = 'Wild guess' | 'Educated guess' | 'Strong match';

export interface CandidateRecord {
  id: string;
  category: CategoryId;
  industry: string | null;
  name: string;
  subtitle: string;
  releaseYear: number | null;
  endYear: number | null;
  decade: string | null;
  era: MediaEra | null;
  popularityPrior: number;
  verified: boolean;
  attributes: Record<string, string | boolean | number>;
  posterUrl?: string | null;
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface RankedCandidate {
  id: string;
  name: string;
  subtitle: string;
  category: CategoryId;
  industry: string | null;
  releaseYear: number | null;
  endYear: number | null;
  decade: string | null;
  era: MediaEra | null;
  scorePct: number;
  posterUrl?: string | null;
  attributes: Record<string, string | boolean | number>;
}
