import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { appState } from "../../hostAdapter";
import { initializeStatefulModule } from "../../hostRpc";
import {
  showDesktopContextMenu,
  supportsNativeMenus,
  type DesktopContextMenuSpecItem,
  type DesktopContextMenuTheme,
} from "./desktopContextMenu";

// The transport resolves a theme for every request; pin it so the request
// assertions are deterministic (jsdom carries no styles to sample).
const TEST_THEME = vi.hoisted(() => ({
  isDark: false,
  textPrimary: "#111111",
  textSecondary: "#222222",
  textTertiary: "#333333",
  hoverBackground: "#444444",
  separator: "#555555",
  badgeBackground: "#666666",
  badgeText: "#777777",
  destructiveText: "#880000",
  iconColor: "#999999",
}));

vi.mock("./nativeMenuTheme", () => ({
  resolveNativeMenuTheme: vi.fn(() => ({ ...TEST_THEME })),
}));

function setAssistantHost(assistantHost: string): void {
  appState.update((state) => ({
    ...state,
    environment: { ...state.environment, assistantHost },
  }));
}

describe("showDesktopContextMenu", () => {
  const items: DesktopContextMenuSpecItem[] = [
    { kind: "action", id: "copy", label: "Copy" },
    { kind: "separator" },
    { kind: "action", id: "paste", label: "Paste" },
  ];

  beforeEach(() => {
    setAssistantHost("desktop");
  });

  afterEach(() => {
    setAssistantHost("");
  });

  it("resolves with the id selected by the host and resolves a theme for the request", async () => {
    const sender = vi.fn().mockResolvedValue("paste");
    initializeStatefulModule(sender);

    await expect(showDesktopContextMenu(items, { x: 10, y: 20 })).resolves.toBe("paste");

    expect(sender).toHaveBeenCalledWith("showDesktopContextMenu", [
      { position: { x: 10, y: 20 }, align: undefined, theme: TEST_THEME, items },
    ]);
  });

  it("resolves undefined when the menu is dismissed (host returns null)", async () => {
    initializeStatefulModule(vi.fn().mockResolvedValue(null));

    await expect(showDesktopContextMenu(items, { x: 0, y: 0 })).resolves.toBeUndefined();
  });

  it("passes the align option through to the host", async () => {
    const sender = vi.fn().mockResolvedValue(null);
    initializeStatefulModule(sender);

    await showDesktopContextMenu(items, { x: 5, y: 6 }, { align: "end" });

    expect(sender).toHaveBeenCalledWith("showDesktopContextMenu", [
      { position: { x: 5, y: 6 }, align: "end", theme: TEST_THEME, items },
    ]);
  });

  it("passes an explicit theme and minWidth through instead of resolving", async () => {
    const sender = vi.fn().mockResolvedValue(null);
    initializeStatefulModule(sender);
    const customTheme: DesktopContextMenuTheme = { ...TEST_THEME, isDark: true };

    await showDesktopContextMenu(
      items,
      { x: 5, y: 6 },
      {
        theme: customTheme,
        minWidth: 450,
        highlightStyle: "themed",
      },
    );

    expect(sender).toHaveBeenCalledWith("showDesktopContextMenu", [
      {
        position: { x: 5, y: 6 },
        align: undefined,
        theme: customTheme,
        minWidth: 450,
        highlightStyle: "themed",
        items,
      },
    ]);
  });

  it("passes the star token and star icons through to the host", async () => {
    const sender = vi.fn().mockResolvedValue(null);
    initializeStatefulModule(sender);
    const starIcons = { pinned: "PINNED", normal: "NORMAL", hover: "HOVER" };
    const starItems: DesktopContextMenuSpecItem[] = [
      { kind: "action", id: "opus", label: "Opus", star: { starred: true } },
    ];

    await showDesktopContextMenu(starItems, { x: 5, y: 6 }, { token: "menu-token", starIcons });

    expect(sender).toHaveBeenCalledWith("showDesktopContextMenu", [
      {
        position: { x: 5, y: 6 },
        align: undefined,
        token: "menu-token",
        theme: TEST_THEME,
        starIcons,
        items: starItems,
      },
    ]);
  });

  it("resolves undefined instead of rejecting when the host call fails", async () => {
    initializeStatefulModule(vi.fn().mockRejectedValue(new Error("no menu host")));

    await expect(showDesktopContextMenu(items, { x: 0, y: 0 })).resolves.toBeUndefined();
  });

  it("is a no-op off the desktop host", async () => {
    setAssistantHost("vscode");
    const sender = vi.fn();
    initializeStatefulModule(sender);

    await expect(showDesktopContextMenu(items, { x: 0, y: 0 })).resolves.toBeUndefined();
    expect(sender).not.toHaveBeenCalled();
  });
});

describe("supportsNativeMenus", () => {
  it("is true only for the desktop host on macOS", () => {
    expect(supportsNativeMenus({ assistantHost: "desktop", operatingSystem: "darwin" })).toBe(true);
    expect(supportsNativeMenus({ assistantHost: "desktop", operatingSystem: "windows" })).toBe(
      false,
    );
    expect(supportsNativeMenus({ assistantHost: "desktop" })).toBe(false);
    expect(supportsNativeMenus({ assistantHost: "vscode", operatingSystem: "darwin" })).toBe(false);
  });
});

describe("DesktopContextMenuSpecItem", () => {
  it("accepts a flat list of action items", () => {
    const spec: DesktopContextMenuSpecItem[] = [
      { kind: "action", id: "copy", label: "Copy", enabled: true },
      { kind: "action", id: "paste", label: "Paste", enabled: false },
    ];

    expect(spec).toHaveLength(2);
    expect(spec[0]).toMatchObject({ kind: "action", id: "copy", label: "Copy", enabled: true });
    expect(spec[1]).toMatchObject({ kind: "action", id: "paste", label: "Paste", enabled: false });
  });

  it("accepts separator items, with an optional section-header label", () => {
    const spec: DesktopContextMenuSpecItem[] = [
      { kind: "action", id: "cut", label: "Cut" },
      { kind: "separator" },
      { kind: "separator", label: "Danger zone" },
      { kind: "action", id: "delete", label: "Delete" },
    ];

    const separators = spec.filter((item) => item.kind === "separator");
    expect(separators).toHaveLength(2);
    expect(separators[1]).toMatchObject({ label: "Danger zone" });
  });

  it("accepts nested submenus, with an optional current-selection detail", () => {
    const spec: DesktopContextMenuSpecItem[] = [
      {
        kind: "submenu",
        label: "Open in…",
        detail: "Finder",
        enabled: true,
        items: [
          { kind: "action", id: "open:vscode", label: "VS Code" },
          { kind: "action", id: "open:finder", label: "Finder" },
        ],
      },
    ];

    expect(spec[0].kind).toBe("submenu");
    if (spec[0].kind === "submenu") {
      expect(spec[0].detail).toBe("Finder");
      expect(spec[0].items).toHaveLength(2);
      expect(spec[0].items[0]).toMatchObject({ kind: "action", id: "open:vscode" });
    }
  });

  it("allows action items without optional fields", () => {
    const item: DesktopContextMenuSpecItem = { kind: "action", id: "foo", label: "Foo" };
    expect(item).toMatchObject({ kind: "action", id: "foo", label: "Foo" });
    if (item.kind === "action") {
      expect(item.enabled).toBeUndefined();
      expect(item.accelerator).toBeUndefined();
    }
  });

  it("allows the full set of optional action fields", () => {
    const item: DesktopContextMenuSpecItem = {
      kind: "action",
      id: "delete",
      label: "Delete",
      sublabel: "Moves the file to the Trash",
      icon: { pngBase64: "aWNvbg==" },
      checked: false,
      accelerator: "Cmd+Backspace",
      toolTip: "Delete the selected file",
      destructive: true,
      star: { starred: true },
      starGroup: "model",
    };

    if (item.kind === "action") {
      expect(item.sublabel).toBe("Moves the file to the Trash");
      expect(item.icon).toEqual({ pngBase64: "aWNvbg==" });
      expect(item.destructive).toBe(true);
      expect(item.star).toEqual({ starred: true });
      expect(item.starGroup).toBe("model");
    }
  });
});

describe("spec shape helpers", () => {
  function labels(spec: DesktopContextMenuSpecItem[]): string[] {
    return spec.map((item) => {
      if (item.kind === "separator") return "---";
      return item.label;
    });
  }

  function ids(spec: DesktopContextMenuSpecItem[]): string[] {
    return spec.flatMap((item) => {
      if (item.kind === "action") return [item.id];
      if (item.kind === "submenu") return ids(item.items);
      return [];
    });
  }

  it("collects labels including separators", () => {
    const spec: DesktopContextMenuSpecItem[] = [
      { kind: "action", id: "a", label: "Alpha" },
      { kind: "separator" },
      { kind: "action", id: "b", label: "Beta" },
    ];

    expect(labels(spec)).toEqual(["Alpha", "---", "Beta"]);
  });

  it("collects ids recursively from submenus", () => {
    const spec: DesktopContextMenuSpecItem[] = [
      {
        kind: "submenu",
        label: "More",
        items: [
          { kind: "action", id: "nested-1", label: "One" },
          { kind: "action", id: "nested-2", label: "Two" },
        ],
      },
      { kind: "action", id: "top", label: "Top" },
    ];

    expect(ids(spec)).toEqual(["nested-1", "nested-2", "top"]);
  });
});
