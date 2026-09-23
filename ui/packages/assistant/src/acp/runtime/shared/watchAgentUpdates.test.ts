import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchAgentUpdates } from "./watchAgentUpdates";

const INTERVAL = 5 * 60 * 1000;

describe("watchAgentUpdates", () => {
  let stop = () => {};
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  });
  afterEach(() => {
    stop();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("checks at startup and periodically, throttles focus bursts, and stops on teardown", async () => {
    const check = vi.fn(async () => {});
    stop = watchAgentUpdates(check);
    await vi.advanceTimersByTimeAsync(0);
    expect(check).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
    expect(check).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(INTERVAL);
    expect(check).toHaveBeenCalledTimes(2);
    stop();
    await vi.advanceTimersByTimeAsync(INTERVAL);
    window.dispatchEvent(new Event("focus"));
    expect(check).toHaveBeenCalledTimes(2);
  });

  it("skips hidden windows and catches up when they become visible", async () => {
    const check = vi.fn(async () => {});
    stop = watchAgentUpdates(check);
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    await vi.advanceTimersByTimeAsync(INTERVAL * 2);
    expect(check).toHaveBeenCalledTimes(1);
    vi.spyOn(document, "hidden", "get").mockReturnValue(false);
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("focus"));
    expect(check).toHaveBeenCalledTimes(2);
  });

  it("does not overlap slow checks and retries failures on the next interval", async () => {
    let reject!: (error: Error) => void;
    const check = vi.fn(
      () =>
        new Promise<void>((_, fail) => {
          reject = fail;
        }),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});
    stop = watchAgentUpdates(check);
    await vi.advanceTimersByTimeAsync(INTERVAL * 2);
    expect(check).toHaveBeenCalledTimes(1);
    reject(new Error("offline"));
    await vi.advanceTimersByTimeAsync(INTERVAL);
    expect(check).toHaveBeenCalledTimes(2);
  });
});
