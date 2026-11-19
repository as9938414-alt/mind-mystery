import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GeminiServiceError } from './server/gemini.ts';
import {
  advanceNextRound,
  getMindSession,
  recordPredictionFeedback,
  startMindSession,
  submitMindAnswer,
} from './server/mindEngine.ts';
import { evaluateRiddleAnswer, generateRiddle } from './server/riddleEngine.ts';
import {
  getLeaderboard,
  getOrCreateUser,
  recordMindReaderResult,
  updateUserProfile,
} from './server/storage.ts';
import { GameMode, PredictionCategoryId, RiddleCategoryId, RiddleDifficulty } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function bootstrap() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  const api = express.Router();

  // Health & User Profile
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
      const { userId = 'default_challenger', mode = 'mind_reader', category, numberRange } = req.body ?? {};
      const session = await startMindSession({
        userId: String(userId),
        mode: mode as GameMode,
        category: category as PredictionCategoryId | undefined,
        numberRange,
      });
      res.json({ session });
    } catch (err) {
      next(err);
    }
  });

  api.post('/mind/answer', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, answer } = req.body ?? {};
      if (!sessionId || typeof answer !== 'string') {
        res.status(400).json({ error: 'sessionId and answer are required.' });
        return;
      }
      const session = await submitMindAnswer({ sessionId: String(sessionId), answer });
      res.json({ session });
    } catch (err) {
      next(err);
    }
  });

  api.post('/mind/feedback', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId, userId = 'default_challenger', correct, actualAnswer } = req.body ?? {};
      if (!sessionId || typeof correct !== 'boolean') {
        res.status(400).json({ error: 'sessionId and boolean correct are required.' });
        return;
      }

      const internal = getMindSession(String(sessionId));
      if (!internal || !internal.prediction) {
        res.status(404).json({ error: 'Prediction session not found or already closed.' });
        return;
      }

      const predSnapshot = { ...internal.prediction };
      const resolvedCat = predSnapshot.detectedCategory ?? internal.resolvedCategory;

      const feedback = await recordPredictionFeedback({
        sessionId: String(sessionId),
        correct,
        actualAnswer,
      });

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

  api.post('/mind/next-round', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.body ?? {};
      if (!sessionId) {
        res.status(400).json({ error: 'sessionId is required.' });
        return;
      }
      const session = await advanceNextRound(String(sessionId));
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

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MindMystery server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start MindMystery server:', err);
  process.exit(1);
});
