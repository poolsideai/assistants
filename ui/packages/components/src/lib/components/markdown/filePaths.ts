/**
 * Utilities for detecting and extracting file paths from text content.
 * Used by the Markdown renderer to create clickable file path pills.
 */

/**
 * Regex to match file paths in text content.
 * Matches both traditional files with extensions and dotfiles, with an optional
 * `:line` or `:line:column` suffix (e.g. `src/main.ts:42`, `src/main.ts:42:5`).
 *
 * Group 1 captures the file path.
 * Group 2 captures the line number (without the leading colon), if present.
 * Group 3 captures the column number (without the leading colon), if present.
 * The regex handles:
 * - Absolute paths: /path/to/file.ext
 * - Relative paths: ./path/to/file.ext, ../path/to/file.ext
 * - Bare relative paths: path/to/file.ext
 * - Dotfiles in paths: /path/to/.dockerignore, ./.gitignore
 * - Quoted paths: "path/to/file.ext", 'file.ext', including curly quotes
 */
export const FILE_PATH_REGEX =
  /(?:^|[\s("'“‘])((?:\/|\.\/|\.\.\/)?[\w.%\-/()]+\.\w{1,4}|(?:\/|\.\/|\.\.\/)?(?:[\w.%\-()]+\/)+\.\w[\w.\-]*)(?::(\d+)(?::(\d+))?)?(?=[\s,;:)\]!?"'”’]|$)/g;

const MATCHING_QUOTE: Record<string, string> = {
  '"': '"',
  "'": "'",
  "“": "”", // “ ”
  "‘": "’", // ‘ ’
};

/** Return the closing quote that pairs with an opening quote character, if any. */
export function closingQuoteFor(char: string): string | undefined {
  return MATCHING_QUOTE[char];
}

/**
 * Strip one pair of matching surrounding quotes, e.g. `"src/foo.ts"` -> `src/foo.ts`.
 * Returns the text unchanged when it is not wrapped in a matching pair.
 */
export function stripMatchingQuotes(text: string): string {
  const closer = MATCHING_QUOTE[text[0] ?? ""];
  if (closer !== undefined && text.length > 2 && text.endsWith(closer)) {
    return text.slice(1, -1);
  }
  return text;
}

/**
 * Decode a URL/path target, falling back to partial URI decoding and then the
 * original text when it contains malformed percent escapes.
 */
export function decodeFilePathTarget(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    try {
      return decodeURI(text);
    } catch {
      return text;
    }
  }
}

/**
 * Extract optional `:line` or `:line:column` suffix from text that may be a file
 * reference. Returns the base path with any line/column numbers parsed out.
 */
export function parseFilePathWithLine(text: string): {
  path: string;
  line?: number;
  column?: number;
} {
  const match = /^(.*?)(?::(\d+)(?::(\d+))?)?$/.exec(text);
  if (!match) return { path: text };
  const [, path, lineStr, columnStr] = match;
  return {
    path,
    ...(lineStr !== undefined && { line: Number(lineStr) }),
    ...(columnStr !== undefined && { column: Number(columnStr) }),
  };
}

/**
 * Check if text looks like a file path.
 * Used for content inside code elements (backticks).
 * Accepts an optional trailing `:line` or `:line:column` suffix.
 */
export function isFilePath(text: string): boolean {
  if (!text) return false;
  const { path } = parseFilePathWithLine(text);
  return (
    path.startsWith("/") ||
    path.startsWith("./") ||
    path.startsWith("../") ||
    // Traditional files with extension: file.go, models/book.go, (pages)/file.tsx
    /^(?:\/|\.\/|\.\.\/)?[\w.%\-/()]+\.\w{1,4}$/.test(path) ||
    // Dotfiles: .dockerignore, .gitignore, path/to/.eslintrc
    /^(?:[\w.\-()]+\/)*\.\w[\w.\-]*$/.test(path)
  );
}
