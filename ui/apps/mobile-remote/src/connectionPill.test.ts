import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createConnectionPill, OFFLINE_PILL_DELAY_MS } from "./connectionPill";

function pillText(): string | null {
  return document.querySelector(".connection-pill")?.textContent ?? null;
}

describe("createConnectionPill", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.querySelector(".connection-pill")?.remove();
  });

  it("stays hidden through a short blip", () => {
    const update = createConnectionPill();
    update("open");
    update("connecting");
    vi.advanceTimersByTime(OFFLINE_PILL_DELAY_MS - 1);
    expect(pillText()).toBeNull();

    // Recovered before the grace period: no pill, and no "Connected" flash
    // for a drop that was never visible.
    update("open");
    vi.advanceTimersByTime(OFFLINE_PILL_DELAY_MS);
    expect(pillText()).toBeNull();
  });

  it("appears only after 10s of continuous disconnection", () => {
    const update = createConnectionPill();
    update("open");
    update("connecting");
    vi.advanceTimersByTime(OFFLINE_PILL_DELAY_MS - 1);
    expect(pillText()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(pillText()).toBe("Reconnecting…");
  });

  it("applies the same grace period to the initial connect", () => {
    const update = createConnectionPill();
    update("connecting");
    vi.advanceTimersByTime(OFFLINE_PILL_DELAY_MS - 1);
    expect(pillText()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(pillText()).toBe("Connecting…");
  });

  it("keeps a visible pill's text current as the status changes", () => {
    const update = createConnectionPill();
    update("open");
    update("connecting");
    vi.advanceTimersByTime(OFFLINE_PILL_DELAY_MS);
    expect(pillText()).toBe("Reconnecting…");
    update("closed");
    expect(pillText()).toBe("Offline — retrying…");
  });

  it("flashes Connected after a visible drop, then hides", () => {
    const update = createConnectionPill();
    update("open");
    update("closed");
    vi.advanceTimersByTime(OFFLINE_PILL_DELAY_MS);
    expect(pillText()).toBe("Offline — retrying…");

    update("open");
    expect(pillText()).toBe("Connected");
    vi.advanceTimersByTime(1_500);
    expect(pillText()).toBeNull();
  });
});
