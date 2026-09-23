import { describe, expect, it } from "vitest";
import { pointInTriangle, pointerHeadedToRect } from "./safeTriangle";

const rect = (left: number, top: number, right: number, bottom: number): DOMRect =>
  ({ left, top, right, bottom }) as DOMRect;

describe("pointInTriangle", () => {
  const a = { x: 0, y: 0 };
  const b = { x: 10, y: 0 };
  const c = { x: 0, y: 10 };

  it("accepts interior and edge points", () => {
    expect(pointInTriangle({ x: 2, y: 2 }, a, b, c)).toBe(true);
    expect(pointInTriangle({ x: 5, y: 0 }, a, b, c)).toBe(true);
  });

  it("rejects exterior points", () => {
    expect(pointInTriangle({ x: 6, y: 6 }, a, b, c)).toBe(false);
    expect(pointInTriangle({ x: -1, y: 5 }, a, b, c)).toBe(false);
  });
});

describe("pointerHeadedToRect", () => {
  // Panel to the right of the pointer, e.g. the desktop sidebar popover.
  const panel = rect(100, 50, 300, 250);

  it("accepts a pointer moving toward the panel's facing edge", () => {
    const from = { x: 20, y: 150 };
    expect(pointerHeadedToRect({ x: 60, y: 170 }, from, panel, 16)).toBe(true);
  });

  it("uses the pad to widen the facing edge", () => {
    const from = { x: 20, y: 150 };
    // Aimed just above the panel's top corner: outside the bare edge but
    // inside the padded one.
    expect(pointerHeadedToRect({ x: 99, y: 45 }, from, panel, 16)).toBe(true);
    expect(pointerHeadedToRect({ x: 99, y: 45 }, from, panel, 0)).toBe(false);
  });

  it("rejects a pointer moving away from the panel", () => {
    const from = { x: 20, y: 150 };
    expect(pointerHeadedToRect({ x: 10, y: 150 }, from, panel, 16)).toBe(false);
    expect(pointerHeadedToRect({ x: 40, y: 400 }, from, panel, 16)).toBe(false);
  });

  it("uses a horizontal facing edge for a panel below the pointer", () => {
    const below = rect(50, 300, 250, 500);
    const from = { x: 150, y: 100 };
    expect(pointerHeadedToRect({ x: 180, y: 200 }, from, below, 16)).toBe(true);
    expect(pointerHeadedToRect({ x: 400, y: 200 }, from, below, 16)).toBe(false);
  });

  it("is not headed to the panel when starting on top of it", () => {
    const from = { x: 150, y: 150 };
    expect(pointerHeadedToRect({ x: 150, y: 160 }, from, panel, 16)).toBe(false);
  });
});
