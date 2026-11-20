import { neon } from '@neondatabase/serverless';
import { Redis } from '@upstash/redis';
import fs from 'fs';
import path from 'path';
import {
  BADGE_DEFINITIONS,
  LeaderboardEntry,
  PredictionCategoryId,
  RiddleCategoryId,
  UserStats,
} from '../src/types.ts';

/**
 * Player profiles, leaderboard and learned corrections.
 *
 * Interchangeable backends, picked automatically from the environment:
 *  - Postgres (Neon) — DATABASE_URL / POSTGRES_URL. Persistent and shared by every serverless
 *    instance; scores are updated with atomic upserts, so simultaneous players never collide.
 *  - Upstash Redis — UPSTASH_REDIS_REST_URL/TOKEN (or KV_REST_API_URL/TOKEN).
 *  - A JSON file (data/mindmystery-db.json) — for the local booth laptop.
 */

export interface LearnedCorrection {
  id: string;
  category: PredictionCategoryId;
  qaSummary: string;
  predictedGuess: string;
  actualAnswer: string;
  failureAnalysis: string;
  createdAt: string;
}

type Board = 'alltime' | 'daily' | 'weekly';

export interface StorageBackend {
  readonly name: 'postgres' | 'redis' | 'file';
  getUser(id: string): Promise<UserStats | null>;
  getUsers(ids: string[]): Promise<Array<UserStats | null>>;
  putUser(user: UserStats): Promise<void>;
  /** Adds points to the daily and weekly boards and sets the all-time score. */
  addScore(userId: string, delta: number, allTime: number): Promise<void>;
  top(board: Board, n: number): Promise<Array<{ id: string; score: number }>>;
  scores(userIds: string[]): Promise<Array<{ daily: number; weekly: number; alltime: number }>>;
  pushCorrection(c: LearnedCorrection): Promise<void>;
  listCorrections(): Promise<LearnedCorrection[]>;
}

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function weekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/* ------------------------------- Redis ------------------------------- */

class RedisBackend implements StorageBackend {
  readonly name = 'redis' as const;
  constructor(private redis: Redis) {}

  private userKey = (id: string) => `mm:user:${id}`;
  private boardKey(board: Board): string {
    if (board === 'daily') return `mm:lb:day:${dayKey()}`;
    if (board === 'weekly') return `mm:lb:week:${weekKey()}`;
    return 'mm:lb:alltime';
  }

  async getUser(id: string) {
    return (await this.redis.get<UserStats>(this.userKey(id))) ?? null;
  }
  async getUsers(ids: string[]) {
    if (ids.length === 0) return [];
    const rows = await this.redis.mget<Array<UserStats | null>>(...ids.map(this.userKey));
    return rows.map((r) => r ?? null);
  }
  async putUser(user: UserStats) {
    await this.redis.set(this.userKey(user.userId), user);
  }
  async addScore(userId: string, delta: number, allTime: number) {
    const p = this.redis.pipeline();
    const day = this.boardKey('daily');
    const week = this.boardKey('weekly');
    p.zincrby(day, delta, userId);
    p.expire(day, 60 * 60 * 24 * 3);
    p.zincrby(week, delta, userId);
    p.expire(week, 60 * 60 * 24 * 15);
    p.zadd('mm:lb:alltime', { score: allTime, member: userId });
    await p.exec();
  }
  async top(board: Board, n: number) {
    const raw = await this.redis.zrange<Array<string | number>>(this.boardKey(board), 0, n - 1, {
      rev: true,
      withScores: true,
    });
    const out: Array<{ id: string; score: number }> = [];
    for (let i = 0; i + 1 < raw.length; i += 2) out.push({ id: String(raw[i]), score: Number(raw[i + 1]) });
    return out;
  }
  async scores(userIds: string[]) {
    if (userIds.length === 0) return [];
    const p = this.redis.pipeline();
    for (const id of userIds) {
      p.zscore(this.boardKey('daily'), id);
      p.zscore(this.boardKey('weekly'), id);
      p.zscore(this.boardKey('alltime'), id);
    }
    const res = (await p.exec()) as Array<number | string | null>;
    return userIds.map((_, i) => ({
      daily: Number(res[i * 3] ?? 0),
      weekly: Number(res[i * 3 + 1] ?? 0),
      alltime: Number(res[i * 3 + 2] ?? 0),
    }));
  }
  async pushCorrection(c: LearnedCorrection) {
    const p = this.redis.pipeline();
    p.lpush('mm:corrections', c);
    p.ltrim('mm:corrections', 0, 99);
    await p.exec();
  }
  async listCorrections() {
    return (await this.redis.lrange<LearnedCorrection>('mm:corrections', 0, 99)) ?? [];
  }
}

/* ------------------------------ Postgres ----------------------------- */

/** Runs one parameterised SQL statement and returns its rows (Neon over HTTPS in production). */
export type SqlQuery = (text: string, params?: unknown[]) => Promise<Array<Record<string, unknown>>>;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS mm_users (
     id text PRIMARY KEY,
     data jsonb NOT NULL,
     updated_at timestamptz NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS mm_scores (
     board text NOT NULL,
     user_id text NOT NULL,
     score double precision NOT NULL DEFAULT 0,
     updated_at timestamptz NOT NULL DEFAULT now(),
     PRIMARY KEY (board, user_id)
   )`,
  `CREATE INDEX IF NOT EXISTS mm_scores_board_score ON mm_scores (board, score DESC)`,
  `CREATE TABLE IF NOT EXISTS mm_corrections (
     id text PRIMARY KEY,
     category text NOT NULL,
     data jsonb NOT NULL,
     created_at timestamptz NOT NULL DEFAULT now()
   )`,
];

export class PostgresBackend implements StorageBackend {
  readonly name = 'postgres' as const;
  private ready: Promise<void> | null = null;
  constructor(private q: SqlQuery) {}

  /** Creates the tables once per instance (idempotent). */
  private init(): Promise<void> {
    this.ready ??= (async () => {
      for (const stmt of SCHEMA) await this.q(stmt);
    })().catch((err) => {
      this.ready = null; // retry on the next request
      throw err;
    });
    return this.ready;
  }
  private boardKey(board: Board): string {
    if (board === 'daily') return `day:${dayKey()}`;
    if (board === 'weekly') return `week:${weekKey()}`;
    return 'alltime';
  }
  private static parse<T>(v: unknown): T {
    return (typeof v === 'string' ? JSON.parse(v) : v) as T;
  }

  async getUser(id: string) {
    await this.init();
    const rows = await this.q('SELECT data FROM mm_users WHERE id = $1', [id]);
    return rows[0] ? PostgresBackend.parse<UserStats>(rows[0].data) : null;
  }
  async getUsers(ids: string[]) {
    if (ids.length === 0) return [];
    await this.init();
    const rows = await this.q('SELECT id, data FROM mm_users WHERE id = ANY($1::text[])', [ids]);
    const byId = new Map(rows.map((r) => [String(r.id), PostgresBackend.parse<UserStats>(r.data)]));
    return ids.map((id) => byId.get(id) ?? null);
  }
  async putUser(user: UserStats) {
    await this.init();
    await this.q(
      `INSERT INTO mm_users (id, data, updated_at) VALUES ($1, $2::jsonb, now())
       ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
      [user.userId, JSON.stringify(user)]
    );
  }
  async addScore(userId: string, delta: number, allTime: number) {
    await this.init();
    // Daily/weekly add atomically (no lost updates); all-time is the player's authoritative total.
    await this.q(
      `INSERT INTO mm_scores (board, user_id, score, updated_at)
       VALUES ($1, $3, $4, now()), ($2, $3, $4, now())
       ON CONFLICT (board, user_id) DO UPDATE SET score = mm_scores.score + EXCLUDED.score, updated_at = now()`,
      [this.boardKey('daily'), this.boardKey('weekly'), userId, delta]
    );
    await this.q(
      `INSERT INTO mm_scores (board, user_id, score, updated_at) VALUES ('alltime', $1, $2, now())
       ON CONFLICT (board, user_id) DO UPDATE SET score = EXCLUDED.score, updated_at = now()`,
      [userId, allTime]
    );
  }
  async top(board: Board, n: number) {
    await this.init();
    const rows = await this.q(
      'SELECT user_id, score FROM mm_scores WHERE board = $1 ORDER BY score DESC, updated_at ASC LIMIT $2',
      [this.boardKey(board), n]
    );
    return rows.map((r) => ({ id: String(r.user_id), score: Number(r.score) }));
  }
  async scores(userIds: string[]) {
    if (userIds.length === 0) return [];
    await this.init();
    const boards = [this.boardKey('daily'), this.boardKey('weekly'), 'alltime'];
    const rows = await this.q(
      'SELECT board, user_id, score FROM mm_scores WHERE board = ANY($1::text[]) AND user_id = ANY($2::text[])',
      [boards, userIds]
    );
    const get = (b: string, id: string) => Number(rows.find((r) => r.board === b && r.user_id === id)?.score ?? 0);
    return userIds.map((id) => ({ daily: get(boards[0], id), weekly: get(boards[1], id), alltime: get('alltime', id) }));
  }
  async pushCorrection(c: LearnedCorrection) {
    await this.init();
    await this.q('INSERT INTO mm_corrections (id, category, data) VALUES ($1, $2, $3::jsonb) ON CONFLICT (id) DO NOTHING', [
      c.id,
      c.category,
      JSON.stringify(c),
    ]);
  }
  async listCorrections() {
    await this.init();
    const rows = await this.q('SELECT data FROM mm_corrections ORDER BY created_at DESC LIMIT 100');
    return rows.map((r) => PostgresBackend.parse<LearnedCorrection>(r.data));
  }
}

/* ------------------------------- File -------------------------------- */

interface FileDb {
  users: Record<string, UserStats>;
  boards: { alltime: Record<string, number>; daily: Record<string, Record<string, number>>; weekly: Record<string, Record<string, number>> };
  learnedCorrections: LearnedCorrection[];
}

class FileBackend implements StorageBackend {
  readonly name = 'file' as const;
  private db: FileDb | null = null;
  private readonly dir: string;
  private readonly file: string;

  constructor() {
    // Serverless hosts only allow writes to /tmp (temporary) — Redis is the right choice there.
    this.dir = process.env.MINDMYSTERY_DATA_DIR
      ? path.resolve(process.env.MINDMYSTERY_DATA_DIR)
      : process.env.VERCEL
        ? '/tmp/mindmystery-data'
        : path.resolve(process.cwd(), 'data');
    this.file = path.join(this.dir, 'mindmystery-db.json');
  }

  private load(): FileDb {
    if (this.db) return this.db;
    const empty: FileDb = { users: {}, boards: { alltime: {}, daily: {}, weekly: {} }, learnedCorrections: [] };
    try {
      const parsed = JSON.parse(fs.readFileSync(this.file, 'utf-8'));
      // Older files (before the storage rewrite) have no `boards` — start the boards fresh.
      this.db = parsed && parsed.boards ? parsed : { ...empty, users: parsed?.users ?? {} };
    } catch {
      this.db = empty;
    }
    return this.db!;
  }
  private save() {
    try {
      fs.mkdirSync(this.dir, { recursive: true });
      const tmp = `${this.file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tmp, this.file);
    } catch (err) {
      console.warn('[MindMystery] Could not persist data:', err instanceof Error ? err.message : err);
    }
  }
  private board(board: Board): Record<string, number> {
    const db = this.load();
    if (board === 'alltime') return db.boards.alltime;
    const key = board === 'daily' ? dayKey() : weekKey();
    const group = board === 'daily' ? db.boards.daily : db.boards.weekly;
    // Keep only the current period so the file never grows without bound.
    for (const k of Object.keys(group)) if (k !== key) delete group[k];
    return (group[key] ??= {});
  }

  async getUser(id: string) {
    return this.load().users[id] ?? null;
  }
  async getUsers(ids: string[]) {
    const db = this.load();
    return ids.map((id) => db.users[id] ?? null);
  }
  async putUser(user: UserStats) {
    this.load().users[user.userId] = user;
    this.save();
  }
  async addScore(userId: string, delta: number, allTime: number) {
    const daily = this.board('daily');
    const weekly = this.board('weekly');
    daily[userId] = (daily[userId] ?? 0) + delta;
    weekly[userId] = (weekly[userId] ?? 0) + delta;
    this.board('alltime')[userId] = allTime;
    this.save();
  }
  async top(board: Board, n: number) {
    return Object.entries(this.board(board))
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, n);
  }
  async scores(userIds: string[]) {
    const d = this.board('daily');
    const w = this.board('weekly');
    const a = this.board('alltime');
    return userIds.map((id) => ({ daily: d[id] ?? 0, weekly: w[id] ?? 0, alltime: a[id] ?? 0 }));
  }
  async pushCorrection(c: LearnedCorrection) {
    const db = this.load();
    db.learnedCorrections = [c, ...db.learnedCorrections].slice(0, 100);
    this.save();
  }
  async listCorrections() {
    return this.load().learnedCorrections;
  }
}

/* ------------------------------ Selection ---------------------------- */

function createBackend(): StorageBackend {
  const pgUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (pgUrl && /^postgres(ql)?:\/\//.test(pgUrl)) {
    const sql = neon(pgUrl);
    return new PostgresBackend((text, params) => sql.query(text, params ?? []) as Promise<Array<Record<string, unknown>>>);
  }
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) return new RedisBackend(new Redis({ url, token }));
  return new FileBackend();
}

let backend: StorageBackend = createBackend();

/** Swap the storage backend (used by tests to run the Postgres code against an in-process database). */
export function setStorageBackend(next: StorageBackend): void {
  backend = next;
}

export function storageBackendName(): 'postgres' | 'redis' | 'file' {
  return backend.name;
}

/* ------------------------------ Game logic --------------------------- */

function cleanUserId(userId: string): string {
  return userId.trim().replace(/[^\w-]/g, '').slice(0, 64) || 'default_challenger';
}

function newUser(id: string): UserStats {
  return {
    userId: id,
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
}

/** Returns the player's profile. New visitors get a default profile that is only saved once they score. */
export async function getOrCreateUser(userId: string): Promise<UserStats> {
  const id = cleanUserId(userId);
  return (await backend.getUser(id)) ?? newUser(id);
}

export async function updateUserProfile(
  userId: string,
  updates: { name?: string; avatarAccent?: string }
): Promise<UserStats> {
  const user = await getOrCreateUser(userId);
  if (typeof updates.name === 'string' && updates.name.trim()) {
    user.name = updates.name.trim().slice(0, 32);
  }
  if (typeof updates.avatarAccent === 'string' && /^#[0-9A-Fa-f]{6}$/.test(updates.avatarAccent)) {
    user.avatarAccent = updates.avatarAccent;
  }
  await backend.putUser(user);
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

async function commit(user: UserStats, pointsDelta: number) {
  user.recentActivity = user.recentActivity.slice(0, 20);
  await backend.putUser(user);
  await backend.addScore(user.userId, pointsDelta, user.totalPoints);
}

export async function recordMindReaderResult(params: {
  userId: string;
  category: PredictionCategoryId;
  guess: string;
  confidence: number;
  correct: boolean;
}): Promise<{ user: UserStats; pointsAwarded: number; newBadges: string[] }> {
  const user = await getOrCreateUser(params.userId);
  user.gamesPlayed += 1;
  const stats = (user.categoryStats[params.category] ??= { played: 0, guessed: 0 });
  stats.played += 1;

  let pointsAwarded = 15; // participation
  if (params.correct) {
    user.successfulGuesses += 1;
    user.currentStreak += 1;
    user.bestStreak = Math.max(user.bestStreak, user.currentStreak);
    stats.guessed += 1;
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
  await commit(user, pointsAwarded);
  return { user, pointsAwarded, newBadges };
}

export async function recordRiddleResult(params: {
  userId: string;
  category: RiddleCategoryId;
  subtopic: string;
  correct: boolean;
  pointsAwarded: number;
}): Promise<{ user: UserStats; newBadges: string[] }> {
  const user = await getOrCreateUser(params.userId);
  user.riddlesAttempted += 1;
  if (params.correct) {
    user.riddlesSolved += 1;
    user.currentStreak += 1;
    user.bestStreak = Math.max(user.bestStreak, user.currentStreak);
    if (!user.solvedRiddleCategories.includes(params.category)) user.solvedRiddleCategories.push(params.category);
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
  await commit(user, params.pointsAwarded);
  return { user, newBadges };
}

export async function saveLearnedCorrection(correction: Omit<LearnedCorrection, 'id' | 'createdAt'>): Promise<void> {
  await backend.pushCorrection({
    ...correction,
    id: `corr_${Date.now()}`,
    createdAt: new Date().toISOString(),
  });
}

export async function getLearnedCorrectionsForCategory(category: PredictionCategoryId): Promise<LearnedCorrection[]> {
  const all = await backend.listCorrections();
  return all.filter((c) => c.category === category).slice(0, 12);
}

export async function getLeaderboard(
  timeframe: 'daily' | 'weekly' | 'alltime',
  currentUserId: string
): Promise<LeaderboardEntry[]> {
  const me = cleanUserId(currentUserId);
  const board: Board = timeframe === 'alltime' ? 'alltime' : timeframe;
  const top = (await backend.top(board, 20)).filter((t) => t.score > 0);
  const ids = top.map((t) => t.id);
  if (!ids.includes(me)) ids.push(me);

  const [users, scores] = await Promise.all([backend.getUsers(ids), backend.scores(ids)]);
  const rows: LeaderboardEntry[] = ids.map((id, i) => {
    const u = users[i] ?? newUser(id);
    return {
      userId: id,
      name: u.name,
      avatarAccent: u.avatarAccent,
      dailyPoints: scores[i].daily,
      weeklyPoints: scores[i].weekly,
      allTimePoints: scores[i].alltime,
      correctPredictions: u.successfulGuesses,
      riddlesSolved: u.riddlesSolved,
      currentStreak: u.currentStreak,
      isCurrentUser: id === me,
    };
  });
  const key = timeframe === 'daily' ? 'dailyPoints' : timeframe === 'weekly' ? 'weeklyPoints' : 'allTimePoints';
  return rows
    .filter((r) => r[key] > 0 || r.isCurrentUser)
    .sort((a, b) => b[key] - a[key] || b.allTimePoints - a.allTimePoints)
    .slice(0, 21);
}
