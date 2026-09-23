import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Harness from "./DesktopSettingsPanelFrame.test.svelte";

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(readonly callback: ResizeObserverCallback) {
    MockResizeObserver.instances.push(this);
  }
}

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

describe("DesktopSettingsPanelFrame", () => {
  let frames: FrameRequestCallback[];

  beforeEach(() => {
    MockResizeObserver.instances = [];
    MockMutationObserver.instances = [];
    frames = [];
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    vi.stubGlobal("MutationObserver", MockMutationObserver);
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps one observer lifecycle while overflow state and props update", async () => {
    const rendered = render(Harness);
    const pane = rendered.container.querySelector<HTMLDivElement>(".desktop-settings-pane");
    expect(pane).not.toBeNull();
    if (!pane) return;

    expect(MockResizeObserver.instances).toHaveLength(1);
    expect(MockMutationObserver.instances).toHaveLength(1);
    expect(MockMutationObserver.instances[0]?.observe).toHaveBeenCalledWith(pane, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    Object.defineProperties(pane, {
      scrollTop: { configurable: true, value: 20 },
      scrollHeight: { configurable: true, value: 300 },
      clientHeight: { configurable: true, value: 100 },
    });

    const resizeObserver = MockResizeObserver.instances[0];
    resizeObserver?.callback([], resizeObserver as unknown as ResizeObserver);
    resizeObserver?.callback([], resizeObserver as unknown as ResizeObserver);
    expect(frames).toHaveLength(1);

    frames.shift()?.(performance.now());
    await tick();
    expect(pane).toHaveAttribute("data-overflow-top", "true");
    expect(pane).toHaveAttribute("data-overflow-bottom", "true");

    const previousContent = pane.firstElementChild;
    const replacementContent = document.createElement("div");
    pane.replaceChildren(replacementContent);
    const mutationObserver = MockMutationObserver.instances[0];
    mutationObserver?.callback([], mutationObserver as unknown as MutationObserver);
    expect(resizeObserver?.unobserve).toHaveBeenCalledWith(previousContent);
    expect(resizeObserver?.observe).toHaveBeenCalledWith(replacementContent);

    await rendered.rerender({ title: "Projects" });
    expect(MockResizeObserver.instances).toHaveLength(1);
    expect(MockMutationObserver.instances).toHaveLength(1);

    rendered.unmount();
    expect(resizeObserver?.disconnect).toHaveBeenCalledOnce();
    expect(MockMutationObserver.instances[0]?.disconnect).toHaveBeenCalledOnce();
  });
});
