import express, { NextFunction, Request, Response } from 'express';
import { GameMode, PredictionCategoryId, RiddleCategoryId, RiddleDifficulty } from '../src/types.ts';
import { GEMINI_MODEL, GeminiServiceError, checkGeminiHealth, isGeminiConfigured } from './gemini.ts';
import {
  advanceNextRound,
  continueAfterMiss,
  getMindSession,
  recordPredictionFeedback,
  startMindSession,
  submitMindAnswer,
} from './mindEngine.ts';
import { oracleStats } from './oracle/pools.ts';
import { evaluateRiddleAnswer, generateRiddle } from './riddleEngine.ts';
import { getLeaderboard, getOrCreateUser, recordMindReaderResult, updateUserProfile } from './storage.ts';

/**
 * The MindMystery API as a standalone Express app. Used by server.ts (local / booth) and by the
 * Vercel serverless function (server/vercelHandler.ts), so both run exactly the same code.
 */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  // Best-effort guard (per instance) so a replayed request can't score a round twice.
  const scoredRounds = new Set<string>();

  const api = express.Router();

  // Health (booth operator status light)
  api.get('/health', async (req: Request, res: Response) => {
    const health = await checkGeminiHealth(req.query.force === '1');
    res.json({
      ok: true,
      aiConfigured: isGeminiConfigured(),
      aiReachable: health.reachable,
      aiMessage: health.message,
      oracleCandidates: oracleStats().candidates,
      model: GEMINI_MODEL,
    });
  });

  // User Profile
  api.get('/profile', (req: Request, res: Response) => {
    const userId = String(req.query.userId || 'default_challenger');
    const user = getOrCreateUser(userId);
    res.json({ user });
  });

  api.patch('/profile', (req: Request, res: Response) => {
    const { userId = 'default_challenger', name, avatarAccent } = req.body ?? {};
    const user = updateUserProfile(String(userId), { name, avatarAccent });
    res.json({ user });
  });

  // Leaderboard
  api.get('/leaderboard', (req: Request, res: Response) => {
    const timeframeParam = String(req.query.timeframe || 'alltime');
    const timeframe =
      timeframeParam === 'daily' || timeframeParam === 'weekly' ? timeframeParam : 'alltime';
    const userId = String(req.query.userId || 'default_challenger');
    const entries = getLeaderboard(timeframe, userId);
    res.json({ timeframe, entries });
  });

  // Mind Reader Engine
  api.post('/mind/start', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId = 'default_challenger', mode = 'mind_reader', category, industry, numberRange } = req.body ?? {};
      const allowedModes: GameMode[] = ['mind_reader', 'surprise_me', 'number_reader', 'double_challenge', 'ultimate_challenge'];
      if (!allowedModes.includes(mode)) {
        res.status(400).json({ error: 'Unknown game mode.' });
        return;
      }
      const session = await startMindSession({
        userId: String(userId),
        mode: mode as GameMode,
        category: category as PredictionCategoryId | undefined,
        industry: typeof industry === 'string' ? industry : null,
        numberRange,
      });
      res.json({ session });
    } catch (err) {
      next(err);
    }
  });

  api.post('/mind/answer', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, answer, token } = req.body ?? {};
      if (!sessionId || typeof answer !== 'string') {
        res.status(400).json({ error: 'sessionId and answer are required.' });
        return;
      }
      const session = await submitMindAnswer({ sessionId: String(sessionId), answer, token });
      res.json({ session });
    } catch (err) {
      next(err);
    }
  });

  api.post('/mind/feedback', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, userId = 'default_challenger', correct, actualAnswer, token } = req.body ?? {};
      if (!sessionId || typeof correct !== 'boolean') {
        res.status(400).json({ error: 'sessionId and boolean correct are required.' });
        return;
      }

      const internal = getMindSession(String(sessionId), token);
      if (!internal || !internal.prediction) {
        res.status(404).json({ error: 'Prediction session not found or already closed.' });
        return;
      }
      const roundKey = `${internal.sessionId}:${internal.roundIndex}`;
      if (internal.status !== 'ready_to_reveal' || scoredRounds.has(roundKey)) {
        res.status(409).json({ error: 'This round has already been scored.' });
        return;
      }

      const predSnapshot = { ...internal.prediction };
      const resolvedCat = predSnapshot.detectedCategory ?? internal.resolvedCategory;

      const feedback = await recordPredictionFeedback({
        sessionId: String(sessionId),
        correct,
        actualAnswer,
        token,
      });
      scoredRounds.add(roundKey);
      if (scoredRounds.size > 20_000) scoredRounds.clear();

      const statsOutcome = recordMindReaderResult({
        userId: String(userId),
        category: resolvedCat,
        guess: predSnapshot.guess,
        confidence: predSnapshot.confidence,
        correct,
      });

      res.json({
        session: feedback.session,
        failureAnalysis: feedback.failureAnalysis,
        hasNextRound: feedback.hasNextRound,
        user: statsOutcome.user,
        pointsAwarded: statsOutcome.pointsAwarded,
        newBadges: statsOutcome.newBadges,
      });
    } catch (err) {
      next(err);
    }
  });

  api.post('/mind/continue', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, token } = req.body ?? {};
      if (!sessionId) {
        res.status(400).json({ error: 'sessionId is required.' });
        return;
      }
      const session = await continueAfterMiss(String(sessionId), token);
      res.json({ session });
    } catch (err) {
      next(err);
    }
  });

  api.post('/mind/next-round', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, token } = req.body ?? {};
      if (!sessionId) {
        res.status(400).json({ error: 'sessionId is required.' });
        return;
      }
      const session = await advanceNextRound(String(sessionId), token);
      res.json({ session });
    } catch (err) {
      next(err);
    }
  });

  // Brain Arena Riddles
  api.post('/riddles/generate', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category = 'technology', difficulty = 'Medium', excludeQuestions = [] } = req.body ?? {};
      const riddle = await generateRiddle({
        category: category as RiddleCategoryId,
        difficulty: difficulty as RiddleDifficulty,
        excludeQuestions: Array.isArray(excludeQuestions) ? excludeQuestions.map(String) : [],
      });
      res.json({ riddle });
    } catch (err) {
      next(err);
    }
  });

  api.post('/riddles/answer', (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        riddleId,
        userId = 'default_challenger',
        selectedIndex = null,
        usedHint = false,
        secondsRemaining = 0,
        timedOut = false,
        token,
      } = req.body ?? {};

      if (!riddleId) {
        res.status(400).json({ error: 'riddleId is required.' });
        return;
      }

      const result = evaluateRiddleAnswer({
        riddleId: String(riddleId),
        userId: String(userId),
        selectedIndex: typeof selectedIndex === 'number' ? selectedIndex : null,
        usedHint: Boolean(usedHint),
        secondsRemaining: Number(secondsRemaining) || 0,
        timedOut: Boolean(timedOut),
        token,
      });

      res.json({
        evaluation: {
          correct: result.correct,
          timedOut: result.timedOut,
          correctIndex: result.correctIndex,
          correctOption: result.correctOption,
          explanation: result.explanation,
          pointsAwarded: result.pointsAwarded,
          newBadges: result.newBadges,
        },
        user: result.userStats,
      });
    } catch (err) {
      next(err);
    }
  });

  // API Error Handler
  api.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof GeminiServiceError) {
      res.status(err.status).json({ error: err.message, code: err.code });
      return;
    }
    const message = err instanceof Error ? err.message : 'Internal server error.';
    res.status(500).json({ error: message, code: 'SERVER_ERROR' });
  });

  app.use('/api', api);
  return app;
}
