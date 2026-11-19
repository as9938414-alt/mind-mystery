import { Menu, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

export type ActiveTab = 'home' | 'mind_reader' | 'brain_arena' | 'leaderboard' | 'profile';

interface NavbarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onQuickStart: () => void;
  onNewPlayer: () => void;
  playerName?: string;
  aiReady: boolean | null;
  aiMessage?: string;
}

function AiStatusDot({ aiReady, aiMessage }: { aiReady: boolean | null; aiMessage?: string }) {
  // Every game works offline; the AI only adds extra reach when a guess misses.
  const label = aiReady === null ? 'Connecting…' : aiReady ? 'AI boost on' : 'Offline mode';
  const color = aiReady === null ? 'bg-slate-400' : aiReady ? 'bg-emerald-500' : 'bg-sky-400';
  return (
    <span
      title={aiReady === false && aiMessage ? aiMessage : label}
      className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
    >
      <span className={`w-2 h-2 rounded-full ${color} ${aiReady ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  );
}

const NAV_ITEMS: Array<{ id: ActiveTab; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'mind_reader', label: 'Mind Reader' },
  { id: 'brain_arena', label: 'Brain Arena' },
  { id: 'leaderboard', label: 'Leaderboard' },
  { id: 'profile', label: 'Profile' },
];

export function Navbar({ activeTab, onNavigate, onQuickStart, onNewPlayer, playerName, aiReady, aiMessage }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (tab: ActiveTab) => {
    setMobileOpen(false);
    onNavigate(tab);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-[#070B1A]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 h-14 sm:h-16">
        {/* Zone 1: Single-element brand wordmark */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md"
        >
          Mind<span className="mm-gradient-text">Mystery</span>
        </button>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Primary Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action + mobile drawer trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <AiStatusDot aiReady={aiReady} aiMessage={aiMessage} />
          <button
            type="button"
            onClick={onNewPlayer}
            title={playerName ? `Playing as ${playerName}` : 'Start a fresh player'}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Player
          </button>
          <button
            type="button"
            onClick={onQuickStart}
            className="hidden sm:inline-flex items-center justify-center rounded-lg mm-btn-primary px-4 py-2 text-xs font-semibold text-white transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            Start Reading
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1121] px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onNewPlayer();
              }}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              New Player
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onQuickStart();
              }}
              className="w-full rounded-lg mm-btn-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Start Reading
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
