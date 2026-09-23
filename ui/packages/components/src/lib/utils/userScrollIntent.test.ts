import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UserScrollIntentTracker } from "./userScrollIntent.js";

function wheel(el: HTMLElement, deltaY: number) {
  el.dispatchEvent(new WheelEvent("wheel", { deltaY }));
}

// jsdom has no Touch/TouchEvent constructors; the handlers only read
// touches[0].clientY, so a plain Event with a touches array stands in.
function touch(el: HTMLElement, type: "touchstart" | "touchmove" | "touchend", clientY: number) {
  const event = new Event(type);
  Object.defineProperty(event, "touches", { value: [{ clientY }] });
  el.dispatchEvent(event);
}

function pointer(target: EventTarget, type: "pointerdown" | "pointerup") {
  target.dispatchEvent(new Event(type));
}

describe("UserScrollIntentTracker", () => {
  let el: HTMLDivElement;
  let tracker: UserScrollIntentTracker;

  beforeEach(() => {
    vi.useFakeTimers();
    el = document.createElement("div");
    tracker = new UserScrollIntentTracker(el);
  });

  afterEach(() => {
    tracker.disconnect();
    vi.useRealTimers();
  });

  it("reports upward intent after a wheel-up, expiring with the window", () => {
    expect(tracker.upwardIntent()).toBe(false);
    wheel(el, -10);
    expect(tracker.upwardIntent()).toBe(true);
    vi.advanceTimersByTime(UserScrollIntentTracker.WHEEL_INTENT_MS + 1);
    expect(tracker.upwardIntent()).toBe(false);
  });

  it("does not report upward intent for wheel-down", () => {
    wheel(el, 10);
    expect(tracker.upwardIntent()).toBe(false);
  });

  it("reports upward intent through the touch inertia window after an upward drag", () => {
    touch(el, "touchstart", 100);
    touch(el, "touchmove", 150); // finger moving down the screen = content up
    touch(el, "touchend", 150);
    expect(tracker.upwardIntent()).toBe(true);
    vi.advanceTimersByTime(UserScrollIntentTracker.TOUCH_INERTIA_MS + 1);
    expect(tracker.upwardIntent()).toBe(false);
  });

  it("bumps the generation on wheel in either direction", () => {
    const before = tracker.generation;
    wheel(el, 10);
    wheel(el, -10);
    expect(tracker.generation).toBe(before + 2);
  });

  it("bumps the generation on scroll keys but not other keys", () => {
    const before = tracker.generation;
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" }));
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(tracker.generation).toBe(before + 1);
  });

  it("counts scrolls as user input while a pointer is down (scrollbar drag)", () => {
    const before = tracker.generation;
    pointer(el, "pointerdown"); // grab the scrollbar thumb: +1
    el.dispatchEvent(new Event("scroll")); // each drag movement: +1
    el.dispatchEvent(new Event("scroll"));
    expect(tracker.generation).toBe(before + 3);
    expect(tracker.active()).toBe(true);

    // Release can land outside the container — observed at the window.
    pointer(window, "pointerup");
    expect(tracker.active()).toBe(false);

    // Programmatic scrolls while idle bump nothing.
    vi.advanceTimersByTime(UserScrollIntentTracker.TOUCH_INERTIA_MS + 1);
    el.dispatchEvent(new Event("scroll"));
    expect(tracker.generation).toBe(before + 3);
  });

  it("counts scrolls as user input during the wheel momentum window", () => {
    wheel(el, 5);
    const after = tracker.generation;
    el.dispatchEvent(new Event("scroll"));
    expect(tracker.generation).toBe(after + 1);
    vi.advanceTimersByTime(UserScrollIntentTracker.WHEEL_INTENT_MS + 1);
    el.dispatchEvent(new Event("scroll"));
    expect(tracker.generation).toBe(after + 1);
  });

  it("invokes onIntent for every bump", () => {
    const onIntent = vi.fn();
    const withCallback = new UserScrollIntentTracker(el, { onIntent });
    wheel(el, -1);
    pointer(el, "pointerdown");
    expect(onIntent).toHaveBeenCalledTimes(2);
    withCallback.disconnect();
  });

  it("stops listening after disconnect", () => {
    const before = tracker.generation;
    tracker.disconnect();
    wheel(el, -10);
    expect(tracker.generation).toBe(before);
    expect(tracker.upwardIntent()).toBe(false);
    // Re-create so afterEach's disconnect is harmless.
    tracker = new UserScrollIntentTracker(el);
  });
});
