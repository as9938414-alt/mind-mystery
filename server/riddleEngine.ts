import {
  RIDDLE_CATEGORIES,
  RiddleCategoryId,
  RiddleDifficulty,
  RiddleEvaluation,
  RiddleQuestion,
} from '../src/types.ts';
import { RIDDLE_BANK } from './riddleBank.ts';
import { open, seal } from './sealedState.ts';
import { recordRiddleResult } from './storage.ts';

type RiddleData = {
  subtopic: string;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  explanation: string;
};

function pickBankRiddle(category: RiddleCategoryId, excludes: string[]): RiddleData {
  const bank = RIDDLE_BANK[category] ?? RIDDLE_BANK.general;
  const fresh = bank.filter((r) => !excludes.includes(r.question));
  const pool = fresh.length > 0 ? fresh : bank;
  const r = pool[Math.floor(Math.random() * pool.length)];
  // Shuffle options so repeat visitors don't memorise positions.
  const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  return {
    subtopic: r.subtopic,
    question: r.question,
    options: order.map((i) => r.options[i]),
    correctIndex: order.indexOf(r.correctIndex),
    hint: r.hint,
    explanation: r.explanation,
  };
}

interface StoredRiddle extends RiddleQuestion {
  correctIndex: number;
  explanation: string;
}

const activeRiddles = new Map<string, StoredRiddle>();
// Best-effort replay guard (per instance) so one riddle can't be scored twice.
const answeredRiddles = new Set<string>();

const DIFFICULTY_META: Record<RiddleDifficulty, { basePoints: number; timeLimitSeconds: number }> = {
  Easy: { basePoints: 15, timeLimitSeconds: 30 },
  Medium: { basePoints: 30, timeLimitSeconds: 40 },
  Hard: { basePoints: 50, timeLimitSeconds: 50 },
};


export async function generateRiddle(params: {
  category: RiddleCategoryId;
  difficulty: RiddleDifficulty;
  excludeQuestions?: string[];
}): Promise<RiddleQuestion> {
  const cat = RIDDLE_CATEGORIES.find((c) => c.id === params.category) ?? RIDDLE_CATEGORIES[0];
  const difficulty: RiddleDifficulty = DIFFICULTY_META[params.difficulty] ? params.difficulty : 'Medium';
  const meta = DIFFICULTY_META[difficulty];
  const randomTopic = cat.topics[Math.floor(Math.random() * cat.topics.length)];
  // Verified riddles only: every answer in the bank was checked by hand, so the Arena can never
  // mark a correct answer wrong. (AI-written riddles can contain false "facts".)
  const data = pickBankRiddle(cat.id, params.excludeQuestions ?? []);

  const safeOptions = (data.options ?? []).slice(0, 4);
  while (safeOptions.length < 4) {
    safeOptions.push(`Option ${safeOptions.length + 1}`);
  }
  const safeCorrectIdx = Math.min(3, Math.max(0, Number.isInteger(data.correctIndex) ? data.correctIndex : 0));

  const id = `rd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const stored: StoredRiddle = {
    id,
    category: cat.id,
    difficulty,
    subtopic: data.subtopic || randomTopic,
    question: data.question,
    options: safeOptions,
    hint: data.hint,
    timeLimitSeconds: meta.timeLimitSeconds,
    basePoints: meta.basePoints,
    correctIndex: safeCorrectIdx,
    explanation: data.explanation,
  };

  activeRiddles.set(id, stored);

  // Return public view without correctIndex
  return {
    id: stored.id,
    category: stored.category,
    difficulty: stored.difficulty,
    subtopic: stored.subtopic,
    question: stored.question,
    options: stored.options,
    hint: stored.hint,
    timeLimitSeconds: stored.timeLimitSeconds,
    basePoints: stored.basePoints,
    token: seal({ ...stored, issuedAt: Date.now() }),
  };
}

export async function evaluateRiddleAnswer(params: {
  riddleId: string;
  userId: string;
  selectedIndex: number | null;
  usedHint: boolean;
  secondsRemaining: number;
  timedOut?: boolean;
  token?: unknown;
}): Promise<RiddleEvaluation & { userStats: Awaited<ReturnType<typeof recordRiddleResult>>['user'] }> {
  let riddle = activeRiddles.get(params.riddleId);
  if (!riddle && !answeredRiddles.has(params.riddleId)) {
    // Serverless: the riddle may have been issued by another instance — reopen it from the sealed token.
    const restored = open<StoredRiddle & { issuedAt: number }>(params.token);
    if (restored && restored.id === params.riddleId && Date.now() - restored.issuedAt < 60 * 60 * 1000) {
      riddle = restored;
    }
  }
  if (!riddle) {
    throw new Error('Riddle session expired. Please load the next riddle.');
  }

  const timedOut = Boolean(params.timedOut || params.selectedIndex === null);
  const correct = !timedOut && params.selectedIndex === riddle.correctIndex;

  let pointsAwarded = 0;
  if (correct) {
    const timeBonus = Math.max(0, Math.round(params.secondsRemaining * 0.4));
    const hintPenalty = params.usedHint ? 5 : 0;
    pointsAwarded = Math.max(10, riddle.basePoints + timeBonus - hintPenalty);
  }

  const { user, newBadges } = await recordRiddleResult({
    userId: params.userId,
    category: riddle.category,
    subtopic: riddle.subtopic,
    correct,
    pointsAwarded,
  });

  // Clean up solved riddle so it cannot be re-submitted for duplicate points
  activeRiddles.delete(params.riddleId);
  answeredRiddles.add(params.riddleId);
  if (answeredRiddles.size > 5000) answeredRiddles.clear();

  return {
    correct,
    timedOut,
    correctIndex: riddle.correctIndex,
    correctOption: riddle.options[riddle.correctIndex],
    explanation: riddle.explanation,
    pointsAwarded,
    newBadges,
    userStats: user,
  };
}
