import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  HelpCircle,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  BADGE_DEFINITIONS,
  RIDDLE_CATEGORIES,
  RiddleCategoryId,
  RiddleDifficulty,
  RiddleEvaluation,
  RiddleQuestion,
  UserStats,
} from '../types';
import { generateArenaRiddle, submitArenaRiddleAnswer } from '../utils/api';
import { soundFx } from '../utils/sound';
import { RiddleCategoryIcon } from './Visuals';

interface BrainArenaProps {
  initialCategory: RiddleCategoryId;
  initialDifficulty: RiddleDifficulty;
  autoLoadSignal: number;
  onUserStatsUpdate: (user: UserStats) => void;
  onBackHome: () => void;
}

const DIFFICULTIES: RiddleDifficulty[] = ['Easy', 'Medium', 'Hard'];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function BrainArena({
  initialCategory,
  initialDifficulty,
  autoLoadSignal,
  onUserStatsUpdate,
  onBackHome,
}: BrainArenaProps) {
  const [category, setCategory] = useState<RiddleCategoryId>(initialCategory);
  const [difficulty, setDifficulty] = useState<RiddleDifficulty>(initialDifficulty);

  const [riddle, setRiddle] = useState<RiddleQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [evaluation, setEvaluation] = useState<RiddleEvaluation | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askedHistoryRef = useRef<string[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setCategory(initialCategory);
    setDifficulty(initialDifficulty);
  }, [initialCategory, initialDifficulty]);

  useEffect(() => {
    if (autoLoadSignal > 0) {
      loadRiddle(initialCategory, initialDifficulty);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadSignal]);

  // Countdown Timer
  useEffect(() => {
    if (!riddle || evaluation || loading) {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          handleTimeoutSubmission(riddle.id);
          return 0;
        }
        if (prev <= 6) {
          soundFx.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riddle?.id, evaluation, loading]);

  const handleTimeoutSubmission = async (riddleId: string) => {
    if (submitting || evaluation) return;
    setSubmitting(true);
    try {
      const res = await submitArenaRiddleAnswer({
        riddleId,
        selectedIndex: null,
        usedHint: showHint,
        secondsRemaining: 0,
        timedOut: true,
      });
      setEvaluation(res.evaluation);
      onUserStatsUpdate(res.user);
      soundFx.playMiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit timed-out challenge.');
    } finally {
      setSubmitting(false);
    }
  };

  const loadRiddle = async (cat = category, diff = difficulty) => {
    setLoading(true);
    setError(null);
    setEvaluation(null);
    setSelectedIndex(null);
    setShowHint(false);
    soundFx.playStart();

    try {
      const next = await generateArenaRiddle({
        category: cat,
        difficulty: diff,
        excludeQuestions: askedHistoryRef.current,
      });
      askedHistoryRef.current = [...askedHistoryRef.current, next.question].slice(-20);
      setRiddle(next);
      setSecondsLeft(next.timeLimitSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate Brain Arena challenge.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!riddle || selectedIndex === null || submitting || evaluation) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await submitArenaRiddleAnswer({
        riddleId: riddle.id,
        selectedIndex,
        usedHint: showHint,
        secondsRemaining: secondsLeft,
        timedOut: false,
      });
      setEvaluation(res.evaluation);
      onUserStatsUpdate(res.user);

      if (res.evaluation.correct) {
        soundFx.playSuccess();
        confetti({
          particleCount: 55,
          spread: 55,
          origin: { y: 0.65 },
        });
      } else {
        soundFx.playMiss();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate your answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeCatDef = RIDDLE_CATEGORIES.find((c) => c.id === category) ?? RIDDLE_CATEGORIES[0];
  const timerPct =
    riddle && riddle.timeLimitSeconds > 0
      ? Math.max(0, Math.round((secondsLeft / riddle.timeLimitSeconds) * 100))
      : 0;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            The Brain Arena
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Verified, non-repeating riddles and timed challenges across five core disciplines.
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

      {/* Category & Difficulty Controls */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {RIDDLE_CATEGORIES.map((cat) => {
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategory(cat.id);
                  if (riddle) loadRiddle(cat.id, difficulty);
                }}
                className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left transition-colors ${
                  active
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <RiddleCategoryIcon category={cat.id} className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold leading-tight">{cat.name}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Difficulty:</span>
            <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-900 p-1 gap-1">
              {DIFFICULTIES.map((diff) => {
                const active = difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      setDifficulty(diff);
                      if (riddle) loadRiddle(category, diff);
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          {!riddle && (
            <button
              type="button"
              disabled={loading}
              onClick={() => loadRiddle(category, difficulty)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-60 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>{loading ? 'Generating Riddle...' : 'Start Challenge'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 flex items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => loadRiddle(category, difficulty)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-8 flex items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
          <span>Crafting a verified {difficulty} {activeCatDef.name} challenge...</span>
        </div>
      )}

      {/* Active Riddle Stage */}
      {!loading && riddle && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-6 sm:p-8 space-y-6">
          {/* Metadata + Countdown Timer */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-violet-600 dark:text-violet-400">
                  {activeCatDef.name}
                </span>
                <span aria-hidden="true">·</span>
                <span>{riddle.subtopic}</span>
                <span aria-hidden="true">·</span>
                <span>{riddle.difficulty}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{riddle.basePoints} base pts</span>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 font-mono text-sm font-semibold tabular-nums ${
                  secondsLeft <= 8 && !evaluation
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>00:{String(secondsLeft).padStart(2, '0')}</span>
              </div>
            </div>

            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  secondsLeft <= 8 ? 'bg-rose-500' : 'bg-violet-500'
                }`}
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {riddle.question}
          </h2>

          {/* Hint Area */}
          {showHint && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-800 dark:text-amber-200">
              <span className="font-semibold">Hint: </span>
              {riddle.hint}
            </div>
          )}

          {/* 4 Multiple Choice Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {riddle.options.map((opt, idx) => {
              const isSelected = selectedIndex === idx;
              const isCorrectOption = evaluation && evaluation.correctIndex === idx;
              const isWrongSelected = evaluation && isSelected && !evaluation.correct;

              let styleClass =
                'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 hover:border-violet-500 text-slate-800 dark:text-slate-100';

              if (evaluation) {
                if (isCorrectOption) {
                  styleClass =
                    'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200';
                } else if (isWrongSelected) {
                  styleClass = 'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200';
                } else {
                  styleClass =
                    'border-slate-200 dark:border-slate-800 opacity-60 text-slate-600 dark:text-slate-400';
                }
              } else if (isSelected) {
                styleClass =
                  'border-violet-500 bg-violet-50 dark:bg-violet-500/15 text-violet-900 dark:text-violet-100';
              }

              return (
                <button
                  key={`${idx}_${opt}`}
                  type="button"
                  disabled={Boolean(evaluation) || submitting}
                  onClick={() => {
                    setSelectedIndex(idx);
                    soundFx.playClick();
                  }}
                  className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors flex items-start gap-3 ${styleClass}`}
                >
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                    {OPTION_LABELS[idx]}
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Actions before evaluation */}
          {!evaluation && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                disabled={showHint || submitting}
                onClick={() => {
                  setShowHint(true);
                  soundFx.playClick();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'Hint Revealed (-5 pts)' : 'Show Hint'}</span>
              </button>

              <button
                type="button"
                disabled={selectedIndex === null || submitting}
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Submit Answer</span>
              </button>
            </div>
          )}

          {/* Evaluation Feedback */}
          {evaluation && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {evaluation.correct ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                        Correct Answer
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-500" />
                      <span className="font-display text-base font-bold text-rose-600 dark:text-rose-400">
                        {evaluation.timedOut ? 'Time Expired' : 'Incorrect Answer'}
                      </span>
                    </>
                  )}
                </div>

                <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  +{evaluation.pointsAwarded} pts awarded
                </span>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {evaluation.explanation}
              </p>

              {evaluation.newBadges.length > 0 && (
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                  Badge Unlocked:{' '}
                  {evaluation.newBadges
                    .map((id) => BADGE_DEFINITIONS.find((b) => b.id === id)?.name || id)
                    .join(', ')}
                </p>
              )}

              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => loadRiddle(category, difficulty)}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  <span>Next Riddle</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
