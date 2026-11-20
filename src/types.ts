export type PredictionCategoryId =
  | 'movie'
  | 'number'
  | 'song'
  | 'actor'
  | 'sports_person'
  | 'singer'
  | 'dob'
  | 'food'
  | 'place'
  | 'colour'
  | 'animal'
  | 'weather'
  | 'alphabet'
  | 'word';

export type GameMode =
  | 'mind_reader'
  | 'surprise_me'
  | 'number_reader'
  | 'double_challenge'
  | 'ultimate_challenge'
  | 'crystal_ball';

export type RiddleCategoryId =
  | 'politics'
  | 'society'
  | 'technology'
  | 'science'
  | 'general';

export type RiddleDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface CategoryDefinition {
  id: PredictionCategoryId;
  name: string;
  shortDesc: string;
  strategyHint: string;
  samplePrompt: string;
}

export const PREDICTION_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'movie',
    name: 'Favourite Movie',
    shortDesc: 'Bollywood, Hollywood, classics, blockbusters, and cult cinema.',
    strategyHint: 'Narrows by film industry, genre, release era, emotional tone, franchise, and storyline.',
    samplePrompt: 'Think of a memorable film you love watching.',
  },
  {
    id: 'number',
    name: 'Favourite Number',
    shortDesc: 'Mathematical properties, ranges, parity, and lucky digits.',
    strategyHint: 'Uses binary range splitting, parity, divisibility, prime checks, and digit properties.',
    samplePrompt: 'Pick any integer in your mind within a range.',
  },
  {
    id: 'song',
    name: 'Favourite Song',
    shortDesc: 'Tracks across languages, genres, eras, and moods.',
    strategyHint: 'Narrows by language, genre, release decade, tempo, mood, and artist type.',
    samplePrompt: 'Hold a song melody or lyric in your head.',
  },
  {
    id: 'actor',
    name: 'Favourite Actor',
    shortDesc: 'Screen icons from Bollywood, Hollywood, and world cinema.',
    strategyHint: 'Narrows by film industry, generation, signature genre, and career milestones.',
    samplePrompt: 'Picture your favourite screen performer.',
  },
  {
    id: 'sports_person',
    name: 'Favourite Sports Person',
    shortDesc: 'Champions in cricket, football, tennis, athletics, and more.',
    strategyHint: 'Narrows by sport, nationality, active status, role, and championship legacy.',
    samplePrompt: 'Focus on an athlete you admire.',
  },
  {
    id: 'singer',
    name: 'Favourite Singer',
    shortDesc: 'Playback legends, pop icons, vocalists, and indie voices.',
    strategyHint: 'Narrows by language, music industry, vocal timbre, gender, and era.',
    samplePrompt: 'Think of a vocalist whose voice moves you.',
  },
  {
    id: 'dob',
    name: 'Date of Birth',
    shortDesc: 'Month, season, day pattern, and calendar range clues.',
    strategyHint: 'Triangulates season, birth month, half of month, and weekday clues with honest bounds.',
    samplePrompt: 'Keep a specific birthday in mind.',
  },
  {
    id: 'food',
    name: 'Favourite Food',
    shortDesc: 'Global cuisines, street favourites, comfort dishes, and sweets.',
    strategyHint: 'Narrows by cuisine, dietary style, flavour profile, temperature, and meal type.',
    samplePrompt: 'Imagine the dish you never get tired of eating.',
  },
  {
    id: 'place',
    name: 'Favourite Place',
    shortDesc: 'Dream cities, beaches, mountain retreats, and world landmarks.',
    strategyHint: 'Narrows by geography, landscape type, climate, urban vs natural, and travel vibe.',
    samplePrompt: 'Visualize a destination you love or dream of visiting.',
  },
  {
    id: 'colour',
    name: 'Favourite Colour',
    shortDesc: 'Warm hues, cool tones, jewel shades, pastels, and neutrals.',
    strategyHint: 'Narrows by colour temperature, brightness, saturation, nature association, and family.',
    samplePrompt: 'Picture the colour that speaks to your personality.',
  },
  {
    id: 'animal',
    name: 'Favourite Animal',
    shortDesc: 'Pets, apex predators, ocean dwellers, birds, and wildlife.',
    strategyHint: 'Narrows by domestic/wild status, habitat, size, diet, and defining traits.',
    samplePrompt: 'Think of any creature from land, sea, or sky.',
  },
  {
    id: 'weather',
    name: 'Favourite Weather',
    shortDesc: 'Crisp autumn, monsoon rain, golden sun, snowfall, or mist.',
    strategyHint: 'Narrows by temperature, precipitation, sky state, season, and sensory mood.',
    samplePrompt: 'Imagine the sky and weather that lifts your mood.',
  },
  {
    id: 'alphabet',
    name: 'Favourite Letter',
    shortDesc: 'Vowels, consonants, letter geometry, and alphabetical zones.',
    strategyHint: 'Eliminates A–Z via half-splits, vowel checks, stroke symmetry, and frequency.',
    samplePrompt: 'Hold a single letter from A to Z in your mind.',
  },
  {
    id: 'word',
    name: 'Favourite Word',
    shortDesc: 'Meaningful concepts, poetic terms, and everyday favourites.',
    strategyHint: 'Narrows by word length, starting letter zone, part of speech, and emotional theme.',
    samplePrompt: 'Think of a word whose sound or meaning you love.',
  },
];

/** Sub-pools for the offline Oracle engine (picking one narrows the field before the first question). */
export const CATEGORY_INDUSTRIES: Partial<Record<PredictionCategoryId, string[]>> = {
  movie: ['Bollywood', 'Hollywood', 'Tollywood', 'Kollywood', 'Mollywood/Sandalwood', 'Korean', 'Web Series', 'Anime'],
  actor: ['Bollywood', 'Hollywood', 'Tollywood', 'Kollywood', 'Mollywood/Sandalwood', 'Korean', 'Web Series', 'Anime'],
  song: [
    'Bollywood (Hindi)',
    'Hollywood (English)',
    'Tollywood (Telugu)',
    'Kollywood (Tamil)',
    'Mollywood/Sandalwood',
    'Korean (K-Pop)',
    'Web Series OST',
    'Anime OST',
  ],
  singer: [
    'Bollywood (Hindi)',
    'Hollywood (English)',
    'Tollywood (Telugu)',
    'Kollywood (Tamil)',
    'Mollywood/Sandalwood',
    'Korean (K-Pop)',
    'Independent / Global',
    'Anime / J-Pop',
  ],
  sports_person: ['Cricket', 'Football', 'Tennis', 'Basketball', 'Athletics & Olympics', 'Combat & Motorsport'],
  dob: ['Any / Skip Birth Year', '1960–1989', '1990–2004', '2005–2020'],
};

export interface RiddleCategoryDefinition {
  id: RiddleCategoryId;
  name: string;
  topics: string[];
  description: string;
}

export const RIDDLE_CATEGORIES: RiddleCategoryDefinition[] = [
  {
    id: 'politics',
    name: 'Politics & Governance',
    topics: ['Democracy', 'Constitution', 'Elections', 'Political Systems', 'International Relations'],
    description: 'Factual, politically neutral challenges on civic institutions, constitutions, and diplomacy.',
  },
  {
    id: 'society',
    name: 'Society',
    topics: ['Social Awareness', 'Human Behaviour', 'Culture', 'Social Problems', 'Ethical Dilemmas'],
    description: 'Thought-provoking puzzles exploring human psychology, ethics, and cultural shifts.',
  },
  {
    id: 'technology',
    name: 'Technology',
    topics: ['Artificial Intelligence', 'Computers', 'Internet', 'Cybersecurity', 'Digital Innovation'],
    description: 'Challenges spanning algorithms, network security, computing history, and AI.',
  },
  {
    id: 'science',
    name: 'Innovation & Science',
    topics: ['Scientific Discoveries', 'Inventions', 'Space Exploration', 'Future Tech', 'Innovators'],
    description: 'Riddles on breakthroughs in physics, medicine, spaceflight, and engineering.',
  },
  {
    id: 'general',
    name: 'General Knowledge',
    topics: ['History', 'Geography', 'Sports', 'Famous Personalities', 'World Records'],
    description: 'Sharp questions across world geography, landmark history, records, and culture.',
  },
];

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  requirement: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_mind_read',
    name: 'First Mind Read',
    description: 'Achieved your first successful AI prediction.',
    requirement: '1 successful mind read',
  },
  {
    id: 'mind_master',
    name: 'Mind Master',
    description: 'Connected with the engine across five accurate predictions.',
    requirement: '5 successful mind reads',
  },
  {
    id: 'brain_explorer',
    name: 'Brain Explorer',
    description: 'Solved riddles across at least three Brain Arena domains.',
    requirement: '3 distinct riddle categories',
  },
  {
    id: 'riddle_champion',
    name: 'Riddle Champion',
    description: 'Demonstrated mastery by solving ten Brain Arena challenges.',
    requirement: '10 riddles solved',
  },
  {
    id: 'perfect_prediction',
    name: 'Perfect Prediction',
    description: 'Guided the AI to a correct guess with 85%+ confidence.',
    requirement: '85%+ confidence match',
  },
  {
    id: 'ten_games',
    name: '10 Games Completed',
    description: 'Completed ten total Mind Reader or Brain Arena sessions.',
    requirement: '10 completed games',
  },
];

export interface QuestionPayload {
  questionNumber: number;
  maxQuestions: number;
  questionText: string;
  options: string[];
  allowCustomInput: boolean;
  customPlaceholder?: string;
  aiInsight?: string;
  signalStrength: number; // 0-95 honest leading signal strength
  remainingEstimate?: string;
  /** Present for the deterministic Magic Cards rounds (number / alphabet). */
  card?: {
    kind: 'number' | 'alphabet';
    items: string[];
    columns: number;
  };
}

export interface PredictionResult {
  guess: string;
  runnerUp?: string;
  confidence: number; // 15-94, never fake 100%
  questionsAsked: number;
  explanation: string;
  honestyNote?: string;
  visualAccent?: string; // e.g., hex colour for Colour category
  detectedCategory?: PredictionCategoryId;
  /** Subtitle for the guess (e.g. "2009 · Bollywood · Aamir Khan"). */
  subtitle?: string;
  posterUrl?: string | null;
  runnersUp?: string[];
  engine?: 'cards' | 'oracle' | 'ai';
}

export interface MindSessionState {
  sessionId: string;
  mode: GameMode;
  category: PredictionCategoryId | 'mystery';
  resolvedCategory?: PredictionCategoryId;
  roundIndex: number; // 1-based for Double (1..2) or Ultimate (1..3)
  totalRounds: number;
  roundCategories: PredictionCategoryId[];
  roundResults: Array<{
    roundIndex: number;
    category: PredictionCategoryId;
    guess: string;
    confidence: number;
    correct: boolean | null;
  }>;
  numberRange?: { min: number; max: number };
  questionCount: number;
  maxQuestions: number;
  status: 'questioning' | 'ready_to_reveal' | 'revealed' | 'completed';
  currentQuestion: QuestionPayload | null;
  prediction: PredictionResult | null;
  /** How many more "let me try again" retries the AI gets after a wrong guess. */
  attemptsLeft: number;
  rejectedGuesses: string[];
  industry?: string | null;
  engine?: 'cards' | 'oracle' | 'ai';
  /** Encrypted game state; sent back with every request so any server instance can continue. */
  token?: string;
}

export interface HealthStatus {
  ok: boolean;
  oracleCandidates?: number;
  storage?: 'redis' | 'file';
  aiConfigured: boolean;
  aiReachable: boolean | null;
  aiMessage?: string;
  model: string;
}

export interface RiddleQuestion {
  id: string;
  category: RiddleCategoryId;
  difficulty: RiddleDifficulty;
  subtopic: string;
  question: string;
  options: string[];
  hint: string;
  timeLimitSeconds: number;
  basePoints: number;
  token?: string;
}

export interface RiddleEvaluation {
  correct: boolean;
  timedOut: boolean;
  correctIndex: number;
  correctOption: string;
  explanation: string;
  pointsAwarded: number;
  newBadges: string[];
}

export interface UserStats {
  userId: string;
  name: string;
  avatarAccent: string;
  gamesPlayed: number;
  successfulGuesses: number;
  riddlesSolved: number;
  riddlesAttempted: number;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  badges: string[];
  solvedRiddleCategories: RiddleCategoryId[];
  categoryStats: Partial<Record<PredictionCategoryId, { played: number; guessed: number }>>;
  recentActivity: Array<{
    id: string;
    type: 'mind_reader' | 'riddle';
    title: string;
    detail: string;
    points: number;
    success: boolean;
    timestamp: string;
  }>;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatarAccent: string;
  dailyPoints: number;
  weeklyPoints: number;
  allTimePoints: number;
  correctPredictions: number;
  riddlesSolved: number;
  currentStreak: number;
  isCurrentUser?: boolean;
}
