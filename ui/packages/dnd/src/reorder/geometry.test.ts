import { describe, expect, it } from "vitest";
import {
  edgeForPointer,
  moveItem,
  projectDropTarget,
  reorderLayoutOffsets,
  resolveMoveTarget,
  type AxisSpan,
} from "./geometry.js";
import type { ReorderItemRect } from "./types.js";

describe("edgeForPointer", () => {
  const span: AxisSpan = { start: 100, size: 40 }; // midpoint at 120

  it("returns before above the midpoint", () => {
    expect(edgeForPointer(100, span)).toBe("before");
    expect(edgeForPointer(119, span)).toBe("before");
  });

  it("returns after at or below the midpoint", () => {
    expect(edgeForPointer(120, span)).toBe("after");
    expect(edgeForPointer(140, span)).toBe("after");
  });
});

describe("projectDropTarget", () => {
  // Three stacked 40px rows starting at 0, 40, 80.
  const spans: AxisSpan[] = [
    { start: 0, size: 40 },
    { start: 40, size: 40 },
    { start: 80, size: 40 },
  ];

  it("returns null for an empty list", () => {
    expect(projectDropTarget(10, [])).toBeNull();
  });

  it("detects the hovered row and edge independent of any dragged element", () => {
    expect(projectDropTarget(10, spans)).toEqual({ index: 0, edge: "before" });
    expect(projectDropTarget(35, spans)).toEqual({ index: 0, edge: "after" });
    expect(projectDropTarget(95, spans)).toEqual({ index: 2, edge: "before" });
  });

  it("clamps to the nearest extreme when the pointer is outside all rows", () => {
    expect(projectDropTarget(-50, spans)).toEqual({ index: 0, edge: "before" });
    expect(projectDropTarget(9999, spans)).toEqual({ index: 2, edge: "after" });
  });

  it("attributes a pointer in the gap between rows to the nearer edge", () => {
    // Three 30px rows with 10px gaps: [0,30] [40,70] [80,110].
    const gapped: AxisSpan[] = [
      { start: 0, size: 30 },
      { start: 40, size: 30 },
      { start: 80, size: 30 },
    ];
    // Gap 30..40: closer to row 0's end -> after row 0.
    expect(projectDropTarget(33, gapped)).toEqual({ index: 0, edge: "after" });
    // Gap 30..40: closer to row 1's start -> before row 1.
    expect(projectDropTarget(37, gapped)).toEqual({ index: 1, edge: "before" });
  });
});

describe("resolveMoveTarget", () => {
  it("treats both sides of the item's own slot as a no-op", () => {
    expect(resolveMoveTarget(1, 1, "before")).toBeNull();
    expect(resolveMoveTarget(1, 1, "after")).toBeNull();
    expect(resolveMoveTarget(1, 0, "after")).toBeNull(); // already after index 0
    expect(resolveMoveTarget(1, 2, "before")).toBeNull(); // already before index 2
  });

  it("adjusts the target index for the removed dragged item when moving down", () => {
    // [A,B,C,D], drag A (0) after C (2) -> [B,C,A,D]
    expect(resolveMoveTarget(0, 2, "after")).toBe(2);
    // drag A (0) before C (2) -> [B,A,C,D]
    expect(resolveMoveTarget(0, 2, "before")).toBe(1);
  });

  it("keeps the index as-is when moving up", () => {
    // [A,B,C,D], drag D (3) before A (0) -> [D,A,B,C]
    expect(resolveMoveTarget(3, 0, "before")).toBe(0);
    // drag C (2) before A (0) -> [C,A,B,D]
    expect(resolveMoveTarget(2, 0, "before")).toBe(0);
  });
});

describe("moveItem", () => {
  it("moves down with splice semantics without mutating the input", () => {
    const input = ["A", "B", "C", "D"];
    const result = moveItem(input, 0, 2);
    expect(result).toEqual(["B", "C", "A", "D"]);
    expect(input).toEqual(["A", "B", "C", "D"]);
  });

  it("moves up", () => {
    expect(moveItem(["A", "B", "C", "D"], 3, 0)).toEqual(["D", "A", "B", "C"]);
  });

  it("composes with resolveMoveTarget for the common drag flows", () => {
    const items = ["A", "B", "C", "D"];
    // Drag A onto the bottom half of C.
    const to = resolveMoveTarget(0, 2, "after");
    expect(to).not.toBeNull();
    expect(moveItem(items, 0, to as number)).toEqual(["B", "C", "A", "D"]);
  });
});

describe("reorderLayoutOffsets", () => {
  const rect = (top: number, height: number, left = 0, width = 100): ReorderItemRect => ({
    top,
    right: left + width,
    bottom: top + height,
    left,
    width,
    height,
  });

  it("opens the dragged item's full-height slot while preserving variable gaps", () => {
    const rects = [rect(0, 30), rect(34, 50), rect(90, 20)];

    expect(reorderLayoutOffsets(rects, 0, 2)).toEqual([80, -34, -36]);
    expect(reorderLayoutOffsets(rects, 2, 0)).toEqual([24, 26, -90]);
  });

  it("supports horizontal lists", () => {
    const rects = [rect(0, 20, 0, 40), rect(0, 20, 44, 60), rect(0, 20, 108, 30)];

    expect(reorderLayoutOffsets(rects, 0, 2, "horizontal")).toEqual([98, -44, -44]);
  });

  it("returns zero offsets for an invalid or unchanged move", () => {
    const rects = [rect(0, 30), rect(34, 30)];

    expect(reorderLayoutOffsets(rects, 0, 0)).toEqual([0, 0]);
    expect(reorderLayoutOffsets(rects, -1, 1)).toEqual([0, 0]);
  });
});
