import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import UserMessageBubble from "./UserMessageBubble.svelte";

// Regression coverage for PE-2482: a pending/enqueued prompt containing a
// scrollable code block flickered because UserMessageBubble ran checkOverflow()
// synchronously inside its ResizeObserver callback. checkOverflow() reads
// layout and writes state that toggles classes changing the bubble's own
// max-height, so each run fed a resize straight back into the observer.
//
// jsdom does no layout (scrollHeight is 0, getBoundingClientRect is zeroed), so
// we cannot observe the visual flicker. Instead we pin the mechanism the fix
// relies on: resize notifications are coalesced onto a single
// requestAnimationFrame rather than handled synchronously per-notification, so
// a burst of notifications can never drive a synchronous read→write→resize
// loop within one frame.

type ResizeCallback = () => void;

let resizeCallbacks: ResizeCallback[];
let rafCallbacks: FrameRequestCallback[];
let rafSpy: ReturnType<typeof vi.fn>;
let cancelSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  resizeCallbacks = [];
  rafCallbacks = [];

  vi.stubGlobal(
    "ResizeObserver",
    vi.fn().mockImplementation((cb: ResizeCallback) => {
      resizeCallbacks.push(cb);
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    }),
  );

  // Queue rAF callbacks so the test drives the frame boundary explicitly.
  rafSpy = vi.fn((cb: FrameRequestCallback) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length; // non-zero handle
  });
  cancelSpy = vi.fn();
  vi.stubGlobal("requestAnimationFrame", rafSpy);
  vi.stubGlobal("cancelAnimationFrame", cancelSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function flushFrame() {
  const pending = rafCallbacks.splice(0, rafCallbacks.length);
  for (const cb of pending) cb(performance.now());
}

function fireResize() {
  // A collapsible bubble registers exactly one ResizeObserver.
  resizeCallbacks.forEach((cb) => cb());
}

describe("UserMessageBubble (collapsible overflow handling)", () => {
  it("does not schedule any frame work when not collapsible", async () => {
    render(UserMessageBubble, { props: { collapsible: false } });
    await tick();
    // Non-collapsible bubbles never observe resizes, so nothing is queued.
    expect(resizeCallbacks).toHaveLength(0);
    fireResize();
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it("defers a resize notification to requestAnimationFrame instead of running synchronously", async () => {
    render(UserMessageBubble, { props: { collapsible: true } });
    await tick();

    expect(resizeCallbacks).toHaveLength(1);

    rafSpy.mockClear();
    fireResize();

    // The callback must schedule work, not do it inline. If it ran
    // checkOverflow() synchronously (the flicker bug), no frame would be
    // requested here.
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it("coalesces a burst of resize notifications into a single frame", async () => {
    render(UserMessageBubble, { props: { collapsible: true } });
    await tick();

    rafSpy.mockClear();

    // A read→write→resize loop would deliver many notifications in a row.
    // The fix must collapse them to one queued frame.
    fireResize();
    fireResize();
    fireResize();
    expect(rafSpy).toHaveBeenCalledTimes(1);

    // After the frame runs, a later notification is free to schedule again —
    // i.e. we throttle per frame, we don't stop reacting.
    flushFrame();
    rafSpy.mockClear();
    fireResize();
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it("cancels a pending frame on unmount", async () => {
    const { unmount } = render(UserMessageBubble, { props: { collapsible: true } });
    await tick();

    fireResize();
    expect(rafCallbacks).toHaveLength(1);

    unmount();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
