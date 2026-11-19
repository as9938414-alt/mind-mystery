import { ThinkingLevel, Type } from '@google/genai';
import {
  GameMode,
  MindSessionState,
  PREDICTION_CATEGORIES,
  PredictionCategoryId,
  PredictionResult,
  QuestionPayload,
} from '../src/types.ts';
import {
  CANDIDATE_SEEDS,
  CATEGORY_STRATEGIES,
  FULL_ALPHABET,
  applyDeterministicAlphabetFilter,
  applyDeterministicNumberFilter,
  createNumberPool,
  isPrime,
} from './candidates.ts';
import { generateStructuredJson } from './gemini.ts';
import { getLearnedCorrectionsForCategory, saveLearnedCorrection } from './storage.ts';

interface QAHistoryItem {
  questionNumber: number;
  questionText: string;
  answer: string;
  questionTag?: string;
}

interface CandidateRank {
  name: string;
  score: number; // relative weight 0..100
  reason: string;
}

interface InternalMindSession {
  sessionId: string;
  userId: string;
  mode: GameMode;
  category: PredictionCategoryId | 'mystery';
  resolvedCategory: PredictionCategoryId;
  roundIndex: number;
  totalRounds: number;
  roundCategories: PredictionCategoryId[];
  roundResults: MindSessionState['roundResults'];
  numberRange?: { min: number; max: number };
  numberPool?: number[];
  alphabetPool?: string[];
  questionCount: number;
  maxQuestions: number;
  minQuestions: number;
  status: MindSessionState['status'];
  history: QAHistoryItem[];
  askedTags: string[];
  candidates: CandidateRank[];
  currentQuestion: QuestionPayload | null;
  currentQuestionTag?: string;
  prediction: PredictionResult | null;
}

const sessions = new Map<string, InternalMindSession>();

const ALL_CATEGORY_IDS = PREDICTION_CATEGORIES.map((c) => c.id);

function pickDistinctCategories(count: number, exclude: PredictionCategoryId[] = []): PredictionCategoryId[] {
  const pool = ALL_CATEGORY_IDS.filter((c) => !exclude.includes(c) && c !== 'dob');
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function toPublicState(s: InternalMindSession): MindSessionState {
  return {
    sessionId: s.sessionId,
    mode: s.mode,
    category: s.category,
    resolvedCategory: s.mode === 'surprise_me' && s.status === 'questioning' ? undefined : s.resolvedCategory,
    roundIndex: s.roundIndex,
    totalRounds: s.totalRounds,
    roundCategories: s.mode === 'surprise_me' && s.status === 'questioning' ? [] : s.roundCategories,
    roundResults: s.roundResults,
    numberRange: s.numberRange,
    questionCount: s.questionCount,
    maxQuestions: s.maxQuestions,
    status: s.status,
    currentQuestion: s.currentQuestion,
    prediction: s.prediction,
  };
}

function buildNumberQuestion(session: InternalMindSession): {
  question: QuestionPayload;
  tag: string;
} {
  const pool = session.numberPool ?? createNumberPool(1, 100);
  const qNum = session.questionCount + 1;
  const asked = new Set(session.askedTags);

  // Choose highest-information-gain deterministic split that hasn't been asked yet
  const sorted = [...pool].sort((a, b) => a - b);
  const mid = sorted[Math.floor((sorted.length - 1) / 2)];
  const minVal = sorted[0];
  const maxVal = sorted[sorted.length - 1];

  const evens = pool.filter((n) => n % 2 === 0).length;
  const odds = pool.length - evens;
  const primes = pool.filter((n) => isPrime(n)).length;

  let questionText = '';
  let options: string[] = [];
  let tag = '';

  const halfTag = `half:${mid}`;
  if (pool.length <= 2) {
    // Almost exact — ask a final confirming mathematical/cultural question
    const first = sorted[0];
    const second = sorted[1] ?? sorted[0];
    if (first !== second) {
      tag = `half:${first}`;
      questionText = `Final precision check: is your number ${first} or ${second}?`;
      options = [`Less than or equal to ${first}`, `Greater than ${first}`, 'Neither / I want to add a hint'];
    } else {
      tag = `final_confirm_${qNum}`;
      questionText = `Does your number hold special personal meaning (like a birthday, jersey, or lucky digit)?`;
      options = ['Yes, it feels personally lucky', 'No, picked purely at random', 'Mathematical favourite'];
    }
  } else if (qNum === 1 && !asked.has(halfTag)) {
    tag = halfTag;
    questionText = `Is your number ${mid} or lower, or higher than ${mid}?`;
    options = [`${minVal} to ${mid} (lower half)`, `${mid + 1} to ${maxVal} (higher half)`, `Exactly ${mid}`];
  } else if (!asked.has('parity') && evens > 0 && odds > 0 && qNum === 2) {
    tag = 'parity';
    questionText = 'Is the number you are thinking of an even number or an odd number?';
    options = ['Even number', 'Odd number', 'Not sure'];
  } else if (!asked.has(`half:${mid}`) && pool.length > 4) {
    tag = `half:${mid}`;
    questionText = `Looking between ${minVal} and ${maxVal}: is your number less than or equal to ${mid}, or greater than ${mid}?`;
    options = [`${mid} or lower`, `Higher than ${mid}`];
  } else if (!asked.has('div:5') && pool.some((n) => n % 5 === 0) && pool.some((n) => n % 5 !== 0) && qNum <= 6) {
    tag = 'div:5';
    questionText = 'Is your number cleanly divisible by 5 (ending in 0 or 5)?';
    options = ['Yes, divisible by 5', 'No, not divisible by 5'];
  } else if (!asked.has('prime') && primes > 0 && primes < pool.length && qNum <= 7) {
    tag = 'prime';
    questionText = 'Is your number a prime number (only divisible by 1 and itself)?';
    options = ['Yes, it is prime', 'No, it is not prime', 'Not sure'];
  } else if (!asked.has('div:3') && pool.some((n) => n % 3 === 0) && pool.some((n) => n % 3 !== 0)) {
    tag = 'div:3';
    questionText = 'Is your number a multiple of 3?';
    options = ['Yes, multiple of 3', 'No, not a multiple of 3', 'Not sure'];
  } else {
    // Binary split fallback
    tag = `half:${mid}`;
    questionText = `Let’s narrow further: is your number ${mid} or smaller, or larger than ${mid}?`;
    options = [`${mid} or smaller`, `Larger than ${mid}`];
  }

  const signalStrength = Math.min(94, Math.max(12, Math.round((1 / Math.max(1, pool.length)) * 100)));

  return {
    tag,
    question: {
      questionNumber: qNum,
      maxQuestions: session.maxQuestions,
      questionText,
      options,
      allowCustomInput: true,
      customPlaceholder: 'Or enter a custom mathematical clue...',
      aiInsight:
        qNum > 1
          ? `Eliminated non-matching integers; ${pool.length} valid ${pool.length === 1 ? 'candidate' : 'candidates'} remain in range.`
          : `Scanning integer range ${session.numberRange?.min ?? 1}–${session.numberRange?.max ?? 100}.`,
      signalStrength,
      remainingEstimate: `${pool.length} possible ${pool.length === 1 ? 'number' : 'numbers'} left`,
    },
  };
}

function buildAlphabetQuestion(session: InternalMindSession): {
  question: QuestionPayload;
  tag: string;
} {
  const pool = [...(session.alphabetPool ?? FULL_ALPHABET)].sort();
  const qNum = session.questionCount + 1;
  const asked = new Set(session.askedTags);

  let tag = '';
  let questionText = '';
  let options: string[] = [];

  if (!asked.has('alpha_half') && qNum === 1) {
    tag = 'alpha_half';
    questionText = 'Does your letter fall in the first half of the alphabet (A–M) or the second half (N–Z)?';
    options = ['First half (A–M)', 'Second half (N–Z)'];
  } else if (!asked.has('alpha_vowel') && pool.some((c) => 'AEIOU'.includes(c)) && pool.some((c) => !'AEIOU'.includes(c))) {
    tag = 'alpha_vowel';
    questionText = 'Is your letter a vowel (A, E, I, O, U) or a consonant?';
    options = ['It is a Vowel', 'It is a Consonant'];
  } else if (!asked.has('alpha_strokes') && pool.length > 2) {
    tag = 'alpha_strokes';
    questionText = 'When written in uppercase, is your letter drawn with only straight lines, or does it have curves?';
    options = ['Only straight lines (e.g. A, E, H, T)', 'Has curved strokes (e.g. B, C, O, S)'];
  } else if (pool.length > 2) {
    const midIdx = Math.floor((pool.length - 1) / 2);
    const pivot = pool[midIdx];
    tag = `alpha_split:${pivot}`;
    questionText = `Among the remaining letters, does yours come on or before "${pivot}", or after "${pivot}"?`;
    options = [`On or before ${pivot}`, `After ${pivot}`];
  } else if (!asked.has('alpha_sym')) {
    tag = 'alpha_sym';
    questionText = 'Is the uppercase letter visually symmetric (left-right or top-bottom mirror symmetry)?';
    options = ['Yes, visually symmetric', 'No, asymmetric'];
  } else {
    tag = `alpha_clue_${qNum}`;
    questionText = 'Does this letter start your own name, or a word you deeply like?';
    options = ['Starts my name or loved one’s name', 'Starts a favourite word', 'Just love how it looks/sounds'];
  }

  const signalStrength = Math.min(94, Math.max(12, Math.round((1 / Math.max(1, pool.length)) * 100)));

  return {
    tag,
    question: {
      questionNumber: qNum,
      maxQuestions: session.maxQuestions,
      questionText,
      options,
      allowCustomInput: true,
      customPlaceholder: 'Optional hint (e.g. "appears twice in banana")...',
      aiInsight:
        qNum > 1
          ? `Narrowed A–Z down to ${pool.length} matching ${pool.length === 1 ? 'letter' : 'letters'}.`
          : 'Initializing 26-letter elimination matrix.',
      signalStrength,
      remainingEstimate: `${pool.length} ${pool.length === 1 ? 'letter' : 'letters'} remaining`,
    },
  };
}

interface GeminiStepResponse {
  aiInsight: string;
  updatedCandidates: Array<{
    name: string;
    score: number;
    reason: string;
  }>;
  nextQuestionText: string;
  nextOptions: string[];
  questionTopicTag: string;
  allowCustomInput: boolean;
  customPlaceholder: string;
  shouldRevealNow: boolean;
  finalPrediction?: {
    guess: string;
    runnerUp: string;
    confidence: number;
    explanation: string;
    honestyNote: string;
    visualAccent: string;
  };
}

const GEMINI_STEP_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    aiInsight: { type: Type.STRING, description: '1 concise sentence analyzing what the user last revealed.' },
    updatedCandidates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER, description: 'Relative probability weight 0 to 100.' },
          reason: { type: Type.STRING },
        },
        required: ['name', 'score', 'reason'],
      },
    },
    nextQuestionText: { type: Type.STRING },
    nextOptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    questionTopicTag: { type: Type.STRING, description: 'Short snake_case topic tag so this question is never repeated.' },
    allowCustomInput: { type: Type.BOOLEAN },
    customPlaceholder: { type: Type.STRING },
    shouldRevealNow: { type: Type.BOOLEAN },
    finalPrediction: {
      type: Type.OBJECT,
      properties: {
        guess: { type: Type.STRING },
        runnerUp: { type: Type.STRING },
        confidence: { type: Type.NUMBER, description: 'Honest evidence-based confidence 15 to 94. Never 100.' },
        explanation: { type: Type.STRING },
        honestyNote: { type: Type.STRING, description: 'Honest note if answers leave uncertainty, especially for Date of Birth.' },
        visualAccent: { type: Type.STRING, description: 'Hex colour like #3B82F6 (or actual predicted colour hex if category is colour).' },
      },
      required: ['guess', 'runnerUp', 'confidence', 'explanation', 'honestyNote', 'visualAccent'],
    },
  },
  required: [
    'aiInsight',
    'updatedCandidates',
    'nextQuestionText',
    'nextOptions',
    'questionTopicTag',
    'allowCustomInput',
    'customPlaceholder',
    'shouldRevealNow',
  ],
};

async function runGeminiMindStep(session: InternalMindSession, isInitial: boolean): Promise<void> {
  const catId = session.resolvedCategory;
  const catDef = PREDICTION_CATEGORIES.find((c) => c.id === catId)!;
  const seeds = CANDIDATE_SEEDS[catId] ?? [];
  const corrections = getLearnedCorrectionsForCategory(catId);

  const qNum = session.questionCount + 1;
  const forceReveal = session.questionCount >= session.maxQuestions;
  const canReveal = session.questionCount >= session.minQuestions;

  const isSurprise = session.mode === 'surprise_me';

  const systemInstruction = `You are MINDMYSTERY, a sharp, truthful, adaptive deductive mind-reading engine.
Your absolute highest priority is PREDICTION ACCURACY and INTELLECTUAL HONESTY.
Rules:
1. Never repeat any previously asked question or topic tag.
2. Ask intelligent, high-information-gain questions tailored specifically to "${catDef.name}" (${CATEGORY_STRATEGIES[catId]}).
3. ${
    isSurprise
      ? `SURPRISE ME MODE: The user does NOT know which category you are targeting yet, OR you are secretly targeting "${catDef.name}". Keep the questions natural and intriguing without explicitly spoiling the category name in the first 3 questions if possible, while still strictly narrowing down "${catDef.name}"!`
      : `Target category: "${catDef.name}".`
  }
4. Maintain realistic candidate rankings with probability weights. You are NOT restricted to the seed examples if the user's clues point to a real, well-known entity outside the seed list.
5. NEVER set confidence to 100. Keep honest confidence between 18 and 94 based on actual clue specificity.
6. For "Date of Birth" (dob): You MUST be explicitly honest in honestyNote that an exact birth date/year cannot be known with certainty without specific month/day/year clues; estimate the closest narrowed window or best guess honestly with realistic low/moderate confidence.
7. Questions window: Ask between ${session.minQuestions} and ${session.maxQuestions} questions before revealing.
   - Currently ${session.questionCount} questions have been answered.
   - ${forceReveal ? 'YOU MUST REVEAL NOW (shouldRevealNow = true) and populate finalPrediction.' : canReveal ? 'You may set shouldRevealNow = true ONLY if top candidate clearly leads with strong evidence; otherwise ask 1 more sharper distinguishing question (especially a final clue question around Q8-Q9).' : 'shouldRevealNow MUST be false because fewer than 7 questions have been answered.'}
8. Always provide 3 to 5 clear, concise multiple-choice options for the next question (do not include vague filler options if specific ones fit better, and allowCustomInput=true when a freeform hint helps).`;

  const historyText =
    session.history.length === 0
      ? 'No questions asked yet. Generate Question 1.'
      : session.history
          .map((h) => `Q${h.questionNumber} [${h.questionTag ?? 'general'}]: ${h.questionText}\nUser Answer: ${h.answer}`)
          .join('\n\n');

  const prompt = `Session Context:
- Category: ${catDef.name} (${catId})
- Questions Answered So Far: ${session.questionCount} / ${session.maxQuestions} (Min before reveal: ${session.minQuestions})
- Previously Asked Topic Tags (DO NOT REPEAT): ${session.askedTags.join(', ') || 'none'}
- Curated Reference Candidates:
${seeds.slice(0, 18).map((s) => `  * ${s.name}: ${s.traits}`).join('\n')}
${
  corrections.length > 0
    ? `- Past User Corrections Learned for ${catDef.name} (learn from these patterns):\n${corrections
        .slice(0, 5)
        .map((c) => `  * Clues: ${c.qaSummary} -> Actual answer was "${c.actualAnswer}" (missed with "${c.predictedGuess}")`)
        .join('\n')}`
    : ''
}
- Current Ranked Candidates:
${session.candidates.map((c) => `  * ${c.name} (score ${c.score}): ${c.reason}`).join('\n') || '  (Initializing candidate space)'}

Conversation History:
${historyText}

${isInitial ? 'Generate Question 1 to start narrowing effectively.' : forceReveal ? 'We have reached the question limit. Synthesize finalPrediction accurately based strictly on the evidence above.' : 'Analyze the latest answer, update candidate scores, and either ask the highest-gain next question or reveal if >= 7 questions and evidence is conclusive.'}`;

  const result = await generateStructuredJson<GeminiStepResponse>({
    systemInstruction,
    prompt,
    schema: GEMINI_STEP_SCHEMA,
    thinkingLevel: forceReveal || canReveal ? ThinkingLevel.MEDIUM : ThinkingLevel.LOW,
  });

  if (Array.isArray(result.updatedCandidates) && result.updatedCandidates.length > 0) {
    session.candidates = result.updatedCandidates
      .slice(0, 8)
      .sort((a, b) => b.score - a.score);
  }

  const topScore = session.candidates[0]?.score ?? 25;
  const secondScore = session.candidates[1]?.score ?? 15;
  const computedSignal = Math.min(93, Math.max(14, Math.round(topScore * 0.7 + (topScore - secondScore) * 0.5)));

  if ((result.shouldRevealNow && canReveal) || forceReveal) {
    const fp = result.finalPrediction;
    const guessName = fp?.guess?.trim() || session.candidates[0]?.name || 'Uncertain Match';
    const rawConf = fp?.confidence ?? computedSignal;
    const boundedConf = Math.min(94, Math.max(15, Math.round(rawConf)));

    session.status = 'ready_to_reveal';
    session.currentQuestion = null;
    session.prediction = {
      guess: guessName,
      runnerUp: fp?.runnerUp || session.candidates[1]?.name,
      confidence: catId === 'dob' && session.questionCount < 9 ? Math.min(boundedConf, 68) : boundedConf,
      questionsAsked: session.questionCount,
      explanation:
        fp?.explanation ||
        `Synthesized across ${session.questionCount} adaptive questions pointing toward ${guessName}.`,
      honestyNote: fp?.honestyNote || undefined,
      visualAccent: fp?.visualAccent || '#6366F1',
      detectedCategory: catId,
    };
    return;
  }

  session.askedTags.push(result.questionTopicTag || `topic_${qNum}`);
  session.currentQuestionTag = result.questionTopicTag;
  session.currentQuestion = {
    questionNumber: qNum,
    maxQuestions: session.maxQuestions,
    questionText: result.nextQuestionText,
    options: (result.nextOptions || ['Yes', 'No', 'Not sure']).slice(0, 5),
    allowCustomInput: result.allowCustomInput ?? true,
    customPlaceholder: result.customPlaceholder || 'Add a short custom hint if needed...',
    aiInsight: result.aiInsight,
    signalStrength: computedSignal,
  };
}

async function synthesizeDeterministicFinal(session: InternalMindSession): Promise<void> {
  if (session.resolvedCategory === 'number') {
    const pool = session.numberPool ?? [];
    const sorted = [...pool].sort((a, b) => a - b);
    // Use Gemini to rank the remaining candidates based on any custom clues + psychological/math priors
    const systemInstruction = `You are finalizing a Number Mind Reader prediction. Pick the single most likely number from the remaining valid pool based strictly on the Q&A history. Never claim 100% certainty if multiple numbers remain.`;
    const prompt = `Remaining valid numbers (${sorted.length}): ${sorted.slice(0, 30).join(', ')}
Q&A History:
${session.history.map((h) => `Q${h.questionNumber}: ${h.questionText} -> ${h.answer}`).join('\n')}
Return your final prediction.`;

    const res = await generateStructuredJson<{
      guess: string;
      runnerUp: string;
      explanation: string;
      honestyNote: string;
    }>({
      systemInstruction,
      prompt,
      schema: {
        type: Type.OBJECT,
        properties: {
          guess: { type: Type.STRING },
          runnerUp: { type: Type.STRING },
          explanation: { type: Type.STRING },
          honestyNote: { type: Type.STRING },
        },
        required: ['guess', 'runnerUp', 'explanation', 'honestyNote'],
      },
      thinkingLevel: ThinkingLevel.LOW,
    });

    const honestConf =
      sorted.length <= 1
        ? 94
        : sorted.length === 2
          ? 58
          : Math.max(15, Math.min(82, Math.round((1 / sorted.length) * 100 + 18)));

    session.status = 'ready_to_reveal';
    session.currentQuestion = null;
    session.prediction = {
      guess: res.guess || String(sorted[Math.floor(sorted.length / 2)] ?? 7),
      runnerUp: res.runnerUp || (sorted.length > 1 ? String(sorted[0]) : undefined),
      confidence: honestConf,
      questionsAsked: session.questionCount,
      explanation: res.explanation,
      honestyNote:
        sorted.length > 1
          ? res.honestyNote || `${sorted.length} numbers in the range still satisfy every clue given.`
          : undefined,
      visualAccent: '#3B82F6',
      detectedCategory: 'number',
    };
    return;
  }

  if (session.resolvedCategory === 'alphabet') {
    const pool = session.alphabetPool ?? FULL_ALPHABET;
    const res = await generateStructuredJson<{
      guess: string;
      runnerUp: string;
      explanation: string;
      honestyNote: string;
    }>({
      systemInstruction: `You are finalizing an Alphabet Mind Reader prediction from A–Z. Choose the best letter from the remaining valid pool based strictly on the Q&A clues.`,
      prompt: `Remaining valid letters (${pool.length}): ${pool.join(', ')}
Q&A History:
${session.history.map((h) => `Q${h.questionNumber}: ${h.questionText} -> ${h.answer}`).join('\n')}`,
      schema: {
        type: Type.OBJECT,
        properties: {
          guess: { type: Type.STRING },
          runnerUp: { type: Type.STRING },
          explanation: { type: Type.STRING },
          honestyNote: { type: Type.STRING },
        },
        required: ['guess', 'runnerUp', 'explanation', 'honestyNote'],
      },
      thinkingLevel: ThinkingLevel.LOW,
    });

    const honestConf =
      pool.length <= 1 ? 94 : Math.max(20, Math.min(75, Math.round((1 / pool.length) * 100 + 15)));

    session.status = 'ready_to_reveal';
    session.currentQuestion = null;
    session.prediction = {
      guess: (res.guess || pool[0] || 'A').trim().slice(0, 1).toUpperCase(),
      runnerUp: res.runnerUp || (pool[1] ?? undefined),
      confidence: honestConf,
      questionsAsked: session.questionCount,
      explanation: res.explanation,
      honestyNote: pool.length > 1 ? res.honestyNote : undefined,
      visualAccent: '#8B5CF6',
      detectedCategory: 'alphabet',
    };
  }
}

export async function startMindSession(params: {
  userId: string;
  mode: GameMode;
  category?: PredictionCategoryId;
  numberRange?: { min: number; max: number };
}): Promise<MindSessionState> {
  const sessionId = `ms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  let totalRounds = 1;
  let roundCategories: PredictionCategoryId[] = [];
  let displayCategory: PredictionCategoryId | 'mystery' = params.category ?? 'movie';

  if (params.mode === 'surprise_me') {
    const picked = pickDistinctCategories(1)[0];
    roundCategories = [picked];
    displayCategory = 'mystery';
  } else if (params.mode === 'number_reader') {
    roundCategories = ['number'];
    displayCategory = 'number';
  } else if (params.mode === 'double_challenge') {
    totalRounds = 2;
    const first = params.category ?? pickDistinctCategories(1)[0];
    const second = pickDistinctCategories(1, [first])[0];
    roundCategories = [first, second];
    displayCategory = first;
  } else if (params.mode === 'ultimate_challenge') {
    totalRounds = 3;
    const first = params.category ?? pickDistinctCategories(1)[0];
    const others = pickDistinctCategories(2, [first]);
    roundCategories = [first, ...others];
    displayCategory = first;
  } else {
    roundCategories = [params.category ?? 'movie'];
    displayCategory = roundCategories[0];
  }

  const activeCategory = roundCategories[0];
  const minQuestions = 7;
  const maxQuestions = 10;

  const range =
    activeCategory === 'number'
      ? {
          min: Math.max(0, params.numberRange?.min ?? 1),
          max: Math.min(10000, Math.max((params.numberRange?.min ?? 1) + 10, params.numberRange?.max ?? 100)),
        }
      : undefined;

  const session: InternalMindSession = {
    sessionId,
    userId: params.userId,
    mode: params.mode,
    category: displayCategory,
    resolvedCategory: activeCategory,
    roundIndex: 1,
    totalRounds,
    roundCategories,
    roundResults: [],
    numberRange: range,
    numberPool: activeCategory === 'number' && range ? createNumberPool(range.min, range.max) : undefined,
    alphabetPool: activeCategory === 'alphabet' ? [...FULL_ALPHABET] : undefined,
    questionCount: 0,
    maxQuestions,
    minQuestions,
    status: 'questioning',
    history: [],
    askedTags: [],
    candidates: [],
    currentQuestion: null,
    prediction: null,
  };

  if (activeCategory === 'number') {
    const next = buildNumberQuestion(session);
    session.currentQuestion = next.question;
    session.currentQuestionTag = next.tag;
    session.askedTags.push(next.tag);
  } else if (activeCategory === 'alphabet') {
    const next = buildAlphabetQuestion(session);
    session.currentQuestion = next.question;
    session.currentQuestionTag = next.tag;
    session.askedTags.push(next.tag);
  } else {
    await runGeminiMindStep(session, true);
  }

  sessions.set(sessionId, session);
  return toPublicState(session);
}

export async function submitMindAnswer(params: {
  sessionId: string;
  answer: string;
}): Promise<MindSessionState> {
  const session = sessions.get(params.sessionId);
  if (!session) {
    throw new Error('Session not found or expired. Please start a new Mind Reading session.');
  }
  if (session.status !== 'questioning' || !session.currentQuestion) {
    return toPublicState(session);
  }

  const cleanAnswer = params.answer.trim();
  if (!cleanAnswer) {
    throw new Error('Please choose an answer or enter a clue.');
  }

  const tag = session.currentQuestionTag ?? `q_${session.questionCount + 1}`;
  session.questionCount += 1;
  session.history.push({
    questionNumber: session.questionCount,
    questionText: session.currentQuestion.questionText,
    answer: cleanAnswer,
    questionTag: tag,
  });

  if (session.resolvedCategory === 'number') {
    session.numberPool = applyDeterministicNumberFilter(session.numberPool ?? [], tag, cleanAnswer);
    const shouldReveal =
      session.questionCount >= session.maxQuestions ||
      (session.questionCount >= session.minQuestions && (session.numberPool?.length ?? 0) <= 2);

    if (shouldReveal) {
      await synthesizeDeterministicFinal(session);
    } else {
      const next = buildNumberQuestion(session);
      session.currentQuestion = next.question;
      session.currentQuestionTag = next.tag;
      session.askedTags.push(next.tag);
    }
    return toPublicState(session);
  }

  if (session.resolvedCategory === 'alphabet') {
    session.alphabetPool = applyDeterministicAlphabetFilter(session.alphabetPool ?? FULL_ALPHABET, tag, cleanAnswer);
    const shouldReveal =
      session.questionCount >= session.maxQuestions ||
      (session.questionCount >= session.minQuestions && (session.alphabetPool?.length ?? 0) <= 1);

    if (shouldReveal) {
      await synthesizeDeterministicFinal(session);
    } else {
      const next = buildAlphabetQuestion(session);
      session.currentQuestion = next.question;
      session.currentQuestionTag = next.tag;
      session.askedTags.push(next.tag);
    }
    return toPublicState(session);
  }

  await runGeminiMindStep(session, false);
  return toPublicState(session);
}

export async function recordPredictionFeedback(params: {
  sessionId: string;
  correct: boolean;
  actualAnswer?: string;
}): Promise<{
  session: MindSessionState;
  failureAnalysis?: string;
  hasNextRound: boolean;
}> {
  const session = sessions.get(params.sessionId);
  if (!session || !session.prediction) {
    throw new Error('Prediction session not found.');
  }

  session.roundResults.push({
    roundIndex: session.roundIndex,
    category: session.resolvedCategory,
    guess: session.prediction.guess,
    confidence: session.prediction.confidence,
    correct: params.correct,
  });

  let failureAnalysis: string | undefined;

  if (!params.correct && params.actualAnswer && params.actualAnswer.trim()) {
    const actual = params.actualAnswer.trim().slice(0, 120);
    const qaSummary = session.history.map((h) => `${h.questionText} -> ${h.answer}`).join(' | ');

    try {
      const analysisResp = await generateStructuredJson<{ analysis: string }>({
        systemInstruction:
          'Analyze concisely in 1-2 sentences why the AI prediction missed and what key differentiating clue will help next time.',
        prompt: `Category: ${session.resolvedCategory}\nPredicted: ${session.prediction.guess}\nActual User Thought: ${actual}\nClues: ${qaSummary}`,
        schema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
          },
          required: ['analysis'],
        },
        thinkingLevel: ThinkingLevel.LOW,
      });
      failureAnalysis = analysisResp.analysis;
    } catch {
      failureAnalysis = `Logged "${actual}" for future ${session.resolvedCategory} pattern calibration.`;
    }

    saveLearnedCorrection({
      category: session.resolvedCategory,
      qaSummary: qaSummary.slice(0, 500),
      predictedGuess: session.prediction.guess,
      actualAnswer: actual,
      failureAnalysis: failureAnalysis ?? 'Calibrated candidate weights.',
    });
  }

  const hasNextRound = session.roundIndex < session.totalRounds;
  if (!hasNextRound) {
    session.status = 'completed';
  } else {
    session.status = 'revealed';
  }

  return {
    session: toPublicState(session),
    failureAnalysis,
    hasNextRound,
  };
}

export async function advanceNextRound(sessionId: string): Promise<MindSessionState> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found.');
  }
  if (session.roundIndex >= session.totalRounds) {
    throw new Error('All challenge rounds are already completed.');
  }

  session.roundIndex += 1;
  const nextCat = session.roundCategories[session.roundIndex - 1];
  session.resolvedCategory = nextCat;
  session.category = session.mode === 'surprise_me' ? 'mystery' : nextCat;
  session.questionCount = 0;
  session.status = 'questioning';
  session.history = [];
  session.askedTags = [];
  session.candidates = [];
  session.prediction = null;
  session.currentQuestion = null;

  if (nextCat === 'number') {
    session.numberRange = session.numberRange ?? { min: 1, max: 100 };
    session.numberPool = createNumberPool(session.numberRange.min, session.numberRange.max);
    const next = buildNumberQuestion(session);
    session.currentQuestion = next.question;
    session.currentQuestionTag = next.tag;
    session.askedTags.push(next.tag);
  } else if (nextCat === 'alphabet') {
    session.alphabetPool = [...FULL_ALPHABET];
    const next = buildAlphabetQuestion(session);
    session.currentQuestion = next.question;
    session.currentQuestionTag = next.tag;
    session.askedTags.push(next.tag);
  } else {
    await runGeminiMindStep(session, true);
  }

  return toPublicState(session);
}

export function getMindSession(sessionId: string): InternalMindSession | undefined {
  return sessions.get(sessionId);
}
