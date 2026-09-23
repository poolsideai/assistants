export type TabID = string;
export type PaneID = string;
export type SplitID = string;

export type SplitOrientation = "horizontal" | "vertical";
export type NavigationDirection = "left" | "right" | "up" | "down";
export type ContentViewLifecycle = "recreateOnSwitch" | "keepAllAlive";
export type NewTabPosition = "current" | "end";
export type SplitAnimationOrigin = "fromFirst" | "fromSecond";

export interface Tab {
  id: TabID;
  title: string;
  icon: string | null;
  isDirty: boolean;
  isClosable?: boolean;
}

export interface PaneState {
  id: PaneID;
  tabs: Tab[];
  selectedTabId?: TabID;
}

export interface PaneNode {
  type: "pane";
  pane: PaneState;
}

export interface SplitState {
  id: SplitID;
  orientation: SplitOrientation;
  first: SplitNode;
  second: SplitNode;
  dividerPosition: number;
  animationOrigin?: SplitAnimationOrigin;
}

export interface SplitBranchNode {
  type: "split";
  split: SplitState;
}

export type SplitNode = PaneNode | SplitBranchNode;

export interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaneGeometry {
  paneId: PaneID;
  frame: PixelRect;
  selectedTabId?: TabID;
  tabIds: TabID[];
}

export interface LayoutSnapshot {
  containerFrame: PixelRect;
  panes: PaneGeometry[];
  focusedPaneId?: PaneID;
  isZoomed: boolean;
  zoomedPaneId?: PaneID;
  timestamp: number;
}

export interface ExternalTab {
  id: TabID;
  title: string;
}

export interface ExternalPaneNode {
  id: PaneID;
  frame: PixelRect;
  tabs: ExternalTab[];
  selectedTabId?: TabID;
}

export interface ExternalSplitNode {
  id: SplitID;
  orientation: SplitOrientation;
  dividerPosition: number;
  first: ExternalTreeNode;
  second: ExternalTreeNode;
}

export type ExternalTreeNode =
  | {
      type: "pane";
      pane: ExternalPaneNode;
    }
  | {
      type: "split";
      split: ExternalSplitNode;
    };

export interface SplitsAppearance {
  tabBarHeight: number;
  tabMinWidth: number;
  tabMaxWidth: number;
  tabSpacing: number;
  minimumPaneWidth: number;
  minimumPaneHeight: number;
  showSplitButtons: boolean;
  animationDuration: number;
  enableAnimations: boolean;
}

export interface SplitsConfiguration {
  allowSplits: boolean;
  allowCloseTabs: boolean;
  allowCloseLastPane: boolean;
  allowTabReordering: boolean;
  allowCrossPaneTabMove: boolean;
  allowCrossControllerTabMove: boolean;
  autoCloseEmptyPanes: boolean;
  contentViewLifecycle: ContentViewLifecycle;
  newTabPosition: NewTabPosition;
  preserveZoomOnNavigation: boolean;
  appearance: SplitsAppearance;
}

export type SplitsConfigurationInput = Partial<
  Omit<SplitsConfiguration, "appearance"> & {
    appearance: Partial<SplitsAppearance>;
  }
>;

export interface SplitsState {
  rootNode: SplitNode;
  focusedPaneId?: PaneID;
  zoomedPaneId?: PaneID;
  containerFrame: PixelRect;
  version: number;
}

export interface SerializedSplitsState {
  version: 1;
  rootNode: SplitNode;
  focusedPaneId?: PaneID;
  zoomedPaneId?: PaneID;
}

export interface CreateTabOptions {
  id?: TabID;
  icon?: string | null;
  isDirty?: boolean;
  isClosable?: boolean;
  inPane?: PaneID;
}

export interface CreateTabObjectOptions extends CreateTabOptions {
  title: string;
}

export interface UpdateTabOptions {
  title?: string;
  icon?: string | null;
  isDirty?: boolean;
  isClosable?: boolean;
}

export interface SplitPaneOptions {
  paneId?: PaneID;
  orientation: SplitOrientation;
  withTab?: Tab | CreateTabObjectOptions | false;
  insertFirst?: boolean;
}

export interface SplitsDelegate<Controller = unknown> {
  shouldCreateTab?: (controller: Controller, tab: Tab, pane: PaneID) => boolean;
  shouldCloseTab?: (controller: Controller, tab: Tab, pane: PaneID) => boolean;
  didCreateTab?: (controller: Controller, tab: Tab, pane: PaneID) => void;
  didCloseTab?: (controller: Controller, tabId: TabID, pane: PaneID) => void;
  didSelectTab?: (controller: Controller, tab: Tab, pane: PaneID) => void;
  didMoveTab?: (controller: Controller, tab: Tab, source: PaneID, destination: PaneID) => void;
  shouldSplitPane?: (
    controller: Controller,
    pane: PaneID,
    orientation: SplitOrientation,
  ) => boolean;
  shouldClosePane?: (controller: Controller, pane: PaneID) => boolean;
  didSplitPane?: (
    controller: Controller,
    originalPane: PaneID,
    newPane: PaneID,
    orientation: SplitOrientation,
  ) => void;
  didClosePane?: (controller: Controller, paneId: PaneID) => void;
  didZoomPane?: (controller: Controller, paneId: PaneID) => void;
  didUnzoomPane?: (controller: Controller, paneId: PaneID) => void;
  didFocusPane?: (controller: Controller, pane: PaneID) => void;
  didChangeGeometry?: (controller: Controller, snapshot: LayoutSnapshot) => void;
  shouldNotifyDuringDrag?: (controller: Controller, isDragging: boolean) => boolean;
}

export type SplitsSubscriber = (state: SplitsState) => void;
export type SplitsUnsubscriber = () => void;
