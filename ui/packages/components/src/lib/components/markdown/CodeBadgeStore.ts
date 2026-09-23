import { writable } from "svelte/store";

// Define the type for our unique words map
export type UniqueWordsMap = Map<string, string>;

// Maximum number of unique words to track before evicting oldest entries
const MAX_UNIQUE_WORDS = 1000;

// Create a writable store with an empty Map as initial value
export const uniqueWordsStore = writable<UniqueWordsMap>(new Map());

// Colors available for code highlighting
export const codeColors = [
  "text-red-600 dark:text-red-400",
  "text-emerald-600 dark:text-emerald-400",
  "text-sky-600 dark:text-sky-400",
  "text-amber-600 dark:text-amber-400",
  "text-teal-600 dark:text-teal-400",
  "text-cyan-600 dark:text-cyan-400",
  "text-purple-600 dark:text-purple-400",
  "text-rose-600 dark:text-rose-400",
];

// Function to normalize words - strips parentheses and non-alphanumeric chars except underscores
export function normalizeWord(word: string | null): string {
  if (!word) return "";
  return word
    .replace(/[()]/g, "") // Remove parentheses
    .replace(/[^a-zA-Z0-9_]/g, "") // Remove other non-alphanumeric chars except underscores
    .toLowerCase()
    .trim();
}

// Function to check if a word should be colorized
export function shouldColorize(word: string | null): boolean {
  if (!word) return false;
  // Only colorize words that contain letters, numbers, and common programming symbols (_ and parentheses)
  return /^[a-zA-Z0-9_()]+$/.test(word.trim());
}

// Pick a color from a hash of the word rather than its insertion index. Indexing
// by `map.size` collapsed to a single color once the cap was reached (each insert
// evicts one first, pinning size at MAX-1, so `size % length` was constant); a
// hash also gives each identifier a stable color regardless of eviction.
function colorForWord(word: string): string {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash * 31 + word.charCodeAt(i)) | 0;
  }
  return codeColors[Math.abs(hash) % codeColors.length];
}

// Function to add a new word to the store if it doesn't exist
export function addUniqueWord(word: string): void {
  uniqueWordsStore.update((map) => {
    const normalizedWord = normalizeWord(word);
    if (!map.has(normalizedWord) && normalizedWord) {
      // Evict oldest entry if at capacity before inserting new one
      if (map.size >= MAX_UNIQUE_WORDS) {
        const oldestKey = map.keys().next().value as string;
        map.delete(oldestKey);
      }
      map.set(normalizedWord, colorForWord(normalizedWord));
    }
    return map;
  });
}
