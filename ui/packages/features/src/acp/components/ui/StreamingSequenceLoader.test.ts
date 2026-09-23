import { render, screen } from "@testing-library/svelte";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import StreamingSequenceLoader from "./StreamingSequenceLoader.svelte";

function read(packageRelativePath: string): string {
  return readFileSync(packageRelativePath, "utf-8");
}

function webpLosslessDimensions(bytes: Buffer): { width: number; height: number } {
  expect(bytes.toString("ascii", 0, 4)).toBe("RIFF");
  expect(bytes.toString("ascii", 8, 12)).toBe("WEBP");
  expect(bytes.toString("ascii", 12, 16)).toBe("VP8L");
  expect(bytes[20]).toBe(0x2f);

  const sizeBits = bytes.readUInt32LE(21);
  return {
    width: (sizeBits & 0x3fff) + 1,
    height: ((sizeBits >> 14) & 0x3fff) + 1,
  };
}

describe("StreamingSequenceLoader performance invariants", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("uses a pre-rendered sprite with a non-catching-up frame clock", () => {
    const source = read("src/acp/components/ui/StreamingSequenceLoader.svelte");

    expect(source).toContain("streaming-sequence-loader-sprite.webp");
    expect(source).toContain("setTimeout(advanceFrame, FRAME_INTERVAL_MS)");
    expect(source).not.toContain("steps(321)");
    expect(source).not.toContain("<svg");
    expect(source).not.toContain("<circle");
  });

  it("schedules one sprite frame at a time and clears the timer on unmount", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.stubGlobal("matchMedia", () => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const rendered = render(StreamingSequenceLoader, { props: { size: 16 } });
    const loader = screen.getByRole("img", { name: "Working" });

    expect(vi.getTimerCount()).toBe(1);
    expect(loader).toHaveAttribute("data-playing", "true");

    vi.advanceTimersToNextTimer();
    expect(vi.getTimerCount()).toBe(1);

    vi.advanceTimersToNextTimer();
    expect(vi.getTimerCount()).toBe(1);

    rendered.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps the checked-in sprite dimensions in sync with the component constants", () => {
    const sprite = readFileSync("src/acp/components/ui/streaming-sequence-loader-sprite.webp");

    expect(webpLosslessDimensions(sprite)).toEqual({ width: 15456, height: 48 });
  });
});
