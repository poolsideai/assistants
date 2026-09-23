import { afterEach, describe, expect, it, vi } from "vitest";
import { ROW_EXIT_DURATION_MS, rowExitDurationMs } from "./rowExitTransition";

describe("rowExitDurationMs", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("animates rows the user removed", () => {
    expect(rowExitDurationMs(true)).toBe(ROW_EXIT_DURATION_MS);
  });

  // A row filtered out by the search box or a collapsed group has to vanish
  // instantly, otherwise collapsing a group looks like bulk deletion.
  it("does not animate rows that were merely filtered out", () => {
    expect(rowExitDurationMs(false)).toBe(0);
  });

  it("skips the animation when reduced motion is requested", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({ matches: query === "(prefers-reduced-motion: reduce)" })),
    );

    expect(rowExitDurationMs(true)).toBe(0);
  });
});
