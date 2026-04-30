import * as diff from "diff";
import { type DiffCharsOptions, type SpanChange } from "../diffChars.js";
import { type WordChange } from "../diffWords.js";
import { diffText } from "./diffText.js";

export interface EqualChange {
  type: "equal";
  value: string;
  oldNumber: number;
  newNumber: number;
}

export interface InsertChange {
  type: "insert";
  value: string;
  number: number;
}

export interface DeleteChange {
  type: "delete";
  value: string;
  number: number;
}

interface ReplaceChange {
  type: "replace";
  oldValue: string;
  newValue: string;
  oldNumber: number;
  newNumber: number;
  changes: SpanChange[] | WordChange[];
}

export type Change = EqualChange | InsertChange | DeleteChange | ReplaceChange;

interface DiffStats {
  additions: number;
  deletions: number;
}

export interface DiffLinesResult {
  changes: Change[];
  stats: DiffStats;
}

export interface DiffLinesOptions extends DiffCharsOptions {
  /**
   * Whether to ignore leading and trailing whitespace characters when checking
   * if two lines are equal.
   * @default false
   */
  ignoreWhitespace?: boolean;
}

/**
 * Produce a line-oriented diff between two strings. Where a removed
 * line is immediately followed by an inserted line, emit a single
 * `"replace"` with inner word/char-level changes.
 */
export function diffLines(
  oldStr: string,
  newStr: string,
  options?: DiffLinesOptions,
): DiffLinesResult {
  const { ignoreWhitespace = false, ignoreCase } = options ?? {};

  const changes = diff.diffLines(oldStr, newStr, {
    ignoreWhitespace,
    stripTrailingCr: true,
  });

  const result: Change[] = [];
  const stats: DiffStats = {
    additions: 0,
    deletions: 0,
  };

  let newNumber = 1;
  let oldNumber = 1;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const { value } = change;

    if (change.added) {
      result.push({
        type: "insert",
        value,
        number: newNumber,
      });

      stats.additions += change.count;
      newNumber += change.count;
      continue;
    }

    if (change.removed) {
      const nextChange = changes.at(i + 1);
      // If the next change is an insertion, treat the pair as a replacement
      if (nextChange?.added) {
        result.push({
          type: "replace",
          oldValue: value,
          newValue: nextChange.value,
          oldNumber,
          newNumber,
          changes: diffText(value, nextChange.value, { ignoreCase }),
        });

        stats.deletions += change.count;
        stats.additions += nextChange.count;

        oldNumber += change.count;
        newNumber += nextChange.count;
        i++; // skip the paired insert
      } else {
        result.push({
          type: "delete",
          value,
          number: oldNumber,
        });

        stats.deletions += change.count;
        oldNumber += change.count;
      }
      continue;
    }

    result.push({
      type: "equal",
      value,
      oldNumber,
      newNumber,
    });
    oldNumber += change.count;
    newNumber += change.count;
  }

  return { changes: result, stats };
}
