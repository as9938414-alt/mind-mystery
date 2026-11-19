import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export const GEMINI_MODEL = 'gemini-4-hydrogen';

let cachedClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new GeminiServiceError(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.',
      503,
      'API_KEY_MISSING'
    );
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
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

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
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
  const maxAttempts = 3;
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
      return JSON.parse(text) as T;
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

  throw mapGeminiError(lastError);
}
