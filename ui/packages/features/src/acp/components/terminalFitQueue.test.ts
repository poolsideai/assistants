import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { enqueueSettledFit } from "./terminalFitQueue";

describe("terminalFitQueue", () => {
  let frameCallbacks: FrameRequestCallback[];

  beforeEach(() => {
    frameCallbacks = [];
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frameCallbacks.push(callback);
      return frameCallbacks.length;
    });
  });

  afterEach(() => {
    // Drain anything left behind so state does not leak across tests (the
    // queue module is a singleton).
    while (frameCallbacks.length > 0) {
      runNextFrame();
    }
    vi.unstubAllGlobals();
  });

  function runNextFrame() {
    const callbacks = frameCallbacks;
    frameCallbacks = [];
    for (const callback of callbacks) {
      callback(performance.now());
    }
  }

  it("runs at most one task per animation frame, in FIFO order", () => {
    const runs: string[] = [];
    enqueueSettledFit(() => runs.push("a"));
    enqueueSettledFit(() => runs.push("b"));
    enqueueSettledFit(() => runs.push("c"));

    expect(runs).toEqual([]);

    runNextFrame();
    expect(runs).toEqual(["a"]);

    runNextFrame();
    expect(runs).toEqual(["a", "b"]);

    runNextFrame();
    expect(runs).toEqual(["a", "b", "c"]);
  });

  it("keeps draining after a task throws", () => {
    const runs: string[] = [];
    enqueueSettledFit(() => {
      throw new Error("boom");
    });
    enqueueSettledFit(() => runs.push("survivor"));

    expect(() => runNextFrame()).toThrow("boom");
    runNextFrame();
    expect(runs).toEqual(["survivor"]);
  });

  it("accepts new tasks after the queue fully drains", () => {
    const runs: string[] = [];
    enqueueSettledFit(() => runs.push("first"));
    runNextFrame();
    expect(runs).toEqual(["first"]);

    enqueueSettledFit(() => runs.push("second"));
    runNextFrame();
    expect(runs).toEqual(["first", "second"]);
  });
});
