import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from './app.ts';

/**
 * Vercel serverless entry. Bundled by scripts/build-vercel.mjs into
 * .vercel/output/functions/api.func/index.js. Routes send /api/<path> here as /api?__path=<path>;
 * the original path is restored so the Express routes match exactly as they do locally.
 */
const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const forwarded = url.searchParams.get('__path');
  if (forwarded !== null) {
    url.searchParams.delete('__path');
    const query = url.searchParams.toString();
    req.url = `/api/${forwarded.replace(/^\/+/, '')}${query ? `?${query}` : ''}`;
  }
  return app(req as never, res as never);
}
