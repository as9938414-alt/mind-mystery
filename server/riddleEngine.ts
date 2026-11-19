import { ThinkingLevel, Type } from '@google/genai';
import {
  RIDDLE_CATEGORIES,
  RiddleCategoryId,
  RiddleDifficulty,
  RiddleEvaluation,
  RiddleQuestion,
} from '../src/types.ts';
import { generateStructuredJson } from './gemini.ts';
import { recordRiddleResult } from './storage.ts';

interface StoredRiddle extends RiddleQuestion {
  correctIndex: number;
  explanation: string;
}

const activeRiddles = new Map<string, StoredRiddle>();

const DIFFICULTY_META: Record<RiddleDifficulty, { basePoints: number; timeLimitSeconds: number }> = {
  Easy: { basePoints: 15, timeLimitSeconds: 30 },
  Medium: { basePoints: 30, timeLimitSeconds: 40 },
  Hard: { basePoints: 50, timeLimitSeconds: 50 },
};

const RIDDLE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    subtopic: { type: Type.STRING },
    question: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    correctIndex: { type: Type.INTEGER, description: '0-based index (0 to 3) of the single verified correct option.' },
    hint: { type: Type.STRING },
    explanation: { type: Type.STRING },
  },
  required: ['subtopic', 'question', 'options', 'correctIndex', 'hint', 'explanation'],
};

export async function generateRiddle(params: {
  category: RiddleCategoryId;
  difficulty: RiddleDifficulty;
  excludeQuestions?: string[];
}): Promise<RiddleQuestion> {
  const cat = RIDDLE_CATEGORIES.find((c) => c.id === params.category) ?? RIDDLE_CATEGORIES[0];
  const meta = DIFFICULTY_META[params.difficulty];
  const randomTopic = cat.topics[Math.floor(Math.random() * cat.topics.length)];
  const excludes = (params.excludeQuestions ?? []).slice(-12);

  const systemInstruction = `You are the question master for MINDMYSTERY's "The Brain Arena".
Generate ONE high-quality, engaging, factually accurate riddle or brain challenge with 4 distinct multiple-choice options.
Rules:
1. Domain: ${cat.name} (topics: ${cat.topics.join(', ')}). Focus on "${randomTopic}".
2. Difficulty: ${params.difficulty}.
3. For Politics & Governance and General Knowledge: Use verified, factual, and strictly politically neutral information. Never take partisan stances.
4. Ensure exactly ONE unambiguously correct option among the 4 choices (correctIndex 0..3).
5. Provide a clever, non-spoiler hint and a clear 1–2 sentence factual explanation.
6. NEVER repeat any question listed in the excluded list.`;

  const prompt = `Create a fresh ${params.difficulty} challenge in "${cat.name}" (focus area: ${randomTopic}).
${excludes.length > 0 ? `Do NOT repeat or closely paraphrase these already-asked questions:\n${excludes.map((q) => `- ${q}`).join('\n')}` : ''}`;

  const data = await generateStructuredJson<{
    subtopic: string;
    question: string;
    options: string[];
    correctIndex: number;
    hint: string;
    explanation: string;
  }>({
    systemInstruction,
    prompt,
    schema: RIDDLE_SCHEMA,
    thinkingLevel: ThinkingLevel.LOW,
  });

  const safeOptions = (data.options ?? []).slice(0, 4);
  while (safeOptions.length < 4) {
    safeOptions.push(`Option ${safeOptions.length + 1}`);
  }
  const safeCorrectIdx = Math.min(3, Math.max(0, Number.isInteger(data.correctIndex) ? data.correctIndex : 0));

  const id = `rd_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const stored: StoredRiddle = {
    id,
    category: cat.id,
    difficulty: params.difficulty,
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
  };
}

export function evaluateRiddleAnswer(params: {
  riddleId: string;
  userId: string;
  selectedIndex: number | null;
  usedHint: boolean;
  secondsRemaining: number;
  timedOut?: boolean;
}): RiddleEvaluation & { userStats: ReturnType<typeof recordRiddleResult>['user'] } {
  const riddle = activeRiddles.get(params.riddleId);
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

  const { user, newBadges } = recordRiddleResult({
    userId: params.userId,
    category: riddle.category,
    subtopic: riddle.subtopic,
    correct,
    pointsAwarded,
  });

  // Clean up solved riddle so it cannot be re-submitted for duplicate points
  activeRiddles.delete(params.riddleId);

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
