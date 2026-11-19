import { MotionConfig, motion } from 'motion/react';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AuroraBackdrop } from './components/AuroraBackdrop';
import { BrainArena } from './components/BrainArena';
import { DashboardHome } from './components/DashboardHome';
import { LeaderboardView } from './components/LeaderboardView';
import { MindReaderArena } from './components/MindReaderArena';
import { ActiveTab, Navbar } from './components/Navbar';
import { ProfileView } from './components/ProfileView';
import {
  CATEGORY_INDUSTRIES,
  GameMode,
  HealthStatus,
  PredictionCategoryId,
  RiddleCategoryId,
  RiddleDifficulty,
  UserStats,
} from './types';
import { fetchHealth, fetchProfile, startNewPlayer, updateProfile } from './utils/api';

const IDLE_RETURN_MS = 120_000;
import { soundFx } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [newPlayerOpen, setNewPlayerOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [arenaResetKey, setArenaResetKey] = useState(0);
  const idleTimerRef = useRef<number | null>(null);

  // Mind Reader launch state
  const [mindMode, setMindMode] = useState<GameMode>('mind_reader');
  const [mindCategory, setMindCategory] = useState<PredictionCategoryId>('movie');
  const [mindAutoStartSignal, setMindAutoStartSignal] = useState(0);

  // Brain Arena launch state
  const [arenaCategory, setArenaCategory] = useState<RiddleCategoryId>('technology');
  const [arenaDifficulty, setArenaDifficulty] = useState<RiddleDifficulty>('Medium');
  const [arenaAutoLoadSignal, setArenaAutoLoadSignal] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    soundFx.setMuted(muted);
  }, [muted]);

  useEffect(() => {
    fetchProfile()
      .then((user) => setUserStats(user))
      .catch(() => {});
  }, []);

  // AI engine status (polled so the booth recovers on its own if Wi-Fi drops and comes back)
  useEffect(() => {
    let cancelled = false;
    const poll = () =>
      fetchHealth()
        .then((h) => !cancelled && setHealth(h))
        .catch(() => !cancelled && setHealth({ ok: false, aiConfigured: false, aiReachable: false, model: '' }));
    poll();
    const iv = window.setInterval(poll, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, []);

  const aiReady: boolean | null = health === null ? null : health.aiConfigured && health.aiReachable !== false;

  // Booth mode: if nobody touches the screen for a while, glide back to the home screen for the next visitor.
  const activeTabRef = useRef(activeTab);
  activeTabRef.current = activeTab;
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    idleTimerRef.current = window.setTimeout(() => {
      if (activeTabRef.current !== 'home') {
        setActiveTab('home');
        setArenaResetKey((k) => k + 1);
        window.scrollTo({ top: 0 });
      }
    }, IDLE_RETURN_MS);
  }, []);

  useEffect(() => {
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    events.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  const handleNewPlayer = async (e?: FormEvent) => {
    e?.preventDefault();
    startNewPlayer();
    setNewPlayerOpen(false);
    setArenaResetKey((k) => k + 1);
    setActiveTab('home');
    window.scrollTo({ top: 0 });
    try {
      const name = newPlayerName.trim();
      const user = name ? await updateProfile({ name }) : await fetchProfile();
      setUserStats(user);
    } catch {
      setUserStats(null);
    }
    setNewPlayerName('');
  };
  const handleStartMindMode = (mode: GameMode, category?: PredictionCategoryId) => {
    setMindMode(mode);
    if (category) setMindCategory(category);
    setActiveTab('mind_reader');
    // Every launch from the home screen goes straight into the game — fewer taps at the booth —
    // except categories split by industry, which first open the picker ("Bollywood or Hollywood?").
    const needsIndustryPick = mode === 'mind_reader' && category && CATEGORY_INDUSTRIES[category];
    if (needsIndustryPick) {
      setMindAutoStartSignal(0);
    } else if (category || mode !== 'mind_reader') {
      setMindAutoStartSignal((n) => n + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenArena = (category: RiddleCategoryId, difficulty: RiddleDifficulty) => {
    setArenaCategory(category);
    setArenaDifficulty(difficulty);
    setActiveTab('brain_arena');
    setArenaAutoLoadSignal((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: ActiveTab) => {
    // Plain navigation must never re-trigger a previous auto-start.
    setMindAutoStartSignal(0);
    setArenaAutoLoadSignal(0);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <AuroraBackdrop isDark={darkMode} />
      <div className="relative min-h-screen flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Navbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onQuickStart={() => handleNavigate('mind_reader')}
          onNewPlayer={() => setNewPlayerOpen(true)}
          playerName={userStats?.name}
          aiReady={aiReady}
          aiMessage={health?.aiMessage}
        />

        {newPlayerOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
            onClick={() => setNewPlayerOpen(false)}
          >
            <form
              onSubmit={handleNewPlayer}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl mm-glass p-6 space-y-4"
            >
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">New player</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Starts a fresh score so the next visitor gets their own spot on the leaderboard.
              </p>
              <input
                autoFocus
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                maxLength={32}
                placeholder="Your name (optional)"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setNewPlayerOpen(false)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-semibold text-white">
                  Let’s play
                </button>
              </div>
            </form>
          </div>
        )}

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            key={`${activeTab}-${arenaResetKey}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && (
              <DashboardHome
                userStats={userStats}
                darkMode={darkMode}
                muted={muted}
                onToggleTheme={() => setDarkMode((d) => !d)}
                onToggleMute={() => setMuted((m) => !m)}
                onStartMindMode={handleStartMindMode}
                onOpenArena={handleOpenArena}
                aiReady={aiReady}
              />
            )}

            {activeTab === 'mind_reader' && (
              <MindReaderArena
                initialMode={mindMode}
                initialCategory={mindCategory}
                autoStartSignal={mindAutoStartSignal}
                aiReady={aiReady}
                onUserStatsUpdate={setUserStats}
                onBackHome={() => handleNavigate('home')}
              />
            )}

            {activeTab === 'brain_arena' && (
              <BrainArena
                initialCategory={arenaCategory}
                initialDifficulty={arenaDifficulty}
                autoLoadSignal={arenaAutoLoadSignal}
                onUserStatsUpdate={setUserStats}
                onBackHome={() => handleNavigate('home')}
              />
            )}

            {activeTab === 'leaderboard' && <LeaderboardView userStats={userStats} />}

            {activeTab === 'profile' && (
              <ProfileView
                userStats={userStats}
                darkMode={darkMode}
                muted={muted}
                onToggleTheme={() => setDarkMode((d) => !d)}
                onToggleMute={() => setMuted((m) => !m)}
                onUserStatsUpdate={setUserStats}
              />
            )}
          </motion.div>
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <p>MindMystery — Your Thoughts. Our Intelligence. One Mysterious Game.</p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => handleNavigate('mind_reader')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Mind Reader
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('brain_arena')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Brain Arena
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('leaderboard')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Leaderboard
              </button>
            </div>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
