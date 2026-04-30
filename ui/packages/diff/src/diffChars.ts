import * as diff from "diff";
import type { Range } from "./types/range.js";

export interface SpanEqualChange {
  type: "equal";
  value: string;
  range: Range;
}

export interface SpanRangeChange {
  type: "range";
  value: string;
  oldRange: Range;
  newRange: Range;
}

export interface SpanInsertChange {
  type: "insert";
  value: string;
  range: Range;
}

export interface SpanDeleteChange {
  type: "delete";
  value: string;
  range: Range;
}

export interface SpanReplaceChange {
  type: "replace";
  oldValue: string;
  newValue: string;
  oldRange: Range;
  newRange: Range;
}

export type SpanChange =
  | SpanEqualChange
  | SpanRangeChange
  | SpanInsertChange
  | SpanDeleteChange
  | SpanReplaceChange;

export interface DiffCharsOptions {
  /**
   * Weather to consider uppercase and lowercase forms of a character equal.
   */
  ignoreCase?: boolean;
}

/**
 * diffs two blocks of text, treating each character as a token
 */
export function diffChars(
  oldStr: string,
  newStr: "",
  options?: DiffCharsOptions,
): SpanDeleteChange[];
export function diffChars(
  oldStr: "",
  newStr: string,
  options?: DiffCharsOptions,
): SpanInsertChange[];
export function diffChars(oldStr: string, newStr: string, options?: DiffCharsOptions): SpanChange[];
export function diffChars(
  oldStr: string,
  newStr: string,
  options?: DiffCharsOptions,
): SpanChange[] {
  const changes = diff.diffChars(oldStr, newStr, options);

  const result: SpanChange[] = [];

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
