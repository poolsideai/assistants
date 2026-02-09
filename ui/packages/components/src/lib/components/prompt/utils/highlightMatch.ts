export function findMatchIndices(text: string, term: string) {
  if (!text) return [];
  if (!term) return [];

  const termChars = term.toLowerCase().split("");
  const matchedIndices: number[] = [];
  let textIndex = 0;
  let termIndex = 0;

  while (textIndex < text.length && termIndex < termChars.length) {
    const textChar = text[textIndex].toLowerCase();
    if (textChar === termChars[termIndex]) {
      matchedIndices.push(textIndex);
      termIndex++;
    }
    textIndex++;
  }

  return matchedIndices;
}

/**
 * A run of characters that is either matched (and so highlighted) or not.
 *
 * Segments are deliberately *not* an HTML string: item titles and subtitles
 * carry repository-controlled data (filenames, directories, workspace paths),
 * so they must reach the DOM as text nodes rather than through `{@html}`.
 */
export interface HighlightSegment {
  text: string;
  matched: boolean;
}

const HIGHLIGHT_CACHE_SIZE = 200;
const highlightCache = new Map<string, HighlightSegment[]>();

function getCacheKey(value: string, indices: readonly number[]): string {
  return `${value}\0${indices.join(",")}`;
}

export function highlightSegments(
  value: string,
  indices: readonly number[],
): readonly HighlightSegment[] {
  if (!value) return [];
  if (indices.length === 0) return [{ text: value, matched: false }];

  const cacheKey = getCacheKey(value, indices);
  const cached = highlightCache.get(cacheKey);
  if (cached !== undefined) {
    highlightCache.delete(cacheKey);
    highlightCache.set(cacheKey, cached);
    return cached;
  }

  const _indices = new Set(indices);

  const segments: HighlightSegment[] = [];
  for (let i = 0; i < value.length; ++i) {
    const matched = _indices.has(i);
    const last = segments[segments.length - 1];
    if (last !== undefined && last.matched === matched) {
      last.text += value[i];
    } else {
      segments.push({ text: value[i], matched });
    }
  }

  if (highlightCache.size >= HIGHLIGHT_CACHE_SIZE) {
    const firstKey = highlightCache.keys().next().value;
    if (firstKey !== undefined) {
      highlightCache.delete(firstKey);
    }
  }
  highlightCache.set(cacheKey, segments);

  return segments;
}
