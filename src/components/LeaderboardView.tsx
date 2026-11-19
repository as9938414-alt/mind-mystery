import { Award, CheckCircle2, Lock, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BADGE_DEFINITIONS, LeaderboardEntry, UserStats } from '../types';
import { fetchLeaderboard } from '../utils/api';

interface LeaderboardViewProps {
  userStats: UserStats | null;
}

type Timeframe = 'daily' | 'weekly' | 'alltime';

export function LeaderboardView({ userStats }: LeaderboardViewProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (tf: Timeframe) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard(tf);
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(timeframe);
  }, [timeframe, userStats?.totalPoints]);

  const unlockedSet = new Set(userStats?.badges ?? []);

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
            Leaderboard & Rewards
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Compete across Daily, Weekly, and All-Time rankings by solving riddles and reading minds.
          </p>
        </div>

        {/* Segmented Timeframe Control */}
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 gap-1 self-start sm:self-auto">
          {(
            [
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'alltime', label: 'All-Time' },
            ] as const
          ).map((tab) => {
            const active = timeframe === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTimeframe(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl mm-glass overflow-hidden">
        {error ? (
          <div className="p-6 flex items-center justify-between gap-4 text-sm text-rose-600 dark:text-rose-400">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => loadData(timeframe)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 text-white px-3 py-1.5 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-10 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-5">Rank</th>
                  <th className="py-3.5 px-5">Challenger</th>
                  <th className="py-3.5 px-5 text-right">Points</th>
                  <th className="py-3.5 px-5 text-right">Mind Reads</th>
                  <th className="py-3.5 px-5 text-right">Riddles Solved</th>
                  <th className="py-3.5 px-5 text-right">Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
                {entries.map((entry, idx) => {
                  const displayPoints =
                    timeframe === 'daily'
                      ? entry.dailyPoints
                      : timeframe === 'weekly'
                        ? entry.weeklyPoints
                        : entry.allTimePoints;
                  return (
                    <tr
                      key={entry.userId}
                      className={`transition-colors ${
                        entry.isCurrentUser
                          ? 'bg-indigo-50/70 dark:bg-indigo-500/10'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: entry.avatarAccent }}
                          >
                            {entry.name.slice(0, 1).toUpperCase()}
                          </span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {entry.name}
                            {entry.isCurrentUser ? ' (You)' : ''}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {displayPoints.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {entry.correctPredictions}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {entry.riddlesSolved}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {entry.currentStreak}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Achievement Badges */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Achievement Badges
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Unlock milestones through accurate predictions and Brain Arena streaks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGE_DEFINITIONS.map((badge) => {
            const unlocked = unlockedSet.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-xl border p-5 flex items-start gap-4 ${
                  unlocked
                    ? 'border-indigo-500/50 bg-indigo-50/40 dark:bg-indigo-500/10'
                    : 'border-slate-200 dark:border-slate-800 mm-glass opacity-80'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    unlocked
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {unlocked ? <Award className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                      {badge.name}
                    </h3>
                    {unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{badge.description}</p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500">
                    {unlocked ? 'Unlocked' : `Requirement: ${badge.requirement}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
