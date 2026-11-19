/**
 * Optional movie/series poster for the reveal (TMDB). Only runs when TMDB_API_KEY is set;
 * results are cached in memory. A 2.5 s timeout means a slow network never delays the reveal much.
 */
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const cache = new Map<string, string | null>();

export async function findPoster(params: {
  name: string;
  industry: string | null;
  releaseYear: number | null;
}): Promise<string | null> {
  const apiKey = process.env.TMDB_API_KEY?.trim();
  if (!apiKey) return null;
  const key = `${params.name}|${params.releaseYear ?? ''}`;
  if (cache.has(key)) return cache.get(key)!;

  const isSeries = params.industry === 'Web Series' || params.industry === 'Anime';
  const endpoint = isSeries ? 'tv' : 'movie';
  const yearParam = params.releaseYear
    ? `&${isSeries ? 'first_air_date_year' : 'year'}=${params.releaseYear}`
    : '';
  const url = `https://api.themoviedb.org/3/search/${endpoint}?api_key=${encodeURIComponent(apiKey)}&query=${encodeURIComponent(
    params.name
  )}${yearParam}&include_adult=false`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: Array<{ poster_path?: string }> };
    const path = data.results?.find((r) => r.poster_path)?.poster_path;
    const full = path ? `${TMDB_IMAGE_BASE}${path}` : null;
    cache.set(key, full);
    return full;
  } catch {
    return null;
  }
}
