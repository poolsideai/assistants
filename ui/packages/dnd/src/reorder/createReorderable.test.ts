import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createReorderable } from "./createReorderable.js";
import type { ReorderableHandle } from "./types.js";

interface Row {
  top: number;
  height: number;
}

function buildZone(
  rows: Row[],
  { withHandle }: { withHandle: boolean },
): { zone: HTMLElement; items: HTMLElement[]; handles: HTMLElement[] } {
  const zone = document.createElement("div");
  const items: HTMLElement[] = [];
  const handles: HTMLElement[] = [];
  for (const row of rows) {
    const item = document.createElement("div");
    item.setAttribute("data-reorderable-item", "");
    const handle = document.createElement("button");
    if (withHandle) handle.setAttribute("data-reorderable-handle", "");
    item.appendChild(handle);
    item.getBoundingClientRect = () =>
      ({
        top: row.top,
        bottom: row.top + row.height,
        height: row.height,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: row.top,
        toJSON: () => ({}),
      }) as DOMRect;
    zone.appendChild(item);
    items.push(item);
    handles.push(handle);
  }
  document.body.appendChild(zone);
  return { zone, items, handles };
}

function fire(target: EventTarget, type: string, init: MouseEventInit = {}): MouseEvent {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, ...init });
  target.dispatchEvent(event);
  return event;
}

function buildThreeRowZone(withHandle: boolean) {
  return buildZone(
    [
      { top: 0, height: 30 },
      { top: 30, height: 30 },
      { top: 60, height: 30 },
    ],
    { withHandle },
  );
}

describe("createReorderable (pointer based)", () => {
  let handle: ReorderableHandle | null = null;

  beforeEach(() => {
    document.body.innerHTML = "";
  });
  afterEach(() => {
    handle?.destroy();
    handle = null;
  });

  it("commits a downward reorder dragged from the handle", () => {
    const { zone, items, handles } = buildThreeRowZone(true);
    const onReorder = vi.fn();
    const onDragStart = vi.fn();
    const onTargetChange = vi.fn();
    handle = createReorderable(zone, {
      handleSelector: "[data-reorderable-handle]",
      autoScrollThreshold: 0,
      onReorder,
      onDragStart,
      onTargetChange,
    });

    fire(handles[0], "pointerdown", { clientX: 10, clientY: 10 });
    // Below threshold: no drag yet.
    fire(window, "pointermove", { clientX: 10, clientY: 12 });
    expect(onDragStart).not.toHaveBeenCalled();

    // Past threshold, into the lower half of the last row -> after it.
    fire(window, "pointermove", { clientX: 10, clientY: 80 });
    expect(onDragStart).toHaveBeenCalledExactlyOnceWith(0);
    expect(items[0].hasAttribute("data-reorderable-dragging")).toBe(true);
    expect(onTargetChange).toHaveBeenLastCalledWith({ index: 2, edge: "after" });
    expect(items[2].getAttribute("data-reorderable-over")).toBe("after");

    fire(window, "pointerup", { clientX: 10, clientY: 80 });
    expect(onReorder).toHaveBeenCalledExactlyOnceWith(0, 2);
    expect(items[0].hasAttribute("data-reorderable-dragging")).toBe(false);
    expect(items[2].hasAttribute("data-reorderable-over")).toBe(false);
  });

  it("does not drag when the press starts outside the handle", () => {
    const { zone, items } = buildThreeRowZone(true);
    const onReorder = vi.fn();
    const onDragStart = vi.fn();
    handle = createReorderable(zone, {
      handleSelector: "[data-reorderable-handle]",
      autoScrollThreshold: 0,
      onReorder,
      onDragStart,
    });

    fire(items[0], "pointerdown", { clientX: 10, clientY: 10 }); // item body, not handle
    fire(window, "pointermove", { clientX: 10, clientY: 80 });
    fire(window, "pointerup", { clientX: 10, clientY: 80 });
    expect(onDragStart).not.toHaveBeenCalled();
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("reports pointer and item geometry while dragging", () => {
    const { zone, handles } = buildThreeRowZone(true);
    const onDragMove = vi.fn();
    handle = createReorderable(zone, {
      handleSelector: "[data-reorderable-handle]",
      autoScrollThreshold: 0,
      onReorder: vi.fn(),
      onDragMove,
    });

    fire(handles[0], "pointerdown", { clientX: 10, clientY: 10 });
    fire(window, "pointermove", { clientX: 14, clientY: 80 });

    expect(onDragMove).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        from: 0,
        clientX: 14,
        clientY: 80,
        pointerOffsetX: 10,
        pointerOffsetY: 10,
        itemRect: expect.objectContaining({ top: 0, left: 0, width: 100, height: 30 }),
        itemRects: [
          expect.objectContaining({ top: 0, height: 30 }),
          expect.objectContaining({ top: 30, height: 30 }),
          expect.objectContaining({ top: 60, height: 30 }),
        ],
      }),
    );
  });

  it("suppresses the click synthesised after a drag, but not a plain click", () => {
    const { zone, handles } = buildThreeRowZone(true);
    handle = createReorderable(zone, {
      handleSelector: "[data-reorderable-handle]",
      autoScrollThreshold: 0,
      onReorder: vi.fn(),
    });

    // Drag, then the trailing click is swallowed.
    fire(handles[0], "pointerdown", { clientX: 10, clientY: 10 });
    fire(window, "pointermove", { clientX: 10, clientY: 80 });
    fire(window, "pointerup", { clientX: 10, clientY: 80 });
    expect(fire(handles[0], "click").defaultPrevented).toBe(true);

    // A plain click (press + release, no movement) passes through.
    fire(handles[0], "pointerdown", { clientX: 10, clientY: 10 });
    fire(window, "pointerup", { clientX: 10, clientY: 10 });
    expect(fire(handles[0], "click").defaultPrevented).toBe(false);
  });

  it("cancels an in-progress drag on Escape", () => {
    const { zone, items, handles } = buildThreeRowZone(true);
    const onReorder = vi.fn();
    handle = createReorderable(zone, {
      handleSelector: "[data-reorderable-handle]",
      autoScrollThreshold: 0,
      onReorder,
    });

    fire(handles[0], "pointerdown", { clientX: 10, clientY: 10 });
    fire(window, "pointermove", { clientX: 10, clientY: 80 });
    expect(items[0].hasAttribute("data-reorderable-dragging")).toBe(true);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(items[0].hasAttribute("data-reorderable-dragging")).toBe(false);

    fire(window, "pointerup", { clientX: 10, clientY: 80 });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("drags from anywhere on the item in whole-item mode", () => {
    const { zone, items } = buildZone(
      [
        { top: 0, height: 30 },
        { top: 30, height: 30 },
      ],
      { withHandle: false },
    );
    const onReorder = vi.fn();
    handle = createReorderable(zone, { autoScrollThreshold: 0, onReorder });

    fire(items[1], "pointerdown", { clientX: 10, clientY: 45 });
    fire(window, "pointermove", { clientX: 10, clientY: 5 }); // up into first row's upper half
    fire(window, "pointerup", { clientX: 10, clientY: 5 });
    expect(onReorder).toHaveBeenCalledExactlyOnceWith(1, 0);
  });
});
