import type {
  ExternalTreeNode,
  PaneID,
  PaneNode,
  PaneState,
  PixelRect,
  SplitID,
  SplitNode,
  SplitOrientation,
  SplitState,
  Tab,
  TabID,
} from "../types.js";
import { createId } from "./id.js";

export interface PaneBounds {
  paneId: PaneID;
  bounds: PixelRect;
}

export function cloneTab(tab: Tab): Tab {
  return {
    id: tab.id,
    title: tab.title,
    icon: tab.icon,
    isDirty: tab.isDirty,
    isClosable: tab.isClosable,
  };
}

export function createTabItem(options: {
  id?: TabID;
  title: string;
  icon?: string | null;
  isDirty?: boolean;
  isClosable?: boolean;
}): Tab {
  return {
    id: options.id ?? createId(),
    title: options.title,
    icon: options.icon === undefined ? "doc.text" : options.icon,
    isDirty: options.isDirty ?? false,
    isClosable: options.isClosable ?? true,
  };
}

export function createPane(tabs: Tab[] = [], id: PaneID = createId()): PaneState {
  return {
    id,
    tabs,
    selectedTabId: tabs[0]?.id,
  };
}

export function createPaneNode(pane: PaneState): PaneNode {
  return {
    type: "pane",
    pane,
  };
}

export function createInitialRootNode(): SplitNode {
  return createPaneNode(createPane([createTabItem({ title: "Welcome", icon: "star" })]));
}

export function findPane(node: SplitNode, paneId: PaneID): PaneState | undefined {
  if (node.type === "pane") {
    return node.pane.id === paneId ? node.pane : undefined;
  }

  return findPane(node.split.first, paneId) ?? findPane(node.split.second, paneId);
}

export function allPaneIds(node: SplitNode): PaneID[] {
  if (node.type === "pane") {
    return [node.pane.id];
  }

  return [...allPaneIds(node.split.first), ...allPaneIds(node.split.second)];
}

export function allPanes(node: SplitNode): PaneState[] {
  if (node.type === "pane") {
    return [node.pane];
  }

  return [...allPanes(node.split.first), ...allPanes(node.split.second)];
}

export function allSplits(node: SplitNode): SplitState[] {
  if (node.type === "pane") {
    return [];
  }

  return [node.split, ...allSplits(node.split.first), ...allSplits(node.split.second)];
}

export function findSplit(node: SplitNode, splitId: SplitID): SplitState | undefined {
  if (node.type === "pane") {
    return undefined;
  }

  if (node.split.id === splitId) {
    return node.split;
  }

  return findSplit(node.split.first, splitId) ?? findSplit(node.split.second, splitId);
}

export function findTab(
  node: SplitNode,
  tabId: TabID,
): { pane: PaneState; tab: Tab; tabIndex: number } | undefined {
  for (const pane of allPanes(node)) {
    const tabIndex = pane.tabs.findIndex((tab) => tab.id === tabId);

    if (tabIndex !== -1) {
      return {
        pane,
        tab: pane.tabs[tabIndex]!,
        tabIndex,
      };
    }
  }

  return undefined;
}

export function selectedTab(pane: PaneState): Tab | undefined {
  return pane.tabs.find((tab) => tab.id === pane.selectedTabId);
}

export function selectTab(pane: PaneState, tabId: TabID): boolean {
  if (!pane.tabs.some((tab) => tab.id === tabId)) {
    return false;
  }

  pane.selectedTabId = tabId;
  return true;
}

export function insertTab(pane: PaneState, tab: Tab, index?: number, select = true): void {
  if (index === undefined) {
    pane.tabs.push(tab);
  } else {
    const safeIndex = Math.min(Math.max(0, index), pane.tabs.length);
    pane.tabs.splice(safeIndex, 0, tab);
  }

  if (select) {
    pane.selectedTabId = tab.id;
  }
}

export function removeTab(pane: PaneState, tabId: TabID): Tab | undefined {
  const index = pane.tabs.findIndex((tab) => tab.id === tabId);

  if (index === -1) {
    return undefined;
  }

  const [tab] = pane.tabs.splice(index, 1);

  if (pane.selectedTabId === tabId) {
    pane.selectedTabId = pane.tabs[index - 1]?.id ?? pane.tabs[0]?.id;
  }

  return tab;
}

export function moveTabWithinPane(
  pane: PaneState,
  sourceIndex: number,
  destinationIndex: number,
): boolean {
  if (
    sourceIndex === destinationIndex ||
    sourceIndex < 0 ||
    sourceIndex >= pane.tabs.length ||
    destinationIndex < 0 ||
    destinationIndex > pane.tabs.length
  ) {
    return false;
  }

  const [tab] = pane.tabs.splice(sourceIndex, 1);
  const adjustedIndex = destinationIndex > sourceIndex ? destinationIndex - 1 : destinationIndex;
  pane.tabs.splice(adjustedIndex, 0, tab!);
  return true;
}

export function computePaneBounds(
  node: SplitNode,
  availableRect: PixelRect = { x: 0, y: 0, width: 1, height: 1 },
): PaneBounds[] {
  if (node.type === "pane") {
    return [
      {
        paneId: node.pane.id,
        bounds: availableRect,
      },
    ];
  }

  const dividerPosition = node.split.dividerPosition;

  if (node.split.orientation === "horizontal") {
    const firstRect = {
      x: availableRect.x,
      y: availableRect.y,
      width: availableRect.width * dividerPosition,
      height: availableRect.height,
    };
    const secondRect = {
      x: availableRect.x + availableRect.width * dividerPosition,
      y: availableRect.y,
      width: availableRect.width * (1 - dividerPosition),
      height: availableRect.height,
    };

    return [
      ...computePaneBounds(node.split.first, firstRect),
      ...computePaneBounds(node.split.second, secondRect),
    ];
  }

  const firstRect = {
    x: availableRect.x,
    y: availableRect.y,
    width: availableRect.width,
    height: availableRect.height * dividerPosition,
  };
  const secondRect = {
    x: availableRect.x,
    y: availableRect.y + availableRect.height * dividerPosition,
    width: availableRect.width,
    height: availableRect.height * (1 - dividerPosition),
  };

  return [
    ...computePaneBounds(node.split.first, firstRect),
    ...computePaneBounds(node.split.second, secondRect),
  ];
}

export function splitNodeRecursively(
  node: SplitNode,
  targetPaneId: PaneID,
  orientation: SplitOrientation,
  tab?: Tab,
  insertFirst = false,
  newPaneId: PaneID = createId(),
): { node: SplitNode; newPaneId?: PaneID } {
  if (node.type === "pane") {
    if (node.pane.id !== targetPaneId) {
      return { node };
    }

    const newPane = createPane(tab ? [cloneTab(tab)] : [], newPaneId);
    const newPaneNode = createPaneNode(newPane);
    const split: SplitState = {
      id: createId(),
      orientation,
      first: insertFirst ? newPaneNode : node,
      second: insertFirst ? node : newPaneNode,
      dividerPosition: 0.5,
      animationOrigin: insertFirst ? "fromFirst" : "fromSecond",
    };

    return {
      node: {
        type: "split",
        split,
      },
      newPaneId: newPane.id,
    };
  }

  const firstResult = splitNodeRecursively(
    node.split.first,
    targetPaneId,
    orientation,
    tab,
    insertFirst,
    newPaneId,
  );

  if (firstResult.newPaneId) {
    node.split.first = firstResult.node;
    return {
      node,
      newPaneId: firstResult.newPaneId,
    };
  }

  const secondResult = splitNodeRecursively(
    node.split.second,
    targetPaneId,
    orientation,
    tab,
    insertFirst,
    newPaneId,
  );

  if (secondResult.newPaneId) {
    node.split.second = secondResult.node;
    return {
      node,
      newPaneId: secondResult.newPaneId,
    };
  }

  return { node };
}

export function closePaneRecursively(
  node: SplitNode,
  targetPaneId: PaneID,
): { node?: SplitNode; focusPaneId?: PaneID; closed: boolean } {
  if (node.type === "pane") {
    return {
      node: node.pane.id === targetPaneId ? undefined : node,
      closed: node.pane.id === targetPaneId,
    };
  }

  if (node.split.first.type === "pane" && node.split.first.pane.id === targetPaneId) {
    return {
      node: node.split.second,
      focusPaneId: allPaneIds(node.split.second)[0],
      closed: true,
    };
  }

  if (node.split.second.type === "pane" && node.split.second.pane.id === targetPaneId) {
    return {
      node: node.split.first,
      focusPaneId: allPaneIds(node.split.first)[0],
      closed: true,
    };
  }

  const firstResult = closePaneRecursively(node.split.first, targetPaneId);
  if (firstResult.closed) {
    if (!firstResult.node) {
      return {
        node: node.split.second,
        focusPaneId: allPaneIds(node.split.second)[0],
        closed: true,
      };
    }

    node.split.first = firstResult.node;
    return {
      node,
      focusPaneId: firstResult.focusPaneId,
      closed: true,
    };
  }

  const secondResult = closePaneRecursively(node.split.second, targetPaneId);
  if (secondResult.closed) {
    if (!secondResult.node) {
      return {
        node: node.split.first,
        focusPaneId: allPaneIds(node.split.first)[0],
        closed: true,
      };
    }

    node.split.second = secondResult.node;
    return {
      node,
      focusPaneId: secondResult.focusPaneId,
      closed: true,
    };
  }

  return {
    node,
    closed: false,
  };
}

export function buildExternalTree(
  node: SplitNode,
  containerFrame: PixelRect,
  bounds: PixelRect = { x: 0, y: 0, width: 1, height: 1 },
): ExternalTreeNode {
  if (node.type === "pane") {
    return {
      type: "pane",
      pane: {
        id: node.pane.id,
        frame: toPixelRect(containerFrame, bounds),
        tabs: node.pane.tabs.map((tab) => ({
          id: tab.id,
          title: tab.title,
        })),
        selectedTabId: node.pane.selectedTabId,
      },
    };
  }

  const dividerPosition = node.split.dividerPosition;
  const firstBounds =
    node.split.orientation === "horizontal"
      ? {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width * dividerPosition,
          height: bounds.height,
        }
      : {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height * dividerPosition,
        };
  const secondBounds =
    node.split.orientation === "horizontal"
      ? {
          x: bounds.x + bounds.width * dividerPosition,
          y: bounds.y,
          width: bounds.width * (1 - dividerPosition),
          height: bounds.height,
        }
      : {
          x: bounds.x,
          y: bounds.y + bounds.height * dividerPosition,
          width: bounds.width,
          height: bounds.height * (1 - dividerPosition),
        };

  return {
    type: "split",
    split: {
      id: node.split.id,
      orientation: node.split.orientation,
      dividerPosition,
      first: buildExternalTree(node.split.first, containerFrame, firstBounds),
      second: buildExternalTree(node.split.second, containerFrame, secondBounds),
    },
  };
}

export function toPixelRect(containerFrame: PixelRect, bounds: PixelRect): PixelRect {
  return {
    x: bounds.x * containerFrame.width + containerFrame.x,
    y: bounds.y * containerFrame.height + containerFrame.y,
    width: bounds.width * containerFrame.width,
    height: bounds.height * containerFrame.height,
  };
}

export function clampDividerPosition(position: number): number {
  return Math.min(Math.max(position, 0.1), 0.9);
}
