import { describe, expect, it } from "vitest";
import { computeVirtualWindow } from "./virtualWindow.js";

// Uniform-height helper: every item is `h` tall.
function uniform(count: number, h: number) {
  return (i: number) => (i >= 0 && i < count ? h : 0);
}

describe("computeVirtualWindow", () => {
  it("returns an empty window for an empty list", () => {
    expect(
      computeVirtualWindow({
        count: 0,
        heightFor: () => 100,
        scrollTop: 0,
        viewportHeight: 500,
        overscanPx: 0,
        pinEnd: false,
      }),
    ).toEqual({ start: 0, end: -1, topPad: 0, bottomPad: 0 });
  });

  it("windows uniform items at the top (scrollTop 0, no overscan)", () => {
    const win = computeVirtualWindow({
      count: 100,
      heightFor: uniform(100, 100),
      scrollTop: 0,
      viewportHeight: 500,
      overscanPx: 0,
      pinEnd: false,
    });
    expect(win.start).toBe(0);
    expect(win.end).toBe(4); // items 0..4 overlap [0, 500); item 5 starts at 500
    expect(win.topPad).toBe(0);
    expect(win.bottomPad).toBe((100 - 5) * 100);
  });

  it("shifts the window when scrolled into the middle", () => {
    const win = computeVirtualWindow({
      count: 100,
      heightFor: uniform(100, 100),
      scrollTop: 5000, // item 50 at the top
      viewportHeight: 500,
      overscanPx: 0,
      pinEnd: false,
    });
    expect(win.start).toBe(50);
    expect(win.topPad).toBe(5000);
    expect(win.end).toBe(54); // items 50..54 overlap [5000, 5500)
  });

  it("overscan widens the rendered range", () => {
    const tight = computeVirtualWindow({
      count: 100,
      heightFor: uniform(100, 100),
      scrollTop: 5000,
      viewportHeight: 500,
      overscanPx: 0,
      pinEnd: false,
    });
    const loose = computeVirtualWindow({
      count: 100,
      heightFor: uniform(100, 100),
      scrollTop: 5000,
      viewportHeight: 500,
      overscanPx: 300,
      pinEnd: false,
    });
    expect(loose.start).toBeLessThan(tight.start);
    expect(loose.end).toBeGreaterThan(tight.end);
  });

  it("pinEnd extends end to the last item and zeroes bottomPad", () => {
    const win = computeVirtualWindow({
      count: 100,
      heightFor: uniform(100, 100),
      scrollTop: 9500, // near the bottom
      viewportHeight: 500,
      overscanPx: 0,
      pinEnd: true,
    });
    expect(win.end).toBe(99);
    expect(win.bottomPad).toBe(0);
  });

  it("pinEnd at scrollTop 0 mounts the whole list — why the caller must gate the pin", () => {
    // This documents the hazard behind VirtualList's `laidOut` gate: pinEnd
    // forces end to the last item, and at scrollTop 0 start is also 0, so the
    // window is the entire list. VirtualList must therefore never set pinEnd on
    // the cold-mount frame (where scrollHeight hasn't yet reflected the list and
    // `nearBottom` spuriously reads true). Without the pin, the same geometry
    // yields a small top window.
    const shared = {
      count: 1000,
      heightFor: uniform(1000, 100),
      scrollTop: 0,
      viewportHeight: 800,
      overscanPx: 0,
    };
    const pinned = computeVirtualWindow({ ...shared, pinEnd: true });
    expect(pinned.start).toBe(0);
    expect(pinned.end).toBe(999); // the entire transcript in one frame

    const unpinned = computeVirtualWindow({ ...shared, pinEnd: false });
    expect(unpinned.start).toBe(0);
    expect(unpinned.end).toBe(7); // items 0..7 overlap [0, 800); bounded window
  });

  it("never returns an empty range when count > 0", () => {
    const win = computeVirtualWindow({
      count: 10,
      heightFor: uniform(10, 100),
      scrollTop: 99999, // far below all content
      viewportHeight: 500,
      overscanPx: 0,
      pinEnd: false,
    });
    expect(win.end).toBeGreaterThanOrEqual(win.start);
  });

  it("keeps topPad + rendered + bottomPad == total height (variable heights)", () => {
    const heights = [80, 400, 120, 60, 900, 200, 40, 300, 150, 500];
    const total = heights.reduce((a, b) => a + b, 0);
    for (const scrollTop of [0, 700, 1500, total]) {
      const win = computeVirtualWindow({
        count: heights.length,
        heightFor: (i) => heights[i],
        scrollTop,
        viewportHeight: 600,
        overscanPx: 100,
        pinEnd: false,
      });
      let rendered = 0;
      for (let i = win.start; i <= win.end; i++) rendered += heights[i];
      expect(win.topPad + rendered + win.bottomPad).toBe(total);
    }
  });
});
