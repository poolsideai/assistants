import { createRawSnippet, flushSync, mount, unmount } from "svelte";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SplitsController } from "./controller.js";
import SplitsView from "./SplitsView.svelte";
import type { PaneID, Tab } from "./types.js";

// Unit tests for the onTabContextMenu hook wired in TabBar.svelte.
// Also covers middle-click (auxclick button 1) tab close in TabBar.svelte.

class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("onTabContextMenu hook", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
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
    target = document.createElement("div");
    document.body.appendChild(target);
  });

  function contentSnippet() {
    return createRawSnippet<[Tab, PaneID]>((tab) => ({
      render: () => `<div data-test-content="${tab().id}"></div>`,
    }));
  }

  function mountWithContextMenuHook(
    controller: SplitsController,
    onTabContextMenu: (args: { paneId: PaneID; tabId: string; event: MouseEvent }) => void,
  ) {
    const component = mount(SplitsView, {
      target,
      props: {
        controller,
        children: contentSnippet(),
        onTabContextMenu,
      },
    });
    flushSync();
    return component;
  }

  it("calls onTabContextMenu with correct paneId and tabId when right-clicking a tab", () => {
    const controller = new SplitsController();
    const tabId = controller.allTabIds[0]!;
    const paneId = controller.allPaneIds[0]!;

    const handler = vi.fn();
    const component = mountWithContextMenuHook(controller, handler);

    const tabElement = target.querySelector<HTMLElement>(`[data-splits-tab-id="${tabId}"]`);
    expect(tabElement, "tab element").not.toBeNull();

    const contextMenuEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 50,
      clientY: 20,
    });
    tabElement!.dispatchEvent(contextMenuEvent);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0]![0]).toMatchObject({
      paneId,
      tabId,
    });

    void unmount(component);
  });

  it("prevents the default context menu when onTabContextMenu is provided", () => {
    const controller = new SplitsController();
    const tabId = controller.allTabIds[0]!;

    const handler = vi.fn();
    const component = mountWithContextMenuHook(controller, handler);

    const tabElement = target.querySelector<HTMLElement>(`[data-splits-tab-id="${tabId}"]`);
    expect(tabElement).not.toBeNull();

    const contextMenuEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    tabElement!.dispatchEvent(contextMenuEvent);

    expect(contextMenuEvent.defaultPrevented).toBe(true);

    void unmount(component);
  });

  it("does not prevent default when onTabContextMenu is absent", () => {
    const controller = new SplitsController();
    const tabId = controller.allTabIds[0]!;

    // Mount without providing onTabContextMenu
    const component = mount(SplitsView, {
      target,
      props: {
        controller,
        children: contentSnippet(),
      },
    });
    flushSync();

    const tabElement = target.querySelector<HTMLElement>(`[data-splits-tab-id="${tabId}"]`);
    expect(tabElement).not.toBeNull();

    const contextMenuEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    tabElement!.dispatchEvent(contextMenuEvent);

    // No hook => default not prevented
    expect(contextMenuEvent.defaultPrevented).toBe(false);

    void unmount(component);
  });

  it("passes the MouseEvent to the callback", () => {
    const controller = new SplitsController();
    const tabId = controller.allTabIds[0]!;

    const handler = vi.fn();
    const component = mountWithContextMenuHook(controller, handler);

    const tabElement = target.querySelector<HTMLElement>(`[data-splits-tab-id="${tabId}"]`);
    const contextMenuEvent = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 42,
    });
    tabElement!.dispatchEvent(contextMenuEvent);

    expect(handler.mock.calls[0]![0].event).toBe(contextMenuEvent);

    void unmount(component);
  });
});

// ---------------------------------------------------------------------------
// Middle-click (auxclick button 1) close tests
// ---------------------------------------------------------------------------

describe("middle-click tab close", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", MockResizeObserver);
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
    target = document.createElement("div");
    document.body.appendChild(target);
  });

  function mountController(controller: SplitsController) {
    const snippet = createRawSnippet<[Tab, PaneID]>((tab) => ({
      render: () => `<div data-test-content="${tab().id}"></div>`,
    }));
    const component = mount(SplitsView, {
      target,
      props: { controller, children: snippet },
    });
    flushSync();
    return component;
  }

  function auxClick(element: HTMLElement, button: number) {
    element.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button }));
  }

  it("middle-click on a closable tab closes it", () => {
    const controller = new SplitsController({ allowCloseTabs: true });
    // Add a second tab so there is still a tab after closing the first.
    const secondTabId = controller.createTab("Second");
    const firstTabId = controller.allTabIds.find((id) => id !== secondTabId)!;
    const component = mountController(controller);

    const tabElement = target.querySelector<HTMLElement>(`[data-splits-tab-id="${firstTabId}"]`);
    expect(tabElement, "tab element").not.toBeNull();

    auxClick(tabElement!, 1);

    expect(controller.allTabIds).not.toContain(firstTabId);

    void unmount(component);
  });

  it("middle-click on a non-closable tab does NOT close it", () => {
    // Create a controller and mark the default tab as non-closable.
    const controller = new SplitsController({ allowCloseTabs: true });
    const tabId = controller.allTabIds[0]!;
    const paneId = controller.allPaneIds[0]!;
    // Update the tab to be non-closable via the internal state by replacing it.
    controller.updateTab(tabId, { isClosable: false });
    const component = mountController(controller);

    const tabElement = target.querySelector<HTMLElement>(`[data-splits-tab-id="${tabId}"]`);
    expect(tabElement, "tab element").not.toBeNull();

    auxClick(tabElement!, 1);

    // Tab must still exist.
    expect(controller.tab(tabId)).toBeDefined();
    // Confirm the pane still has the tab.
    expect(controller.tabs(paneId).map((t) => t.id)).toContain(tabId);

    void unmount(component);
  });

  it("middle-click with button 0 (left click) does NOT close the tab", () => {
    const controller = new SplitsController({ allowCloseTabs: true });
    const secondTabId = controller.createTab("Second");
    const firstTabId = controller.allTabIds.find((id) => id !== secondTabId)!;
    const component = mountController(controller);

    const tabElement = target.querySelector<HTMLElement>(`[data-splits-tab-id="${firstTabId}"]`);
    expect(tabElement).not.toBeNull();

    // Dispatch auxclick with button 0 — should be ignored.
    auxClick(tabElement!, 0);

    expect(controller.allTabIds).toContain(firstTabId);

    void unmount(component);
  });

  it("middle-click does NOT close tab when allowCloseTabs is false", () => {
    const controller = new SplitsController({ allowCloseTabs: false });
    const tabId = controller.allTabIds[0]!;
    const component = mountController(controller);

    const tabElement = target.querySelector<HTMLElement>(`[data-splits-tab-id="${tabId}"]`);
    expect(tabElement).not.toBeNull();

    auxClick(tabElement!, 1);

    expect(controller.tab(tabId)).toBeDefined();

    void unmount(component);
  });
});
