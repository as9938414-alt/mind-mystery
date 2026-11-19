import {
  GameMode,
  HealthStatus,
  LeaderboardEntry,
  MindSessionState,
  PredictionCategoryId,
  RiddleCategoryId,
  RiddleDifficulty,
  RiddleEvaluation,
  RiddleQuestion,
  UserStats,
} from '../types';

const USER_ID_STORAGE_KEY = 'mindmystery_user_id';

let memoryUserId: string | null = null;

function newUserId() {
  return `usr_${Math.random().toString(36).slice(2, 10)}`;
}

export function getClientUserId(): string {
  if (typeof window === 'undefined') return 'default_challenger';
  try {
    let id = localStorage.getItem(USER_ID_STORAGE_KEY);
    if (!id) {
      id = newUserId();
      localStorage.setItem(USER_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    memoryUserId = memoryUserId ?? newUserId();
    return memoryUserId;
  }
}

/** Booth mode: hand the device to the next visitor with a fresh profile. */
export function startNewPlayer(): string {
  const id = newUserId();
  memoryUserId = id;
  try {
    localStorage.setItem(USER_ID_STORAGE_KEY, id);
  } catch {
    /* storage blocked — memory id is used */
  }
  return id;
}

export async function fetchHealth(): Promise<HealthStatus> {
  return apiRequest<HealthStatus>('/api/health');
}

export async function continueMindAfterMiss(sessionId: string): Promise<MindSessionState> {
  const data = await apiRequest<{ session: MindSessionState }>('/api/mind/continue', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
  return data.session;
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Lost connection to the MindMystery server. Check the Wi-Fi and try again.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

export async function fetchProfile(): Promise<UserStats> {
  const userId = getClientUserId();
  const data = await apiRequest<{ user: UserStats }>(`/api/profile?userId=${encodeURIComponent(userId)}`);
  return data.user;
}

export async function updateProfile(payload: { name?: string; avatarAccent?: string }): Promise<UserStats> {
  const userId = getClientUserId();
  const data = await apiRequest<{ user: UserStats }>('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify({ userId, ...payload }),
  });
  return data.user;
}

export async function fetchLeaderboard(timeframe: 'daily' | 'weekly' | 'alltime'): Promise<LeaderboardEntry[]> {
  const userId = getClientUserId();
  const data = await apiRequest<{ entries: LeaderboardEntry[] }>(
    `/api/leaderboard?timeframe=${timeframe}&userId=${encodeURIComponent(userId)}`
  );
  return data.entries;
}

export async function startMindGame(params: {
  mode: GameMode;
  category?: PredictionCategoryId;
  industry?: string | null;
  numberRange?: { min: number; max: number };
}): Promise<MindSessionState> {
  const userId = getClientUserId();
  const data = await apiRequest<{ session: MindSessionState }>('/api/mind/start', {
    method: 'POST',
    body: JSON.stringify({ userId, ...params }),
  });
  return data.session;
}

export async function answerMindQuestion(params: {
  sessionId: string;
  answer: string;
}): Promise<MindSessionState> {
  const data = await apiRequest<{ session: MindSessionState }>('/api/mind/answer', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data.session;
}

export async function submitMindFeedback(params: {
  sessionId: string;
  correct: boolean;
  actualAnswer?: string;
}): Promise<{
  session: MindSessionState;
  failureAnalysis?: string;
  hasNextRound: boolean;
  user: UserStats;
  pointsAwarded: number;
  newBadges: string[];
}> {
  const userId = getClientUserId();
  return apiRequest('/api/mind/feedback', {
    method: 'POST',
    body: JSON.stringify({ userId, ...params }),
  });
}

export async function nextMindRound(sessionId: string): Promise<MindSessionState> {
  const data = await apiRequest<{ session: MindSessionState }>('/api/mind/next-round', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  });
  return data.session;
}

export async function generateArenaRiddle(params: {
  category: RiddleCategoryId;
  difficulty: RiddleDifficulty;
  excludeQuestions: string[];
}): Promise<RiddleQuestion> {
  const data = await apiRequest<{ riddle: RiddleQuestion }>('/api/riddles/generate', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return data.riddle;
}

export async function submitArenaRiddleAnswer(params: {
  riddleId: string;
  selectedIndex: number | null;
  usedHint: boolean;
  secondsRemaining: number;
  timedOut?: boolean;
}): Promise<{
  evaluation: RiddleEvaluation;
  user: UserStats;
}> {
  const userId = getClientUserId();
  return apiRequest('/api/riddles/answer', {
    method: 'POST',
    body: JSON.stringify({ userId, ...params }),
  });
}
