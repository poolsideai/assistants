import { render } from "@testing-library/svelte";
import { beforeAll, describe, expect, it, vi } from "vitest";
import SessionEventsRendererHarness from "./SessionEventsRenderer.test.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { VIRTUALIZE_THRESHOLD } from "./chat/threadVirtualization";

// jsdom does not perform layout, so ResizeObserver callbacks never fire and
// scrollHeight/clientHeight stay at 0. The windowed path therefore cannot be
// verified for pixel-accurate spacer math in unit tests — that requires a real
// browser (VirtualList has its own tests). This file verifies the ACP wiring:
//   1. Without a scrollElement, every row renders and nothing is windowed.
//   2. The component mounts without throwing.

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

__POOL_SYNTHETIC_IMPORT_BASELINE__
  return Array.from({ length: count }, (_, i) => ({
    id: `event-${i}`,
    kind: "event" as const,
    index: i,
    event: {
      eventKind: "user_message" as const,
      messageId: `m-${i}`,
      content: [{ type: "text" as const, text: `Message ${i}` }],
    },
  }));
}

describe("SessionEventsRenderer virtualization", () => {
  it("renders every row and does not window when no scrollElement is provided", () => {
    const count = VIRTUALIZE_THRESHOLD - 1;
    const { container } = render(SessionEventsRendererHarness, {
      props: { events: [], items: makeItems(count) },
    });

    expect(container.querySelector(".virtual-list--windowed")).toBeNull();
    expect(container.querySelectorAll(".virtual-list__row")).toHaveLength(count);
  });

  it("renders every row even above the threshold when no scrollElement is provided", () => {
    // Windowing stays off without a scroll element, regardless of item count.
    const count = VIRTUALIZE_THRESHOLD + 10;
    const { container } = render(SessionEventsRendererHarness, {
      props: { events: [], items: makeItems(count) },
    });

    expect(container.querySelector(".virtual-list--windowed")).toBeNull();
    expect(container.querySelectorAll(".virtual-list__row")).toHaveLength(count);
  });

  it("does not throw when mounted without a scrollElement", () => {
    expect(() => {
      render(SessionEventsRendererHarness, {
        props: { events: [], items: makeItems(5) },
      });
    }).not.toThrow();
  });

  it("uses explicit scroll anchoring for a detached windowed transcript", () => {
    const { container } = render(SessionEventsRendererHarness, {
      props: {
        events: [],
        items: makeItems(VIRTUALIZE_THRESHOLD + 10),
        scrollElement: document.createElement("div"),
        preserveScrollAnchor: true,
      },
    });

    expect(container.querySelector(".virtual-list--windowed")).not.toBeNull();
    expect(container.querySelector(".virtual-list--manual-anchor")).not.toBeNull();
  });
});
