import { SplitsConfiguration, normalizeSplitsConfiguration } from "./configuration.js";
import { createId } from "./internal/id.js";
import {
  allPaneIds,
  allPanes,
  buildExternalTree,
  clampDividerPosition,
  cloneTab,
  closePaneRecursively,
  computePaneBounds,
  createInitialRootNode,
  createTabItem,
  findPane,
  findSplit,
  findTab,
  insertTab,
  moveTabWithinPane,
  removeTab,
  selectTab,
  selectedTab,
  splitNodeRecursively,
  toPixelRect,
} from "./internal/tree.js";
import type {
  CreateTabObjectOptions,
  CreateTabOptions,
  ExternalTreeNode,
  LayoutSnapshot,
  NavigationDirection,
  PaneID,
  PaneState,
  PixelRect,
  SerializedSplitsState,
  SplitID,
  SplitNode,
  SplitOrientation,
  SplitPaneOptions,
  SplitsConfigurationInput,
  SplitsConfiguration as SplitsConfigurationType,
  SplitsDelegate,
  SplitsState,
  SplitsSubscriber,
  SplitsUnsubscriber,
  Tab,
  TabID,
  UpdateTabOptions,
} from "./types.js";

type SplitPaneArgument = SplitOrientation | PaneID | SplitPaneOptions | undefined;

const defaultNewTabTitle = "Untitled";
const serializedSplitsStateVersion = 1 satisfies SerializedSplitsState["version"];

const emptyFrame: PixelRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

interface SerializedValidationContext {
  paneIds: Set<PaneID>;
  splitIds: Set<SplitID>;
  tabIds: Set<TabID>;
}

function cloneSplitNode(node: SplitNode): SplitNode {
  if (node.type === "pane") {
    return {
      type: "pane",
      pane: {
        id: node.pane.id,
        tabs: node.pane.tabs.map(cloneTab),
        selectedTabId: node.pane.selectedTabId,
      },
    };
  }

  return {
    type: "split",
    split: {
      id: node.split.id,
      orientation: node.split.orientation,
      first: cloneSplitNode(node.split.first),
      second: cloneSplitNode(node.split.second),
      dividerPosition: node.split.dividerPosition,
      animationOrigin: node.split.animationOrigin,
    },
  };
}

function normalizeSerializedSplitsState(
  snapshot: unknown,
): Pick<SerializedSplitsState, "rootNode" | "focusedPaneId" | "zoomedPaneId"> | undefined {
  if (!isRecord(snapshot) || snapshot.version !== serializedSplitsStateVersion) {
    return undefined;
  }

  const context: SerializedValidationContext = {
    paneIds: new Set(),
    splitIds: new Set(),
    tabIds: new Set(),
  };
  const rootNode = normalizeSerializedSplitNode(snapshot.rootNode, context);
  if (!rootNode || context.paneIds.size === 0) {
    return undefined;
  }

  const focusedPaneId =
    snapshot.focusedPaneId === undefined
      ? allPaneIds(rootNode)[0]
      : typeof snapshot.focusedPaneId === "string" && context.paneIds.has(snapshot.focusedPaneId)
        ? snapshot.focusedPaneId
        : undefined;
  if (!focusedPaneId) {
    return undefined;
  }

  let zoomedPaneId: PaneID | undefined;
  if (snapshot.zoomedPaneId !== undefined) {
    if (typeof snapshot.zoomedPaneId !== "string" || !context.paneIds.has(snapshot.zoomedPaneId)) {
      return undefined;
    }
    zoomedPaneId = snapshot.zoomedPaneId;
  }

  return {
    rootNode,
    focusedPaneId,
    zoomedPaneId,
  };
}

function normalizeSerializedSplitNode(
  value: unknown,
  context: SerializedValidationContext,
): SplitNode | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  if (value.type === "pane") {
    const pane = isRecord(value.pane) ? value.pane : undefined;
    if (!pane) {
      return undefined;
    }
    const paneId = pane?.id;
    const tabsValue = pane?.tabs;
    if (
      typeof paneId !== "string" ||
      paneId.length === 0 ||
      context.paneIds.has(paneId) ||
      !Array.isArray(tabsValue)
    ) {
      return undefined;
    }

    context.paneIds.add(paneId);
    const tabs: Tab[] = [];
    for (const tabValue of tabsValue) {
      const tab = normalizeSerializedTab(tabValue, context);
      if (!tab) {
        return undefined;
      }
      tabs.push(tab);
    }

    const selectedTabId = pane.selectedTabId;
    if (
      selectedTabId !== undefined &&
      (typeof selectedTabId !== "string" || !tabs.some((tab) => tab.id === selectedTabId))
    ) {
      return undefined;
    }

    return {
      type: "pane",
      pane: {
        id: paneId,
        tabs,
        selectedTabId,
      },
    };
  }

  if (value.type === "split") {
    const split = isRecord(value.split) ? value.split : undefined;
    if (!split) {
      return undefined;
    }
    const splitId = split?.id;
    const orientation = split?.orientation;
    const dividerPosition = split?.dividerPosition;
    if (
      typeof splitId !== "string" ||
      splitId.length === 0 ||
      context.splitIds.has(splitId) ||
      (orientation !== "horizontal" && orientation !== "vertical") ||
      typeof dividerPosition !== "number" ||
      !Number.isFinite(dividerPosition)
    ) {
      return undefined;
    }

    context.splitIds.add(splitId);
    const first = normalizeSerializedSplitNode(split.first, context);
    const second = normalizeSerializedSplitNode(split.second, context);
    if (!first || !second) {
      return undefined;
    }

    const animationOrigin =
      split.animationOrigin === "fromFirst" || split.animationOrigin === "fromSecond"
        ? split.animationOrigin
        : undefined;

    return {
      type: "split",
      split: {
        id: splitId,
        orientation,
        first,
        second,
        dividerPosition: clampDividerPosition(dividerPosition),
        animationOrigin,
      },
    };
  }

  return undefined;
}

function normalizeSerializedTab(
  value: unknown,
  context: SerializedValidationContext,
): Tab | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = value.id;
  const title = value.title;
  const icon = value.icon;
  const isDirty = value.isDirty;
  const isClosable = value.isClosable;
  if (
    typeof id !== "string" ||
    id.length === 0 ||
    context.tabIds.has(id) ||
    typeof title !== "string" ||
    (icon !== null && typeof icon !== "string") ||
    typeof isDirty !== "boolean" ||
    (isClosable !== undefined && typeof isClosable !== "boolean")
  ) {
    return undefined;
  }

  context.tabIds.add(id);
  return {
    id,
    title,
    icon,
    isDirty,
    isClosable,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class SplitsController {
  delegate?: SplitsDelegate<SplitsController>;
  configuration: SplitsConfigurationType;

  private state: SplitsState;
  private subscribers = new Set<SplitsSubscriber>();
  private isExternalUpdateInProgress = false;
  private lastGeometryNotificationTime = 0;

  constructor(configuration: SplitsConfigurationInput = {}) {
    this.configuration = normalizeSplitsConfiguration(configuration);

    const rootNode = createInitialRootNode();
    this.state = {
      rootNode,
      focusedPaneId: allPaneIds(rootNode)[0],
      containerFrame: emptyFrame,
      version: 0,
    };
  }

  static Configuration = SplitsConfiguration;

  subscribe(subscriber: SplitsSubscriber): SplitsUnsubscriber {
    this.subscribers.add(subscriber);
    subscriber(this.state);

    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  getState(): SplitsState {
    return this.state;
  }

  get focusedPaneId(): PaneID | undefined {
    return this.state.focusedPaneId;
  }

  get zoomedPaneId(): PaneID | undefined {
    return this.state.zoomedPaneId;
  }

  get isZoomed(): boolean {
    return this.state.zoomedPaneId !== undefined;
  }

  get allTabIds(): TabID[] {
    return allPanes(this.state.rootNode).flatMap((pane) => pane.tabs.map((tab) => tab.id));
  }

  get allPaneIds(): PaneID[] {
    return allPaneIds(this.state.rootNode);
  }

  serializeState(): SerializedSplitsState {
    return {
      version: serializedSplitsStateVersion,
      rootNode: cloneSplitNode(this.state.rootNode),
      focusedPaneId: this.state.focusedPaneId,
      zoomedPaneId: this.state.zoomedPaneId,
    };
  }

  restoreState(snapshot: unknown): boolean {
    const restored = normalizeSerializedSplitsState(snapshot);
    if (!restored) {
      return false;
    }

    this.state = {
      rootNode: restored.rootNode,
      focusedPaneId: restored.focusedPaneId,
      zoomedPaneId: restored.zoomedPaneId,
      containerFrame: this.state.containerFrame,
      version: this.state.version,
    };
    this.emit();
    this.notifyGeometryChange();
    return true;
  }

  createTab(title: string, options?: CreateTabOptions): TabID | undefined;
  createTab(options: CreateTabObjectOptions): TabID | undefined;
  createTab(
    titleOrOptions: string | CreateTabObjectOptions,
    options: CreateTabOptions = {},
  ): TabID | undefined {
    const tabOptions =
      typeof titleOrOptions === "string"
        ? {
            ...options,
            title: titleOrOptions,
          }
        : titleOrOptions;

    const targetPaneId =
      tabOptions.inPane ?? this.state.focusedPaneId ?? allPaneIds(this.state.rootNode)[0];
    if (!targetPaneId) {
      return undefined;
    }

    const targetPane = findPane(this.state.rootNode, targetPaneId);
    if (!targetPane) {
      return undefined;
    }

    const tab = createTabItem(tabOptions);
    if (this.delegate?.shouldCreateTab?.(this, cloneTab(tab), targetPaneId) === false) {
      return undefined;
    }

    const insertIndex = this.newTabInsertionIndex(targetPane);
    insertTab(targetPane, tab, insertIndex);

    this.emit();
    this.delegate?.didCreateTab?.(this, cloneTab(tab), targetPaneId);

    return tab.id;
  }

  updateTab(tabId: TabID, updates: UpdateTabOptions): boolean {
    const match = findTab(this.state.rootNode, tabId);
    if (!match) {
      return false;
    }

    const nextIcon = Object.hasOwn(updates, "icon") ? (updates.icon ?? null) : match.tab.icon;
    const changed =
      (updates.title !== undefined && updates.title !== match.tab.title) ||
      (Object.hasOwn(updates, "icon") && nextIcon !== match.tab.icon) ||
      (updates.isDirty !== undefined && updates.isDirty !== match.tab.isDirty) ||
      (updates.isClosable !== undefined && updates.isClosable !== match.tab.isClosable);
    if (!changed) {
      return true;
    }

    if (updates.title !== undefined) {
      match.tab.title = updates.title;
    }

    if (Object.hasOwn(updates, "icon")) {
      match.tab.icon = nextIcon;
    }

    if (updates.isDirty !== undefined) {
      match.tab.isDirty = updates.isDirty;
    }

    if (updates.isClosable !== undefined) {
      match.tab.isClosable = updates.isClosable;
    }

    this.emit();
    return true;
  }

  closeTab(tabId: TabID, paneId?: PaneID): boolean {
    if (!this.configuration.allowCloseTabs) {
      return false;
    }

    const match = paneId ? this.findTabInPane(tabId, paneId) : findTab(this.state.rootNode, tabId);
    if (!match) {
      return false;
    }

    if (match.tab.isClosable === false) {
      return false;
    }

    const paneIdToCloseFrom = match.pane.id;
    const tab = cloneTab(match.tab);
    if (this.delegate?.shouldCloseTab?.(this, tab, paneIdToCloseFrom) === false) {
      return false;
    }

    removeTab(match.pane, tabId);
    const closedPane = this.closePaneIfEmpty(match.pane.id);

    this.emit();
    this.delegate?.didCloseTab?.(this, tabId, paneIdToCloseFrom);

    if (closedPane) {
      this.notifyGeometryChange();
    }

    return true;
  }

  selectTab(tabId: TabID): boolean {
    const match = findTab(this.state.rootNode, tabId);
    if (!match || !selectTab(match.pane, tabId)) {
      return false;
    }

    const previousPaneId = this.state.focusedPaneId;
    this.state.focusedPaneId = match.pane.id;
    this.emit();
    this.delegate?.didSelectTab?.(this, cloneTab(match.tab), match.pane.id);
    if (previousPaneId !== match.pane.id) {
      this.delegate?.didFocusPane?.(this, match.pane.id);
    }
    return true;
  }

  selectPreviousTab(): boolean {
    return this.selectRelativeTab(-1);
  }

  selectNextTab(): boolean {
    return this.selectRelativeTab(1);
  }

  toggleZoom(paneId?: PaneID): boolean {
    const targetPaneId = paneId ?? this.state.focusedPaneId;
    if (!targetPaneId || !findPane(this.state.rootNode, targetPaneId)) {
      return false;
    }

    const previousZoomedPaneId = this.state.zoomedPaneId;
    if (previousZoomedPaneId === targetPaneId) {
      this.state.zoomedPaneId = undefined;
      this.emit();
      this.delegate?.didUnzoomPane?.(this, targetPaneId);
      return true;
    }

    if (!previousZoomedPaneId && allPaneIds(this.state.rootNode).length <= 1) {
      return false;
    }

    this.state.zoomedPaneId = targetPaneId;
    this.emit();
    this.delegate?.didZoomPane?.(this, targetPaneId);
    return true;
  }

  unzoom(): void {
    const previousZoomedPaneId = this.state.zoomedPaneId;
    if (!previousZoomedPaneId) {
      return;
    }

    this.state.zoomedPaneId = undefined;
    this.emit();
    this.delegate?.didUnzoomPane?.(this, previousZoomedPaneId);
  }

  splitPane(orientation: SplitOrientation): PaneID | undefined;
  splitPane(paneId: PaneID | undefined, orientation: SplitOrientation): PaneID | undefined;
  splitPane(options: SplitPaneOptions): PaneID | undefined;
  splitPane(
    firstArgument: SplitPaneArgument,
    secondArgument?: SplitOrientation,
  ): PaneID | undefined {
    const options = this.normalizeSplitPaneArguments(firstArgument, secondArgument);
    if (!options || !this.configuration.allowSplits) {
      return undefined;
    }

    const targetPaneId = options.paneId ?? this.state.focusedPaneId;
    if (!targetPaneId || !findPane(this.state.rootNode, targetPaneId)) {
      return undefined;
    }

    if (this.delegate?.shouldSplitPane?.(this, targetPaneId, options.orientation) === false) {
      return undefined;
    }

    const newPaneId = createId();
    const tab = this.tabForSplit(options);
    if (tab && this.delegate?.shouldCreateTab?.(this, cloneTab(tab), newPaneId) === false) {
      return undefined;
    }

    const result = splitNodeRecursively(
      this.state.rootNode,
      targetPaneId,
      options.orientation,
      tab,
      options.insertFirst,
      newPaneId,
    );

    if (!result.newPaneId) {
      return undefined;
    }

    this.state.rootNode = result.node;
    this.state.focusedPaneId = result.newPaneId;
    this.state.zoomedPaneId = undefined;

    this.emit();
    this.delegate?.didSplitPane?.(this, targetPaneId, result.newPaneId, options.orientation);
    if (tab) {
      this.delegate?.didCreateTab?.(this, cloneTab(tab), result.newPaneId);
    }
    this.notifyGeometryChange();

    return result.newPaneId;
  }

  closePane(paneId: PaneID): boolean {
    if (!this.configuration.allowCloseLastPane && allPaneIds(this.state.rootNode).length <= 1) {
      return false;
    }

    if (this.delegate?.shouldClosePane?.(this, paneId) === false) {
      return false;
    }

    const didClose = this.closePaneInternal(paneId);
    if (!didClose) {
      return false;
    }

    this.emit();
    this.delegate?.didClosePane?.(this, paneId);
    this.notifyGeometryChange();

    return true;
  }

  focusPane(paneId: PaneID): boolean {
    if (!findPane(this.state.rootNode, paneId)) {
      return false;
    }

    this.state.focusedPaneId = paneId;
    this.emit();
    this.delegate?.didFocusPane?.(this, paneId);
    return true;
  }

  navigateFocus(direction: NavigationDirection): boolean {
    const previousZoomedPaneId = this.state.zoomedPaneId;
    if (previousZoomedPaneId && !this.configuration.preserveZoomOnNavigation) {
      this.state.zoomedPaneId = undefined;
      this.delegate?.didUnzoomPane?.(this, previousZoomedPaneId);
    }

    const didNavigate = this.navigateFocusInternal(direction);
    if (didNavigate && previousZoomedPaneId && this.configuration.preserveZoomOnNavigation) {
      this.state.zoomedPaneId = this.state.focusedPaneId;
    }

    if (!didNavigate && previousZoomedPaneId && !this.configuration.preserveZoomOnNavigation) {
      this.emit();
      return true;
    }

    if (didNavigate) {
      this.emit();
      if (this.state.focusedPaneId) {
        this.delegate?.didFocusPane?.(this, this.state.focusedPaneId);
      }
    }

    return didNavigate;
  }

  tab(tabId: TabID): Tab | undefined {
    const match = findTab(this.state.rootNode, tabId);
    return match ? cloneTab(match.tab) : undefined;
  }

  tabs(paneId: PaneID): Tab[] {
    return findPane(this.state.rootNode, paneId)?.tabs.map(cloneTab) ?? [];
  }

  selectedTab(paneId: PaneID): Tab | undefined {
    const pane = findPane(this.state.rootNode, paneId);
    const tab = pane ? selectedTab(pane) : undefined;
    return tab ? cloneTab(tab) : undefined;
  }

  layoutSnapshot(): LayoutSnapshot {
    const containerFrame = this.state.containerFrame;
    const paneBounds =
      this.state.zoomedPaneId && findPane(this.state.rootNode, this.state.zoomedPaneId)
        ? [
            {
              paneId: this.state.zoomedPaneId,
              bounds: { x: 0, y: 0, width: 1, height: 1 },
            },
          ]
        : computePaneBounds(this.state.rootNode);

    return {
      containerFrame,
      panes: paneBounds.map(({ paneId, bounds }) => {
        const pane = findPane(this.state.rootNode, paneId);

        return {
          paneId,
          frame: toPixelRect(containerFrame, bounds),
          selectedTabId: pane?.selectedTabId,
          tabIds: pane?.tabs.map((tab) => tab.id) ?? [],
        };
      }),
      focusedPaneId: this.state.focusedPaneId,
      isZoomed: this.state.zoomedPaneId !== undefined,
      zoomedPaneId: this.state.zoomedPaneId,
      timestamp: Date.now() / 1000,
    };
  }

  treeSnapshot(): ExternalTreeNode {
    return buildExternalTree(this.state.rootNode, this.state.containerFrame);
  }

  findSplit(splitId: SplitID): boolean {
    return findSplit(this.state.rootNode, splitId) !== undefined;
  }

  setDividerPosition(
    position: number,
    splitId: SplitID,
    options: { fromExternal?: boolean; notify?: boolean } = {},
  ): boolean {
    const split = findSplit(this.state.rootNode, splitId);
    if (!split) {
      return false;
    }

    if (options.fromExternal) {
      this.isExternalUpdateInProgress = true;
    }

    split.dividerPosition = clampDividerPosition(position);
    this.emit();

    if (options.notify) {
      this.notifyGeometryChange(options.notify === true);
    }

    if (options.fromExternal) {
      queueMicrotask(() => {
        this.isExternalUpdateInProgress = false;
      });
    }

    return true;
  }

  setContainerFrame(frame: PixelRect): void {
    if (
      this.state.containerFrame.x === frame.x &&
      this.state.containerFrame.y === frame.y &&
      this.state.containerFrame.width === frame.width &&
      this.state.containerFrame.height === frame.height
    ) {
      return;
    }

    this.state.containerFrame = frame;
    this.emit();
    this.notifyGeometryChange();
  }

  notifyGeometryChange(isDragging = false): void {
    if (this.isExternalUpdateInProgress) {
      return;
    }

    if (isDragging && this.delegate?.shouldNotifyDuringDrag?.(this, true) !== true) {
      return;
    }

    const now = Date.now();
    if (now - this.lastGeometryNotificationTime < 50) {
      return;
    }

    this.lastGeometryNotificationTime = now;
    this.delegate?.didChangeGeometry?.(this, this.layoutSnapshot());
  }

  moveTab(tabId: TabID, sourcePaneId: PaneID, targetPaneId: PaneID, index?: number): boolean {
    if (sourcePaneId !== targetPaneId && !this.configuration.allowCrossPaneTabMove) {
      return false;
    }

    const sourcePane = findPane(this.state.rootNode, sourcePaneId);
    const targetPane = findPane(this.state.rootNode, targetPaneId);
    if (!sourcePane || !targetPane) {
      return false;
    }

    const sourceIndex = sourcePane.tabs.findIndex((tab) => tab.id === tabId);
    if (sourceIndex === -1) {
      return false;
    }

    if (sourcePaneId === targetPaneId) {
      const didMove = moveTabWithinPane(sourcePane, sourceIndex, index ?? sourcePane.tabs.length);
      if (didMove) {
        this.emit();
      }
      return didMove;
    }

    const tab = removeTab(sourcePane, tabId);
    if (!tab) {
      return false;
    }

    insertTab(targetPane, tab, index);
    this.state.focusedPaneId = targetPaneId;
    const closedPane = this.closePaneIfEmpty(sourcePaneId);

    this.emit();
    this.delegate?.didMoveTab?.(this, cloneTab(tab), sourcePaneId, targetPaneId);

    if (closedPane) {
      this.notifyGeometryChange();
    }

    return true;
  }

  moveTabFromController(
    sourceController: SplitsController,
    tabId: TabID,
    sourcePaneId: PaneID,
    targetPaneId: PaneID,
    index?: number,
  ): boolean {
    if (sourceController === this) {
      return this.moveTab(tabId, sourcePaneId, targetPaneId, index);
    }

    if (!this.canTransferTabFrom(sourceController)) {
      return false;
    }

    const sourcePane = findPane(sourceController.state.rootNode, sourcePaneId);
    const targetPane = findPane(this.state.rootNode, targetPaneId);
    if (!sourcePane || !targetPane || findTab(this.state.rootNode, tabId)) {
      return false;
    }

    const tab = removeTab(sourcePane, tabId);
    if (!tab) {
      return false;
    }

    insertTab(targetPane, tab, index);
    sourceController.closePaneIfEmpty(sourcePaneId);
    this.state.focusedPaneId = targetPaneId;
    this.state.zoomedPaneId = undefined;

    sourceController.emit();
    this.emit();
    this.notifyTransferredTabSelected(tab, sourcePaneId, targetPaneId);
    sourceController.notifyGeometryChange();
    this.notifyGeometryChange();

    return true;
  }

  moveTabToSplit(
    tabId: TabID,
    sourcePaneId: PaneID,
    targetPaneId: PaneID,
    orientation: SplitOrientation,
    options: { insertFirst?: boolean } = {},
  ): PaneID | undefined {
    if (!this.configuration.allowSplits) {
      return undefined;
    }

    if (sourcePaneId !== targetPaneId && !this.configuration.allowCrossPaneTabMove) {
      return undefined;
    }

    const sourcePane = findPane(this.state.rootNode, sourcePaneId);
    const targetPane = findPane(this.state.rootNode, targetPaneId);
    if (!sourcePane || !targetPane) {
      return undefined;
    }

    const tab = sourcePane.tabs.find((candidate) => candidate.id === tabId);
    if (!tab) {
      return undefined;
    }

    if (sourcePaneId !== targetPaneId && targetPane.tabs.length === 0) {
      return this.moveTab(tabId, sourcePaneId, targetPaneId) ? targetPaneId : undefined;
    }

    if (sourcePaneId === targetPaneId && sourcePane.tabs.length === 1) {
      return undefined;
    }

    if (this.delegate?.shouldSplitPane?.(this, targetPaneId, orientation) === false) {
      return undefined;
    }

    removeTab(sourcePane, tabId);

    const shouldCloseSourcePane =
      sourcePaneId !== targetPaneId &&
      sourcePane.tabs.length === 0 &&
      allPaneIds(this.state.rootNode).length > 1 &&
      this.configuration.autoCloseEmptyPanes;

    if (shouldCloseSourcePane) {
      this.closePaneInternal(sourcePaneId);
    }

    const result = splitNodeRecursively(
      this.state.rootNode,
      targetPaneId,
      orientation,
      tab,
      options.insertFirst,
    );

    const newPaneId = result.newPaneId;
    if (!newPaneId) {
      insertTab(sourcePane, tab);
      return undefined;
    }

    this.state.rootNode = result.node;
    this.state.focusedPaneId = newPaneId;
    this.state.zoomedPaneId = undefined;
    this.emit();
    this.delegate?.didSplitPane?.(this, targetPaneId, newPaneId, orientation);
    this.delegate?.didMoveTab?.(this, cloneTab(tab), sourcePaneId, newPaneId);
    this.notifyGeometryChange();

    return newPaneId;
  }

  moveTabFromControllerToSplit(
    sourceController: SplitsController,
    tabId: TabID,
    sourcePaneId: PaneID,
    targetPaneId: PaneID,
    orientation: SplitOrientation,
    options: { insertFirst?: boolean } = {},
  ): PaneID | undefined {
    if (sourceController === this) {
      return this.moveTabToSplit(tabId, sourcePaneId, targetPaneId, orientation, options);
    }

    if (!this.configuration.allowSplits || !this.canTransferTabFrom(sourceController)) {
      return undefined;
    }

    const sourcePane = findPane(sourceController.state.rootNode, sourcePaneId);
    const targetPane = findPane(this.state.rootNode, targetPaneId);
    if (!sourcePane || !targetPane || findTab(this.state.rootNode, tabId)) {
      return undefined;
    }

    const tab = sourcePane.tabs.find((candidate) => candidate.id === tabId);
    if (!tab) {
      return undefined;
    }

    if (targetPane.tabs.length === 0) {
      return this.moveTabFromController(sourceController, tabId, sourcePaneId, targetPaneId)
        ? targetPaneId
        : undefined;
    }

    if (this.delegate?.shouldSplitPane?.(this, targetPaneId, orientation) === false) {
      return undefined;
    }

    const removedTab = removeTab(sourcePane, tabId);
    if (!removedTab) {
      return undefined;
    }

    const result = splitNodeRecursively(
      this.state.rootNode,
      targetPaneId,
      orientation,
      removedTab,
      options.insertFirst,
    );

    const newPaneId = result.newPaneId;
    if (!newPaneId) {
      insertTab(sourcePane, removedTab);
      return undefined;
    }

    sourceController.closePaneIfEmpty(sourcePaneId);
    this.state.rootNode = result.node;
    this.state.focusedPaneId = newPaneId;
    this.state.zoomedPaneId = undefined;

    sourceController.emit();
    this.emit();
    this.delegate?.didSplitPane?.(this, targetPaneId, newPaneId, orientation);
    this.notifyTransferredTabSelected(removedTab, sourcePaneId, newPaneId);
    sourceController.notifyGeometryChange();
    this.notifyGeometryChange();

    return newPaneId;
  }

  private emit(): void {
    this.state = {
      ...this.state,
      version: this.state.version + 1,
    };

    for (const subscriber of this.subscribers) {
      subscriber(this.state);
    }
  }

  private newTabInsertionIndex(pane: { tabs: Tab[]; selectedTabId?: TabID }): number | undefined {
    if (this.configuration.newTabPosition === "end") {
      return undefined;
    }

    const selectedIndex = pane.tabs.findIndex((tab) => tab.id === pane.selectedTabId);
    return selectedIndex === -1 ? undefined : selectedIndex + 1;
  }

  private closePaneIfEmpty(paneId: PaneID): boolean {
    const pane = findPane(this.state.rootNode, paneId);
    if (
      !pane ||
      pane.tabs.length > 0 ||
      allPaneIds(this.state.rootNode).length <= 1 ||
      !this.configuration.autoCloseEmptyPanes
    ) {
      return false;
    }

    return this.closePaneInternal(paneId);
  }

  private canTransferTabFrom(sourceController: SplitsController): boolean {
    return (
      this.configuration.allowTabReordering &&
      this.configuration.allowCrossControllerTabMove &&
      sourceController.configuration.allowTabReordering &&
      sourceController.configuration.allowCrossControllerTabMove
    );
  }

  private notifyTransferredTabSelected(tab: Tab, sourcePaneId: PaneID, targetPaneId: PaneID): void {
    this.delegate?.didMoveTab?.(this, cloneTab(tab), sourcePaneId, targetPaneId);
    this.delegate?.didSelectTab?.(this, cloneTab(tab), targetPaneId);
    this.delegate?.didFocusPane?.(this, targetPaneId);
  }

  private closePaneInternal(paneId: PaneID): boolean {
    if (allPaneIds(this.state.rootNode).length <= 1) {
      return false;
    }

    const result = closePaneRecursively(this.state.rootNode, paneId);
    if (!result.closed || !result.node) {
      return false;
    }

    this.state.rootNode = result.node;
    this.state.focusedPaneId = result.focusPaneId ?? allPaneIds(this.state.rootNode)[0];

    if (
      this.state.zoomedPaneId &&
      (!findPane(this.state.rootNode, this.state.zoomedPaneId) ||
        allPaneIds(this.state.rootNode).length <= 1)
    ) {
      this.state.zoomedPaneId = undefined;
    }

    return true;
  }

  private findTabInPane(tabId: TabID, paneId: PaneID): { pane: PaneState; tab: Tab } | undefined {
    const pane = findPane(this.state.rootNode, paneId);
    if (!pane) {
      return undefined;
    }

    const tab = pane.tabs.find((candidate) => candidate.id === tabId);
    return tab ? { pane, tab } : undefined;
  }

  private selectRelativeTab(direction: -1 | 1): boolean {
    const pane = this.state.focusedPaneId
      ? findPane(this.state.rootNode, this.state.focusedPaneId)
      : undefined;
    if (!pane || !pane.selectedTabId || pane.tabs.length === 0) {
      return false;
    }

    const currentIndex = pane.tabs.findIndex((tab) => tab.id === pane.selectedTabId);
    if (currentIndex === -1) {
      return false;
    }

    const panesWithTabs = allPanes(this.state.rootNode).filter(
      (candidate) => candidate.tabs.length > 0,
    );
    const currentPaneIndex = panesWithTabs.findIndex((candidate) => candidate.id === pane.id);
    if (currentPaneIndex === -1) {
      return false;
    }

    const target =
      direction === 1
        ? this.nextTabTarget(panesWithTabs, currentPaneIndex, currentIndex)
        : this.previousTabTarget(panesWithTabs, currentPaneIndex, currentIndex);
    if (!target) {
      return false;
    }

    const previousPaneId = this.state.focusedPaneId;
    target.pane.selectedTabId = target.tab.id;
    this.state.focusedPaneId = target.pane.id;
    this.emit();
    this.delegate?.didSelectTab?.(this, cloneTab(target.tab), target.pane.id);
    if (previousPaneId !== target.pane.id) {
      this.delegate?.didFocusPane?.(this, target.pane.id);
    }
    return true;
  }

  private nextTabTarget(
    panes: PaneState[],
    currentPaneIndex: number,
    currentTabIndex: number,
  ): { pane: PaneState; tab: Tab } | undefined {
    const pane = panes[currentPaneIndex];
    const nextTab = pane?.tabs[currentTabIndex + 1];
    if (pane && nextTab) {
      return { pane, tab: nextTab };
    }

    const nextPane = panes[(currentPaneIndex + 1) % panes.length];
    const tab = nextPane?.tabs[0];
    return nextPane && tab ? { pane: nextPane, tab } : undefined;
  }

  private previousTabTarget(
    panes: PaneState[],
    currentPaneIndex: number,
    currentTabIndex: number,
  ): { pane: PaneState; tab: Tab } | undefined {
    const pane = panes[currentPaneIndex];
    const previousTab = pane?.tabs[currentTabIndex - 1];
    if (pane && previousTab) {
      return { pane, tab: previousTab };
    }

    const previousPane = panes[(currentPaneIndex - 1 + panes.length) % panes.length];
    const tab = previousPane?.tabs.at(-1);
    return previousPane && tab ? { pane: previousPane, tab } : undefined;
  }

  private navigateFocusInternal(direction: NavigationDirection): boolean {
    const currentPaneId = this.state.focusedPaneId;
    if (!currentPaneId) {
      return false;
    }

    const paneBounds = computePaneBounds(this.state.rootNode);
    const currentBounds = paneBounds.find(({ paneId }) => paneId === currentPaneId)?.bounds;
    if (!currentBounds) {
      return false;
    }

    const targetPaneId = this.findBestNeighbor(direction, currentPaneId, currentBounds, paneBounds);
    if (!targetPaneId) {
      return false;
    }

    this.state.focusedPaneId = targetPaneId;
    return true;
  }

  private findBestNeighbor(
    direction: NavigationDirection,
    currentPaneId: PaneID,
    currentBounds: PixelRect,
    paneBounds: ReturnType<typeof computePaneBounds>,
  ): PaneID | undefined {
    const epsilon = 0.001;
    const candidates = paneBounds.filter(({ paneId, bounds }) => {
      if (paneId === currentPaneId) {
        return false;
      }

      switch (direction) {
        case "left":
          return bounds.x + bounds.width <= currentBounds.x + epsilon;
        case "right":
          return bounds.x >= currentBounds.x + currentBounds.width - epsilon;
        case "up":
          return bounds.y + bounds.height <= currentBounds.y + epsilon;
        case "down":
          return bounds.y >= currentBounds.y + currentBounds.height - epsilon;
      }
    });

    return candidates
      .map(({ paneId, bounds }) => {
        const overlap =
          direction === "left" || direction === "right"
            ? Math.max(
                0,
                Math.min(currentBounds.y + currentBounds.height, bounds.y + bounds.height) -
                  Math.max(currentBounds.y, bounds.y),
              )
            : Math.max(
                0,
                Math.min(currentBounds.x + currentBounds.width, bounds.x + bounds.width) -
                  Math.max(currentBounds.x, bounds.x),
              );
        const distance =
          direction === "left"
            ? currentBounds.x - (bounds.x + bounds.width)
            : direction === "right"
              ? bounds.x - (currentBounds.x + currentBounds.width)
              : direction === "up"
                ? currentBounds.y - (bounds.y + bounds.height)
                : bounds.y - (currentBounds.y + currentBounds.height);

        return {
          paneId,
          overlap,
          distance,
        };
      })
      .sort((first, second) => {
        if (Math.abs(first.overlap - second.overlap) > epsilon) {
          return second.overlap - first.overlap;
        }

        return first.distance - second.distance;
      })[0]?.paneId;
  }

  private normalizeSplitPaneArguments(
    firstArgument: SplitPaneArgument,
    secondArgument?: SplitOrientation,
  ): SplitPaneOptions | undefined {
    if (typeof firstArgument === "object") {
      return firstArgument;
    }

    if (firstArgument === "horizontal" || firstArgument === "vertical") {
      return {
        orientation: firstArgument,
      };
    }

    if (secondArgument) {
      return {
        paneId: firstArgument,
        orientation: secondArgument,
      };
    }

    return undefined;
  }

  private normalizeTab(tab: Tab | CreateTabObjectOptions): Tab {
    if ("id" in tab && tab.id) {
      return {
        id: tab.id,
        title: tab.title,
        icon: tab.icon === undefined ? "doc.text" : tab.icon,
        isDirty: tab.isDirty ?? false,
        isClosable: tab.isClosable ?? true,
      };
    }

    return createTabItem(tab);
  }

  private tabForSplit(options: SplitPaneOptions): Tab | undefined {
    if (options.withTab === false) {
      return undefined;
    }

    return this.normalizeTab(options.withTab ?? { title: defaultNewTabTitle });
  }
}
