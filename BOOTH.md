# Running MindMystery at a booth

```bash
npm install
npm run booth        # builds, then serves on http://localhost:3000
```

Open the page full-screen in Chrome (macOS: Ctrl+Cmd+F) and leave it on the Home screen.

## What never misses
| Game | How it works |
|---|---|
| **Number Reader** | Binary "magic cards" — 7 cards for 1–100. 100% with honest answers. |
| **Letters** (Mind Reader → Letter) | Same principle, 5 cards for A–Z. |
| **Crystal Ball** | Any 2-digit number minus its digit sum is a multiple of 9; every multiple of 9 gets the same symbol (reshuffled each play). |
| **Mind Reader** (movies, actors, songs, singers, sports, food, places, colours, animals, weather, words, birthdays) | Offline Bayesian "Oracle" over ~1,000 curated entries, ~7 questions. Simulated with honest answers: 99.3% first guess, 99.9% with one retry — *when the answer is in its database*. |

No internet is required for any of the above. The dot in the top bar shows **Offline mode** or **AI boost on**.

## Optional keys (`.env`)
- `GEMINI_API_KEY` — after a wrong Oracle guess, Gemini takes over with the full Q&A history to reach answers outside the database; also generates fresh riddles.
- `TMDB_API_KEY` — movie posters on the reveal.

## Operator tips
- **New Player** (top bar) gives the next visitor a fresh score and leaderboard name.
- Screens idle for 2 minutes return to Home automatically.
- Presenting to a big room? Start with **Number Reader** (instant, can't fail), then **Crystal Ball**, then a volunteer's **Bollywood movie**.
- Leaderboard data lives in `data/mindmystery-db.json`; delete it to reset before the event.

## Live link (Vercel)
**https://mind-mystery.vercel.app** — same app, no install needed (good for phones and a QR code at the booth).

- Deploy again: `vercel deploy --prod` from this folder (build: `npm run vercel-build`, which writes `.vercel/output`).
- Games run on serverless functions. Each response carries the game state as an encrypted token
  (`server/sealedState.ts`), so a game survives requests landing on different instances.
  `SESSION_SECRET` is set in the Vercel project; keep it set.
- Leaderboard: connect **Upstash for Redis** (free) in the Vercel dashboard → project → Storage, then
  redeploy. The app detects it automatically (`/api/health` shows `"storage":"redis"`). Without it,
  Vercel scores are temporary; the local laptop always keeps them in `data/mindmystery-db.json`.
- AI is off by default. To switch on the AI rescue, add `GEMINI_API_KEY` in the project's environment
  variables and redeploy — no code changes needed.
- Brain Arena uses only hand-checked riddles (93), never AI-written ones.
