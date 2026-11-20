import crypto from 'crypto';

/**
 * Encrypted, tamper-proof state tokens (AES-256-GCM).
 *
 * On serverless hosts (Vercel) consecutive requests can land on different instances, so
 * in-memory game sessions may vanish between two answers. Every response therefore carries
 * the full game state sealed in a token; any instance can reopen it. Encryption (not just
 * signing) keeps players from reading the answer out of a riddle token.
 *
 * Set SESSION_SECRET in production so all instances share the key. Without it, a random
 * per-process key is used — fine for a single local server.
 */
let cachedKey: Buffer | null = null;

function key(): Buffer {
  if (cachedKey) return cachedKey;
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret && process.env.VERCEL) {
    console.warn('[MindMystery] SESSION_SECRET is not set — sessions will not survive instance changes.');
  }
  cachedKey = secret
    ? crypto.createHash('sha256').update(secret).digest()
    : crypto.randomBytes(32);
  return cachedKey;
}

export function seal(value: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
}

/** Returns null for a missing, corrupted, forged or foreign-key token. */
export function open<T>(token: unknown): T | null {
  if (typeof token !== 'string' || token.length < 40 || token.length > 400_000) return null;
  try {
    const raw = Buffer.from(token, 'base64url');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const json = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8');
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
