import { afterEach, describe, expect, it, vi } from "vitest";
import { UNDO_COUNTDOWN_SECONDS, UndoCountdown } from "./undoCountdown";

describe("UndoCountdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses a three-second grace period by default", () => {
    vi.useFakeTimers();
    const onRemainingChange = vi.fn();
    const onExpire = vi.fn();
    const countdown = new UndoCountdown(onRemainingChange);

    countdown.start("key", onExpire);
    expect(onRemainingChange).toHaveBeenLastCalledWith("key", 3);

    vi.advanceTimersByTime(1000);
    expect(onRemainingChange).toHaveBeenLastCalledWith("key", 2);

    vi.advanceTimersByTime(1000);
    expect(onRemainingChange).toHaveBeenLastCalledWith("key", 1);

    vi.advanceTimersByTime(1000);
    expect(onExpire).toHaveBeenCalledOnce();
    expect(UNDO_COUNTDOWN_SECONDS).toBe(3);
  });

  it("counts down independent keys", () => {
    vi.useFakeTimers();
    const remaining: Record<string, number> = {};
    const countdown = new UndoCountdown((key, value) => {
      if (value === undefined) delete remaining[key];
      else remaining[key] = value;
    }, 2);

    countdown.start("first", vi.fn());
    vi.advanceTimersByTime(1000);
    countdown.start("second", vi.fn());

    expect(remaining).toEqual({ first: 1, second: 2 });
  });

  it("ignores duplicate starts for a pending key", () => {
    vi.useFakeTimers();
    const firstExpire = vi.fn();
    const secondExpire = vi.fn();
    const countdown = new UndoCountdown(() => {}, 2);

    countdown.start("key", firstExpire);
    vi.advanceTimersByTime(1000);
    countdown.start("key", secondExpire);
    vi.advanceTimersByTime(1000);

    expect(firstExpire).toHaveBeenCalledOnce();
    expect(secondExpire).not.toHaveBeenCalled();
  });

  it("cancels a pending countdown", () => {
    vi.useFakeTimers();
    const onRemainingChange = vi.fn();
    const onExpire = vi.fn();
    const countdown = new UndoCountdown(onRemainingChange, 2);

    countdown.start("key", onExpire);
    countdown.cancel("key");
    vi.advanceTimersByTime(2000);

    expect(onExpire).not.toHaveBeenCalled();
    expect(onRemainingChange).toHaveBeenLastCalledWith("key", undefined);
  });

  it("expires once and clears the key", () => {
    vi.useFakeTimers();
    const onRemainingChange = vi.fn();
    const onExpire = vi.fn();
    const countdown = new UndoCountdown(onRemainingChange, 2);

    countdown.start("key", onExpire);
    vi.advanceTimersByTime(5000);

    expect(onExpire).toHaveBeenCalledOnce();
    expect(onRemainingChange).toHaveBeenLastCalledWith("key", undefined);
  });

  it("destroys all pending timers", () => {
    vi.useFakeTimers();
    const onRemainingChange = vi.fn();
    const firstExpire = vi.fn();
    const secondExpire = vi.fn();
    const countdown = new UndoCountdown(onRemainingChange, 2);

    countdown.start("first", firstExpire);
    countdown.start("second", secondExpire);
    countdown.destroy();
    vi.advanceTimersByTime(2000);

    expect(firstExpire).not.toHaveBeenCalled();
    expect(secondExpire).not.toHaveBeenCalled();
    expect(onRemainingChange).toHaveBeenCalledWith("first", undefined);
    expect(onRemainingChange).toHaveBeenCalledWith("second", undefined);
    expect(vi.getTimerCount()).toBe(0);
  });
});
