import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  BADGE_DEFINITIONS,
  GameMode,
  MindSessionState,
  PREDICTION_CATEGORIES,
  PredictionCategoryId,
  UserStats,
} from '../types';
import {
  answerMindQuestion,
  nextMindRound,
  startMindGame,
  submitMindFeedback,
} from '../utils/api';
import { soundFx } from '../utils/sound';
import { CategoryIcon, PredictionRevealArtwork } from './Visuals';

interface MindReaderArenaProps {
  initialMode: GameMode;
  initialCategory: PredictionCategoryId;
  autoStartSignal: number;
  onUserStatsUpdate: (user: UserStats) => void;
  onBackHome: () => void;
}

const MODE_OPTIONS: Array<{ id: GameMode; label: string; desc: string }> = [
  { id: 'mind_reader', label: 'Mind Reader', desc: '14 categories · 7–10 adaptive questions' },
  { id: 'surprise_me', label: 'Surprise Me', desc: 'Hidden category selected by AI' },
  { id: 'number_reader', label: 'Number Mind Reader', desc: 'Exact numeric range elimination' },
  { id: 'double_challenge', label: 'Double Challenge', desc: '2 sequential predictions' },
  { id: 'ultimate_challenge', label: 'Ultimate Challenge', desc: '3 sequential predictions' },
];

const RANGE_PRESETS = [
  { label: '1 – 50', min: 1, max: 50 },
  { label: '1 – 100', min: 1, max: 100 },
  { id: '1 – 500', min: 1, max: 500 },
  { label: '1 – 1000', min: 1, max: 1000 },
];

export function MindReaderArena({
  initialMode,
  initialCategory,
  autoStartSignal,
  onUserStatsUpdate,
  onBackHome,
}: MindReaderArenaProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>(initialMode);
  const [selectedCategory, setSelectedCategory] = useState<PredictionCategoryId>(initialCategory);
  const [numberRange, setNumberRange] = useState<{ min: number; max: number }>({ min: 1, max: 100 });

  const [session, setSession] = useState<MindSessionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');

  // Suspense reveal transition
  const [revealPhase, setRevealPhase] = useState<'idle' | 'suspense' | 'shown'>('idle');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean | null>(null);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [actualAnswerInput, setActualAnswerInput] = useState('');
  const [failureAnalysis, setFailureAnalysis] = useState<string | null>(null);
  const [rewardBanner, setRewardBanner] = useState<{ points: number; badges: string[] } | null>(null);

  useEffect(() => {
    setSelectedMode(initialMode);
    setSelectedCategory(initialCategory);
  }, [initialMode, initialCategory]);

  // If navigated from Dashboard card/CTA with autoStartSignal > 0, launch immediately (unless number_reader lets them pick range or starts 1-100)
  useEffect(() => {
    if (autoStartSignal > 0) {
      handleStartSession(initialMode, initialCategory, { min: 1, max: 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartSignal]);

  const handleStartSession = async (
    modeToStart = selectedMode,
    catToStart = selectedCategory,
    rangeToUse = numberRange
  ) => {
    setLoading(true);
    setError(null);
    setRevealPhase('idle');
    setFeedbackSubmitted(null);
    setShowCorrectionForm(false);
    setActualAnswerInput('');
    setFailureAnalysis(null);
    setRewardBanner(null);
    setCustomInput('');
    soundFx.playStart();

    try {
      const nextSession = await startMindGame({
        mode: modeToStart,
        category: modeToStart === 'number_reader' ? 'number' : catToStart,
        numberRange: modeToStart === 'number_reader' || catToStart === 'number' ? rangeToUse : undefined,
      });
      setSession(nextSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start Mind Reader session.');
    } finally {
      setLoading(false);
    }
  };

  const triggerRevealSequence = (nextSession: MindSessionState) => {
    setSession(nextSession);
    setRevealPhase('suspense');
    soundFx.playSuspense();
    window.setTimeout(() => {
      setRevealPhase('shown');
    }, 1450);
  };

  const handleSubmitAnswer = async (answerText: string) => {
    if (!session || loading || !answerText.trim()) return;
    setLoading(true);
    setError(null);
    soundFx.playClick();

    try {
      const updated = await answerMindQuestion({
        sessionId: session.sessionId,
        answer: answerText.trim(),
      });
      setCustomInput('');

      if (updated.status === 'ready_to_reveal' && updated.prediction) {
        triggerRevealSequence(updated);
      } else {
        setSession(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process your answer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      handleSubmitAnswer(customInput.trim());
    }
  };

  const handleFeedback = async (correct: boolean, actualAnswer?: string) => {
    if (!session) return;
    setLoading(true);
    setError(null);

    try {
      const res = await submitMindFeedback({
        sessionId: session.sessionId,
        correct,
        actualAnswer,
      });
      setSession(res.session);
      setFeedbackSubmitted(correct);
      setFailureAnalysis(res.failureAnalysis ?? null);
      setShowCorrectionForm(false);
      setRewardBanner({ points: res.pointsAwarded, badges: res.newBadges });
      onUserStatsUpdate(res.user);

      if (correct) {
        soundFx.playSuccess();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        soundFx.playMiss();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save prediction feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceRound = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    setRevealPhase('idle');
    setFeedbackSubmitted(null);
    setShowCorrectionForm(false);
    setActualAnswerInput('');
    setFailureAnalysis(null);
    setRewardBanner(null);

    try {
      const next = await nextMindRound(session.sessionId);
      setSession(next);
      soundFx.playStart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start next round.');
    } finally {
      setLoading(false);
    }
  };

  const resetToSetup = () => {
    setSession(null);
    setRevealPhase('idle');
    setError(null);
    setFeedbackSubmitted(null);
    setShowCorrectionForm(false);
    setRewardBanner(null);
  };

  // Setup View when no session is active
  if (!session) {
    return (
      <div className="max-w-5xl mx-auto py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
              Mind Reader Engine
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select your mode and subject, hold your answer in mind, and let the AI narrow it down in 7–10 questions.
            </p>
          </div>
          <button
            type="button"
            onClick={onBackHome}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-500 self-start sm:self-auto"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 text-sm text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => handleStartSession()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Mode Selector */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-6 space-y-5">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white">
            1. Select Game Mode
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {MODE_OPTIONS.map((m) => {
              const active = selectedMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMode(m.id)}
                  className={`text-left rounded-xl border p-4 transition-colors ${
                    active
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                    {m.label}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{m.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Number Range Picker if Number Mind Reader or Number category */}
          {(selectedMode === 'number_reader' ||
            (selectedMode === 'mind_reader' && selectedCategory === 'number')) && (
            <div className="pt-2 space-y-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Choose Number Range
              </p>
              <div className="flex flex-wrap gap-2">
                {RANGE_PRESETS.map((preset) => {
                  const active =
                    numberRange.min === preset.min && numberRange.max === preset.max;
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

          {/* Category Picker (hidden for Surprise Me & Number Reader) */}
          {selectedMode !== 'surprise_me' && selectedMode !== 'number_reader' && (
            <div className="pt-2 space-y-3 border-t border-slate-200 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                2. Select {selectedMode === 'mind_reader' ? 'Category' : 'Starting Category'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
                {PREDICTION_CATEGORIES.map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors ${
                        active
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <CategoryIcon category={cat.id} className="w-4 h-4" />
                      <span className="text-xs font-medium leading-snug">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selectedMode === 'surprise_me'
                ? 'Think of something memorable from a common category — the AI will pick a secret target and triangulate.'
                : selectedMode === 'number_reader'
                  ? `Think of any whole number between ${numberRange.min} and ${numberRange.max}.`
                  : PREDICTION_CATEGORIES.find((c) => c.id === selectedCategory)?.samplePrompt}
            </p>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleStartSession()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-6 py-3 text-sm font-semibold text-white transition-colors whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{loading ? 'Initializing...' : 'Begin Session'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeCategoryDef = PREDICTION_CATEGORIES.find(
    (c) => c.id === (session.prediction?.detectedCategory ?? session.resolvedCategory ?? session.category)
  );
  const progressPct = Math.min(100, Math.round((session.questionCount / session.maxQuestions) * 100));

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      {/* Top Session Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <span>{MODE_OPTIONS.find((m) => m.id === session.mode)?.label}</span>
            {session.totalRounds > 1 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Round {session.roundIndex} of {session.totalRounds}
                </span>
              </>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {session.mode === 'surprise_me' && revealPhase === 'idle'
              ? 'Mystery Category'
              : activeCategoryDef?.name || 'Mind Reader'}
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

      {/* Multi-Round History Strip for Double / Ultimate */}
      {session.totalRounds > 1 && session.roundResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {session.roundResults.map((rr) => (
            <div
              key={rr.roundIndex}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] px-4 py-3 flex items-center justify-between gap-2"
            >
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Round {rr.roundIndex}</p>
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                  {rr.guess}
                </p>
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

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => handleStartSession()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
        </div>
      )}

      {/* PHASE 1: QUESTIONING */}
      {revealPhase === 'idle' && session.currentQuestion && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-6 sm:p-8 space-y-6">
          {/* Progress & Signal Meter */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                Question {session.currentQuestion.questionNumber} of {session.maxQuestions}
              </span>
              <span className="font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                {session.currentQuestion.remainingEstimate
                  ? session.currentQuestion.remainingEstimate
                  : `Pattern Signal: ${session.currentQuestion.signalStrength}%`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${Math.max(10, progressPct)}%` }}
              />
            </div>
          </div>

          {/* AI Deduction Insight */}
          {session.currentQuestion.aiInsight && (
            <p className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-4">
              {session.currentQuestion.aiInsight}
            </p>
          )}

          {/* Question Headline */}
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {session.currentQuestion.questionText}
          </h2>

          {/* Answer Options */}
          <div className="grid grid-cols-1 gap-3">
            {session.currentQuestion.options.map((opt) => (
              <button
                key={opt}
                type="button"
                disabled={loading}
                onClick={() => handleSubmitAnswer(opt)}
                className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 disabled:opacity-60 px-5 py-3.5 text-sm font-medium text-slate-800 dark:text-slate-100 transition-colors flex items-center justify-between gap-3"
              >
                <span>{opt}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>

          {/* Optional Custom Input Clue */}
          {session.currentQuestion.allowCustomInput && (
            <form onSubmit={handleCustomSubmit} className="pt-2 flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                disabled={loading}
                placeholder={
                  session.currentQuestion.customPlaceholder || 'Or type a specific clue...'
                }
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={loading || !customInput.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Send</span>
              </button>
            </form>
          )}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 pt-1">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analysing your answer and narrowing possibilities...</span>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: SUSPENSE REVEAL ANIMATION */}
      {revealPhase === 'suspense' && (
        <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-slate-900 to-[#0A1024] p-10 text-center space-y-5 text-white">
          <div className="w-20 h-20 mx-auto rounded-full border-2 border-indigo-400/60 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-indigo-300" />
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            WAIT... I THINK I KNOW WHAT YOU ARE THINKING!
          </p>
          <p className="text-sm text-slate-300">
            Synthesizing clues across {session.questionCount} responses...
          </p>
        </div>
      )}

      {/* PHASE 3: FINAL PREDICTION REVEAL */}
      {revealPhase === 'shown' && session.prediction && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-6 sm:p-10 space-y-6 text-center">
          <p className="text-xs font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
            YOUR MIND HAS BEEN READ
          </p>

          <PredictionRevealArtwork
            category={session.prediction.detectedCategory ?? session.resolvedCategory ?? 'movie'}
            guess={session.prediction.guess}
            visualAccent={session.prediction.visualAccent}
          />

          <div className="space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              My Final Guess ({activeCategoryDef?.name ?? 'Target'}):
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              {session.prediction.guess}
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-300 tabular-nums">
            <span>Confidence: {session.prediction.confidence}%</span>
            <span aria-hidden="true">·</span>
            <span>Questions Asked: {session.prediction.questionsAsked}</span>
            {session.prediction.runnerUp && (
              <>
                <span aria-hidden="true">·</span>
                <span>Runner-up: {session.prediction.runnerUp}</span>
              </>
            )}
          </div>

          <p className="max-w-xl mx-auto text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {session.prediction.explanation}
          </p>

          {session.prediction.honestyNote && (
            <div className="max-w-xl mx-auto rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-start gap-2.5 text-left text-xs text-amber-800 dark:text-amber-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{session.prediction.honestyNote}</span>
            </div>
          )}

          {/* Feedback Buttons */}
          {feedbackSubmitted === null && !showCorrectionForm && (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleFeedback(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>YES! YOU READ MY MIND!</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => setShowCorrectionForm(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>NO! TRY AGAIN!</span>
              </button>
            </div>
          )}

          {/* Optional Correction Capture when NO is clicked */}
          {showCorrectionForm && feedbackSubmitted === null && (
            <div className="max-w-md mx-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-5 space-y-3 text-left">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Help calibrate MindMystery
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                What were you actually thinking of? (Optional — helps improve future predictions.)
              </p>
              <input
                type="text"
                value={actualAnswerInput}
                onChange={(e) => setActualAnswerInput(e.target.value)}
                placeholder="Enter the actual answer..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleFeedback(false, actualAnswerInput)}
                  className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  {loading ? 'Analysing...' : 'Submit & Analyse'}
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

          {/* Post-Feedback Outcome & Multi-Round Next Button */}
          {feedbackSubmitted !== null && (
            <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                <span
                  className={`font-semibold ${
                    feedbackSubmitted
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {feedbackSubmitted
                    ? 'Prediction confirmed!'
                    : 'Calibration recorded for future games.'}
                </span>
                {rewardBanner && (
                  <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400 tabular-nums">
                    +{rewardBanner.points} pts earned
                  </span>
                )}
              </div>

              {failureAnalysis && (
                <p className="max-w-lg mx-auto text-xs text-slate-600 dark:text-slate-400">
                  AI Post-Game Note: {failureAnalysis}
                </p>
              )}

              {rewardBanner && rewardBanner.badges.length > 0 && (
                <div className="text-xs font-medium text-violet-600 dark:text-violet-400">
                  Badge Unlocked:{' '}
                  {rewardBanner.badges
                    .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id)?.name || id)
                    .join(', ')}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {session.roundIndex < session.totalRounds ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleAdvanceRound}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white"
                  >
                    <span>
                      Start Target {session.roundIndex + 1} of {session.totalRounds}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartSession()}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Play Again</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetToSetup}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Change Category / Mode
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
