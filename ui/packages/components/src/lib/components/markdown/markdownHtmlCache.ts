const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;

interface CacheEntry {
  html: string;
  bytes: number;
}

const cache = new Map<string, CacheEntry>();
let totalBytes = 0;

function cacheKey(variant: string, source: string): string {
  return `${variant}\u0000${source}`;
}

function estimatedBytes(key: string, html: string): number {
  // JavaScriptCore stores strings in one or two bytes per code unit. Counting
  // two gives the cache a conservative, deterministic upper bound.
  return (key.length + html.length) * 2;
}

export function getCachedMarkdownHtml(variant: string, source: string): string | undefined {
  const key = cacheKey(variant, source);
  const entry = cache.get(key);
  if (!entry) return undefined;

  cache.delete(key);
  cache.set(key, entry);
  return entry.html;
}

export function setCachedMarkdownHtml(
  variant: string,
  source: string,
  html: string,
  maxBytes = DEFAULT_MAX_BYTES,
): void {
  const key = cacheKey(variant, source);
  const bytes = estimatedBytes(key, html);
  const existing = cache.get(key);
  if (existing) {
    totalBytes -= existing.bytes;
    cache.delete(key);
  }

  if (bytes > maxBytes) return;

  cache.set(key, { html, bytes });
  totalBytes += bytes;
  while (totalBytes > maxBytes) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey === undefined) break;
    const oldest = cache.get(oldestKey);
    cache.delete(oldestKey);
    totalBytes -= oldest?.bytes ?? 0;
  }
}
