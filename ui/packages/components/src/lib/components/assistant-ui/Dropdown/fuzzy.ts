// Fuzzy search scoring shared by dropdown search boxes. Higher scores are
// better matches; null means no match. Substring hits always outrank
// scattered-letter subsequence hits, so typing "opus" ranks
// "anthropic/claude-opus-4.8" above "anthropic/claude-4.5-sonnet" (which only
// matches o‑p‑u‑s as a subsequence) while keeping the forgiving fuzzy recall.
export function fuzzyScore(query: string, text: string): number | null {
  const needle = query.trim().toLowerCase();
  if (!needle) return 0;
  const haystack = text.toLowerCase();

  const index = haystack.indexOf(needle);
  if (index !== -1) {
    if (haystack === needle) return 4000; // exact
    if (index === 0) return 3000; // prefix
    const atWordBoundary = /[^a-z0-9]/.test(haystack[index - 1]);
    return (atWordBoundary ? 2500 : 2000) - Math.min(index, 400);
  }

  // Subsequence fallback, ranked by how tightly the letters cluster.
  let matched = 0;
  let first = -1;
  let last = -1;
  for (let i = 0; i < haystack.length && matched < needle.length; i++) {
    if (haystack[i] === needle[matched]) {
      if (first === -1) first = i;
      last = i;
      matched++;
    }
  }
  if (matched !== needle.length) return null;
  const spread = last - first + 1 - needle.length;
  return 1000 - Math.min(spread, 900);
}
