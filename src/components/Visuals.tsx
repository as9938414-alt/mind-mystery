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
