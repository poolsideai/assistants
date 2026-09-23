import { fireEvent, render } from "@testing-library/svelte";
import { createRawSnippet, tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChatProgress from "./ChatProgress.svelte";

class MockMutationObserver {
  static instances: MockMutationObserver[] = [];

  observe = vi.fn();
  disconnect = vi.fn();

  constructor(readonly callback: MutationCallback) {
    MockMutationObserver.instances.push(this);
  }

  takeRecords(): MutationRecord[] {
    return [];
  }
}

function contentSnippet() {
  return createRawSnippet(() => ({
    render: () => "<p>Long-running thought</p>",
  }));
}

describe("ChatProgress", () => {
  beforeEach(() => {
    MockMutationObserver.instances = [];
    vi.stubGlobal("MutationObserver", MockMutationObserver);
  });

  afterEach(() => vi.unstubAllGlobals());

  it("limits expanded height and tears down pinned-scroll resources when collapsed", async () => {
    const { container, getByRole } = render(ChatProgress, {
      props: { children: contentSnippet() },
    });
    const scrollElement = container.querySelector<HTMLDivElement>(".thinking-container")!;
    scrollElement.scrollTo = vi.fn();
    const addEventListener = vi.spyOn(scrollElement, "addEventListener");
    const removeEventListener = vi.spyOn(scrollElement, "removeEventListener");

    // Collapsed thoughts carry no per-block listeners or observers.
    expect(MockMutationObserver.instances).toHaveLength(0);

    await fireEvent.click(getByRole("button", { name: /think/i }));
    await tick();

    expect(scrollElement).toHaveClass("max-h-[300px]", "overflow-y-auto");
    expect(MockMutationObserver.instances).toHaveLength(1);
    expect(MockMutationObserver.instances[0]?.observe).toHaveBeenCalledWith(scrollElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const inputEvents = ["scroll", "wheel", "touchstart", "touchmove", "touchend", "touchcancel"];
    for (const eventName of inputEvents) {
      expect(addEventListener).toHaveBeenCalledWith(
        eventName,
        expect.any(Function),
        expect.objectContaining({ passive: true }),
      );
    }

    await fireEvent.click(getByRole("button", { name: /think/i }));
    await tick();

    expect(MockMutationObserver.instances[0]?.disconnect).toHaveBeenCalledOnce();
    for (const eventName of inputEvents) {
      expect(removeEventListener).toHaveBeenCalledWith(eventName, expect.any(Function));
    }
  });

  it("does not observe completed thoughts that are expanded for reading", async () => {
    const { container, getByRole } = render(ChatProgress, {
      props: { complete: true, children: contentSnippet() },
    });
    const scrollElement = container.querySelector<HTMLDivElement>(".thinking-container")!;
    scrollElement.scrollTo = vi.fn();

    await fireEvent.click(getByRole("button", { name: /thought/i }));
    await tick();

    expect(MockMutationObserver.instances).toHaveLength(0);
  });

  it("stops observing and performs one final bottom chase when streaming completes", async () => {
    const result = render(ChatProgress, {
      props: { complete: false, children: contentSnippet() },
    });
    const scrollElement = result.container.querySelector<HTMLDivElement>(".thinking-container")!;
    scrollElement.scrollTo = vi.fn();

    await fireEvent.click(result.getByRole("button", { name: /think/i }));
    await tick();
    expect(scrollElement.scrollTo).toHaveBeenCalledTimes(1);

    await result.rerender({ complete: true, children: contentSnippet() });
    await tick();
    await tick();

    expect(MockMutationObserver.instances[0]?.disconnect).toHaveBeenCalledOnce();
    expect(scrollElement.scrollTo).toHaveBeenCalledTimes(2);
  });

  it("preserves the scroll position when a detached stream completes", async () => {
    const result = render(ChatProgress, {
      props: { complete: false, children: contentSnippet() },
    });
    const scrollElement = result.container.querySelector<HTMLDivElement>(".thinking-container")!;
    Object.defineProperties(scrollElement, {
      scrollHeight: { configurable: true, value: 500 },
      clientHeight: { configurable: true, value: 100 },
    });
    scrollElement.scrollTo = vi.fn();

    await fireEvent.click(result.getByRole("button", { name: /think/i }));
    await tick();
    expect(scrollElement.scrollTo).toHaveBeenCalledTimes(1);

    // The mocked scrollTo above does not update scrollTop, so establish the
    // pinned position before simulating the user's upward scroll. The wheel
    // event marks the movement as user input — a bare scroll event reads as a
    // browser clamp and (correctly) does not detach.
    scrollElement.scrollTop = 400;
    await fireEvent.scroll(scrollElement);
    await fireEvent.wheel(scrollElement, { deltaY: -10 });
    scrollElement.scrollTop = 0;
    await fireEvent.scroll(scrollElement);
    await result.rerender({ complete: true, children: contentSnippet() });
    await tick();
    await tick();

    expect(MockMutationObserver.instances[0]?.disconnect).toHaveBeenCalledOnce();
    expect(scrollElement.scrollTo).toHaveBeenCalledTimes(1);
  });
});
