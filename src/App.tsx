import { MotionConfig, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { BrainArena } from './components/BrainArena';
import { DashboardHome } from './components/DashboardHome';
import { LeaderboardView } from './components/LeaderboardView';
import { MindReaderArena } from './components/MindReaderArena';
import { ActiveTab, Navbar } from './components/Navbar';
import { ProfileView } from './components/ProfileView';
import {
  GameMode,
  PredictionCategoryId,
  RiddleCategoryId,
  RiddleDifficulty,
  UserStats,
} from './types';
import { fetchProfile } from './utils/api';
import { soundFx } from './utils/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

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

  const handleStartMindMode = (mode: GameMode, category?: PredictionCategoryId) => {
    setMindMode(mode);
    if (category) setMindCategory(category);
    setActiveTab('mind_reader');
    // For specific category clicks from dashboard or Surprise Me, auto-start immediately
    if (category || mode === 'surprise_me' || mode === 'double_challenge' || mode === 'ultimate_challenge') {
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
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070B16] dark:text-slate-100 transition-colors duration-200">
        <Navbar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          onQuickStart={() => handleStartMindMode('mind_reader', 'movie')}
        />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6">
          <motion.div
            key={activeTab}
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
              />
            )}

            {activeTab === 'mind_reader' && (
              <MindReaderArena
                initialMode={mindMode}
                initialCategory={mindCategory}
                autoStartSignal={mindAutoStartSignal}
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
