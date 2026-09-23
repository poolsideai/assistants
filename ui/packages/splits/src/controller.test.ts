import { describe, expect, it, vi } from "vitest";
import { SplitsController } from "./controller.js";
import type { SerializedSplitsState, SplitsDelegate } from "./types.js";

describe("SplitsController", () => {
  it("starts with one focused welcome pane", () => {
    const controller = new SplitsController();

    expect(controller.focusedPaneId).toBeDefined();
    expect(controller.allPaneIds).toHaveLength(1);
    expect(controller.allTabIds).toHaveLength(1);
    expect(controller.tab(controller.allTabIds[0]!)).toMatchObject({
      title: "Welcome",
      icon: "star",
    });
  });

  it("creates, retrieves, updates, selects, and closes tabs", () => {
    const controller = new SplitsController();

    const tabId = controller.createTab("Test Tab", { icon: "doc" });
    expect(tabId).toBeDefined();
    expect(controller.tab(tabId!)).toMatchObject({
      title: "Test Tab",
      icon: "doc",
      isDirty: false,
    });

    expect(controller.updateTab(tabId!, { title: "Updated", icon: null, isDirty: true })).toBe(
      true,
    );
    expect(controller.tab(tabId!)).toMatchObject({
      title: "Updated",
      icon: null,
      isDirty: true,
    });

    expect(controller.selectTab(tabId!)).toBe(true);
    expect(controller.selectedTab(controller.focusedPaneId!)).toMatchObject({
      id: tabId,
    });

    expect(controller.closeTab(tabId!)).toBe(true);
    expect(controller.tab(tabId!)).toBeUndefined();
  });

  it("does not emit when a tab update leaves every field unchanged", () => {
    const controller = new SplitsController();
    const tabId = controller.allTabIds[0]!;
    const subscriber = vi.fn();
    controller.subscribe(subscriber);
    subscriber.mockClear();

    expect(
      controller.updateTab(tabId, {
        title: "Welcome",
        icon: "star",
        isDirty: false,
        isClosable: true,
      }),
    ).toBe(true);
    expect(controller.updateTab(tabId, {})).toBe(true);

    expect(subscriber).not.toHaveBeenCalled();
  });

  it("keeps tabs closable by default and blocks non-closable tabs", () => {
    const controller = new SplitsController();

    const defaultClosable = controller.createTab("Default closable")!;
    expect(controller.closeTab(defaultClosable)).toBe(true);

    const pinned = controller.createTab({ title: "Pinned", isClosable: false })!;
    expect(controller.tab(pinned)).toMatchObject({
      title: "Pinned",
      isClosable: false,
    });
    expect(controller.closeTab(pinned)).toBe(false);
    expect(controller.tab(pinned)).toBeDefined();

    expect(controller.updateTab(pinned, { isClosable: true })).toBe(true);
    expect(controller.closeTab(pinned)).toBe(true);
  });

  it("inserts new tabs next to the selected tab by default", () => {
    const controller = new SplitsController();
    const first = controller.allTabIds[0]!;
    const second = controller.createTab("Second")!;

    controller.selectTab(first);
    const inserted = controller.createTab("Inserted")!;

    expect(controller.tabs(controller.focusedPaneId!).map((tab) => tab.id)).toEqual([
      first,
      inserted,
      second,
    ]);
  });

  it("selects previous and next tabs across split panes at pane edges", () => {
    const controller = new SplitsController();
    const firstPane = controller.focusedPaneId!;
    const firstPaneFirst = controller.allTabIds[0]!;
    const firstPaneSecond = controller.createTab("First pane second")!;
    const secondPane = controller.splitPane({
      orientation: "horizontal",
      withTab: { title: "Second pane first" },
    })!;
    const secondPaneFirst = controller.tabs(secondPane)[0]!.id;
    const secondPaneSecond = controller.createTab("Second pane second")!;
    const delegate: SplitsDelegate = {
      didFocusPane: vi.fn(),
    };
    controller.delegate = delegate;

    controller.selectTab(firstPaneSecond);
    expect(controller.selectNextTab()).toBe(true);
    expect(controller.focusedPaneId).toBe(secondPane);
    expect(controller.selectedTab(secondPane)?.id).toBe(secondPaneFirst);
    expect(delegate.didFocusPane).toHaveBeenLastCalledWith(controller, secondPane);

    expect(controller.selectPreviousTab()).toBe(true);
    expect(controller.focusedPaneId).toBe(firstPane);
    expect(controller.selectedTab(firstPane)?.id).toBe(firstPaneSecond);
    expect(delegate.didFocusPane).toHaveBeenLastCalledWith(controller, firstPane);

    controller.selectTab(secondPaneSecond);
    expect(controller.selectNextTab()).toBe(true);
    expect(controller.focusedPaneId).toBe(firstPane);
    expect(controller.selectedTab(firstPane)?.id).toBe(firstPaneFirst);
    expect(delegate.didFocusPane).toHaveBeenLastCalledWith(controller, firstPane);

    expect(controller.selectPreviousTab()).toBe(true);
    expect(controller.focusedPaneId).toBe(secondPane);
    expect(controller.selectedTab(secondPane)?.id).toBe(secondPaneSecond);
    expect(delegate.didFocusPane).toHaveBeenLastCalledWith(controller, secondPane);
  });

  it("splits with a new tab by default, closes, and snapshots panes", () => {
    const controller = new SplitsController();
    const originalPane = controller.focusedPaneId!;
    controller.setContainerFrame({ x: 10, y: 20, width: 800, height: 600 });

    const newPane = controller.splitPane("horizontal");
    expect(newPane).toBeDefined();
    expect(controller.allPaneIds).toHaveLength(2);
    expect(controller.focusedPaneId).toBe(newPane);
    expect(controller.tabs(newPane!)).toMatchObject([
      {
        title: "Untitled",
        icon: "doc.text",
      },
    ]);

    const snapshot = controller.layoutSnapshot();
    expect(snapshot.panes).toHaveLength(2);
    expect(snapshot.panes[0]?.frame).toMatchObject({
      x: 10,
      y: 20,
      width: 400,
      height: 600,
    });

    expect(controller.closePane(originalPane)).toBe(true);
    expect(controller.allPaneIds).toEqual([newPane]);
  });

  it("supports explicitly empty splits", () => {
    const controller = new SplitsController();

    const newPane = controller.splitPane({ orientation: "horizontal", withTab: false });

    expect(newPane).toBeDefined();
    expect(controller.tabs(newPane!)).toEqual([]);
  });

  it("serializes and restores split layout state", () => {
    const controller = new SplitsController({ newTabPosition: "end" });
    const firstPane = controller.focusedPaneId!;
    const firstTab = controller.allTabIds[0]!;
    controller.updateTab(firstTab, {
      title: "Chat",
      icon: "agent",
      isClosable: false,
    });
    const secondTab = controller.createTab("Terminal", { icon: null })!;
    const secondPane = controller.splitPane({
      orientation: "horizontal",
      withTab: { id: "files-tab", title: "Files", icon: "folder-open" },
    })!;
    const splitState = controller.serializeState();
    const splitId = splitState.rootNode.type === "split" ? splitState.rootNode.split.id : undefined;
    expect(splitId).toBeDefined();
    controller.setDividerPosition(0.33, splitId!);
    controller.selectTab(secondTab);
    controller.toggleZoom(firstPane);

    const snapshot = controller.serializeState();
    const restored = new SplitsController();

    expect(restored.restoreState(snapshot)).toBe(true);
    expect(restored.serializeState()).toEqual(snapshot);
    expect(restored.focusedPaneId).toBe(firstPane);
    expect(restored.zoomedPaneId).toBe(firstPane);
    expect(restored.tabs(firstPane).map((tab) => tab.id)).toEqual([firstTab, secondTab]);
    expect(restored.tabs(secondPane).map((tab) => tab.id)).toEqual(["files-tab"]);
  });

  it("rejects invalid serialized state without changing current state", () => {
    const controller = new SplitsController();
    const before = controller.serializeState();
    const invalid: SerializedSplitsState = {
      version: 1,
      rootNode: {
        type: "pane",
        pane: {
          id: "pane",
          selectedTabId: "missing",
          tabs: [],
        },
      },
    };

    expect(controller.restoreState(invalid)).toBe(false);
    expect(controller.serializeState()).toEqual(before);
  });

  it("validates restored ids and clamps serialized divider positions", () => {
    const source = new SplitsController();
    const firstTabId = source.allTabIds[0]!;
    source.splitPane({
      orientation: "horizontal",
      withTab: { id: "second-tab", title: "Second", icon: "doc.text" },
    });
    const snapshot = source.serializeState();
    expect(snapshot.rootNode.type).toBe("split");
    if (snapshot.rootNode.type !== "split") return;

    snapshot.rootNode.split.dividerPosition = 2;
    const restored = new SplitsController();

    expect(restored.restoreState(snapshot)).toBe(true);
    const restoredSnapshot = restored.serializeState();
    expect(restoredSnapshot.rootNode.type).toBe("split");
    if (restoredSnapshot.rootNode.type !== "split") return;
    expect(restoredSnapshot.rootNode.split.dividerPosition).toBe(0.9);

    const duplicateTab = JSON.parse(JSON.stringify(snapshot)) as SerializedSplitsState;
    if (duplicateTab.rootNode.type !== "split") return;
    if (duplicateTab.rootNode.split.second.type !== "pane") return;
    duplicateTab.rootNode.split.second.pane.tabs[0]!.id = firstTabId;
    expect(restored.restoreState(duplicateTab)).toBe(false);

    const invalidFocusedPane = {
      ...snapshot,
      focusedPaneId: "missing-pane",
    } satisfies SerializedSplitsState;
    expect(restored.restoreState(invalidFocusedPane)).toBe(false);

    const invalidZoomedPane = {
      ...snapshot,
      zoomedPaneId: "missing-pane",
    } satisfies SerializedSplitsState;
    expect(restored.restoreState(invalidZoomedPane)).toBe(false);
  });

  it("closes a split pane when its last tab closes", () => {
    const controller = new SplitsController();
    const originalPane = controller.focusedPaneId!;
    const newPane = controller.splitPane("horizontal")!;
    const splitTab = controller.tabs(newPane)[0]!;

    expect(controller.closeTab(splitTab.id, newPane)).toBe(true);
    expect(controller.allPaneIds).toEqual([originalPane]);
    expect(controller.focusedPaneId).toBe(originalPane);
  });

  it("supports zoom lifecycle and zoom snapshots", () => {
    const controller = new SplitsController();
    const firstPane = controller.focusedPaneId!;
    const secondPane = controller.splitPane("horizontal")!;

    expect(controller.toggleZoom(firstPane)).toBe(true);
    expect(controller.isZoomed).toBe(true);
    expect(controller.zoomedPaneId).toBe(firstPane);
    expect(controller.layoutSnapshot().panes).toHaveLength(1);

    expect(controller.toggleZoom(secondPane)).toBe(true);
    expect(controller.zoomedPaneId).toBe(secondPane);

    controller.unzoom();
    expect(controller.isZoomed).toBe(false);
  });

  it("navigates focus by pane geometry", () => {
    const controller = new SplitsController();
    const firstPane = controller.focusedPaneId!;
    const secondPane = controller.splitPane("horizontal")!;

    controller.focusPane(firstPane);
    expect(controller.navigateFocus("right")).toBe(true);
    expect(controller.focusedPaneId).toBe(secondPane);
  });

  it("moves tabs within and across panes", () => {
    const controller = new SplitsController();
    const firstPane = controller.focusedPaneId!;
    const first = controller.allTabIds[0]!;
    const second = controller.createTab("Second")!;
    const targetPane = controller.splitPane("horizontal")!;

    expect(controller.moveTab(first, firstPane, firstPane, 2)).toBe(true);
    expect(controller.tabs(firstPane).map((tab) => tab.id)).toEqual([second, first]);

    expect(controller.moveTab(second, firstPane, targetPane)).toBe(true);
    expect(controller.tabs(targetPane).map((tab) => tab.id)).toContain(second);
  });

  it("moves a tab into a new split from the same pane", () => {
    const controller = new SplitsController();
    const pane = controller.focusedPaneId!;
    const first = controller.allTabIds[0]!;
    const moved = controller.createTab("Moved")!;

    const newPane = controller.moveTabToSplit(moved, pane, pane, "horizontal", {
      insertFirst: true,
    });

    expect(newPane).toBeDefined();
    expect(controller.allPaneIds).toHaveLength(2);
    expect(controller.focusedPaneId).toBe(newPane);
    expect(controller.tabs(pane).map((tab) => tab.id)).toEqual([first]);
    expect(controller.tabs(newPane!).map((tab) => tab.id)).toEqual([moved]);
  });

  it("does not move the only tab in a pane into a split of itself", () => {
    const controller = new SplitsController();
    const pane = controller.focusedPaneId!;
    const moved = controller.allTabIds[0]!;

    expect(controller.moveTabToSplit(moved, pane, pane, "horizontal")).toBeUndefined();
    expect(controller.allPaneIds).toEqual([pane]);
    expect(controller.tabs(pane).map((tab) => tab.id)).toEqual([moved]);
  });

  it("moves a tab into a split across panes and closes an emptied source pane", () => {
    const controller = new SplitsController({ autoCloseEmptyPanes: true });
    const sourcePane = controller.focusedPaneId!;
    const moved = controller.allTabIds[0]!;
    const targetPane = controller.splitPane({
      orientation: "horizontal",
      withTab: { title: "Target" },
    })!;
    const targetTab = controller.tabs(targetPane)[0]!.id;

    const newPane = controller.moveTabToSplit(moved, sourcePane, targetPane, "vertical");

    expect(newPane).toBeDefined();
    expect(controller.allPaneIds).not.toContain(sourcePane);
    expect(controller.allPaneIds).toEqual([targetPane, newPane]);
    expect(controller.tabs(targetPane).map((tab) => tab.id)).toEqual([targetTab]);
    expect(controller.tabs(newPane!).map((tab) => tab.id)).toEqual([moved]);
  });

  it("moves a tab directly into an empty pane instead of splitting the empty pane", () => {
    const controller = new SplitsController();
    const sourcePane = controller.focusedPaneId!;
    const moved = controller.allTabIds[0]!;
    const emptyPane = controller.splitPane({
      orientation: "horizontal",
      withTab: false,
    })!;

    const targetPane = controller.moveTabToSplit(moved, sourcePane, emptyPane, "vertical");

    expect(targetPane).toBe(emptyPane);
    expect(controller.allPaneIds).toEqual([emptyPane]);
    expect(controller.tabs(emptyPane).map((tab) => tab.id)).toEqual([moved]);
  });

  it("moves a tab between controllers without closing or creating it", () => {
    const source = new SplitsController({ allowCrossControllerTabMove: true });
    const target = new SplitsController({ allowCrossControllerTabMove: true });
    const sourceDelegate: SplitsDelegate<SplitsController> = {
      didCloseTab: vi.fn(),
    };
    const targetDelegate: SplitsDelegate<SplitsController> = {
      didCreateTab: vi.fn(),
      didFocusPane: vi.fn(),
      didMoveTab: vi.fn(),
      didSelectTab: vi.fn(),
    };
    source.delegate = sourceDelegate;
    target.delegate = targetDelegate;
    const sourcePane = source.focusedPaneId!;
    const targetPane = target.focusedPaneId!;
    const moved = source.allTabIds[0]!;

    expect(target.moveTabFromController(source, moved, sourcePane, targetPane)).toBe(true);
    expect(source.tab(moved)).toBeUndefined();
    expect(target.tab(moved)).toMatchObject({ id: moved, title: "Welcome" });
    expect(source.tabs(sourcePane)).toEqual([]);
    expect(sourceDelegate.didCloseTab).not.toHaveBeenCalled();
    expect(targetDelegate.didCreateTab).not.toHaveBeenCalled();
    expect(targetDelegate.didMoveTab).toHaveBeenCalledWith(
      target,
      expect.objectContaining({ id: moved }),
      sourcePane,
      targetPane,
    );
    expect(targetDelegate.didSelectTab).toHaveBeenCalledWith(
      target,
      expect.objectContaining({ id: moved }),
      targetPane,
    );
    expect(targetDelegate.didFocusPane).toHaveBeenCalledWith(target, targetPane);
  });

  it("moves a tab from another controller into a split", () => {
    const source = new SplitsController({ allowCrossControllerTabMove: true });
    const target = new SplitsController({ allowCrossControllerTabMove: true });
    const targetDelegate: SplitsDelegate<SplitsController> = {
      didFocusPane: vi.fn(),
      didMoveTab: vi.fn(),
      didSelectTab: vi.fn(),
      didSplitPane: vi.fn(),
    };
    target.delegate = targetDelegate;
    const sourcePane = source.focusedPaneId!;
    const targetPane = target.focusedPaneId!;
    const moved = source.allTabIds[0]!;
    const targetTab = target.allTabIds[0]!;

    const newPane = target.moveTabFromControllerToSplit(
      source,
      moved,
      sourcePane,
      targetPane,
      "horizontal",
      { insertFirst: true },
    );

    expect(newPane).toBeDefined();
    expect(source.tabs(sourcePane)).toEqual([]);
    expect(target.allPaneIds).toHaveLength(2);
    expect(target.tabs(newPane!).map((tab) => tab.id)).toEqual([moved]);
    expect(target.tabs(targetPane).map((tab) => tab.id)).toEqual([targetTab]);
    expect(targetDelegate.didSplitPane).toHaveBeenCalledWith(
      target,
      targetPane,
      newPane,
      "horizontal",
    );
    expect(targetDelegate.didMoveTab).toHaveBeenCalledWith(
      target,
      expect.objectContaining({ id: moved }),
      sourcePane,
      newPane,
    );
    expect(targetDelegate.didSelectTab).toHaveBeenCalledWith(
      target,
      expect.objectContaining({ id: moved }),
      newPane,
    );
    expect(targetDelegate.didFocusPane).toHaveBeenCalledWith(target, newPane);
  });

  it("moves a tab from another controller directly into an empty target pane", () => {
    const source = new SplitsController({ allowCrossControllerTabMove: true });
    const target = new SplitsController({ allowCrossControllerTabMove: true });
    const targetDelegate: SplitsDelegate<SplitsController> = {
      didFocusPane: vi.fn(),
      didMoveTab: vi.fn(),
      didSelectTab: vi.fn(),
      didSplitPane: vi.fn(),
    };
    target.delegate = targetDelegate;
    const sourcePane = source.focusedPaneId!;
    const targetPane = target.focusedPaneId!;
    const targetInitialTab = target.allTabIds[0]!;
    const moved = source.allTabIds[0]!;

    target.closeTab(targetInitialTab);
    const movedPane = target.moveTabFromControllerToSplit(
      source,
      moved,
      sourcePane,
      targetPane,
      "horizontal",
      { insertFirst: true },
    );

    expect(movedPane).toBe(targetPane);
    expect(source.tabs(sourcePane)).toEqual([]);
    expect(target.allPaneIds).toEqual([targetPane]);
    expect(target.tabs(targetPane).map((tab) => tab.id)).toEqual([moved]);
    expect(targetDelegate.didSplitPane).not.toHaveBeenCalled();
    expect(targetDelegate.didMoveTab).toHaveBeenCalledWith(
      target,
      expect.objectContaining({ id: moved }),
      sourcePane,
      targetPane,
    );
    expect(targetDelegate.didSelectTab).toHaveBeenCalledWith(
      target,
      expect.objectContaining({ id: moved }),
      targetPane,
    );
    expect(targetDelegate.didFocusPane).toHaveBeenCalledWith(target, targetPane);
  });

  it("rejects cross-controller tab moves unless both controllers opt in", () => {
    const source = new SplitsController({ allowCrossControllerTabMove: true });
    const target = new SplitsController();
    const sourcePane = source.focusedPaneId!;
    const targetPane = target.focusedPaneId!;
    const moved = source.allTabIds[0]!;

    expect(target.moveTabFromController(source, moved, sourcePane, targetPane)).toBe(false);
    expect(source.tab(moved)).toBeDefined();
    expect(target.tab(moved)).toBeUndefined();
  });

  it("lets delegates veto tab creation for new splits", () => {
    const controller = new SplitsController();
    controller.delegate = {
      shouldCreateTab: vi.fn(() => false),
    };

    expect(controller.splitPane("horizontal")).toBeUndefined();
    expect(controller.allPaneIds).toHaveLength(1);
    expect(controller.allTabIds).toHaveLength(1);
  });

  it("lets delegates veto operations", () => {
    const controller = new SplitsController();
    const delegate: SplitsDelegate = {
      shouldCreateTab: vi.fn(() => false),
      shouldSplitPane: vi.fn(() => false),
    };
    controller.delegate = delegate;

    expect(controller.createTab("Nope")).toBeUndefined();
    expect(controller.allTabIds).toHaveLength(1);
    expect(controller.splitPane("horizontal")).toBeUndefined();
    expect(controller.allPaneIds).toHaveLength(1);
  });
});
