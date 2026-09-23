import { readFileSync } from "node:fs";
import { createRawSnippet, flushSync, mount, unmount } from "svelte";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SplitsController } from "./controller.js";
import SplitsView from "./SplitsView.svelte";
import ControllerSwapHarness from "./SplitsViewControllerSwap.test.svelte";
import type { PaneID, Tab } from "./types.js";

// Animation performance invariants. Sidebar/panel/divider animations must
// stay inside the frame budget with many tabs and terminals open; these
// tests pin the mechanisms that keep them there (see the perf(ui) commit
// that introduced them). If one of these fails, panel toggles and divider
// drags regress to sub-60fps under load — change them deliberately and
// re-measure before updating the test.

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  elements = new Set<Element>();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }
  observe(element: Element) {
    this.elements.add(element);
  }
  unobserve(element: Element) {
    this.elements.delete(element);
  }
  disconnect() {
    this.elements.clear();
  }
  trigger(entries: Array<Partial<ResizeObserverEntry>>) {
    this.callback(entries as ResizeObserverEntry[], this as unknown as ResizeObserver);
  }
}

describe("animation performance invariants", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
    // jsdom doesn't implement scrollTo (TabBar scrolls the selected tab into
    // view) or the Web Animations API (the tab list uses animate:flip).
    HTMLElement.prototype.scrollTo = vi.fn();
    Element.prototype.getAnimations = vi.fn().mockReturnValue([]);
    Element.prototype.animate = vi.fn().mockImplementation(() => ({
      cancel: vi.fn(),
      finished: Promise.resolve(),
      onfinish: null,
      pause: vi.fn(),
      play: vi.fn(),
      reverse: vi.fn(),
    }));
  });

  let target: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    MockResizeObserver.instances = [];
    target = document.createElement("div");
    document.body.appendChild(target);
  });

  function contentSnippet() {
    return createRawSnippet<[Tab, PaneID]>((tab) => ({
      render: () => `<div data-test-content="${tab().id}"></div>`,
    }));
  }

  function mountSplitsView(controller: SplitsController) {
    const component = mount(SplitsView, {
      target,
      props: {
        controller,
        children: contentSnippet(),
      },
    });
    flushSync();
    return component;
  }

  it("switches controllers before rendering the next content map", () => {
    const firstController = new SplitsController();
    const secondController = new SplitsController();
    const firstTabId = firstController.allTabIds[0]!;
    const secondTabId = secondController.allTabIds[0]!;
    const onUnavailableRender = vi.fn();
    const component = mount(ControllerSwapHarness, {
      target,
      props: {
        controller: firstController,
        availableTabIds: new Set([firstTabId]),
        onUnavailableRender,
      },
    });
    flushSync();
    onUnavailableRender.mockClear();

    component.swap(secondController, new Set([secondTabId]));
    flushSync();

    // A post-render subscription briefly pairs firstController's tabs with
    // the second content map. WKWebView can retain that unavailable frame
    // until a pointer event triggers another paint.
    expect(onUnavailableRender).not.toHaveBeenCalled();
    expect(target.querySelector(`[data-test-content="${secondTabId}"]`)).not.toBeNull();
    expect(target.querySelector("[data-test-unavailable]")).toBeNull();

    void unmount(component);
  });

  describe("hidden keepAllAlive tabs leave layout", () => {
    it("marks background tab instances with .splits-content-hidden", () => {
      const controller = new SplitsController({ contentViewLifecycle: "keepAllAlive" });
      const firstTabId = controller.allTabIds[0]!;
      const secondTabId = controller.createTab("Second")!;
      const component = mountSplitsView(controller);

      controller.selectTab(secondTabId);
      flushSync();

      const hiddenInstance = target
        .querySelector(`[data-test-content="${firstTabId}"]`)
        ?.closest(".splits-content-instance");
      const visibleInstance = target
        .querySelector(`[data-test-content="${secondTabId}"]`)
        ?.closest(".splits-content-instance");
      expect(hiddenInstance, "background tab instance").not.toBeNull();
      expect(hiddenInstance!.classList.contains("splits-content-hidden")).toBe(true);
      expect(visibleInstance!.classList.contains("splits-content-hidden")).toBe(false);

      void unmount(component);
    });

    it("tracks the exact SVG silhouette throughout pane motion", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const splitsViewSource = readFileSync("src/SplitsView.svelte", "utf-8");
__POOL_SYNTHETIC_IMPORT_BASELINE__
      expect(paneSource).toContain("animating={paneShapeAnimating}");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      // In motion the silhouette must stay mounted and re-measure every frame
      // (unrounded — integer snapping shimmers against subpixel animation).
      expect(paneShapeSource).toContain("if (!element || !selectedTabId)");
      expect(paneShapeSource).toContain("trackFrame = requestAnimationFrame(track)");
      expect(paneShapeSource).toContain("measureShape(false)");
      expect(paneShapeSource).toContain("class:splits-pane-shape-in-motion={inMotion}");
      expect(paneShapeSource).toContain("splits-pane-shape-edge-ring-layer");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      expect(paneShapeSource).not.toContain("<mask");
      expect(paneShapeSource).toContain('<path class="splits-pane-shape-surface" d={fillPath}>');
      expect(splitsViewSource).toContain(
        "paneShapeAnimating={paneShapeAnimating || isDividerDragging}",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    it("keeps a pane's element across a tree restructure", () => {
      // The whole point of the flat layout: splitting a pane used to move it to
      // a deeper position in a nested flex tree, which Svelte can only express
      // by destroying and recreating its subtree — rebuilding the tab bar and
      // pane chrome. Flat and keyed by pane id, a restructure only moves boxes.
      const controller = new SplitsController();
      const paneId = controller.focusedPaneId!;
      const component = mountSplitsView(controller);

      const before = target.querySelector(`[data-pane-id="${paneId}"]`);
      expect(before, "pane before split").not.toBeNull();

      controller.splitPane({ orientation: "horizontal" });
      flushSync();

      expect(target.querySelectorAll(".splits-pane")).toHaveLength(2);
      expect(target.querySelector(`[data-pane-id="${paneId}"]`), "same element").toBe(before);

      void unmount(component);
    });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    });
  });

  describe("narrow tab state", () => {
    it("collapses tabs to icon-only via ResizeObserver, not a container query", () => {
      const controller = new SplitsController({ contentViewLifecycle: "keepAllAlive" });
      controller.createTab("Second");
      const component = mountSplitsView(controller);

      const tabElement = target.querySelector<HTMLElement>("[data-splits-tab-id]");
      expect(tabElement).not.toBeNull();
      expect(tabElement!.classList.contains("splits-tab-narrow")).toBe(false);

      const tabWidthObserver = MockResizeObserver.instances.find((instance) =>
        [...instance.elements].some(
          (element) => element instanceof HTMLElement && element.dataset["splitsTabId"],
        ),
      );
      expect(tabWidthObserver, "tab-width ResizeObserver").toBeDefined();

      tabWidthObserver!.trigger([
        {
          target: tabElement!,
          contentBoxSize: [{ inlineSize: 50, blockSize: 30 }] as unknown as ResizeObserverSize[],
        },
      ]);
      flushSync();
      expect(tabElement!.classList.contains("splits-tab-narrow")).toBe(true);

      tabWidthObserver!.trigger([
        {
          target: tabElement!,
          contentBoxSize: [{ inlineSize: 160, blockSize: 30 }] as unknown as ResizeObserverSize[],
        },
      ]);
      flushSync();
      expect(tabElement!.classList.contains("splits-tab-narrow")).toBe(false);

      void unmount(component);
    });
  });

  describe("divider drags coalesce to one update per frame", () => {
    it("applies at most one setDividerPosition per animation frame, keeping the newest event", () => {
      const controller = new SplitsController({ contentViewLifecycle: "keepAllAlive" });
      const component = mountSplitsView(controller);
      expect(controller.splitPane("horizontal")).toBeDefined();
      flushSync();

      const divider = target.querySelector<HTMLElement>(".splits-divider");
      expect(divider, "split divider").not.toBeNull();
      const container = divider!.parentElement!;
      container.getBoundingClientRect = () =>
        ({ left: 0, top: 0, right: 600, bottom: 400, width: 600, height: 400 }) as DOMRect;

      let rafQueue: FrameRequestCallback[] = [];
      vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
        rafQueue.push(callback);
        return rafQueue.length;
      });
      vi.stubGlobal("cancelAnimationFrame", vi.fn());
      const flushFrames = () => {
        const callbacks = rafQueue;
        rafQueue = [];
        for (const callback of callbacks) callback(performance.now());
      };

      const spy = vi.spyOn(controller, "setDividerPosition");
      const pointerEvent = (type: string, clientX: number) =>
        new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY: 200 });

      divider!.dispatchEvent(pointerEvent("pointerdown", 300));

      // A same-frame burst of moves must not apply any position yet.
      for (const clientX of [310, 320, 330, 340, 350]) {
        window.dispatchEvent(pointerEvent("pointermove", clientX));
      }
      expect(spy).not.toHaveBeenCalled();

      // One frame applies exactly one update, carrying the newest position.
      flushFrames();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0]![0]).toBeCloseTo(350 / 600, 3);

      // A second burst coalesces the same way.
      for (const clientX of [360, 370, 380]) {
        window.dispatchEvent(pointerEvent("pointermove", clientX));
      }
      expect(spy).toHaveBeenCalledTimes(1);
      flushFrames();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy.mock.calls[1]![0]).toBeCloseTo(380 / 600, 3);

      // Release applies the final position synchronously so it is never lost.
      window.dispatchEvent(pointerEvent("pointerup", 390));
      expect(spy).toHaveBeenCalledTimes(3);
      expect(spy.mock.calls[2]![0]).toBeCloseTo(390 / 600, 3);

      vi.unstubAllGlobals();
      vi.stubGlobal("ResizeObserver", MockResizeObserver);
      void unmount(component);
    });
  });
});
