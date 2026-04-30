import * as diff from "diff";
import type { DiffCharsOptions } from "./diffChars.js";
import type { Range } from "./types/range.js";

export interface WordEqualChange {
  type: "equal";
  value: string;
  range: Range;
}

export interface WordRangeChange {
  type: "range";
  value: string;
  oldRange: Range;
  newRange: Range;
}

export interface WordInsertChange {
  type: "insert";
  value: string;
  range: Range;
}

export interface WordDeleteChange {
  type: "delete";
  value: string;
  range: Range;
}

export interface WordReplaceChange {
  type: "replace";
  oldValue: string;
  newValue: string;
  oldRange: Range;
  newRange: Range;
}

export type WordChange =
  | WordEqualChange
  | WordRangeChange
  | WordInsertChange
  | WordDeleteChange
  | WordReplaceChange;

export type DiffWordOptions = DiffCharsOptions;

/**
 * diffs two blocks of text, treating each word as a token
 */
export function diffWords(
  oldStr: string,
  newStr: "",
  options?: DiffWordOptions,
): WordDeleteChange[];
export function diffWords(
  oldStr: "",
  newStr: string,
  options?: DiffWordOptions,
): WordInsertChange[];
export function diffWords(oldStr: string, newStr: string, options?: DiffWordOptions): WordChange[];
export function diffWords(oldStr: string, newStr: string, options?: DiffWordOptions): WordChange[] {
  const changes = diff.diffWords(oldStr, newStr, options);

  const result: WordChange[] = [];

  let oldIndex = 0;
  let newIndex = 0;
  let pendingRemove: { value: string; range: Range } | undefined;

  const flushPendingRemove = () => {
    if (pendingRemove) {
      result.push({
        type: "delete",
        value: pendingRemove.value,
        range: pendingRemove.range,
      });
      pendingRemove = undefined;
    }
  };

  for (const change of changes) {
    const value = change.value;
    if (!value) continue;

    const { length } = value;

    if (change.added) {
      if (pendingRemove) {
        result.push({
          type: "replace",
          oldValue: pendingRemove.value,
          newValue: value,
          oldRange: pendingRemove.range,
          newRange: {
            from: newIndex,
            to: newIndex + length,
          },
        });
        pendingRemove = undefined;
      } else {
        result.push({
          type: "insert",
          value,
          range: {
            from: newIndex,
            to: newIndex + length,
          },
        });
      }
      newIndex += length;
    } else if (change.removed) {
      flushPendingRemove();

      pendingRemove = {
        value,
        range: { from: oldIndex, to: (oldIndex += length) },
      };
    } else {
      flushPendingRemove();

      const oldRange: Range = { from: oldIndex, to: oldIndex + length };
      const newRange: Range = { from: newIndex, to: newIndex + length };

      if (oldRange.from === newRange.from && oldRange.to === newRange.to) {
        result.push({ type: "equal", value, range: oldRange });
      } else {
        result.push({ type: "range", value, oldRange, newRange });
      }

      oldIndex = oldRange.to;
      newIndex = newRange.to;
    }
  }

  flushPendingRemove();
  return result;
}
