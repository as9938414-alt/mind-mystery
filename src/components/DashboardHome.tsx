import { ArrowRight, Gem, Moon, Shuffle, Sparkles, Sun, Target, Volume2, VolumeX, Zap } from 'lucide-react';
import {
  GameMode,
  PREDICTION_CATEGORIES,
  PredictionCategoryId,
  RIDDLE_CATEGORIES,
  RiddleCategoryId,
  RiddleDifficulty,
  UserStats,
} from '../types';
import { ThinkingOrb } from './ThinkingOrb';
import { CategoryIcon, RiddleCategoryIcon } from './Visuals';

interface DashboardHomeProps {
  userStats: UserStats | null;
  darkMode: boolean;
  muted: boolean;
  onToggleTheme: () => void;
  onToggleMute: () => void;
  onStartMindMode: (mode: GameMode, category?: PredictionCategoryId) => void;
  onOpenArena: (category: RiddleCategoryId, difficulty: RiddleDifficulty) => void;
  aiReady: boolean | null;
}

const GAME_MODES: Array<{
  id: GameMode;
  title: string;
  subtitle: string;
  detail: string;
  needsAi: boolean;
  sure?: boolean;
}> = [
  {
    id: 'number_reader',
    title: 'Number Reader',
    subtitle: 'Magic cards · Never misses',
    detail: 'Think of any number from 1 to 100. Look at 7 cards. I’ll name your number.',
    needsAi: false,
    sure: true,
  },
  {
    id: 'crystal_ball',
    title: 'Crystal Ball',
    subtitle: 'Secret maths · Never misses',
    detail: 'Do a little maths in your head, pick a symbol — the crystal ball shows it.',
    needsAi: false,
    sure: true,
  },
  {
    id: 'mind_reader',
    title: 'Mind Reader',
    subtitle: '~1,000 movies, stars, songs & more',
    detail: 'Think of a movie, a cricketer, a singer, a food… About 7 questions later, I name it.',
    needsAi: false,
  },
  {
    id: 'surprise_me',
    title: 'Surprise Me',
    subtitle: 'The orb picks the category',
    detail: 'Spin the orb, get a category, and let the AI hunt down your answer.',
    needsAi: false,
  },
  {
    id: 'double_challenge',
    title: 'Double Challenge',
    subtitle: '2 rounds back-to-back',
    detail: 'Two different things, two mind reads, one session.',
    needsAi: false,
  },
  {
    id: 'ultimate_challenge',
    title: 'Ultimate Challenge',
    subtitle: '3 rounds · Mastery trial',
    detail: 'Three rounds across random categories. Can you beat the machine?',
    needsAi: false,
  },
];

export function DashboardHome({
  userStats,
  darkMode,
  muted,
  onToggleTheme,
  onToggleMute,
  onStartMindMode,
  onOpenArena,
  aiReady,
}: DashboardHomeProps) {
  void aiReady;
  const stats = [
    { label: 'Games Played', value: userStats?.gamesPlayed ?? 0 },
    { label: 'Successful Guesses', value: userStats?.successfulGuesses ?? 0 },
    { label: 'Riddles Solved', value: userStats?.riddlesSolved ?? 0 },
    { label: 'Total Points', value: userStats?.totalPoints ?? 0 },
    { label: 'Current Streak', value: userStats?.currentStreak ?? 0 },
  ];

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Section */}
      <section className="pt-6 sm:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between gap-8 rounded-2xl mm-glass p-6 sm:p-10">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  Your Thoughts · Our Intelligence · One Mysterious Game
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onToggleMute}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors whitespace-nowrap shrink-0"
                    aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
                  >
                    {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{muted ? 'Muted' : 'Sound On'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={onToggleTheme}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors whitespace-nowrap shrink-0"
                    aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    <span>{darkMode ? 'Light' : 'Dark'}</span>
                  </button>
                </div>
              </div>

              <h1
                className="font-display font-bold tracking-tight text-slate-900 dark:text-white leading-[1.08]"
                style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                Think of Something.
                <br />
                <span className="mm-gradient-text">I’ll Read Your Mind.</span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                A movie, a cricketer, a song, a number — keep it secret. About seven questions later, it appears on this screen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => onStartMindMode('number_reader')}
                className="inline-flex items-center gap-2 rounded-xl mm-btn-primary px-7 py-4 text-base font-semibold text-white transition-colors whitespace-nowrap shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.35)]"
              >
                <Target className="w-5 h-5" />
                <span>Read my number</span>
              </button>

              <button
                type="button"
                onClick={() => onStartMindMode('mind_reader')}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 px-7 py-4 text-base font-semibold text-white transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-5 h-5" />
                <span>Read my mind</span>
              </button>

              <button
                type="button"
                onClick={() => onStartMindMode('crystal_ball')}
                className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-500/50 hover:bg-fuchsia-500/10 px-7 py-4 text-base font-semibold text-fuchsia-700 dark:text-fuchsia-300 transition-colors whitespace-nowrap shrink-0"
              >
                <Gem className="w-5 h-5" />
                <span>Crystal Ball</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex">
            <div className="relative w-full rounded-2xl mm-glass overflow-hidden flex flex-col items-center justify-center gap-8 p-8 sm:p-10">
              <ThinkingOrb state="idle" size="lg" confidencePct={70} />
              <div className="grid grid-cols-3 gap-3 w-full text-center">
                {[
                  { k: '~1,000', v: 'things it knows' },
                  { k: '~7', v: 'questions to read you' },
                  { k: '0', v: 'internet needed' },
                ].map((stat) => (
                  <div key={stat.v} className="rounded-xl bg-white/50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 px-2 py-3">
                    <p className="font-display text-2xl sm:text-3xl font-bold mm-gradient-text tabular-nums">{stat.k}</p>
                    <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{stat.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Dashboard Statistics Strip */}
      <section aria-label="Player Statistics">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl mm-glass px-5 py-4"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="mt-1.5 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Interactive Game Modes */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Choose Your Challenge Mode
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Six ways to have your mind read. Works offline — the green ones never miss.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAME_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              disabled={mode.needsAi && aiReady === false}
              onClick={() => onStartMindMode(mode.id)}
              className={`group text-left flex flex-col justify-between rounded-xl border mm-glass p-5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                mode.sure
                  ? 'border-emerald-500/40 hover:border-emerald-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 dark:hover:border-indigo-500/60'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
                  {mode.id === 'surprise_me' ? (
                    <Shuffle className="w-5 h-5" />
                  ) : mode.id === 'crystal_ball' ? (
                    <Gem className="w-5 h-5" />
                  ) : mode.id === 'number_reader' ? (
                    <Target className="w-5 h-5" />
                  ) : mode.id === 'ultimate_challenge' ? (
                    <Zap className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                  <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {mode.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{mode.subtitle}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{mode.detail}</p>
              </div>
              <span
                className={`mt-4 inline-block text-xs font-semibold ${
                  mode.sure ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {mode.needsAi && aiReady === false ? 'AI offline' : mode.sure ? 'Play — 100% accurate' : 'Play'}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* All 14 Prediction Categories */}
      <section className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            14 Things I Can Read
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Select any subject below — every category uses a tailored adaptive questioning strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {PREDICTION_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="flex flex-col justify-between rounded-xl mm-glass p-5"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CategoryIcon category={cat.id} className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {cat.shortDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  onStartMindMode(cat.id === 'number' ? 'number_reader' : 'mind_reader', cat.id)
                }
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 disabled:opacity-40 disabled:pointer-events-none px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors whitespace-nowrap"
              >
                <span>Start Game</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Brain Arena Section */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              The Brain Arena
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Timed riddles and verified challenges across five intellectual domains.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenArena('science', 'Medium')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-auto"
          >
            Enter Brain Arena
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {RIDDLE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onOpenArena(cat.id, 'Medium')}
              className="group text-left flex flex-col justify-between rounded-xl mm-glass hover:border-violet-500/60 p-5 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <RiddleCategoryIcon category={cat.id} className="w-5 h-5" />
                </div>
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
                <span>Solve Riddles</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
