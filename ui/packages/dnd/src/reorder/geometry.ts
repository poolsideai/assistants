import type { ReorderAxis, ReorderDropTarget, ReorderEdge, ReorderItemRect } from "./types.js";

/** A 1-D projection of a DOM rect onto the reorder axis. */
export interface AxisSpan {
  /** Start coordinate (top for vertical, left for horizontal). */
  start: number;
  /** Size (height for vertical, width for horizontal). */
  size: number;
}

export function projectRect(rect: DOMRect, axis: ReorderAxis): AxisSpan {
  return axis === "horizontal"
    ? { start: rect.left, size: rect.width }
    : { start: rect.top, size: rect.height };
}

/** Which half of `span` the pointer falls in. */
export function edgeForPointer(pointer: number, span: AxisSpan): ReorderEdge {
  return pointer < span.start + span.size / 2 ? "before" : "after";
}

/**
 * Find the item the pointer is over (by its rect) and which edge it is nearest.
 * Pointer-driven, so it is independent of the dragged item's own size — the key
 * to predictable reordering with variable-height rows.
 */
export function projectDropTarget(
  pointer: number,
  spans: readonly AxisSpan[],
): ReorderDropTarget | null {
  if (spans.length === 0) return null;
  if (pointer < spans[0].start) return { index: 0, edge: "before" };

  for (let index = 0; index < spans.length; index++) {
    const span = spans[index];
    const end = span.start + span.size;
    if (pointer <= end) {
      return { index, edge: edgeForPointer(pointer, span) };
    }
    // Pointer sits in the gap between this row and the next: attribute it to the
    // nearer edge rather than falling through to the last row.
    const next = spans[index + 1];
    if (next && pointer < next.start) {
      return pointer - end <= next.start - pointer
        ? { index, edge: "after" }
        : { index: index + 1, edge: "before" };
    }
  }
  return { index: spans.length - 1, edge: "after" };
}

/**
 * Convert an (over-index, edge) hover into a "move" target index, or `null`
 * when the result would leave the item where it already is.
 */
export function resolveMoveTarget(from: number, over: number, edge: ReorderEdge): number | null {
  const insertAt = edge === "before" ? over : over + 1;
  // Dropping into its own current slot (either side) is a no-op.
  if (insertAt === from || insertAt === from + 1) return null;
  // Account for the dragged item being removed before re-insertion.
  return insertAt > from ? insertAt - 1 : insertAt;
}

/** Immutably move an item from `from` to `to` using splice semantics. */
export function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const next = items.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Project a reordered list back into its original layout and return the
 * translate offset for each item. Applying these offsets to an inner content
 * wrapper (while the outer item keeps its original space) opens a full-size
 * gap at the drop target without changing the hit-test geometry mid-drag.
 *
 * Gaps are preserved by slot, so variable-height items and non-uniform spacing
 * keep the list's original total extent.
 */
export function reorderLayoutOffsets(
  rects: readonly ReorderItemRect[],
  from: number,
  to: number,
  axis: ReorderAxis = "vertical",
): number[] {
  const offsets = rects.map(() => 0);
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= rects.length ||
    to >= rects.length ||
    rects.length < 2
  ) {
    return offsets;
  }

  const spans = rects.map((rect) =>
    axis === "horizontal"
      ? { start: rect.left, size: rect.width }
      : { start: rect.top, size: rect.height },
  );
  const projectedIndices = moveItem(
    spans.map((_, index) => index),
    from,
    to,
  );
  const slotGaps = spans.slice(0, -1).map((span, index) => {
    const next = spans[index + 1];
    return Math.max(0, next.start - (span.start + span.size));
  });

  let nextStart = spans[0].start;
  projectedIndices.forEach((itemIndex, slotIndex) => {
    const span = spans[itemIndex];
    offsets[itemIndex] = nextStart - span.start;
    nextStart += span.size + (slotGaps[slotIndex] ?? 0);
  });
  return offsets;
}
