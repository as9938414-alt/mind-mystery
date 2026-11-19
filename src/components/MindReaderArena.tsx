import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  Wand2,
  XCircle,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  BADGE_DEFINITIONS,
  CATEGORY_INDUSTRIES,
  GameMode,
  MindSessionState,
  PREDICTION_CATEGORIES,
  PredictionCategoryId,
  UserStats,
} from '../types';
import {
  answerMindQuestion,
  continueMindAfterMiss,
  nextMindRound,
  startMindGame,
  submitMindFeedback,
} from '../utils/api';
import { soundFx } from '../utils/sound';
import { CrystalBall } from './CrystalBall';
import { ThinkingOrb } from './ThinkingOrb';
import { CategoryIcon, PredictionRevealArtwork } from './Visuals';

interface MindReaderArenaProps {
  initialMode: GameMode;
  initialCategory: PredictionCategoryId;
  autoStartSignal: number;
  aiReady: boolean | null;
  initialIndustry?: string | null;
  onUserStatsUpdate: (user: UserStats) => void;
  onBackHome: () => void;
}

const MODE_OPTIONS: Array<{ id: GameMode; label: string; desc: string; sure?: boolean }> = [
  { id: 'mind_reader', label: 'Mind Reader', desc: 'Movies, stars, songs, food… ~1,000 things' },
  { id: 'surprise_me', label: 'Surprise Me', desc: 'The orb picks the category for you' },
  { id: 'number_reader', label: 'Number Reader', desc: 'Magic cards · never misses', sure: true },
  { id: 'crystal_ball', label: 'Crystal Ball', desc: 'Secret maths · never misses', sure: true },
  { id: 'double_challenge', label: 'Double Challenge', desc: '2 rounds back-to-back' },
  { id: 'ultimate_challenge', label: 'Ultimate Challenge', desc: '3 rounds across categories' },
];

const RANGE_PRESETS = [
  { label: '1 – 50', min: 1, max: 50 },
  { label: '1 – 100', min: 1, max: 100 },
  { label: '1 – 200', min: 1, max: 200 },
];

const CARD_CATEGORIES: PredictionCategoryId[] = ['number', 'alphabet'];

function industryShort(industry?: string | null) {
  if (!industry || industry.startsWith('Any')) return '';
  return industry.replace(/\s*\(.*\)/, '').split('/')[0].trim();
}

function thinkPrompt(category: PredictionCategoryId, industry?: string | null): string {
  const ind = industryShort(industry);
  switch (category) {
    case 'movie':
      return ind === 'Web Series' ? 'a web series' : ind === 'Anime' ? 'an anime' : ind ? `a ${ind} movie` : 'a movie';
    case 'actor':
      return ind === 'Anime' ? 'an anime character' : ind ? `a ${ind} star` : 'an actor or actress';
    case 'song':
      return ind ? `a ${ind} song` : 'a song';
    case 'singer':
      return ind ? `a ${ind} singer` : 'a singer';
    case 'sports_person':
      return ind ? `a ${ind} star` : 'a sports star';
    case 'dob':
      return 'a birthday — yours or a friend’s';
    default:
      return THINK_PROMPTS[category] ?? 'something';
  }
}

const THINK_PROMPTS: Partial<Record<PredictionCategoryId, string>> = {
  movie: 'a movie',
  number: 'a number',
  song: 'a song',
  actor: 'an actor or actress',
  sports_person: 'a sports star',
  singer: 'a singer',
  dob: 'a birthday',
  food: 'a food',
  place: 'a place',
  colour: 'a colour',
  animal: 'an animal',
  weather: 'a kind of weather',
  alphabet: 'a letter from A to Z',
  word: 'a word',
};

type FeedbackState = 'none' | 'asking_retry' | 'correction' | 'done';

export function MindReaderArena({
  initialMode,
  initialCategory,
  autoStartSignal,
  aiReady,
  initialIndustry,
  onUserStatsUpdate,
  onBackHome,
}: MindReaderArenaProps) {
  void aiReady;
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);
  const [selectedCategory, setSelectedCategory] = useState<PredictionCategoryId>(initialCategory);
  const [numberRange, setNumberRange] = useState<{ min: number; max: number }>({ min: 1, max: 100 });
  const [industry, setIndustry] = useState<string | null>(initialIndustry ?? null);
  const industryOptions = CATEGORY_INDUSTRIES[selectedCategory];
  const effectiveIndustry =
    industryOptions && industry && industryOptions.includes(industry) ? industry : industryOptions?.[0] ?? null;
  const [crystalActive, setCrystalActive] = useState(false);

  const [session, setSession] = useState<MindSessionState | null>(null);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');
  const retryRef = useRef<(() => void) | null>(null);

  const [ritual, setRitual] = useState(false);
  const [revealPhase, setRevealPhase] = useState<'idle' | 'suspense' | 'shown'>('idle');
  const [suspenseLine, setSuspenseLine] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>('none');
  const [feedbackCorrect, setFeedbackCorrect] = useState<boolean | null>(null);
  const [actualAnswerInput, setActualAnswerInput] = useState('');
  const [failureAnalysis, setFailureAnalysis] = useState<string | null>(null);
  const [rewardBanner, setRewardBanner] = useState<{ points: number; badges: string[] } | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);

  useEffect(() => {
    setSelectedMode(initialMode);
    setSelectedCategory(initialCategory);
  }, [initialMode, initialCategory]);

  useEffect(() => {
    if (autoStartSignal > 0) {
      if (initialMode === 'crystal_ball') {
        setSession(null);
        setCrystalActive(true);
      } else {
        handleStartSession(initialMode, initialCategory, { min: 1, max: 100 }, initialIndustry ?? null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartSignal]);

  const resetRoundUi = () => {
    clearTimers();
    setRevealPhase('idle');
    setFeedback('none');
    setFeedbackCorrect(null);
    setActualAnswerInput('');
    setFailureAnalysis(null);
    setRewardBanner(null);
    setCustomInput('');
  };

  const runAction = async (action: () => Promise<void>, fallbackMsg: string) => {
    setError(null);
    retryRef.current = () => {
      void runAction(action, fallbackMsg);
    };
    try {
      await action();
      retryRef.current = null;
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackMsg);
    }
  };

  const handleStartSession = async (
    modeToStart = selectedMode,
    catToStart = selectedCategory,
    rangeToUse = numberRange,
    industryToUse: string | null = effectiveIndustry
  ) => {
    if (modeToStart === 'crystal_ball') {
      setCrystalActive(true);
      return;
    }
    resetRoundUi();
    setSession(null);
    setRitual(true);
    setStarting(true);
    soundFx.playStart();
    await runAction(async () => {
      setStarting(true);
      try {
        const nextSession = await startMindGame({
          mode: modeToStart,
          category: modeToStart === 'number_reader' ? 'number' : catToStart,
          industry: modeToStart === 'mind_reader' ? industryToUse : null,
          numberRange: rangeToUse,
        });
        setSession(nextSession);
      } finally {
        setStarting(false);
      }
    }, 'Unable to start the Mind Reader.');
  };

  const triggerRevealSequence = (nextSession: MindSessionState) => {
    clearTimers();
    setSession(nextSession);
    setRevealPhase('suspense');
    setSuspenseLine(0);
    soundFx.playRevealBuild();
    timersRef.current.push(window.setTimeout(() => setSuspenseLine(1), 1000));
    timersRef.current.push(window.setTimeout(() => setSuspenseLine(2), 2000));
    timersRef.current.push(
      window.setTimeout(() => {
        setRevealPhase('shown');
        soundFx.playReveal();
        if (nextSession.prediction && nextSession.prediction.guess !== '???') {
          confetti({ particleCount: 70, spread: 100, startVelocity: 35, origin: { y: 0.45 }, colors: ['#818CF8', '#C084FC', '#F0ABFC', '#FFFFFF'] });
        }
      }, 2800)
    );
  };

  const handleSubmitAnswer = async (answerText: string) => {
    if (!session || loading || !answerText.trim()) return;
    setLoading(true);
    if (session.currentQuestion?.card) soundFx.playFlip();
    else soundFx.playClick();
    await runAction(async () => {
      try {
        const updated = await answerMindQuestion({ sessionId: session.sessionId, answer: answerText.trim() });
        setCustomInput('');
        if (updated.status === 'ready_to_reveal' && updated.prediction) triggerRevealSequence(updated);
        else setSession(updated);
      } finally {
        setLoading(false);
      }
    }, 'Failed to process your answer.');
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) handleSubmitAnswer(customInput.trim());
  };

  const handleFeedback = async (correct: boolean, actualAnswer?: string) => {
    if (!session || loading) return;
    setLoading(true);
    await runAction(async () => {
      try {
        const res = await submitMindFeedback({ sessionId: session.sessionId, correct, actualAnswer });
        setSession(res.session);
        setFeedback('done');
        setFeedbackCorrect(correct);
        setFailureAnalysis(res.failureAnalysis ?? null);
        setRewardBanner({ points: res.pointsAwarded, badges: res.newBadges });
        onUserStatsUpdate(res.user);
        if (correct) {
          soundFx.playSuccess();
          const burst = (x: number) => confetti({ particleCount: 90, spread: 70, origin: { x, y: 0.6 } });
          burst(0.25);
          burst(0.75);
        } else {
          soundFx.playMiss();
        }
      } finally {
        setLoading(false);
      }
    }, 'Could not save the result.');
  };

  const handleNoClicked = () => {
    if (!session) return;
    const isCards = CARD_CATEGORIES.includes(session.resolvedCategory ?? 'movie');
    if (!isCards && session.attemptsLeft > 0) setFeedback('asking_retry');
    else if (isCards) void handleFeedback(false);
    else setFeedback('correction');
  };

  const handleKeepGoing = async () => {
    if (!session || loading) return;
    setLoading(true);
    soundFx.playStart();
    await runAction(async () => {
      try {
        const updated = await continueMindAfterMiss(session.sessionId);
        resetRoundUi();
        if (updated.status === 'ready_to_reveal' && updated.prediction) triggerRevealSequence(updated);
        else setSession(updated);
      } finally {
        setLoading(false);
      }
    }, 'Could not continue this round.');
  };

  const handleAdvanceRound = async () => {
    if (!session || loading) return;
    setLoading(true);
    await runAction(async () => {
      try {
        const next = await nextMindRound(session.sessionId);
        resetRoundUi();
        setSession(next);
        setRitual(true);
        soundFx.playStart();
      } finally {
        setLoading(false);
      }
    }, 'Unable to start the next round.');
  };

  const resetToSetup = () => {
    resetRoundUi();
    setSession(null);
    setRitual(false);
    setStarting(false);
    setError(null);
    setCrystalActive(false);
  };

  if (crystalActive) {
    return <CrystalBall onExit={resetToSetup} />;
  }

  const errorBox = error && (
    <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-center justify-between gap-4">
      <div className="flex items-start gap-2.5 text-sm text-rose-700 dark:text-rose-300">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
      <div className="flex gap-2 shrink-0">
        {retryRef.current && (
          <button
            type="button"
            onClick={() => retryRef.current?.()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
        )}
        <button
          type="button"
          onClick={resetToSetup}
          className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300"
        >
          Back
        </button>
      </div>
    </div>
  );

  /* ------------------------------ SETUP ------------------------------ */
  if (!session && !ritual) {

    return (
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Mind Reader</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Choose a game, hold the answer in your mind, and watch it get read.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackHome}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-500 self-start sm:self-auto"
          >
            Back to Home
          </button>
        </div>

        {errorBox}


        <div className="rounded-2xl mm-glass p-6 space-y-5">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">1. Choose a game</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {MODE_OPTIONS.map((m) => {
              const active = selectedMode === m.id;
              const offline = false;
              return (
                <button
                  key={m.id}
                  type="button"
                  disabled={offline}
                  onClick={() => setSelectedMode(m.id)}
                  className={`relative text-left rounded-xl border p-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    active
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{m.label}</p>
                    {m.sure && (
                      <span className="rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap">
                        100%
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{offline ? 'Needs the AI engine' : m.desc}</p>
                </button>
              );
            })}
          </div>

          {(selectedMode === 'number_reader' || (selectedMode === 'mind_reader' && selectedCategory === 'number')) && (
            <div className="pt-2 space-y-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Number range</p>
              <div className="flex flex-wrap gap-2">
                {RANGE_PRESETS.map((preset) => {
                  const active = numberRange.min === preset.min && numberRange.max === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setNumberRange({ min: preset.min, max: preset.max })}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold font-mono transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(selectedMode === 'mind_reader' || selectedMode === 'double_challenge' || selectedMode === 'ultimate_challenge') && (
            <div className="pt-2 space-y-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                2. {selectedMode === 'mind_reader' ? 'What will you think of?' : 'Starting category'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {PREDICTION_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  const sure = CARD_CATEGORIES.includes(cat.id);
                  const offline = false;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={offline}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${
                        active
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <CategoryIcon category={cat.id} className="w-4 h-4" />
                        {sure && <span className="text-[9px] font-bold text-emerald-500">100%</span>}
                      </div>
                      <span className="text-xs font-medium leading-snug">{cat.name.replace('Favourite ', '')}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedMode === 'mind_reader' && industryOptions && (
            <div className="pt-2 space-y-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">3. Which world is it from?</p>
              <div className="flex flex-wrap gap-2">
                {industryOptions.map((opt) => {
                  const active = effectiveIndustry === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIndustry(opt)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                        active
                          ? 'mm-btn-primary'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {selectedMode === 'surprise_me'
                ? 'The orb will choose what you think of.'
                : selectedMode === 'crystal_ball'
                  ? 'A little secret maths, then a symbol only you know.'
                  : selectedMode === 'number_reader'
                    ? `Think of any whole number from ${numberRange.min} to ${numberRange.max}.`
                    : selectedMode === 'mind_reader'
                      ? `Think of ${thinkPrompt(selectedCategory, effectiveIndustry)}.`
                      : PREDICTION_CATEGORIES.find((c) => c.id === selectedCategory)?.samplePrompt}
            </p>

            <button
              type="button"
              disabled={starting}
              onClick={() => handleStartSession()}
              className="inline-flex items-center gap-2 rounded-xl mm-btn-primary disabled:opacity-50 px-8 py-3.5 text-base font-semibold text-white transition-colors whitespace-nowrap"
            >
              <Sparkles className="w-5 h-5" />
              <span>Begin</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const roundCategory = session?.resolvedCategory;
  const activeCategoryDef = PREDICTION_CATEGORIES.find((c) => c.id === (session?.prediction?.detectedCategory ?? roundCategory));
  const isCardRound = roundCategory ? CARD_CATEGORIES.includes(roundCategory) : false;
  const modeLabel = MODE_OPTIONS.find((m) => m.id === (session?.mode ?? selectedMode))?.label;

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {/* Top Session Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <span>{modeLabel}</span>
            {session && session.totalRounds > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Round {session.roundIndex} of {session.totalRounds}
                </span>
              </>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {!session ? 'Tuning in…' : activeCategoryDef?.name.replace('Favourite ', 'Your ') || 'Mind Reader'}
          </h1>
        </div>

        <button
          type="button"
          onClick={resetToSetup}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restart</span>
        </button>
      </div>

      {session && session.totalRounds > 1 && session.roundResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {session.roundResults.map((rr) => (
            <div
              key={rr.roundIndex}
              className="rounded-xl mm-glass px-4 py-3 flex items-center justify-between gap-2"
            >
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Round {rr.roundIndex}</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">{rr.guess}</p>
              </div>
              {rr.correct ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {errorBox}

      <AnimatePresence mode="wait">
        {/* PHASE 0: LOCK-IN RITUAL */}
        {ritual && (
          <motion.div
            key={`ritual-${session?.roundIndex ?? 0}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.03 }}
            transition={{ duration: 0.35 }}
          >
            <RitualScreen
              session={session}
              surprise={(session?.mode ?? selectedMode) === 'surprise_me'}
              starting={starting}
              onReady={() => {
                soundFx.playStart();
                setRitual(false);
              }}
            />
          </motion.div>
        )}

        {/* PHASE 1: QUESTIONING */}
        {!ritual && session && revealPhase === 'idle' && session.currentQuestion && (
          <motion.div
            key="questioning"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl mm-glass p-5 sm:p-8 space-y-6"
          >
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                  {isCardRound ? 'Card' : 'Question'} {session.currentQuestion.questionNumber} of {session.currentQuestion.maxQuestions}
                </span>
                {!isCardRound && (
                  <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    Signal {session.currentQuestion.signalStrength}%
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: session.currentQuestion.maxQuestions }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i < session.currentQuestion!.questionNumber - 1
                        ? 'bg-indigo-500'
                        : i === session.currentQuestion!.questionNumber - 1
                          ? 'bg-indigo-400/60 animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {session.currentQuestion.aiInsight && (
              <p
                key={session.currentQuestion.aiInsight}
                className="text-sm italic text-violet-600 dark:text-violet-300 flex items-center gap-2"
              >
                <Eye className="w-4 h-4 shrink-0" />
                {session.currentQuestion.aiInsight}
              </p>
            )}

            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {session.currentQuestion.questionText}
            </h2>

            {session.currentQuestion.card ? (
              <>
                <div
                  key={`card-${session.currentQuestion.questionNumber}`}
                  className="animate-card-in rounded-2xl border-2 border-indigo-400/40 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/40 p-3 sm:p-5 shadow-[0_0_40px_rgba(99,102,241,0.15)]"
                >
                  <div
                    className="grid gap-1.5 sm:gap-2"
                    style={{ gridTemplateColumns: `repeat(${session.currentQuestion.card.columns}, minmax(0, 1fr))` }}
                  >
                    {session.currentQuestion.card.items.map((item) => (
                      <div
                        key={item}
                        className={`flex items-center justify-center rounded-lg bg-white/80 dark:bg-slate-900/70 font-mono font-bold text-slate-900 dark:text-white tabular-nums ${
                          session.currentQuestion!.card!.kind === 'alphabet'
                            ? 'aspect-square text-2xl sm:text-3xl'
                            : 'py-1.5 sm:py-2 text-sm sm:text-lg'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmitAnswer(session.currentQuestion!.options[0])}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 px-5 py-4 text-base sm:text-lg font-bold text-white transition-colors"
                  >
                    Yes, it’s here
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmitAnswer(session.currentQuestion!.options[1])}
                    className="rounded-xl bg-slate-700 hover:bg-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-60 px-5 py-4 text-base sm:text-lg font-bold text-white transition-colors"
                  >
                    No, it’s not
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-3">
                  {session.currentQuestion.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      disabled={loading}
                      onClick={() => handleSubmitAnswer(opt)}
                      className={`${opt === 'Not sure' ? 'opacity-70 !py-3 text-sm ' : ''}w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 disabled:opacity-60 px-5 py-4 text-base font-medium text-slate-800 dark:text-slate-100 transition-colors flex items-center justify-between gap-3`}
                    >
                      <span>{opt}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  ))}
                </div>

                {session.currentQuestion.allowCustomInput && (
                  <form onSubmit={handleCustomSubmit} className="pt-1 flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      disabled={loading}
                      maxLength={120}
                      placeholder={session.currentQuestion.customPlaceholder || 'Or type a short hint…'}
                      className="flex-1 min-w-0 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={loading || !customInput.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl mm-btn-primary disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                )}

                {loading && (
                  <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reading your answer…</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* PHASE 2: SUSPENSE */}
        {!ritual && revealPhase === 'suspense' && session && (
          <motion.div
            key="suspense"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-slate-950 to-[#0A1024] p-12 sm:p-16 text-center text-white"
          >
            <div className="flex justify-center">
              <ThinkingOrb state="suspense" size="lg" confidencePct={90} />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={suspenseLine}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mt-8 font-display text-2xl sm:text-4xl font-bold tracking-tight ${suspenseLine === 2 ? 'reveal-glitch' : ''}`}
              >
                {['Reading your mind…', 'Don’t change your mind now…', 'I see it!'][suspenseLine]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        )}

        {/* PHASE 3: REVEAL */}
        {!ritual && revealPhase === 'shown' && session?.prediction && (
          <motion.div
            key="shown"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 140, damping: 16 }}
            className="rounded-2xl border border-indigo-500/30 bg-white dark:bg-gradient-to-b dark:from-[#0F1530] dark:to-[#0C1222] p-6 sm:p-10 space-y-6 text-center shadow-[0_0_60px_rgba(99,102,241,0.15)]"
          >
            <p className="text-xs font-semibold tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
              {session.prediction.guess === '???' ? 'THE SIGNAL GOT CROSSED' : 'YOU ARE THINKING OF'}
            </p>

            {session.prediction.posterUrl && (
              <motion.img
                src={session.prediction.posterUrl}
                alt=""
                initial={{ opacity: 0, rotateY: -60, scale: 0.9 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mx-auto h-56 sm:h-72 rounded-xl shadow-[0_20px_60px_-10px_rgba(124,58,237,0.6)] border border-white/10"
              />
            )}

            {session.prediction.guess !== '???' && !isCardRound && !session.prediction.posterUrl && (
              <PredictionRevealArtwork
                category={session.prediction.detectedCategory ?? session.resolvedCategory ?? 'movie'}
                guess={session.prediction.guess}
                visualAccent={session.prediction.visualAccent}
              />
            )}

            <h2
              className={`font-display font-bold tracking-tight ${
                isCardRound && session.prediction.guess !== '???'
                  ? 'text-8xl sm:text-9xl tabular-nums text-indigo-600 dark:text-white drop-shadow-[0_0_35px_rgba(129,140,248,0.75)] py-2'
                  : 'text-4xl sm:text-6xl text-slate-900 dark:text-white'
              }`}
            >
              {session.prediction.guess.split('').map((ch, i) => (
                <motion.span
                  key={`${ch}-${i}`}
                  initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.15 + i * 0.045, duration: 0.35 }}
                  className="inline-block whitespace-pre"
                >
                  {ch}
                </motion.span>
              ))}
            </h2>

            {session.prediction.subtitle && (
              <p className="text-sm font-medium text-violet-600 dark:text-violet-300 -mt-2">{session.prediction.subtitle}</p>
            )}

            {!isCardRound && (
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                <span>{session.prediction.questionsAsked} questions</span>
                <span aria-hidden="true">·</span>
                <span>Confidence {session.prediction.confidence}%</span>
              </div>
            )}

            <p className="max-w-xl mx-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {session.prediction.explanation}
            </p>

            {feedback === 'done' && !feedbackCorrect && session.prediction.runnersUp && session.prediction.runnersUp.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Also on my mind: {session.prediction.runnersUp.join(' · ')}
              </p>
            )}

            {session.prediction.honestyNote && (
              <div className="max-w-xl mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-2.5 text-left text-xs text-amber-800 dark:text-amber-200">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{session.prediction.honestyNote}</span>
              </div>
            )}

            {session.prediction.guess === '???' && feedback === 'none' && (
              <button
                type="button"
                onClick={() => handleStartSession(session.mode, session.resolvedCategory ?? 'number', session.numberRange ?? numberRange)}
                className="inline-flex items-center gap-2 rounded-xl mm-btn-primary px-6 py-3 text-sm font-semibold text-white"
              >
                <RotateCcw className="w-4 h-4" /> Try again
              </button>
            )}

            {session.prediction.guess !== '???' && feedback === 'none' && (
              <div className="pt-2 space-y-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Was I right?</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleFeedback(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-7 py-4 text-base font-bold text-white transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Yes! You read my mind!</span>
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleNoClicked}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-7 py-4 text-base font-semibold text-slate-800 dark:text-slate-100 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>No, not quite</span>
                  </button>
                </div>
              </div>
            )}

            {feedback === 'asking_retry' && (
              <div className="max-w-md mx-auto rounded-xl border border-violet-500/30 bg-violet-500/10 p-5 space-y-3">
                <p className="font-display text-lg font-bold text-slate-900 dark:text-white">So close… let me look deeper.</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Answer a few more questions and I’ll try again. ({session.attemptsLeft} {session.attemptsLeft === 1 ? 'retry' : 'retries'} left)
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleKeepGoing}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 px-5 py-3 text-sm font-semibold text-white"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    Keep going
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setFeedback('correction')}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Tell you the answer
                  </button>
                </div>
              </div>
            )}

            {feedback === 'correction' && (
              <div className="max-w-md mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 space-y-3 text-left">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">You beat me! What was it?</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Optional — it helps the engine for the next player.</p>
                <input
                  type="text"
                  value={actualAnswerInput}
                  maxLength={120}
                  onChange={(e) => setActualAnswerInput(e.target.value)}
                  placeholder="What you were thinking of…"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleFeedback(false, actualAnswerInput)}
                    className="rounded-lg mm-btn-primary px-4 py-2 text-xs font-semibold text-white"
                  >
                    {loading ? 'Saving…' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleFeedback(false)}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {feedback === 'done' && (
              <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm pt-3">
                  <span
                    className={`font-semibold ${
                      feedbackCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {feedbackCorrect
                      ? 'Mind: read. ✨'
                      : isCardRound
                        ? 'The cards never lie — one may have been misread. Try again slowly!'
                        : 'You beat the machine this time!'}
                  </span>
                  {rewardBanner && (
                    <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 tabular-nums">
                      +{rewardBanner.points} pts
                    </span>
                  )}
                </div>

                {failureAnalysis && (
                  <p className="max-w-lg mx-auto text-xs text-slate-600 dark:text-slate-400">{failureAnalysis}</p>
                )}

                {rewardBanner && rewardBanner.badges.length > 0 && (
                  <div className="text-sm font-semibold text-violet-600 dark:text-violet-400">
                    🏅 Badge unlocked:{' '}
                    {rewardBanner.badges.map((id) => BADGE_DEFINITIONS.find((b) => b.id === id)?.name || id).join(', ')}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  {session.roundIndex < session.totalRounds ? (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleAdvanceRound}
                      className="inline-flex items-center gap-2 rounded-xl mm-btn-primary px-6 py-3 text-sm font-semibold text-white"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      <span>
                        Round {session.roundIndex + 1} of {session.totalRounds}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleStartSession(
                          session.mode,
                          session.mode === 'mind_reader' ? (session.resolvedCategory ?? selectedCategory) : selectedCategory,
                          session.numberRange ?? numberRange,
                          session.mode === 'mind_reader' ? (session.industry ?? effectiveIndustry) : null
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl mm-btn-primary px-6 py-3 text-sm font-semibold text-white"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Play again</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={resetToSetup}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Try another game
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lock-in ritual: builds anticipation and hides AI latency            */
/* ------------------------------------------------------------------ */

function RitualScreen({
  session,
  surprise,
  starting,
  onReady,
}: {
  session: MindSessionState | null;
  surprise: boolean;
  starting: boolean;
  onReady: () => void;
}) {
  const category = session?.resolvedCategory;
  const [rouletteIdx, setRouletteIdx] = useState(0);
  const [rouletteDone, setRouletteDone] = useState(!surprise);
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMinDelayDone(true), surprise ? 2200 : 900);
    return () => window.clearTimeout(t);
  }, [surprise, session?.roundIndex]);

  useEffect(() => {
    if (!surprise || rouletteDone) return;
    const iv = window.setInterval(() => {
      setRouletteIdx((i) => (i + 1) % PREDICTION_CATEGORIES.length);
      soundFx.playTick();
    }, 110);
    return () => window.clearInterval(iv);
  }, [surprise, rouletteDone]);

  useEffect(() => {
    if (surprise && category && minDelayDone && !rouletteDone) {
      setRouletteDone(true);
      soundFx.playSuccess();
    }
  }, [surprise, category, minDelayDone, rouletteDone]);

  const ready = Boolean(session) && !starting && minDelayDone && rouletteDone;
  const isCards = category ? CARD_CATEGORIES.includes(category) : false;
  const thing = category ? thinkPrompt(category, session?.industry) : 'something';
  const range = session?.numberRange;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-slate-950 via-[#0D1230] to-[#0A1024] p-8 sm:p-14 text-center text-white space-y-7">
      <div className="flex justify-center">
        <ThinkingOrb state={ready ? 'idle' : 'thinking'} size="lg" confidencePct={ready ? 60 : 35} />
      </div>

      {surprise && !rouletteDone ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-300">THE ORB IS CHOOSING</p>
          <p className="font-display text-3xl sm:text-4xl font-bold text-white/90 reveal-glitch">
            {PREDICTION_CATEGORIES[rouletteIdx].name.replace('Favourite ', '')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.3em] text-indigo-300">
            {surprise ? 'THE ORB HAS CHOSEN' : 'CLOSE YOUR EYES FOR A MOMENT'}
          </p>
          <h2 className="font-display text-3xl sm:text-5xl font-bold leading-tight">
            Think of {thing}.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-md mx-auto">
            {isCards && category === 'number' && range
              ? `Any whole number from ${range.min} to ${range.max}. Picture it clearly. Don’t say it out loud.`
              : isCards
                ? 'Picture the letter clearly, glowing in your mind. Don’t say it out loud.'
                : category === 'dob'
                  ? 'Picture the day and the month. Don’t say it out loud.'
                  : 'Picture it clearly. Don’t say it, don’t write it. Just hold it in your mind.'}
          </p>
          {isCards && (
            <p className="text-sm text-indigo-200/80">
              I’ll show you a few cards. Just tell me if you see it — that’s all I need.
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!ready}
        onClick={onReady}
        className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 hover:bg-indigo-100 disabled:bg-white/20 disabled:text-white/60 px-8 py-4 text-base font-bold transition-colors"
      >
        {ready ? (
          <>
            <Sparkles className="w-5 h-5" /> I’ve got it — read my mind
          </>
        ) : (
          <>
            <Loader2 className="w-5 h-5 animate-spin" /> Tuning in…
          </>
        )}
      </button>
    </div>
  );
}
