import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export const GEMINI_MODEL = process.env.GEMINI_MODEL?.trim() || 'gemini-4-hydrogen';
const REQUEST_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 25000;

export function isGeminiConfigured(): boolean {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  return Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');
}

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new GeminiServiceError(
      'The AI engine is offline (no GEMINI_API_KEY). The Number and Letter readers and the Crystal Ball still work.',
      503,
      'API_KEY_MISSING'
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: REQUEST_TIMEOUT_MS,
        ...(process.env.GEMINI_BASE_URL ? { baseUrl: process.env.GEMINI_BASE_URL } : {}),
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return cachedClient;
}

export class GeminiServiceError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 500, code = 'GEMINI_ERROR') {
    super(message);
    this.name = 'GeminiServiceError';
    this.status = status;
    this.code = code;
  }
}

function mapGeminiError(err: unknown): GeminiServiceError {
  if (err instanceof GeminiServiceError) return err;
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('api key not valid') || lower.includes('permission_denied') || lower.includes('403')) {
    return new GeminiServiceError(
      'Gemini API authentication failed. Please verify your API key in Settings > Secrets.',
      403,
      'API_KEY_INVALID'
    );
  }
  if (lower.includes('resource_exhausted') || lower.includes('429') || lower.includes('quota')) {
    return new GeminiServiceError(
      'Gemini API rate limit or quota reached. Please wait a moment and retry.',
      429,
      'QUOTA_EXHAUSTED'
    );
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return new GeminiServiceError(
      'Requested Gemini model is currently unavailable. Please retry shortly.',
      404,
      'MODEL_NOT_FOUND'
    );
  }
  return new GeminiServiceError(
    'Unable to reach the AI reasoning engine right now. Please retry.',
    502,
    'UPSTREAM_ERROR'
  );
}

export async function generateStructuredJson<T>(params: {
  systemInstruction: string;
  prompt: string;
  schema: Record<string, unknown>;
  thinkingLevel?: ThinkingLevel;
}): Promise<T> {
  const ai = getGeminiClient();
  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: params.schema as { type: Type },
          thinkingConfig: {
            thinkingLevel: params.thinkingLevel ?? ThinkingLevel.LOW,
          },
        },
      });

      const text = (response.text ?? '').trim();
      if (!text) {
        throw new GeminiServiceError('AI returned an empty structured response.', 502, 'EMPTY_RESPONSE');
      }
      const parsed = JSON.parse(text) as T;
      lastHealth = { reachable: true, message: undefined, checkedAt: Date.now() };
      return parsed;
    } catch (err) {
      lastError = err;
      const mapped = mapGeminiError(err);
      if (mapped.status === 403 || mapped.status === 503 || mapped.status === 404) {
        throw mapped;
      }
      if (attempt < maxAttempts) {
        const delayMs = 350 * Math.pow(2, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  const finalError = mapGeminiError(lastError);
  lastHealth = { reachable: false, message: finalError.message, checkedAt: Date.now() };
  throw finalError;
}

let lastHealth: { reachable: boolean | null; message?: string; checkedAt: number } = {
  reachable: null,
  checkedAt: 0,
};

/** Cheap live check (cached for 60s) so the booth operator can see whether the AI is reachable. */
export async function checkGeminiHealth(force = false): Promise<{ reachable: boolean | null; message?: string }> {
  if (!isGeminiConfigured()) {
    return { reachable: false, message: 'GEMINI_API_KEY is not set.' };
  }
  if (!force && Date.now() - lastHealth.checkedAt < 60_000) {
    return { reachable: lastHealth.reachable, message: lastHealth.message };
  }
  try {
    const ai = getGeminiClient();
    await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: 'Reply with the single word: ok',
      config: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } },
    });
    lastHealth = { reachable: true, checkedAt: Date.now() };
  } catch (err) {
    lastHealth = { reachable: false, message: mapGeminiError(err).message, checkedAt: Date.now() };
  }
  return { reachable: lastHealth.reachable, message: lastHealth.message };
}
