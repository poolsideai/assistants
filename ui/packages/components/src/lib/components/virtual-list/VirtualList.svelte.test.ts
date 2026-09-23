import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { beforeAll, describe, expect, it, vi } from "vitest";
import Harness from "./VirtualList.test.svelte";

// jsdom performs no layout (scrollHeight/clientHeight are 0 and ResizeObserver
// never fires), so the windowed spacer math needs a real browser. Here we test
// what is verifiable: the flow (non-windowed) path renders every row, and the
// windowed path mounts without throwing.
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  );
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    setTimeout(() => cb(performance.now()), 0);
    return 0;
  });
});

function items(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: `i-${i}` }));
}

function rect(top: number, bottom: number): DOMRect {
  return { top, bottom } as DOMRect;
}

describe("VirtualList", () => {
  it("renders every row and does not window without a scrollElement", () => {
    const { container } = render(Harness, { props: { items: items(20) } });
    expect(container.querySelector(".virtual-list--windowed")).toBeNull();
    expect(container.querySelectorAll(".virtual-list__row")).toHaveLength(20);
  });

  it("renders everything when disabled, even with a scrollElement above threshold", () => {
    const { container } = render(Harness, {
      props: { items: items(20), scrollElement: document.createElement("div"), enabled: false },
    });
    expect(container.querySelector(".virtual-list--windowed")).toBeNull();
    expect(container.querySelectorAll(".virtual-list__row")).toHaveLength(20);
  });

  it("windows (wraps in .virtual-list--windowed) above threshold with a scrollElement", () => {
    const { container } = render(Harness, {
      props: { items: items(20), scrollElement: document.createElement("div") },
    });
    // The meaningful assertion for jsdom: windowing is engaged (the container is
    // present). Pixel-accurate row counts need a real browser — jsdom reports a
    // zero-size viewport/scrollHeight, which pins to the bottom and renders all.
    expect(container.querySelector(".virtual-list--windowed")).not.toBeNull();
  });

  it("uses a stable per-item height estimate when rows have different formats", () => {
    const estimateHeight = vi.fn((_item: { id: string }, index: number) => 40 + index * 10);
    render(Harness, {
      props: {
        items: items(20),
        scrollElement: document.createElement("div"),
        estimateHeight,
      },
    });

    expect(estimateHeight).toHaveBeenCalledWith({ id: "i-0" }, 0);
  });

  it("disables native anchoring when explicit scroll preservation is enabled", () => {
    const { container } = render(Harness, {
      props: {
        items: items(20),
        scrollElement: document.createElement("div"),
        preserveScrollAnchor: true,
      },
    });

    expect(container.querySelector(".virtual-list--manual-anchor")).not.toBeNull();
  });

  it("mounts when its window is relative to a shared ancestor scroller", () => {
    const { container } = render(Harness, {
      props: {
        items: items(20),
        scrollElement: document.createElement("div"),
        relativeToScrollElement: true,
      },
    });

    expect(container.querySelector(".virtual-list--windowed")).not.toBeNull();
  });

  it("scrolls to a key using the same estimated heights as its spacers", async () => {
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 0, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 5_000 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const estimateHeight = (_item: { id: string }, index: number) => 40 + index * 10;
    const { component, container } = render(Harness, {
      props: { items: items(20), scrollElement, estimateHeight },
    });
    const root = container.querySelector<HTMLElement>(".virtual-list");
    expect(root).not.toBeNull();
    if (root) {
      root.getBoundingClientRect = () => rect(-scrollElement.scrollTop, 5_000);
    }
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      const index = Number.parseInt(row.dataset["vkey"]?.slice(2) ?? "0", 10);
      const absoluteTop = Array.from(
        { length: index },
        (_, itemIndex) => 40 + itemIndex * 10,
      ).reduce((sum, height) => sum + height, 0);
      row.getBoundingClientRect = () => {
        const currentTop = absoluteTop - scrollElement.scrollTop;
        return rect(currentTop, currentTop + 40 + index * 10);
      };
    }

    await expect(component.scrollToKey("i-10", { offsetPx: 20 })).resolves.toBe(true);

    // 40 + 50 + ... + 130 = 850; keep the row 20px below the viewport top.
    expect(scrollElement.scrollTop).toBe(830);

    scrollElement.dispatchEvent(new WheelEvent("wheel"));
    scrollElement.scrollTop = 900;
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scrollElement.scrollTop).toBe(900);
  });

  it("keeps the newest keyed scroll active when an older request resumes", async () => {
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 0, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 5_000 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { component, container, unmount } = render(Harness, {
      props: {
        items: items(20),
        scrollElement,
        estimateHeight: 100,
        enabled: false,
      },
    });
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      const index = Number.parseInt(row.dataset["vkey"]?.slice(2) ?? "0", 10);
      row.getBoundingClientRect = () =>
        rect(index * 100 - scrollElement.scrollTop, (index + 1) * 100 - scrollElement.scrollTop);
    }

    const first = component.scrollToKey("i-10");
    const second = component.scrollToKey("i-11");

    await expect(first).resolves.toBe(false);
    await expect(second).resolves.toBe(true);
    expect(scrollElement.scrollTop).toBe(1_100);
    unmount();
  });

  it("lets user input cancel correction when the list is not windowed", async () => {
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 0, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 500 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { component, container, unmount } = render(Harness, {
      props: {
        items: items(3),
        scrollElement,
        estimateHeight: 100,
      },
    });
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      const index = Number.parseInt(row.dataset["vkey"]?.slice(2) ?? "0", 10);
      row.getBoundingClientRect = () =>
        rect(index * 100 - scrollElement.scrollTop, (index + 1) * 100 - scrollElement.scrollTop);
    }

    await component.scrollToKey("i-2");
    expect(scrollElement.scrollTop).toBe(200);

    scrollElement.dispatchEvent(new WheelEvent("wheel"));
    scrollElement.scrollTop = 50;
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(scrollElement.scrollTop).toBe(50);
    unmount();
  });

  it("defers mounting a distant target until the container has a scroll range", async () => {
    let scrollHeight = 100;
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 0, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, get: () => scrollHeight },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { component, container, rerender, unmount } = render(Harness, {
      props: {
        items: items(100),
        scrollElement,
        estimateHeight: 100,
        overscanPx: 0,
      },
    });

    // Let mount-time list-offset work finish so only target corrections count.
    await new Promise((resolve) => setTimeout(resolve, 20));
    const rafSpy = vi.spyOn(globalThis, "requestAnimationFrame");
    rafSpy.mockClear();
    try {
      await expect(component.scrollToKey("i-99")).resolves.toBe(true);

      expect(container.querySelectorAll(".virtual-list__row").length).toBeLessThan(10);
      expect(container.querySelector('[data-vkey="i-99"]')).not.toBeInTheDocument();
      expect(scrollElement.scrollTop).toBe(0);

      // A hidden target waits for a layout/content signal instead of polling.
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(rafSpy).not.toHaveBeenCalled();

      scrollHeight = 20_000;
      await rerender({ items: [{ id: "inserted" }, ...items(100)] });
      await vi.waitFor(() => expect(scrollElement.scrollTop).toBe(10_000));
    } finally {
      rafSpy.mockRestore();
      unmount();
    }
  });

  it("rechecks live scroll geometry when content changes without a scroll event", async () => {
    let scrollHeight = 100;
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 0, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, get: () => scrollHeight },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { container, rerender } = render(Harness, {
      props: {
        items: items(20),
        scrollElement,
        estimateHeight: 100,
        overscanPx: 0,
      },
    });

    expect(container.querySelector('[data-vkey="i-19"]')).not.toBeInTheDocument();

    scrollHeight = 2_100;
    scrollElement.scrollTop = 2_000;
    await rerender({ items: items(21) });

    await vi.waitFor(() =>
      expect(container.querySelector('[data-vkey="i-20"]')).toBeInTheDocument(),
    );
  });

  it("moves the viewport before forcing a distant target into the window", async () => {
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 0, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 20_000 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { component, container } = render(Harness, {
      props: {
        items: items(100),
        scrollElement,
        estimateHeight: 100,
        overscanPx: 0,
      },
    });

    const scrolling = component.scrollToKey("i-99");
    await tick();

    expect(container.querySelectorAll(".virtual-list__row").length).toBeLessThan(10);
    await expect(scrolling).resolves.toBe(true);
  });

  it("preserves the visible group when its exact anchor row is replaced", async () => {
    const oldItems = [
      { id: "a-0", group: "a" },
      { id: "a-1", group: "a" },
      { id: "b-old", group: "b" },
      { id: "b-tail", group: "b" },
      { id: "c-0", group: "c" },
      { id: "c-1", group: "c" },
      { id: "c-2", group: "c" },
      { id: "c-3", group: "c" },
    ];
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 225, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1_200 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { container, rerender } = render(Harness, {
      props: {
        items: oldItems,
        scrollElement,
        estimateHeight: 100,
        preserveScrollAnchor: true,
        groupAnchors: true,
      },
    });
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      const index = oldItems.findIndex((item) => item.id === row.dataset["vkey"]);
      row.getBoundingClientRect = () =>
        rect(index * 100 - scrollElement.scrollTop, (index + 1) * 100 - scrollElement.scrollTop);
    }

    await rerender({
      items: [
        { id: "a-0", group: "a" },
        { id: "a-1", group: "a" },
        { id: "a-2", group: "a" },
        { id: "a-3", group: "a" },
        { id: "b-new", group: "b" },
        { id: "b-tail", group: "b" },
        { id: "c-0", group: "c" },
        { id: "c-1", group: "c" },
      ],
    });

    // The old anchor was 25px into group b. Its replacement group starts at 400.
    await vi.waitFor(() => expect(scrollElement.scrollTop).toBe(425));
  });

  it("preserves an exact anchor by key when an update recycles its row", async () => {
    const oldItems = items(100);
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 5_000, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 20_000 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { container, rerender } = render(Harness, {
      props: {
        items: oldItems,
        scrollElement,
        estimateHeight: 100,
        overscanPx: 0,
        preserveScrollAnchor: true,
      },
    });
    const root = container.querySelector<HTMLElement>(".virtual-list");
    expect(root).not.toBeNull();
    if (root) {
      root.getBoundingClientRect = () =>
        rect(-scrollElement.scrollTop, 20_000 - scrollElement.scrollTop);
    }
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      const index = oldItems.findIndex((item) => item.id === row.dataset["vkey"]);
      row.getBoundingClientRect = () =>
        rect(index * 100 - scrollElement.scrollTop, (index + 1) * 100 - scrollElement.scrollTop);
    }

    await rerender({
      items: [
        ...Array.from({ length: 20 }, (_, index) => ({ id: `inserted-${index}` })),
        ...oldItems,
      ],
    });

    // The surviving i-50 anchor moved from model offset 5,000 to 7,000 and was
    // outside the newly computed window before restoration.
    await vi.waitFor(() => expect(scrollElement.scrollTop).toBe(7_000));
  });

  it("preserves an exact anchor when same-key item objects are replaced", async () => {
    const oldItems = [
      { id: "a-0" },
      { id: "a-1" },
      { id: "visible" },
      { id: "tail-0" },
      { id: "tail-1" },
      { id: "tail-2" },
      { id: "tail-3" },
      { id: "tail-4" },
    ];
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 225, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1_200 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { container, rerender } = render(Harness, {
      props: {
        items: oldItems,
        scrollElement,
        estimateHeight: 100,
        preserveScrollAnchor: true,
      },
    });

    function rowHeight(row: HTMLElement): number {
      return row.dataset["vkey"] === "a-0" && row.textContent?.includes("grown") ? 200 : 100;
    }
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      row.getBoundingClientRect = () => {
        const rows = Array.from(container.querySelectorAll<HTMLElement>(".virtual-list__row"));
        const index = rows.indexOf(row);
        const top =
          rows.slice(0, index).reduce((sum, item) => sum + rowHeight(item), 0) -
          scrollElement.scrollTop;
        return rect(top, top + rowHeight(row));
      };
    }

    await rerender({
      items: oldItems.map((item) => ({
        ...item,
        label: item.id === "a-0" ? "grown" : undefined,
      })),
    });

    await vi.waitFor(() => expect(scrollElement.scrollTop).toBe(325));
  });

  it("does not replay an anchor over a scrollbar drag in progress (PE-2454)", async () => {
    // A detached reader drags the scrollbar down through unmeasured rows.
    // Each newly mounted row's measurement captures an anchor and queues a
    // restore; before the fix, that restore rewound the drag ("snaps back").
    const oldItems = [
      { id: "a-0" },
      { id: "a-1" },
      { id: "visible" },
      { id: "tail-0" },
      { id: "tail-1" },
      { id: "tail-2" },
      { id: "tail-3" },
      { id: "tail-4" },
    ];
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 225, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1_200 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { container, rerender } = render(Harness, {
      props: {
        items: oldItems,
        scrollElement,
        estimateHeight: 100,
        preserveScrollAnchor: true,
      },
    });

    function rowHeight(row: HTMLElement): number {
      return row.dataset["vkey"] === "a-0" && row.textContent?.includes("grown") ? 200 : 100;
    }
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      row.getBoundingClientRect = () => {
        const rows = Array.from(container.querySelectorAll<HTMLElement>(".virtual-list__row"));
        const index = rows.indexOf(row);
        const top =
          rows.slice(0, index).reduce((sum, item) => sum + rowHeight(item), 0) -
          scrollElement.scrollTop;
        return rect(top, top + rowHeight(row));
      };
    }

    // Grab the scrollbar thumb, then drag downward while an item update lands.
    scrollElement.dispatchEvent(new Event("pointerdown"));
    await rerender({
      items: oldItems.map((item) => ({
        ...item,
        label: item.id === "a-0" ? "grown" : undefined,
      })),
    });
    scrollElement.scrollTop = 700;
    scrollElement.dispatchEvent(new Event("scroll"));

    // Without the guard, restoreVisibleAnchor would rewind scrollTop to 325.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scrollElement.scrollTop).toBe(700);
  });

  it("skips an anchor restore when user input arrived after the capture", async () => {
    const oldItems = [
      { id: "a-0" },
      { id: "a-1" },
      { id: "visible" },
      { id: "tail-0" },
      { id: "tail-1" },
      { id: "tail-2" },
      { id: "tail-3" },
      { id: "tail-4" },
    ];
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 225, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1_200 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { container, rerender } = render(Harness, {
      props: {
        items: oldItems,
        scrollElement,
        estimateHeight: 100,
        preserveScrollAnchor: true,
      },
    });

    function rowHeight(row: HTMLElement): number {
      return row.dataset["vkey"] === "a-0" && row.textContent?.includes("grown") ? 200 : 100;
    }
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      row.getBoundingClientRect = () => {
        const rows = Array.from(container.querySelectorAll<HTMLElement>(".virtual-list__row"));
        const index = rows.indexOf(row);
        const top =
          rows.slice(0, index).reduce((sum, item) => sum + rowHeight(item), 0) -
          scrollElement.scrollTop;
        return rect(top, top + rowHeight(row));
      };
    }

    // The anchor is captured by the item update; a wheel lands right after,
    // before the queued restore runs — the restore must yield to the user.
    await rerender({
      items: oldItems.map((item) => ({
        ...item,
        label: item.id === "a-0" ? "grown" : undefined,
      })),
    });
    scrollElement.dispatchEvent(new WheelEvent("wheel", { deltaY: 10 }));
    scrollElement.scrollTop = 500;
    scrollElement.dispatchEvent(new Event("scroll"));

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scrollElement.scrollTop).toBe(500);
  });

  it("still restores an anchor when the user is idle", async () => {
    // Parity check for the guard: the pre-existing restore behaviour (same-key
    // replacement grows a row above the viewport) must be unaffected when no
    // user input is in flight.
    const oldItems = [{ id: "a-0" }, { id: "a-1" }, { id: "visible" }, { id: "tail-0" }];
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 225, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1_200 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { container, rerender } = render(Harness, {
      props: {
        items: oldItems,
        scrollElement,
        estimateHeight: 100,
        preserveScrollAnchor: true,
      },
    });

    function rowHeight(row: HTMLElement): number {
      return row.dataset["vkey"] === "a-0" && row.textContent?.includes("grown") ? 200 : 100;
    }
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      row.getBoundingClientRect = () => {
        const rows = Array.from(container.querySelectorAll<HTMLElement>(".virtual-list__row"));
        const index = rows.indexOf(row);
        const top =
          rows.slice(0, index).reduce((sum, item) => sum + rowHeight(item), 0) -
          scrollElement.scrollTop;
        return rect(top, top + rowHeight(row));
      };
    }

    await rerender({
      items: oldItems.map((item) => ({
        ...item,
        label: item.id === "a-0" ? "grown" : undefined,
      })),
    });

    await vi.waitFor(() => expect(scrollElement.scrollTop).toBe(325));
  });

  it("cancels a queued anchor restore when the caller reattaches to the bottom", async () => {
    const oldItems = [
      { id: "a-0" },
      { id: "a-1" },
      { id: "visible" },
      { id: "tail-0" },
      { id: "tail-1" },
      { id: "tail-2" },
      { id: "tail-3" },
      { id: "tail-4" },
    ];
    const scrollElement = document.createElement("div");
    Object.defineProperties(scrollElement, {
      scrollTop: { configurable: true, value: 225, writable: true },
      clientHeight: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1_200 },
    });
    scrollElement.getBoundingClientRect = () => rect(0, 100);
    const { container, rerender } = render(Harness, {
      props: {
        items: oldItems,
        scrollElement,
        estimateHeight: 100,
        preserveScrollAnchor: true,
      },
    });

    function rowHeight(row: HTMLElement): number {
      return row.dataset["vkey"] === "a-0" && row.textContent?.includes("grown") ? 200 : 100;
    }
    for (const row of container.querySelectorAll<HTMLElement>(".virtual-list__row")) {
      row.getBoundingClientRect = () => {
        const rows = Array.from(container.querySelectorAll<HTMLElement>(".virtual-list__row"));
        const index = rows.indexOf(row);
        const top =
          rows.slice(0, index).reduce((sum, item) => sum + rowHeight(item), 0) -
          scrollElement.scrollTop;
        return rect(top, top + rowHeight(row));
      };
    }

    // A detached transcript queues restoration of its visible row while a
    // same-key update settles. Sending a message reattaches and scrolls to the
    // bottom before that async restoration resumes.
    await rerender({
      items: oldItems.map((item) => ({
        ...item,
        label: item.id === "a-0" ? "grown" : undefined,
      })),
      preserveScrollAnchor: true,
    });
    scrollElement.scrollTop = 1_100;
    await rerender({
      items: oldItems.map((item) => ({
        ...item,
        label: item.id === "a-0" ? "grown" : undefined,
      })),
      preserveScrollAnchor: false,
    });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(scrollElement.scrollTop).toBe(1_100);
  });
});
