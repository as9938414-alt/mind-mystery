import { ThinkingLevel, Type } from '@google/genai';
import {
  GameMode,
  MindSessionState,
  PREDICTION_CATEGORIES,
  PredictionCategoryId,
  PredictionResult,
  QuestionPayload,
} from '../src/types.ts';
import { CANDIDATE_SEEDS, CATEGORY_STRATEGIES } from './candidates.ts';
import { generateStructuredJson, isGeminiConfigured } from './gemini.ts';
import {
  NOT_SURE_VALUE,
  applyAnswerToScores,
  computeScoringSnapshot,
  initializeScores,
  normalizeScores,
} from './oracle/candidateScorer.ts';
import { isOracleCategory, loadPool, resolveIndustry } from './oracle/pools.ts';
import { findPoster } from './oracle/posters.ts';
import { selectNextBestQuestion } from './oracle/questionSelector.ts';
import type { CandidateRecord, QuestionOption } from './oracle/types.ts';
import {
  MagicCardDeck,
  cardColumns,
  cardItems,
  createDeck,
  decodeDeck,
  isYesAnswer,
} from './magicCards.ts';
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

interface OracleState {
  pool: CandidateRecord[];
  scores: Record<string, number>;
  asked: string[];
  currentAttr?: string;
  currentOptions?: QuestionOption[];
}

type Engine = 'cards' | 'oracle' | 'ai';

interface InternalMindSession {
  engine: Engine;
  industry: string | null;
  requestedIndustry?: string | null;
  oracle?: OracleState;
  sessionId: string;
  userId: string;
  createdAt: number;
  mode: GameMode;
  category: PredictionCategoryId | 'mystery';
  resolvedCategory: PredictionCategoryId;
  roundIndex: number;
  totalRounds: number;
  roundCategories: PredictionCategoryId[];
  roundResults: MindSessionState['roundResults'];
  numberRange?: { min: number; max: number };
  deck?: MagicCardDeck;
  yesBits: number[];
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
  attemptsLeft: number;
  rejectedGuesses: string[];
}

const sessions = new Map<string, InternalMindSession>();
const SESSION_TTL_MS = 3 * 60 * 60 * 1000;
const AI_MIN_QUESTIONS = 6;
const AI_MAX_QUESTIONS = 12;
const RETRY_EXTRA_QUESTIONS = 4;
const MAX_RETRIES = 2;

const ALL_CATEGORY_IDS = PREDICTION_CATEGORIES.map((c) => c.id);

function pruneSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [id, s] of sessions) if (s.createdAt < cutoff) sessions.delete(id);
}

function pickDistinctCategories(count: number, exclude: PredictionCategoryId[] = []): PredictionCategoryId[] {
  // DOB is excluded from random picks: it can never be read precisely and makes a weak random round.
  const pool = ALL_CATEGORY_IDS.filter((c) => !exclude.includes(c) && c !== 'dob');
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function isCardCategory(cat: PredictionCategoryId): cat is 'number' | 'alphabet' {
  return cat === 'number' || cat === 'alphabet';
}

function toPublicState(s: InternalMindSession): MindSessionState {
  return {
    sessionId: s.sessionId,
    mode: s.mode,
    category: s.category,
    resolvedCategory: s.resolvedCategory,
    roundIndex: s.roundIndex,
    totalRounds: s.totalRounds,
    roundCategories: s.roundCategories,
    roundResults: s.roundResults,
    numberRange: s.numberRange,
    questionCount: s.questionCount,
    maxQuestions: s.maxQuestions,
    status: s.status,
    currentQuestion: s.currentQuestion,
    prediction: s.prediction,
    attemptsLeft: s.attemptsLeft,
    rejectedGuesses: s.rejectedGuesses,
    industry: s.industry,
    engine: s.engine,
  };
}

/* ------------------------------------------------------------------ */
/* Magic Cards rounds (number / alphabet) — deterministic, never misses */
/* ------------------------------------------------------------------ */

const CARD_INSIGHTS = [
  'Locking onto your thought pattern…',
  'Your hesitation told me more than you think.',
  'The signal is getting stronger.',
  'Interesting… keep picturing it clearly.',
  'Almost there. Do not change your mind now.',
  'I can see the outline forming.',
  'One more glance and it is mine.',
  'Your mind is an open book.',
  'Hold it steady — final alignment.',
  'Last card. Concentrate.',
];

function setupCardRound(session: InternalMindSession) {
  const kind = session.resolvedCategory as 'number' | 'alphabet';
  if (kind === 'number') session.numberRange = session.numberRange ?? { min: 1, max: 100 };
  session.deck = createDeck(kind, session.numberRange);
  session.yesBits = [];
  session.maxQuestions = session.deck.bitOrder.length;
  session.minQuestions = session.deck.bitOrder.length;
  session.attemptsLeft = 0;
  buildCardQuestion(session);
}

function buildCardQuestion(session: InternalMindSession) {
  const deck = session.deck!;
  const idx = session.questionCount;
  const items = cardItems(deck, idx);
  const isLast = idx === deck.bitOrder.length - 1;
  const noun = deck.kind === 'alphabet' ? 'letter' : 'number';
  session.currentQuestionTag = `card:${deck.bitOrder[idx]}`;
  session.currentQuestion = {
    questionNumber: idx + 1,
    maxQuestions: deck.bitOrder.length,
    questionText: isLast
      ? `Final card. Is your ${noun} anywhere on it?`
      : `Look carefully. Is your ${noun} on this card?`,
    options: ['Yes, it’s here', 'No, it’s not here'],
    allowCustomInput: false,
    aiInsight: idx === 0 ? 'Don’t say it. Don’t write it. Just look for it.' : CARD_INSIGHTS[(idx - 1) % CARD_INSIGHTS.length],
    signalStrength: Math.round(((idx + 1) / deck.bitOrder.length) * 94),
    card: { kind: deck.kind, items, columns: cardColumns(deck, items.length) },
  };
}

function finishCardRound(session: InternalMindSession) {
  const deck = session.deck!;
  const decoded = decodeDeck(deck, session.yesBits);
  const noun = deck.kind === 'alphabet' ? 'letter' : 'number';
  session.status = 'ready_to_reveal';
  session.currentQuestion = null;
  if (!decoded) {
    session.prediction = {
      guess: '???',
      confidence: 15,
      questionsAsked: session.questionCount,
      explanation: `Your answers point to a ${noun} outside the range — one of the cards may have been misread. Let’s try once more, slowly.`,
      honestyNote: 'The cards only work when every answer is honest and careful.',
      visualAccent: '#F59E0B',
      detectedCategory: session.resolvedCategory,
    };
    return;
  }
  session.prediction = {
    guess: decoded.display,
    confidence: 99,
    questionsAsked: session.questionCount,
    explanation:
      deck.kind === 'alphabet'
        ? `Out of 26 letters, you only ever looked at ${session.questionCount} cards — and your mind gave the rest away.`
        : `Out of ${deck.max - deck.min + 1} possible numbers, ${session.questionCount} glances were all it took.`,
    visualAccent: deck.kind === 'alphabet' ? '#8B5CF6' : '#3B82F6',
    detectedCategory: session.resolvedCategory,
  };
}

/* ------------------------------------------------------------------ */
/* Oracle rounds — offline Bayesian deduction over 1,000+ curated picks */
/* ------------------------------------------------------------------ */

const ORACLE_MIN_QUESTIONS = 7;
const ORACLE_MAX_QUESTIONS = 10;
const NOT_SURE_LABEL = 'Not sure';

const ORACLE_INSIGHTS = [
  'Hmm… that narrows things more than you’d think.',
  'Interesting choice. Keep picturing it.',
  'I’m starting to see a shape.',
  'Your answers are leaving footprints.',
  'The field is collapsing fast.',
  'Very revealing. Stay focused.',
  'Only a few possibilities survive now.',
  'I can almost hear it.',
  'Final alignment…',
];

function setupOracleRound(session: InternalMindSession) {
  const cat = session.resolvedCategory;
  session.engine = 'oracle';
  session.industry = resolveIndustry(cat, session.requestedIndustry);
  const pool = loadPool(cat, session.industry);
  session.oracle = { pool, scores: initializeScores(pool), asked: [] };
  session.minQuestions = ORACLE_MIN_QUESTIONS;
  session.maxQuestions = ORACLE_MAX_QUESTIONS;
  session.attemptsLeft = MAX_RETRIES;
  if (buildOracleQuestion(session) === 'reveal') {
    throw new Error('Not enough data to play this category right now.');
  }
}

/** Builds the next highest-information question, or returns 'reveal' when the Oracle is ready. */
function buildOracleQuestion(session: InternalMindSession): 'asked' | 'reveal' {
  const o = session.oracle!;
  const count = session.questionCount;
  const snap = computeScoringSnapshot(o.pool, o.scores, count);
  const selected =
    count >= session.maxQuestions
      ? null
      : selectNextBestQuestion({
          category: session.resolvedCategory,
          candidates: o.pool,
          scores: o.scores,
          askedAttributes: o.asked,
          questionIndex: count + 1,
        });

  const ready =
    !selected ||
    count >= session.maxQuestions ||
    (count >= session.minQuestions && (snap.shouldEarlyStop || snap.candidatesRemaining <= 2 || count >= 9));
  if (ready) return 'reveal';

  o.currentAttr = selected!.attributeKey;
  o.currentOptions = selected!.options;
  session.currentQuestionTag = selected!.attributeKey;
  session.currentQuestion = {
    questionNumber: count + 1,
    maxQuestions: session.maxQuestions,
    questionText: personify(session.resolvedCategory, selected!.fallbackQuestion),
    options: [...selected!.options.map((opt) => opt.label), NOT_SURE_LABEL],
    allowCustomInput: false,
    aiInsight: count === 0 ? 'Answer honestly — your first instinct is usually right.' : ORACLE_INSIGHTS[(count - 1) % ORACLE_INSIGHTS.length],
    signalStrength: Math.min(94, Math.max(8, snap.confidencePct)),
    remainingEstimate: undefined,
  };
  return 'asked';
}

/** Shared question templates say "it"; for people categories, say "they". */
function personify(cat: PredictionCategoryId, text: string): string {
  if (cat !== 'actor' && cat !== 'singer' && cat !== 'sports_person') return text;
  return text
    .replace(/^Which era does it belong to\?$/, 'Which era are they from?')
    .replace(/^Is it /, 'Are they ')
    .replace(/^Was it /, 'Were they ')
    .replace(/^Does it /, 'Do they ');
}

function describeIndustry(session: InternalMindSession) {
  return session.industry && !session.industry.startsWith('Any') ? `${session.industry} ` : '';
}

async function finishOracleRound(session: InternalMindSession) {
  const o = session.oracle!;
  const snap = computeScoringSnapshot(o.pool, o.scores, session.questionCount);
  const top = snap.topCandidate;
  const keyAnswers = session.history
    .filter((h) => h.answer !== NOT_SURE_LABEL)
    .slice(-3)
    .map((h) => h.answer.toLowerCase())
    .join(' · ');
  const catName = PREDICTION_CATEGORIES.find((c) => c.id === session.resolvedCategory)?.name.replace('Favourite ', '').toLowerCase();

  let posterUrl: string | null = null;
  if (session.resolvedCategory === 'movie') {
    posterUrl = await findPoster({ name: top.name, industry: top.industry, releaseYear: top.releaseYear });
  }

  session.status = 'ready_to_reveal';
  session.currentQuestion = null;
  session.prediction = {
    guess: top.name,
    subtitle: top.subtitle || undefined,
    runnerUp: snap.runnersUp[0]?.name,
    runnersUp: snap.runnersUp.map((r) => r.name).slice(0, 3),
    confidence: Math.min(97, Math.max(15, snap.confidencePct)),
    questionsAsked: session.questionCount,
    explanation: keyAnswers
      ? `${session.questionCount} answers were all it took. The last clues — ${keyAnswers} — gave it away.`
      : `Every ${describeIndustry(session)}${catName} I could think of… and only one fit you.`,
    honestyNote:
      session.resolvedCategory === 'dob' && (!session.industry || session.industry.startsWith('Any'))
        ? 'I read the day and month — the birth year was never part of the questions.'
        : undefined,
    visualAccent:
      session.resolvedCategory === 'colour' && typeof top.attributes.hex === 'string' ? String(top.attributes.hex) : '#6366F1',
    detectedCategory: session.resolvedCategory,
    posterUrl,
    engine: 'oracle',
  };
}

/* ------------------------------------------------------------------ */
/* AI deduction rounds (Gemini)                                        */
/* ------------------------------------------------------------------ */

interface GeminiStepResponse {
  aiInsight: string;
  updatedCandidates: Array<{ name: string; score: number; reason: string }>;
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
    aiInsight: {
      type: Type.STRING,
      description: 'One short, intriguing sentence (max 14 words) reacting to the last answer, like a mentalist would. Never name your top candidate.',
    },
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
    nextOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
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
        explanation: { type: Type.STRING, description: '1-2 sentences naming the 2-3 decisive clues the user gave.' },
        honestyNote: { type: Type.STRING, description: 'Only for Date of Birth or genuinely ambiguous evidence; otherwise empty string.' },
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

function sameGuess(a: string, b: string) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return norm(a) === norm(b);
}

async function runGeminiMindStep(session: InternalMindSession, isInitial: boolean): Promise<void> {
  const catId = session.resolvedCategory;
  const catDef = PREDICTION_CATEGORIES.find((c) => c.id === catId)!;
  const seeds = CANDIDATE_SEEDS[catId] ?? [];
  const corrections = getLearnedCorrectionsForCategory(catId);

  const qNum = session.questionCount + 1;
  const forceReveal = session.questionCount >= session.maxQuestions;
  const canReveal = session.questionCount >= session.minQuestions;
  const rejected = session.rejectedGuesses;

  const systemInstruction = `You are MINDMYSTERY, a sharp adaptive mind-reading engine running at a live booth. Players think of something and you deduce it by asking questions, like a master mentalist crossed with Akinator.
Your highest priority is GUESSING CORRECTLY.
Rules:
1. Target category: "${catDef.name}". Strategy: ${CATEGORY_STRATEGIES[catId]}
2. Players are mostly students in India and worldwide; prefer popular, mainstream answers unless clues say otherwise. You are NOT restricted to the seed list.
3. Each question must split the remaining candidates as evenly as possible (maximum information gain). Never repeat a previously asked topic tag.
4. Questions must be short (max 16 words), friendly, and easy to answer in a second. Give 2 to 4 crisp options; always include an "unsure" style option only when the question is genuinely subjective.
5. Never reveal or hint at your top candidate in aiInsight or the question text before the reveal.
6. Confidence must be honest, between 15 and 94. Never 100.
7. For Date of Birth (dob): say in honestyNote that an exact date cannot be certain from broad clues.
8. Question window: reveal after ${session.minQuestions}–${session.maxQuestions} answered questions. ${session.questionCount} answered so far.
   ${
     forceReveal
       ? 'YOU MUST REVEAL NOW: shouldRevealNow = true and fill finalPrediction.'
       : canReveal
         ? 'Set shouldRevealNow = true ONLY if the top candidate clearly leads; otherwise ask one more sharp distinguishing question.'
         : `shouldRevealNow MUST be false: fewer than ${session.minQuestions} questions answered.`
   }
${rejected.length > 0 ? `9. The player already said NO to these guesses — they are WRONG and must never be guessed again: ${rejected.map((r) => `"${r}"`).join(', ')}. Ask questions that separate the remaining strong candidates.` : ''}`;

  const historyText =
    session.history.length === 0
      ? 'No questions asked yet. Generate Question 1.'
      : session.history
          .map((h) => `Q${h.questionNumber} [${h.questionTag ?? 'general'}]: ${h.questionText}\nUser Answer: ${h.answer}`)
          .join('\n\n');

  const prompt = `Session Context:
- Category: ${catDef.name} (${catId})
- Questions Answered So Far: ${session.questionCount} / ${session.maxQuestions}
- Previously Asked Topic Tags (DO NOT REPEAT): ${session.askedTags.join(', ') || 'none'}
- Rejected guesses (WRONG): ${rejected.join(', ') || 'none'}
- Curated Reference Candidates:
${seeds.slice(0, 18).map((s) => `  * ${s.name}: ${s.traits}`).join('\n')}
${
  corrections.length > 0
    ? `- Past player corrections for ${catDef.name} (learn from these):\n${corrections
        .slice(0, 5)
        .map((c) => `  * Clues: ${c.qaSummary} -> Actual answer was "${c.actualAnswer}" (missed with "${c.predictedGuess}")`)
        .join('\n')}`
    : ''
}
- Current Ranked Candidates:
${session.candidates.map((c) => `  * ${c.name} (score ${c.score}): ${c.reason}`).join('\n') || '  (Initializing candidate space)'}

Conversation History:
${historyText}

${
  isInitial
    ? 'Generate Question 1 to start narrowing effectively.'
    : forceReveal
      ? 'Question limit reached. Give your single best finalPrediction based strictly on the evidence.'
      : 'Analyze the latest answer, update candidate scores, then either ask the highest-gain next question or reveal if allowed and conclusive.'
}`;

  const result = await generateStructuredJson<GeminiStepResponse>({
    systemInstruction,
    prompt,
    schema: GEMINI_STEP_SCHEMA,
    thinkingLevel: forceReveal || canReveal ? ThinkingLevel.MEDIUM : ThinkingLevel.LOW,
  });

  if (Array.isArray(result.updatedCandidates) && result.updatedCandidates.length > 0) {
    session.candidates = result.updatedCandidates
      .filter((c) => !rejected.some((r) => sameGuess(r, c.name)))
      .slice(0, 8)
      .sort((a, b) => b.score - a.score);
  }

  const topScore = session.candidates[0]?.score ?? 25;
  const secondScore = session.candidates[1]?.score ?? 15;
  const computedSignal = Math.min(93, Math.max(14, Math.round(topScore * 0.7 + (topScore - secondScore) * 0.5)));

  if ((result.shouldRevealNow && canReveal) || forceReveal) {
    const fp = result.finalPrediction;
    let guessName = fp?.guess?.trim() || session.candidates[0]?.name || 'Uncertain Match';
    // Never re-guess something the player already rejected.
    if (rejected.some((r) => sameGuess(r, guessName))) {
      guessName = session.candidates.find((c) => !rejected.some((r) => sameGuess(r, c.name)))?.name ?? guessName;
    }
    const rawConf = fp?.confidence ?? computedSignal;
    const boundedConf = Math.min(94, Math.max(15, Math.round(rawConf)));
    const runnerUp = fp?.runnerUp || session.candidates.find((c) => !sameGuess(c.name, guessName))?.name;

    session.status = 'ready_to_reveal';
    session.currentQuestion = null;
    session.prediction = {
      guess: guessName,
      runnerUp: runnerUp && !sameGuess(runnerUp, guessName) ? runnerUp : undefined,
      confidence: catId === 'dob' ? Math.min(boundedConf, 68) : boundedConf,
      questionsAsked: session.questionCount,
      explanation: fp?.explanation || `Synthesized across ${session.questionCount} adaptive questions pointing toward ${guessName}.`,
      honestyNote: fp?.honestyNote?.trim() ? fp.honestyNote : undefined,
      visualAccent: /^#[0-9a-f]{6}$/i.test(fp?.visualAccent ?? '') ? fp!.visualAccent : '#6366F1',
      detectedCategory: catId,
    };
    return;
  }

  const options = (Array.isArray(result.nextOptions) ? result.nextOptions : [])
    .map((o) => String(o).trim())
    .filter(Boolean)
    .slice(0, 5);

  session.askedTags.push(result.questionTopicTag || `topic_${qNum}`);
  session.currentQuestionTag = result.questionTopicTag;
  session.currentQuestion = {
    questionNumber: qNum,
    maxQuestions: session.maxQuestions,
    questionText: result.nextQuestionText || 'Tell me one more thing about it…',
    options: options.length >= 2 ? options : ['Yes', 'No', 'Not sure'],
    allowCustomInput: result.allowCustomInput ?? true,
    customPlaceholder: result.customPlaceholder || 'Or type a short hint…',
    aiInsight: result.aiInsight,
    signalStrength: computedSignal,
  };
}

/* ------------------------------------------------------------------ */
/* Round setup shared by start + next round                            */
/* ------------------------------------------------------------------ */

async function setupRound(session: InternalMindSession) {
  session.questionCount = 0;
  session.status = 'questioning';
  session.history = [];
  session.askedTags = [];
  session.candidates = [];
  session.prediction = null;
  session.currentQuestion = null;
  session.currentQuestionTag = undefined;
  session.rejectedGuesses = [];
  session.yesBits = [];
  session.deck = undefined;
  session.oracle = undefined;
  session.industry = null;

  if (isCardCategory(session.resolvedCategory)) {
    session.engine = 'cards';
    setupCardRound(session);
    return;
  }
  if (isOracleCategory(session.resolvedCategory)) {
    setupOracleRound(session);
    return;
  }
  session.engine = 'ai';
  session.minQuestions = AI_MIN_QUESTIONS;
  session.maxQuestions = AI_MAX_QUESTIONS;
  session.attemptsLeft = MAX_RETRIES;
  await runGeminiMindStep(session, true);
}

export async function startMindSession(params: {
  userId: string;
  mode: GameMode;
  category?: PredictionCategoryId;
  industry?: string | null;
  numberRange?: { min: number; max: number };
}): Promise<MindSessionState> {
  pruneSessions();
  const sessionId = `ms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const validCategory =
    params.category && ALL_CATEGORY_IDS.includes(params.category) ? params.category : undefined;

  let totalRounds = 1;
  let roundCategories: PredictionCategoryId[];

  if (params.mode === 'surprise_me') {
    roundCategories = pickDistinctCategories(1);
  } else if (params.mode === 'number_reader') {
    roundCategories = ['number'];
  } else if (params.mode === 'double_challenge') {
    totalRounds = 2;
    const first = validCategory ?? pickDistinctCategories(1)[0];
    roundCategories = [first, pickDistinctCategories(1, [first])[0]];
  } else if (params.mode === 'ultimate_challenge') {
    totalRounds = 3;
    const first = validCategory ?? pickDistinctCategories(1)[0];
    roundCategories = [first, ...pickDistinctCategories(2, [first])];
  } else {
    roundCategories = [validCategory ?? 'movie'];
  }

  const rawMin = Number(params.numberRange?.min ?? 1);
  const rawMax = Number(params.numberRange?.max ?? 100);
  const min = Number.isFinite(rawMin) ? Math.max(1, Math.floor(rawMin)) : 1;
  const max = Number.isFinite(rawMax) ? Math.min(1000, Math.max(min + 9, Math.floor(rawMax))) : 100;

  const session: InternalMindSession = {
    engine: 'ai',
    industry: null,
    requestedIndustry: typeof params.industry === 'string' ? params.industry : null,
    sessionId,
    userId: params.userId,
    createdAt: Date.now(),
    mode: params.mode,
    category: params.mode === 'surprise_me' ? 'mystery' : roundCategories[0],
    resolvedCategory: roundCategories[0],
    roundIndex: 1,
    totalRounds,
    roundCategories,
    roundResults: [],
    numberRange: { min, max },
    yesBits: [],
    questionCount: 0,
    maxQuestions: AI_MAX_QUESTIONS,
    minQuestions: AI_MIN_QUESTIONS,
    status: 'questioning',
    history: [],
    askedTags: [],
    candidates: [],
    currentQuestion: null,
    prediction: null,
    attemptsLeft: MAX_RETRIES,
    rejectedGuesses: [],
  };

  await setupRound(session);
  sessions.set(sessionId, session);
  return toPublicState(session);
}

export async function submitMindAnswer(params: { sessionId: string; answer: string }): Promise<MindSessionState> {
  const session = sessions.get(params.sessionId);
  if (!session) {
    throw new Error('Session not found or expired. Please start a new Mind Reading session.');
  }
  if (session.status !== 'questioning' || !session.currentQuestion) {
    return toPublicState(session);
  }

  const cleanAnswer = params.answer.trim().slice(0, 200);
  if (!cleanAnswer) throw new Error('Please choose an answer or enter a clue.');

  // Snapshot so an AI failure never corrupts the session — the player can simply retry.
  const snapshot = {
    questionCount: session.questionCount,
    historyLen: session.history.length,
    askedTagsLen: session.askedTags.length,
    candidates: session.candidates,
    currentQuestion: session.currentQuestion,
    currentQuestionTag: session.currentQuestionTag,
    yesBits: [...session.yesBits],
  };

  const tag = session.currentQuestionTag ?? `q_${session.questionCount + 1}`;
  session.questionCount += 1;
  session.history.push({
    questionNumber: session.questionCount,
    questionText: session.currentQuestion.questionText,
    answer: cleanAnswer,
    questionTag: tag,
  });

  if (session.engine === 'oracle' && session.oracle) {
    const o = session.oracle;
    const match = o.currentOptions?.find((opt) => opt.label.toLowerCase() === cleanAnswer.toLowerCase());
    const value = match ? match.value : NOT_SURE_VALUE;
    o.scores = applyAnswerToScores(o.pool, o.scores, o.currentAttr!, value);
    if (!o.asked.includes(o.currentAttr!)) o.asked.push(o.currentAttr!);
    if (buildOracleQuestion(session) === 'reveal') await finishOracleRound(session);
    return toPublicState(session);
  }

  if (session.deck) {
    if (isYesAnswer(cleanAnswer)) session.yesBits.push(session.deck.bitOrder[session.questionCount - 1]);
    if (session.questionCount >= session.deck.bitOrder.length) finishCardRound(session);
    else buildCardQuestion(session);
    return toPublicState(session);
  }

  try {
    await runGeminiMindStep(session, false);
  } catch (err) {
    session.questionCount = snapshot.questionCount;
    session.history.length = snapshot.historyLen;
    session.askedTags.length = snapshot.askedTagsLen;
    session.candidates = snapshot.candidates;
    session.currentQuestion = snapshot.currentQuestion;
    session.currentQuestionTag = snapshot.currentQuestionTag;
    session.yesBits = snapshot.yesBits;
    session.status = 'questioning';
    session.prediction = null;
    throw err;
  }
  return toPublicState(session);
}

/** After a wrong AI guess: ask a few more sharp questions and guess again (Akinator-style). */
export async function continueAfterMiss(sessionId: string): Promise<MindSessionState> {
  const session = sessions.get(sessionId);
  if (!session || !session.prediction) throw new Error('Session not found or expired.');
  if (session.deck) throw new Error('The magic cards round cannot be retried — start a new one.');
  if (session.status !== 'ready_to_reveal') return toPublicState(session);
  if (session.attemptsLeft <= 0) throw new Error('No retries left for this round.');

  if (session.engine === 'oracle' && session.oracle) {
    return continueOracleAfterMiss(session);
  }

  const prev = {
    prediction: session.prediction,
    maxQuestions: session.maxQuestions,
    minQuestions: session.minQuestions,
    attemptsLeft: session.attemptsLeft,
    rejectedLen: session.rejectedGuesses.length,
    candidates: session.candidates,
  };

  session.rejectedGuesses.push(session.prediction.guess);
  session.attemptsLeft -= 1;
  session.candidates = session.candidates.filter((c) => !sameGuess(c.name, session.prediction!.guess));
  session.minQuestions = session.questionCount + 2;
  session.maxQuestions = session.questionCount + RETRY_EXTRA_QUESTIONS;
  session.status = 'questioning';
  session.prediction = null;

  try {
    await runGeminiMindStep(session, false);
  } catch (err) {
    session.prediction = prev.prediction;
    session.maxQuestions = prev.maxQuestions;
    session.minQuestions = prev.minQuestions;
    session.attemptsLeft = prev.attemptsLeft;
    session.rejectedGuesses.length = prev.rejectedLen;
    session.candidates = prev.candidates;
    session.status = 'ready_to_reveal';
    throw err;
  }
  return toPublicState(session);
}

/**
 * Oracle miss: if the AI engine is available, hand the whole Q&A history to Gemini, which can reach
 * answers outside the curated database. Otherwise keep going offline without the rejected pick.
 */
async function continueOracleAfterMiss(session: InternalMindSession): Promise<MindSessionState> {
  const o = session.oracle!;
  const rejected = session.prediction!.guess;
  const prev = {
    prediction: session.prediction,
    scores: o.scores,
    maxQuestions: session.maxQuestions,
    minQuestions: session.minQuestions,
    attemptsLeft: session.attemptsLeft,
    rejectedLen: session.rejectedGuesses.length,
    engine: session.engine,
    candidates: session.candidates,
  };

  session.rejectedGuesses.push(rejected);
  session.attemptsLeft -= 1;
  for (const c of o.pool) if (session.rejectedGuesses.some((r) => sameGuess(r, c.name))) o.scores[c.id] = 0;
  o.scores = normalizeScores(o.scores);
  session.minQuestions = session.questionCount + 2;
  session.maxQuestions = session.questionCount + RETRY_EXTRA_QUESTIONS;
  session.status = 'questioning';
  session.prediction = null;

  if (isGeminiConfigured()) {
    const snap = computeScoringSnapshot(o.pool, o.scores, session.questionCount);
    session.candidates = snap.ranked
      .filter((r) => r.scorePct > 1)
      .map((r) => ({ name: r.name, score: r.scorePct, reason: r.subtitle }));
    session.engine = 'ai';
    try {
      await runGeminiMindStep(session, false);
      return toPublicState(session);
    } catch {
      // AI unreachable — fall through to the offline retry below.
      session.engine = 'oracle';
      session.candidates = prev.candidates;
    }
  }

  if (buildOracleQuestion(session) === 'reveal') {
    const snap = computeScoringSnapshot(o.pool, o.scores, session.questionCount);
    if ((snap.topCandidate?.scorePct ?? 0) <= 1) {
      // Nothing plausible left — restore the round so the player can tell us the answer instead.
      Object.assign(session, {
        prediction: prev.prediction,
        maxQuestions: prev.maxQuestions,
        minQuestions: prev.minQuestions,
        attemptsLeft: 0,
        status: 'ready_to_reveal',
        engine: prev.engine,
      });
      o.scores = prev.scores;
      session.rejectedGuesses.length = prev.rejectedLen;
      throw new Error('I’ve run out of ideas in my database — tell me what it was!');
    }
    await finishOracleRound(session);
  }
  return toPublicState(session);
}

export async function recordPredictionFeedback(params: {
  sessionId: string;
  correct: boolean;
  actualAnswer?: string;
}): Promise<{ session: MindSessionState; failureAnalysis?: string; hasNextRound: boolean }> {
  const session = sessions.get(params.sessionId);
  if (!session || !session.prediction) throw new Error('Prediction session not found.');

  session.roundResults.push({
    roundIndex: session.roundIndex,
    category: session.resolvedCategory,
    guess: session.prediction.guess,
    confidence: session.prediction.confidence,
    correct: params.correct,
  });

  let failureAnalysis: string | undefined;

  if (!params.correct && params.actualAnswer && params.actualAnswer.trim() && !session.deck) {
    const actual = params.actualAnswer.trim().slice(0, 120);
    const qaSummary = session.history.map((h) => `${h.questionText} -> ${h.answer}`).join(' | ');

    try {
      const analysisResp = await generateStructuredJson<{ analysis: string }>({
        systemInstruction:
          'In one friendly sentence (max 30 words), explain which clue led the AI astray and what question would have caught it.',
        prompt: `Category: ${session.resolvedCategory}\nPredicted: ${session.prediction.guess}\nActual: ${actual}\nClues: ${qaSummary}`,
        schema: { type: Type.OBJECT, properties: { analysis: { type: Type.STRING } }, required: ['analysis'] },
        thinkingLevel: ThinkingLevel.LOW,
      });
      failureAnalysis = analysisResp.analysis;
    } catch {
      failureAnalysis = `Noted “${actual}” — the engine will remember this pattern for future players.`;
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
  session.status = hasNextRound ? 'revealed' : 'completed';

  return { session: toPublicState(session), failureAnalysis, hasNextRound };
}

export async function advanceNextRound(sessionId: string): Promise<MindSessionState> {
  const session = sessions.get(sessionId);
  if (!session) throw new Error('Session not found.');
  if (session.roundIndex >= session.totalRounds) throw new Error('All challenge rounds are already completed.');

  session.roundIndex += 1;
  session.resolvedCategory = session.roundCategories[session.roundIndex - 1];
  session.category = session.mode === 'surprise_me' ? 'mystery' : session.resolvedCategory;
  try {
    await setupRound(session);
  } catch (err) {
    session.roundIndex -= 1;
    session.resolvedCategory = session.roundCategories[session.roundIndex - 1];
    session.status = 'revealed';
    throw err;
  }
  return toPublicState(session);
}

export function getMindSession(sessionId: string): InternalMindSession | undefined {
  return sessions.get(sessionId);
}
