import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ConversationPreviewCoordinator,
  type ConversationPreviewAnchorTarget,
} from "./ConversationPreviewCoordinator";

interface Target extends ConversationPreviewAnchorTarget {
  label: string;
}

function target(key: string): Target {
  return { key, label: key, anchor: document.createElement("div") };
}

describe("ConversationPreviewCoordinator", () => {
  let changes: Array<Target | null>;
  let coordinator: ConversationPreviewCoordinator<Target>;

  beforeEach(() => {
    vi.useFakeTimers();
    changes = [];
    coordinator = new ConversationPreviewCoordinator({
      onTargetChange: (next) => changes.push(next),
    });
  });

  afterEach(() => {
    coordinator.destroy();
    vi.useRealTimers();
  });

  it("opens only after dwelling on the first row", () => {
    coordinator.rowEntered(target("one"), { x: 20, y: 20 });

    vi.advanceTimersByTime(399);
    expect(changes).toEqual([]);

    vi.advanceTimersByTime(1);
    expect(changes.at(-1)?.key).toBe("one");
  });

  it("cancels a pending preview when the pointer leaves", () => {
    coordinator.rowEntered(target("one"), { x: 20, y: 20 });
    coordinator.rowLeft("one");
    vi.runAllTimers();

    expect(changes).toEqual([]);
  });

  it("uses one short dwell to retarget an open preview", () => {
    coordinator.rowEntered(target("one"), { x: 20, y: 20 });
    vi.advanceTimersByTime(400);

    coordinator.rowLeft("one");
    coordinator.rowEntered(target("two"), { x: 20, y: 40 });
    vi.advanceTimersByTime(119);
    expect(changes.at(-1)?.key).toBe("one");

    vi.advanceTimersByTime(1);
    expect(changes.at(-1)?.key).toBe("two");
  });

  it("keeps the open preview while crossing rows toward it", () => {
    coordinator.rowEntered(target("one"), { x: 20, y: 100 });
    vi.advanceTimersByTime(400);

    const popover = document.createElement("div");
    vi.spyOn(popover, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 50,
      right: 300,
      bottom: 250,
    } as DOMRect);
    coordinator.setPopoverElement(popover);
    coordinator.pointerMoved({ x: 20, y: 100 });

    coordinator.rowLeft("one");
    coordinator.rowEntered(target("two"), { x: 60, y: 120 });
    vi.advanceTimersByTime(299);
    expect(changes.at(-1)?.key).toBe("one");

    vi.advanceTimersByTime(1);
    expect(changes.at(-1)?.key).toBe("two");
  });

  it("closes after leaving rows and the preview", () => {
    coordinator.rowEntered(target("one"), { x: 20, y: 20 });
    vi.advanceTimersByTime(400);
    coordinator.rowLeft("one");

    vi.advanceTimersByTime(299);
    expect(changes.at(-1)?.key).toBe("one");

    vi.advanceTimersByTime(1);
    expect(changes.at(-1)).toBeNull();
  });

  it("does not close in the gap between two rows", () => {
    coordinator.rowEntered(target("one"), { x: 20, y: 20 });
    vi.advanceTimersByTime(400);
    coordinator.rowLeft("one");
    vi.advanceTimersByTime(100);
    coordinator.rowEntered(target("two"), { x: 20, y: 40 });
    vi.advanceTimersByTime(120);

    expect(changes.map((change) => change?.key ?? null)).toEqual(["one", "two"]);
  });
});
