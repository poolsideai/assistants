import type { DesktopContextMenuSpecItem } from "./desktopContextMenu";

export interface TabContextMenuState {
  canCloseThisTab: boolean;
  hasOtherClosableTabs: boolean;
  canSplit: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  canMoveToSidebar: boolean;
  canMoveToPanel: boolean;
  /** True when splits are allowed and the pane has more than one tab. */
  canSplitMove: boolean;
}

/**
 * Builds the context-menu spec for a tab. Pure function — no side effects,
 * easily unit-testable.
 */
export function buildTabContextMenuItems(state: TabContextMenuState): DesktopContextMenuSpecItem[] {
  const {
    canCloseThisTab,
    hasOtherClosableTabs,
    canSplit,
    canMoveUp,
    canMoveDown,
    canMoveLeft,
    canMoveRight,
    canMoveToSidebar,
    canMoveToPanel,
    canSplitMove,
  } = state;

  const hasAnyMoveDirection = canMoveUp || canMoveDown || canMoveLeft || canMoveRight;
  const hasMoveTarget = hasAnyMoveDirection || canMoveToSidebar || canMoveToPanel;
  const hasSplitMoveTarget = canSplitMove;

  return [
    {
      kind: "action",
      id: "close-tab",
      label: "Close Tab",
      enabled: canCloseThisTab,
      accelerator: "Cmd+W",
    },
    {
      kind: "action",
      id: "close-other-tabs",
      label: "Close Other Tabs",
      enabled: hasOtherClosableTabs,
    },
    { kind: "separator" },
    {
      kind: "action",
      id: "split-right",
      label: "Split Right",
      enabled: canSplit,
      accelerator: "Cmd+D",
    },
    {
      kind: "action",
      id: "split-down",
      label: "Split Down",
      enabled: canSplit,
      accelerator: "Cmd+Shift+D",
    },
    { kind: "separator" },
    {
      kind: "submenu",
      label: "Move Tab",
      enabled: hasMoveTarget,
      items: [
        {
          kind: "action",
          id: "move-up",
          label: "Up",
          enabled: canMoveUp,
        },
        {
          kind: "action",
          id: "move-down",
          label: "Down",
          enabled: canMoveDown,
        },
        {
          kind: "action",
          id: "move-left",
          label: "Left",
          enabled: canMoveLeft,
        },
        {
          kind: "action",
          id: "move-right",
          label: "Right",
          enabled: canMoveRight,
        },
        { kind: "separator" },
        {
          kind: "action",
          id: "move-to-sidebar",
          label: "To Sidebar",
          enabled: canMoveToSidebar,
        },
        {
          kind: "action",
          id: "move-to-panel",
          label: "To Panel",
          enabled: canMoveToPanel,
        },
      ],
    },
    {
      kind: "submenu",
      label: "Split and Move",
      enabled: hasSplitMoveTarget,
      items: [
        {
          kind: "action",
          id: "split-move-up",
          label: "Up",
          enabled: canSplitMove,
        },
        {
          kind: "action",
          id: "split-move-down",
          label: "Down",
          enabled: canSplitMove,
        },
        {
          kind: "action",
          id: "split-move-left",
          label: "Left",
          enabled: canSplitMove,
        },
        {
          kind: "action",
          id: "split-move-right",
          label: "Right",
          enabled: canSplitMove,
        },
      ],
    },
  ];
}
