import { describe, expect, it } from "vitest";
import { DesktopSurfaceFocusHistory } from "./desktopSurfaceFocusHistory";

describe("DesktopSurfaceFocusHistory", () => {
  it("restores the element focused when a surface opened", () => {
    const history = new DesktopSurfaceFocusHistory({
      rightSidebar: false,
      bottomPanel: false,
    });
    const editor = document.createElement("textarea");

    expect(history.syncVisibility("rightSidebar", true, editor)).toEqual({ kind: "opened" });
    expect(history.syncVisibility("rightSidebar", false, null)).toEqual({
      kind: "closed",
      restoreFocusTo: editor,
    });
  });

  it("captures focus before a pointer moves it to the toggle", () => {
    const history = new DesktopSurfaceFocusHistory({
      rightSidebar: false,
      bottomPanel: false,
    });
    const editor = document.createElement("textarea");
    const toggle = document.createElement("button");

    history.captureBeforeToggle("bottomPanel", editor);
    history.syncVisibility("bottomPanel", true, toggle);

    expect(history.syncVisibility("bottomPanel", false, null)).toEqual({
      kind: "closed",
      restoreFocusTo: editor,
    });
  });

  it("keeps independent focus history for nested surfaces", () => {
    const history = new DesktopSurfaceFocusHistory({
      rightSidebar: false,
      bottomPanel: false,
    });
    const editor = document.createElement("textarea");
    const sidebarInput = document.createElement("input");

    history.syncVisibility("rightSidebar", true, editor);
    history.syncVisibility("bottomPanel", true, sidebarInput);

    expect(history.syncVisibility("bottomPanel", false, null)).toEqual({
      kind: "closed",
      restoreFocusTo: sidebarInput,
    });
    expect(history.syncVisibility("rightSidebar", false, null)).toEqual({
      kind: "closed",
      restoreFocusTo: editor,
    });
  });

  it("does not overwrite focus history when visibility is unchanged", () => {
    const history = new DesktopSurfaceFocusHistory({
      rightSidebar: false,
      bottomPanel: false,
    });
    const editor = document.createElement("textarea");
    const sidebarInput = document.createElement("input");

    history.syncVisibility("rightSidebar", true, editor);
    expect(history.syncVisibility("rightSidebar", true, sidebarInput)).toEqual({
      kind: "unchanged",
    });
    expect(history.syncVisibility("rightSidebar", false, null)).toEqual({
      kind: "closed",
      restoreFocusTo: editor,
    });
  });
});
