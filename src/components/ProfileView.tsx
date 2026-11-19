import { Check, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { BADGE_DEFINITIONS, PREDICTION_CATEGORIES, UserStats } from '../types';
import { updateProfile } from '../utils/api';

interface ProfileViewProps {
  userStats: UserStats | null;
  darkMode: boolean;
  muted: boolean;
  onToggleTheme: () => void;
  onToggleMute: () => void;
  onUserStatsUpdate: (user: UserStats) => void;
}

const ACCENT_CHOICES = ['#6366F1', '#3B82F6', '#8B5CF6', '#0EA5E9', '#10B981', '#F59E0B'];

export function ProfileView({
  userStats,
  darkMode,
  muted,
  onToggleTheme,
  onToggleMute,
  onUserStatsUpdate,
}: ProfileViewProps) {
  const [name, setName] = useState(userStats?.name ?? 'Mind Challenger');
  const [accent, setAccent] = useState(userStats?.avatarAccent ?? '#6366F1');
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (userStats) {
      setName(userStats.name);
      setAccent(userStats.avatarAccent);
    }
  }, [userStats]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSavedNotice(false);
    try {
      const updated = await updateProfile({ name: name.trim(), avatarAccent: accent });
      onUserStatsUpdate(updated);
      setSavedNotice(true);
      window.setTimeout(() => setSavedNotice(false), 2200);
    } finally {
      setSaving(false);
    }
  };

  const accuracyPct =
    userStats && userStats.gamesPlayed > 0
      ? Math.round((userStats.successfulGuesses / userStats.gamesPlayed) * 100)
      : 0;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Challenger Profile
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your identity on the leaderboard, review category stats, and configure preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Identity & Preferences Card */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-6 space-y-5"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-xl font-bold text-white shrink-0"
              style={{ backgroundColor: accent }}
            >
              {(name || 'M').slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {userStats?.name || 'Mind Challenger'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {userStats?.totalPoints.toLocaleString() ?? 0} total pts · Best Streak:{' '}
                {userStats?.bestStreak ?? 0}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Display Name
            </label>
            <input
              id="profile-name"
              type="text"
              maxLength={32}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Avatar Accent</p>
            <div className="flex flex-wrap gap-2">
              {ACCENT_CHOICES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setAccent(color)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-transform ${
                    accent === color ? 'border-slate-900 dark:border-white scale-105' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select accent color ${color}`}
                >
                  {accent === color && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
            >
              {saving ? 'Saving...' : savedNotice ? 'Profile Saved' : 'Save Profile'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{muted ? 'Muted' : 'Audio'}</span>
              </button>
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{darkMode ? 'Light' : 'Dark'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Stats & Recent Activity */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Mind Read Rate</p>
              <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {accuracyPct}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Riddles Solved</p>
              <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {userStats?.riddlesSolved ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Badges Earned</p>
              <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {userStats?.badges.length ?? 0}/{BADGE_DEFINITIONS.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">Current Streak</p>
              <p className="mt-1 font-display text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
                {userStats?.currentStreak ?? 0}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-6 space-y-4">
            <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
              Recent Sessions
            </h3>

            {!userStats || userStats.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No games played yet. Start a Mind Reader round or Brain Arena challenge to see your history here.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {userStats.recentActivity.slice(0, 8).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums shrink-0">
                      +{item.points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {userStats && Object.keys(userStats.categoryStats).length > 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0C1222] p-6 space-y-3">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                Category Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(userStats.categoryStats).map(([catId, stat]) => {
                  const catName =
                    PREDICTION_CATEGORIES.find((c) => c.id === catId)?.name ?? catId;
                  return (
                    <div
                      key={catId}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-3"
                    >
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                        {catName}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {stat?.guessed ?? 0}/{stat?.played ?? 0} guessed
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
