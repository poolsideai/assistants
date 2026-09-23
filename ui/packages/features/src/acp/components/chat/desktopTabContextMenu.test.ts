import { describe, expect, it } from "vitest";
import { buildTabContextMenuItems, type TabContextMenuState } from "./desktopTabContextMenu";

function allEnabled(): TabContextMenuState {
  return {
    canCloseThisTab: true,
    hasOtherClosableTabs: true,
    canSplit: true,
    canMoveUp: true,
    canMoveDown: true,
    canMoveLeft: true,
    canMoveRight: true,
    canMoveToSidebar: true,
    canMoveToPanel: true,
    canSplitMove: true,
  };
}

describe("buildTabContextMenuItems", () => {
  it("includes close, split, move-tab, and split-and-move sections", () => {
    const items = buildTabContextMenuItems(allEnabled());
    const ids = items.flatMap((item) => {
      if (item.kind === "action") return [item.id];
      if (item.kind === "submenu")
        return [item.label, ...item.items.map((i) => ("id" in i ? i.id : "sep"))];
      return [];
    });
    expect(ids).toContain("close-tab");
    expect(ids).toContain("close-other-tabs");
    expect(ids).toContain("split-right");
    expect(ids).toContain("split-down");
    expect(ids).toContain("Move Tab");
    expect(ids).toContain("Split and Move");
  });

  it("Move Tab submenu has all directional and surface items", () => {
    const items = buildTabContextMenuItems(allEnabled());
    const moveTabMenu = items.find((item) => item.kind === "submenu" && item.label === "Move Tab");
    expect(moveTabMenu).toBeDefined();
    if (!moveTabMenu || moveTabMenu.kind !== "submenu") return;

    const subIds = moveTabMenu.items
      .filter((i) => i.kind === "action")
      .map((i) => (i as { id: string }).id);
    expect(subIds).toEqual(
      expect.arrayContaining([
        "move-up",
        "move-down",
        "move-left",
        "move-right",
        "move-to-sidebar",
        "move-to-panel",
      ]),
    );
  });

  it("Split and Move submenu has all directional items", () => {
    const items = buildTabContextMenuItems(allEnabled());
    const splitMoveMenu = items.find(
      (item) => item.kind === "submenu" && item.label === "Split and Move",
    );
    expect(splitMoveMenu).toBeDefined();
    if (!splitMoveMenu || splitMoveMenu.kind !== "submenu") return;

    const subIds = splitMoveMenu.items
      .filter((i) => i.kind === "action")
      .map((i) => (i as { id: string }).id);
    expect(subIds).toEqual(
      expect.arrayContaining([
        "split-move-up",
        "split-move-down",
        "split-move-left",
        "split-move-right",
      ]),
    );
  });

  it("Move Tab submenu is disabled when no move targets exist", () => {
    const items = buildTabContextMenuItems({
      ...allEnabled(),
      canMoveUp: false,
      canMoveDown: false,
      canMoveLeft: false,
      canMoveRight: false,
      canMoveToSidebar: false,
      canMoveToPanel: false,
    });
    const moveTabMenu = items.find((item) => item.kind === "submenu" && item.label === "Move Tab");
    expect(moveTabMenu?.kind === "submenu" && moveTabMenu.enabled).toBe(false);
  });

  it("Move Tab submenu is enabled when only surface targets exist", () => {
    const items = buildTabContextMenuItems({
      ...allEnabled(),
      canMoveUp: false,
      canMoveDown: false,
      canMoveLeft: false,
      canMoveRight: false,
      canMoveToSidebar: true,
      canMoveToPanel: false,
    });
    const moveTabMenu = items.find((item) => item.kind === "submenu" && item.label === "Move Tab");
    expect(moveTabMenu?.kind === "submenu" && moveTabMenu.enabled).toBe(true);
  });

  it("Split and Move submenu is disabled when canSplitMove is false", () => {
    const items = buildTabContextMenuItems({ ...allEnabled(), canSplitMove: false });
    const splitMoveMenu = items.find(
      (item) => item.kind === "submenu" && item.label === "Split and Move",
    );
    expect(splitMoveMenu?.kind === "submenu" && splitMoveMenu.enabled).toBe(false);
  });

  it("directional move items are individually disabled when that direction has no neighbour", () => {
    const items = buildTabContextMenuItems({
      ...allEnabled(),
      canMoveUp: false,
      canMoveLeft: false,
    });
    const moveTabMenu = items.find((item) => item.kind === "submenu" && item.label === "Move Tab");
    if (!moveTabMenu || moveTabMenu.kind !== "submenu") return;

    const upItem = moveTabMenu.items.find(
      (i) => i.kind === "action" && (i as { id: string }).id === "move-up",
    );
    const downItem = moveTabMenu.items.find(
      (i) => i.kind === "action" && (i as { id: string }).id === "move-down",
    );
    expect(upItem?.kind === "action" && upItem.enabled).toBe(false);
    expect(downItem?.kind === "action" && downItem.enabled).toBe(true);
  });

  it("close-tab respects canCloseThisTab", () => {
    const items = buildTabContextMenuItems({ ...allEnabled(), canCloseThisTab: false });
    const closeItem = items.find((i) => i.kind === "action" && i.id === "close-tab");
    expect(closeItem?.kind === "action" && closeItem.enabled).toBe(false);
  });

  it("close-other-tabs respects hasOtherClosableTabs", () => {
    const items = buildTabContextMenuItems({ ...allEnabled(), hasOtherClosableTabs: false });
    const closeOthers = items.find((i) => i.kind === "action" && i.id === "close-other-tabs");
    expect(closeOthers?.kind === "action" && closeOthers.enabled).toBe(false);
  });

  it("split-right and split-down respect canSplit", () => {
    const items = buildTabContextMenuItems({ ...allEnabled(), canSplit: false });
    const splitRight = items.find((i) => i.kind === "action" && i.id === "split-right");
    const splitDown = items.find((i) => i.kind === "action" && i.id === "split-down");
    expect(splitRight?.kind === "action" && splitRight.enabled).toBe(false);
    expect(splitDown?.kind === "action" && splitDown.enabled).toBe(false);
  });

  it("move-to-sidebar is disabled when canMoveToSidebar is false", () => {
    const items = buildTabContextMenuItems({ ...allEnabled(), canMoveToSidebar: false });
    const moveTabMenu = items.find((item) => item.kind === "submenu" && item.label === "Move Tab");
    if (!moveTabMenu || moveTabMenu.kind !== "submenu") return;
    const sidebarItem = moveTabMenu.items.find(
      (i) => i.kind === "action" && (i as { id: string }).id === "move-to-sidebar",
    );
    expect(sidebarItem?.kind === "action" && sidebarItem.enabled).toBe(false);
  });

  it("move-to-panel is disabled when canMoveToPanel is false", () => {
    const items = buildTabContextMenuItems({ ...allEnabled(), canMoveToPanel: false });
    const moveTabMenu = items.find((item) => item.kind === "submenu" && item.label === "Move Tab");
    if (!moveTabMenu || moveTabMenu.kind !== "submenu") return;
    const panelItem = moveTabMenu.items.find(
      (i) => i.kind === "action" && (i as { id: string }).id === "move-to-panel",
    );
    expect(panelItem?.kind === "action" && panelItem.enabled).toBe(false);
  });
});
