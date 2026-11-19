import fs from 'fs';
import path from 'path';
import {
  BADGE_DEFINITIONS,
  LeaderboardEntry,
  PredictionCategoryId,
  RiddleCategoryId,
  UserStats,
} from '../src/types.ts';

export interface LearnedCorrection {
  id: string;
  category: PredictionCategoryId;
  qaSummary: string;
  predictedGuess: string;
  actualAnswer: string;
  failureAnalysis: string;
  createdAt: string;
}

interface StoredDb {
  users: Record<string, UserStats>;
  leaderboard: Record<
    string,
    {
      userId: string;
      name: string;
      avatarAccent: string;
      dailyPoints: number;
      weeklyPoints: number;
      allTimePoints: number;
      correctPredictions: number;
      riddlesSolved: number;
      currentStreak: number;
      lastDailyReset: string;
      lastWeeklyReset: string;
    }
  >;
  learnedCorrections: LearnedCorrection[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'mindmystery-db.json');

function getDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

function createInitialDb(): StoredDb {
  const today = getDayKey();
  const week = getWeekKey();

  const seedPlayers = [
    {
      userId: 'challenger_aanya',
      name: 'Aanya Verma',
      avatarAccent: '#6366F1',
      dailyPoints: 210,
      weeklyPoints: 740,
      allTimePoints: 2480,
      correctPredictions: 18,
      riddlesSolved: 31,
      currentStreak: 5,
    },
    {
      userId: 'challenger_marcus',
      name: 'Marcus Chen',
      avatarAccent: '#0EA5E9',
      dailyPoints: 165,
      weeklyPoints: 620,
      allTimePoints: 1990,
      correctPredictions: 14,
      riddlesSolved: 24,
      currentStreak: 3,
    },
    {
      userId: 'challenger_elena',
      name: 'Elena Rostova',
      avatarAccent: '#8B5CF6',
      dailyPoints: 140,
      weeklyPoints: 510,
      allTimePoints: 1640,
      correctPredictions: 12,
      riddlesSolved: 19,
      currentStreak: 4,
    },
    {
      userId: 'challenger_kabir',
      name: 'Kabir Mehta',
      avatarAccent: '#3B82F6',
      dailyPoints: 95,
      weeklyPoints: 390,
      allTimePoints: 1210,
      correctPredictions: 9,
      riddlesSolved: 15,
      currentStreak: 2,
    },
  ];

  const leaderboard: StoredDb['leaderboard'] = {};
  for (const p of seedPlayers) {
    leaderboard[p.userId] = {
      ...p,
      lastDailyReset: today,
      lastWeeklyReset: week,
    };
  }

  return {
    users: {},
    leaderboard,
    learnedCorrections: [],
  };
}

let dbCache: StoredDb | null = null;

function loadDb(): StoredDb {
  if (dbCache) return dbCache;
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    dbCache = createInitialDb();
    saveDb(dbCache);
    return dbCache;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    dbCache = JSON.parse(raw) as StoredDb;
  } catch {
    dbCache = createInitialDb();
    saveDb(dbCache);
  }
  return dbCache;
}

function saveDb(db: StoredDb): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmpPath, DB_PATH);
}

export function getOrCreateUser(userId: string): UserStats {
  const db = loadDb();
  const cleanId = userId.trim().slice(0, 64) || 'default_challenger';
  if (!db.users[cleanId]) {
    const newUser: UserStats = {
      userId: cleanId,
      name: 'Mind Challenger',
      avatarAccent: '#6366F1',
      gamesPlayed: 0,
      successfulGuesses: 0,
      riddlesSolved: 0,
      riddlesAttempted: 0,
      totalPoints: 0,
      currentStreak: 0,
      bestStreak: 0,
      badges: [],
      solvedRiddleCategories: [],
      categoryStats: {},
      recentActivity: [],
    };
    db.users[cleanId] = newUser;
    const today = getDayKey();
    const week = getWeekKey();
    db.leaderboard[cleanId] = {
      userId: cleanId,
      name: newUser.name,
      avatarAccent: newUser.avatarAccent,
      dailyPoints: 0,
      weeklyPoints: 0,
      allTimePoints: 0,
      correctPredictions: 0,
      riddlesSolved: 0,
      currentStreak: 0,
      lastDailyReset: today,
      lastWeeklyReset: week,
    };
    saveDb(db);
  }
  return db.users[cleanId];
}

export function updateUserProfile(
  userId: string,
  updates: { name?: string; avatarAccent?: string }
): UserStats {
  const db = loadDb();
  const user = getOrCreateUser(userId);
  if (typeof updates.name === 'string' && updates.name.trim()) {
    user.name = updates.name.trim().slice(0, 32);
  }
  if (typeof updates.avatarAccent === 'string' && /^#[0-9A-Fa-f]{6}$/.test(updates.avatarAccent)) {
    user.avatarAccent = updates.avatarAccent;
  }
  if (db.leaderboard[user.userId]) {
    db.leaderboard[user.userId].name = user.name;
    db.leaderboard[user.userId].avatarAccent = user.avatarAccent;
  }
  saveDb(db);
  return user;
}

function evaluateBadges(user: UserStats, latestConfidence?: number, latestGuessCorrect?: boolean): string[] {
  const unlockedNow: string[] = [];
  const add = (badgeId: string) => {
    if (!user.badges.includes(badgeId) && BADGE_DEFINITIONS.some((b) => b.id === badgeId)) {
      user.badges.push(badgeId);
      unlockedNow.push(badgeId);
    }
  };

  if (user.successfulGuesses >= 1) add('first_mind_read');
  if (user.successfulGuesses >= 5) add('mind_master');
  if (user.solvedRiddleCategories.length >= 3) add('brain_explorer');
  if (user.riddlesSolved >= 10) add('riddle_champion');
  if (latestGuessCorrect && (latestConfidence ?? 0) >= 85) add('perfect_prediction');
  if (user.gamesPlayed + user.riddlesAttempted >= 10) add('ten_games');

  return unlockedNow;
}

function syncLeaderboardPoints(db: StoredDb, user: UserStats, pointsDelta: number): void {
  const today = getDayKey();
  const week = getWeekKey();
  let row = db.leaderboard[user.userId];
  if (!row) {
    row = {
      userId: user.userId,
      name: user.name,
      avatarAccent: user.avatarAccent,
      dailyPoints: 0,
      weeklyPoints: 0,
      allTimePoints: 0,
      correctPredictions: 0,
      riddlesSolved: 0,
      currentStreak: 0,
      lastDailyReset: today,
      lastWeeklyReset: week,
    };
    db.leaderboard[user.userId] = row;
  }

  if (row.lastDailyReset !== today) {
    row.dailyPoints = 0;
    row.lastDailyReset = today;
  }
  if (row.lastWeeklyReset !== week) {
    row.weeklyPoints = 0;
    row.lastWeeklyReset = week;
  }

  row.name = user.name;
  row.avatarAccent = user.avatarAccent;
  row.dailyPoints += pointsDelta;
  row.weeklyPoints += pointsDelta;
  row.allTimePoints = user.totalPoints;
  row.correctPredictions = user.successfulGuesses;
  row.riddlesSolved = user.riddlesSolved;
  row.currentStreak = user.currentStreak;
}

export function recordMindReaderResult(params: {
  userId: string;
  category: PredictionCategoryId;
  guess: string;
  confidence: number;
  correct: boolean;
}): { user: UserStats; pointsAwarded: number; newBadges: string[] } {
  const db = loadDb();
  const user = getOrCreateUser(params.userId);

  user.gamesPlayed += 1;
  if (!user.categoryStats[params.category]) {
    user.categoryStats[params.category] = { played: 0, guessed: 0 };
  }
  user.categoryStats[params.category]!.played += 1;

  let pointsAwarded = 15; // Participation points
  if (params.correct) {
    user.successfulGuesses += 1;
    user.currentStreak += 1;
    user.bestStreak = Math.max(user.bestStreak, user.currentStreak);
    user.categoryStats[params.category]!.guessed += 1;
    pointsAwarded = 50 + Math.round(params.confidence * 0.25);
  } else {
    user.currentStreak = 0;
  }

  user.totalPoints += pointsAwarded;
  const newBadges = evaluateBadges(user, params.confidence, params.correct);

  user.recentActivity.unshift({
    id: `act_${Date.now()}`,
    type: 'mind_reader',
    title: params.correct ? `Mind Read: ${params.guess}` : `Missed Guess: ${params.guess}`,
    detail: `Category: ${params.category} · Confidence ${params.confidence}%`,
    points: pointsAwarded,
    success: params.correct,
    timestamp: new Date().toISOString(),
  });
  user.recentActivity = user.recentActivity.slice(0, 20);

  syncLeaderboardPoints(db, user, pointsAwarded);
  saveDb(db);

  return { user, pointsAwarded, newBadges };
}

export function recordRiddleResult(params: {
  userId: string;
  category: RiddleCategoryId;
  subtopic: string;
  correct: boolean;
  pointsAwarded: number;
}): { user: UserStats; newBadges: string[] } {
  const db = loadDb();
  const user = getOrCreateUser(params.userId);

  user.riddlesAttempted += 1;
  if (params.correct) {
    user.riddlesSolved += 1;
    user.currentStreak += 1;
    user.bestStreak = Math.max(user.bestStreak, user.currentStreak);
    if (!user.solvedRiddleCategories.includes(params.category)) {
      user.solvedRiddleCategories.push(params.category);
    }
  } else {
    user.currentStreak = 0;
  }

  user.totalPoints += params.pointsAwarded;
  const newBadges = evaluateBadges(user);

  user.recentActivity.unshift({
    id: `act_${Date.now()}`,
    type: 'riddle',
    title: params.correct ? `Solved ${params.subtopic} Challenge` : `Missed ${params.subtopic} Challenge`,
    detail: `Brain Arena · ${params.category}`,
    points: params.pointsAwarded,
    success: params.correct,
    timestamp: new Date().toISOString(),
  });
  user.recentActivity = user.recentActivity.slice(0, 20);

  syncLeaderboardPoints(db, user, params.pointsAwarded);
  saveDb(db);

  return { user, newBadges };
}

export function saveLearnedCorrection(correction: Omit<LearnedCorrection, 'id' | 'createdAt'>): void {
  const db = loadDb();
  db.learnedCorrections.unshift({
    ...correction,
    id: `corr_${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
  db.learnedCorrections = db.learnedCorrections.slice(0, 100);
  saveDb(db);
}

export function getLearnedCorrectionsForCategory(category: PredictionCategoryId): LearnedCorrection[] {
  const db = loadDb();
  return db.learnedCorrections.filter((c) => c.category === category).slice(0, 12);
}

export function getLeaderboard(
  timeframe: 'daily' | 'weekly' | 'alltime',
  currentUserId: string
): LeaderboardEntry[] {
  const db = loadDb();
  getOrCreateUser(currentUserId);
  const today = getDayKey();
  const week = getWeekKey();

  const list: LeaderboardEntry[] = Object.values(db.leaderboard).map((row) => {
    const daily = row.lastDailyReset === today ? row.dailyPoints : 0;
    const weekly = row.lastWeeklyReset === week ? row.weeklyPoints : 0;
    return {
      userId: row.userId,
      name: row.name,
      avatarAccent: row.avatarAccent,
      dailyPoints: daily,
      weeklyPoints: weekly,
      allTimePoints: row.allTimePoints,
      correctPredictions: row.correctPredictions,
      riddlesSolved: row.riddlesSolved,
      currentStreak: row.currentStreak,
      isCurrentUser: row.userId === currentUserId,
    };
  });

  list.sort((a, b) => {
    if (timeframe === 'daily') return b.dailyPoints - a.dailyPoints || b.allTimePoints - a.allTimePoints;
    if (timeframe === 'weekly') return b.weeklyPoints - a.weeklyPoints || b.allTimePoints - a.allTimePoints;
    return b.allTimePoints - a.allTimePoints;
  });

  return list.slice(0, 20);
}
