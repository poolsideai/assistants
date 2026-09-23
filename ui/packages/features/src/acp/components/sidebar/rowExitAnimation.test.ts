import { afterEach, describe, expect, it, vi } from "vitest";
import { rowExitAnimation } from "./rowExitAnimation.svelte";
import { ROW_EXIT_DURATION_MS } from "./rowExitTransition";

describe("rowExitAnimation", () => {
  afterEach(() => {
    // The watchdog resets the singleton to idle no matter what a test left in it.
    vi.useFakeTimers();
    vi.advanceTimersByTime(ROW_EXIT_DURATION_MS + 1000);
    vi.useRealTimers();
    vi.unstubAllGlobals();
    expect(rowExitAnimation.animating).toBe(false);
  });

  it("releases when the outro reports completion", () => {
    rowExitAnimation.hold();
    expect(rowExitAnimation.animating).toBe(true);

    rowExitAnimation.outroStarted();
    expect(rowExitAnimation.animating).toBe(true);

    rowExitAnimation.outroEnded();
    expect(rowExitAnimation.animating).toBe(false);
  });

  it("stays held until the last overlapping outro finishes", () => {
    rowExitAnimation.outroStarted();
    rowExitAnimation.outroStarted();

    rowExitAnimation.outroEnded();
    expect(rowExitAnimation.animating).toBe(true);

    rowExitAnimation.outroEnded();
    expect(rowExitAnimation.animating).toBe(false);
  });

  // A held exit may never produce an outro at all — the row can be hidden
  // behind a "Show more" limit — so the hold must expire on its own.
  it("expires a hold that no outro ever answers", () => {
    vi.useFakeTimers();
    try {
      rowExitAnimation.hold();
      expect(rowExitAnimation.animating).toBe(true);

      vi.advanceTimersByTime(ROW_EXIT_DURATION_MS + 251);
      expect(rowExitAnimation.animating).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not hold under reduced motion, where rows leave instantly", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" })),
    );

    rowExitAnimation.hold();

    expect(rowExitAnimation.animating).toBe(false);
  });
});
