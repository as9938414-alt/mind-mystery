import {
  Atom,
  BookOpen,
  Calendar,
  CloudRain,
  Compass,
  Cpu,
  Film,
  Globe,
  Hash,
  Landmark,
  Mic,
  Music,
  Palette,
  PawPrint,
  Sparkles,
  Trophy,
  Type as TypeIcon,
  UserCheck,
  Users,
  Utensils,
} from 'lucide-react';
import { PredictionCategoryId, RiddleCategoryId } from '../types';

export function CategoryIcon({
  category,
  className = 'w-5 h-5',
}: {
  category: PredictionCategoryId | 'mystery';
  className?: string;
}) {
  switch (category) {
    case 'movie':
      return <Film className={className} />;
    case 'number':
      return <Hash className={className} />;
    case 'song':
      return <Music className={className} />;
    case 'actor':
      return <UserCheck className={className} />;
    case 'sports_person':
      return <Trophy className={className} />;
    case 'singer':
      return <Mic className={className} />;
    case 'dob':
      return <Calendar className={className} />;
    case 'food':
      return <Utensils className={className} />;
    case 'place':
      return <Compass className={className} />;
    case 'colour':
      return <Palette className={className} />;
    case 'animal':
      return <PawPrint className={className} />;
    case 'weather':
      return <CloudRain className={className} />;
    case 'alphabet':
      return <TypeIcon className={className} />;
    case 'word':
      return <BookOpen className={className} />;
    case 'mystery':
    default:
      return <Sparkles className={className} />;
  }
}

export function RiddleCategoryIcon({
  category,
  className = 'w-5 h-5',
}: {
  category: RiddleCategoryId;
  className?: string;
}) {
  switch (category) {
    case 'politics':
      return <Landmark className={className} />;
    case 'society':
      return <Users className={className} />;
    case 'technology':
      return <Cpu className={className} />;
    case 'science':
      return <Atom className={className} />;
    case 'general':
    default:
      return <Globe className={className} />;
  }
}

export function NeuralOracleVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-[#0C1328] to-[#13112B] ${
        compact ? 'h-48 w-full' : 'h-full min-h-[320px] w-full'
      }`}
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.28) 0%, rgba(59, 130, 246, 0.12) 42%, transparent 72%)',
        }}
      />

      {/* Concentric geometric neural sphere SVG */}
      <svg
        viewBox="0 0 320 320"
        className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 drop-shadow-[0_0_24px_rgba(99,102,241,0.3)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#6366F1" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#312E81" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer rotating orbital ring */}
        <g className="origin-center animate-orbit-slow" style={{ transformOrigin: '160px 160px' }}>
          <circle
            cx="160"
            cy="160"
            r="128"
            fill="none"
            stroke="url(#neuralGrad)"
            strokeWidth="1"
            strokeDasharray="6 8"
            opacity="0.45"
          />
          <circle cx="160" cy="32" r="4" fill="#60A5FA" />
          <circle cx="288" cy="160" r="3.5" fill="#A78BFA" />
          <circle cx="160" cy="288" r="4" fill="#818CF8" />
          <circle cx="32" cy="160" r="3.5" fill="#38BDF8" />
        </g>

        {/* Inner counter-rotating synaptic polygon */}
        <g className="origin-center animate-orbit-reverse" style={{ transformOrigin: '160px 160px' }}>
          <circle
            cx="160"
            cy="160"
            r="96"
            fill="none"
            stroke="#6366F1"
            strokeWidth="1.25"
            strokeDasharray="24 10 4 10"
            opacity="0.65"
          />
          <polygon
            points="160,72 236,116 236,204 160,248 84,204 84,116"
            fill="none"
            stroke="url(#neuralGrad)"
            strokeWidth="1.25"
            opacity="0.55"
          />
        </g>

        {/* Static lattice lines */}
        <g stroke="#818CF8" strokeWidth="1" opacity="0.35">
          <line x1="160" y1="72" x2="160" y2="248" />
          <line x1="84" y1="116" x2="236" y2="204" />
          <line x1="236" y1="116" x2="84" y2="204" />
        </g>

        {/* Core Sphere */}
        <circle cx="160" cy="160" r="56" fill="url(#coreGlow)" />
        <circle
          cx="160"
          cy="160"
          r="38"
          fill="#0F172A"
          stroke="url(#neuralGrad)"
          strokeWidth="2"
        />

        {/* Brainwave trace inside core */}
        <path
          d="M132 160 L144 160 L150 144 L158 176 L166 138 L173 168 L178 160 L188 160"
          fill="none"
          stroke="#93C5FD"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function PredictionRevealArtwork({
  category,
  guess,
  visualAccent,
}: {
  category: PredictionCategoryId;
  guess: string;
  visualAccent?: string;
}) {
  const accent = visualAccent && /^#[0-9A-Fa-f]{6}$/.test(visualAccent) ? visualAccent : '#6366F1';

  if (category === 'colour') {
    return (
      <div
        className="w-28 h-28 rounded-2xl border border-white/20 shadow-lg flex items-end justify-center p-2.5 mx-auto"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent}, #0f172a 140%)`,
        }}
      >
        <span className="text-[11px] font-mono text-white/90 bg-black/35 px-2 py-0.5 rounded">
          {accent.toUpperCase()}
        </span>
      </div>
    );
  }

  if (category === 'number' || category === 'alphabet') {
    return (
      <div className="w-28 h-28 rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-indigo-600/25 via-violet-600/20 to-slate-900 flex items-center justify-center mx-auto shadow-inner">
        <span className="font-display text-4xl font-bold tracking-tight text-indigo-300 tabular-nums">
          {guess.slice(0, 5)}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-28 h-28 rounded-2xl border border-slate-700/70 bg-gradient-to-br from-indigo-500/20 via-blue-500/15 to-slate-900 flex flex-col items-center justify-center gap-2 mx-auto"
      style={{ boxShadow: `0 0 32px ${accent}25` }}
    >
      <CategoryIcon category={category} className="w-10 h-10 text-indigo-400" />
    </div>
  );
}
