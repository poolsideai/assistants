import { beforeEach, describe, expect, it, vi } from "vitest";
import { NATIVE_MENU_SET_DEFAULT_EVENT, showDesktopContextMenu } from "../chat/desktopContextMenu";
import { starIconsFor, wireIconFor, type NativeMenuIcon } from "../chat/nativeMenuIcons";
import { resolveNativeMenuTheme } from "../chat/nativeMenuTheme";
import { presentNativeMenu, toWireItems, type MenuSpecItem } from "./menuSpec";

// A fixed resolved theme so request assertions are deterministic (the real
// resolver samples the DOM, which carries no styles under jsdom).
const TEST_THEME = vi.hoisted(() => ({
  isDark: true,
  textPrimary: "#eeeeee",
  textSecondary: "#bbbbbb",
  textTertiary: "#999999",
  hoverBackground: "#333333",
  separator: "#222222",
  badgeBackground: "#444444",
  badgeText: "#bbbbbb",
  destructiveText: "#ff6666",
  iconColor: "#dddddd",
}));

// Encodes each icon (and the default color it was rasterized with) into the
// fake wire icon so tests can assert the color threading. Star rasters encode
// their colors the same way.
vi.mock("../chat/nativeMenuIcons", () => ({
  wireIconFor: vi.fn(async (icon: NativeMenuIcon, options?: { iconColor?: string }) => {
    const color = options?.iconColor ?? "default";
    if (typeof icon === "string") return { pngBase64: `png:${icon}:${color}` };
    if ("url" in icon) return { pngBase64: `png:${icon.url}:${icon.color ?? color}` };
    if ("image" in icon) return { pngBase64: `png:image:${icon.image}:${icon.scale ?? 1}` };
    if ("svg" in icon) return { pngBase64: `png:svg:${icon.color ?? color}` };
    if ("file" in icon) return { filePath: icon.file };
    return { pngBase64: `png:${icon.name}:${icon.color ?? color}` };
  }),
  starIconsFor: vi.fn(async (colors: { pinned: string; normal: string; hover: string }) => ({
    pinned: `star:${colors.pinned}`,
    normal: `star:${colors.normal}`,
    hover: `star:${colors.hover}`,
  })),
}));

vi.mock("../chat/nativeMenuTheme", () => ({
  resolveNativeMenuTheme: vi.fn(() => ({ ...TEST_THEME })),
  // The vibrant token resolves through the cascade in the real module; pin it
  // so the pinned-star color is deterministic under jsdom.
  resolveCssColorToHex: vi.fn((value?: string) =>
    value === "var(--psx-vibrant)" ? "#00ffcc" : undefined,
  ),
}));

vi.mock("../chat/desktopContextMenu", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../chat/desktopContextMenu")>()),
  showDesktopContextMenu: vi.fn(async () => "selected-id"),
}));

const mockWireIconFor = vi.mocked(wireIconFor);
const mockStarIconsFor = vi.mocked(starIconsFor);
const mockShowDesktopContextMenu = vi.mocked(showDesktopContextMenu);
const mockResolveTheme = vi.mocked(resolveNativeMenuTheme);

// What the mocked starIconsFor produces for the mocked theme + vibrant token.
const TEST_STAR_ICONS = {
  pinned: "star:#00ffcc",
  normal: `star:${TEST_THEME.textTertiary}`,
  hover: `star:${TEST_THEME.textPrimary}`,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("toWireItems", () => {
  it("converts action icons and preserves every other field", async () => {
    const items: MenuSpecItem[] = [
      {
        kind: "action",
        id: "delete",
        label: "Delete",
        sublabel: "Moves the file to the Trash",
        icon: "delete",
        checked: true,
        enabled: false,
        accelerator: "Cmd+Backspace",
        toolTip: "Delete the selected file",
        destructive: true,
      },
    ];

    await expect(toWireItems(items)).resolves.toEqual([
      {
        kind: "action",
        id: "delete",
        label: "Delete",
        sublabel: "Moves the file to the Trash",
        icon: { pngBase64: "png:delete:default" },
        checked: true,
        enabled: false,
        accelerator: "Cmd+Backspace",
        toolTip: "Delete the selected file",
        destructive: true,
      },
    ]);
  });

  it("rasterizes in the provided default color, red for destructive rows", async () => {
    const items: MenuSpecItem[] = [
      { kind: "action", id: "copy", label: "Copy", icon: "copy" },
      { kind: "action", id: "delete", label: "Delete", icon: "delete", destructive: true },
    ];

    const wire = await toWireItems(items, {
      iconColor: "#dddddd",
      destructiveColor: "#ff6666",
    });
    expect(wire).toEqual([
      expect.objectContaining({ icon: { pngBase64: "png:copy:#dddddd" } }),
      expect.objectContaining({ icon: { pngBase64: "png:delete:#ff6666" } }),
    ]);
    expect(mockWireIconFor).toHaveBeenCalledWith("copy", { iconColor: "#dddddd" });
    expect(mockWireIconFor).toHaveBeenCalledWith("delete", { iconColor: "#ff6666" });
  });

  it("converts URL icons through the rasterizer", async () => {
    const items: MenuSpecItem[] = [
      { kind: "action", id: "agent", label: "Agent", icon: { url: "https://example.com/a.png" } },
    ];

    const [wireItem] = await toWireItems(items);
    expect(wireItem).toMatchObject({
      icon: { pngBase64: "png:https://example.com/a.png:default" },
    });
  });

  it("leaves icon-less items without an icon and skips icon conversion", async () => {
    const items: MenuSpecItem[] = [{ kind: "action", id: "plain", label: "Plain" }];

    const [wireItem] = await toWireItems(items);
    expect(wireItem?.kind === "action" && wireItem.icon).toBeUndefined();
    expect(mockWireIconFor).not.toHaveBeenCalled();
  });

  it("omits icons that fail to convert", async () => {
    mockWireIconFor.mockResolvedValueOnce(undefined);
    const items: MenuSpecItem[] = [{ kind: "action", id: "broken", label: "Broken", icon: "mcp" }];

    const [wireItem] = await toWireItems(items);
    expect(wireItem?.kind === "action" && wireItem.icon).toBeUndefined();
  });

  it("passes an action's indent through to the wire", async () => {
    const items: MenuSpecItem[] = [
      { kind: "action", id: "root", label: "Project" },
      { kind: "action", id: "wt", label: "Worktree", icon: "git-branch", indent: 1 },
    ];

    const wire = await toWireItems(items);
    expect(wire[0]?.kind === "action" && wire[0].indent).toBeUndefined();
    expect(wire[1]).toMatchObject({ kind: "action", id: "wt", indent: 1 });
  });

  it("passes reserveIconSlot through on actions and submenus", async () => {
    // The icon-column opt-in for icon-less rows (e.g. the prompt picker's
    // extras openers beside the iconed Fast Mode/Effort rows) rides the wire
    // untouched; rows that don't set it stay flush-left by default.
    const items: MenuSpecItem[] = [
      { kind: "submenu", label: "Provider", reserveIconSlot: true, items: [] },
      { kind: "action", id: "on", label: "On", reserveIconSlot: true },
      { kind: "action", id: "off", label: "Off" },
    ];

    const wire = await toWireItems(items);
    expect(wire[0]).toMatchObject({ kind: "submenu", label: "Provider", reserveIconSlot: true });
    expect(wire[1]).toMatchObject({ kind: "action", id: "on", reserveIconSlot: true });
    expect(wire[2]?.kind === "action" && wire[2].reserveIconSlot).toBeUndefined();
  });

  it("passes star rows and their starGroup through unchanged", async () => {
    const items: MenuSpecItem[] = [
      { kind: "action", id: "opus", label: "Opus", star: { starred: true }, starGroup: "model" },
      {
        kind: "action",
        id: "sonnet",
        label: "Sonnet",
        star: { starred: false },
        starGroup: "model",
      },
      // No group: a singleton-group star row (native radio clears only
      // same-group rows, so this one clears nothing else).
      { kind: "action", id: "solo", label: "Solo", star: { starred: false } },
    ];

    const wire = await toWireItems(items);
    expect(wire).toEqual([
      { kind: "action", id: "opus", label: "Opus", star: { starred: true }, starGroup: "model" },
      {
        kind: "action",
        id: "sonnet",
        label: "Sonnet",
        star: { starred: false },
        starGroup: "model",
      },
      { kind: "action", id: "solo", label: "Solo", star: { starred: false } },
    ]);
    // Absent stays absent (not an undefined-valued key), so the wire JSON
    // omits it and the native side sees a singleton group.
    expect(wire[2]?.kind === "action" && "starGroup" in wire[2]).toBe(false);
  });

  it("passes separators through, including section-header labels", async () => {
    const items: MenuSpecItem[] = [{ kind: "separator" }, { kind: "separator", label: "Recents" }];

    await expect(toWireItems(items)).resolves.toEqual([
      { kind: "separator" },
      { kind: "separator", label: "Recents" },
    ]);
  });

  it("converts submenus recursively, threading the colors down", async () => {
    const items: MenuSpecItem[] = [
      {
        kind: "submenu",
        label: "Open in",
        icon: "folder",
        enabled: true,
        items: [{ kind: "action", id: "open:finder", label: "Finder", icon: "search" }],
      },
    ];

    await expect(toWireItems(items, { iconColor: "#dddddd" })).resolves.toEqual([
      {
        kind: "submenu",
        label: "Open in",
        icon: { pngBase64: "png:folder:#dddddd" },
        enabled: true,
        items: [
          {
            kind: "action",
            id: "open:finder",
            label: "Finder",
            icon: { pngBase64: "png:search:#dddddd" },
          },
        ],
      },
    ]);
  });

  it("passes a submenu's minWidth through to the wire", async () => {
    // Per-submenu minimum content width (the DOM sub-panel's fixed width):
    // rides the wire untouched so the native submenu wraps long sublabels at
    // it; submenus without one keep their natural fit-to-content width.
    const items: MenuSpecItem[] = [
      {
        kind: "submenu",
        label: "Claude",
        minWidth: 390,
        items: [
          { kind: "action", id: "persona", label: "Persona", sublabel: "A long description" },
        ],
      },
      { kind: "submenu", label: "Bare", items: [] },
    ];

    const wire = await toWireItems(items);
    expect(wire[0]).toMatchObject({ kind: "submenu", label: "Claude", minWidth: 390 });
    expect(wire[1]?.kind === "submenu" && "minWidth" in wire[1]).toBe(false);
  });

  it("passes a submenu's detail (current selection) through to the wire", async () => {
    const items: MenuSpecItem[] = [
      {
        kind: "submenu",
        label: "Model",
        detail: "Opus 5",
        items: [{ kind: "action", id: "model:opus", label: "Opus 5" }],
      },
    ];

    await expect(toWireItems(items)).resolves.toEqual([
      {
        kind: "submenu",
        label: "Model",
        detail: "Opus 5",
        icon: undefined,
        items: [{ kind: "action", id: "model:opus", label: "Opus 5", icon: undefined }],
      },
    ]);
  });
});

describe("presentNativeMenu", () => {
  it("resolves the theme itself, colors icons from it, and ships it on the request", async () => {
    const items: MenuSpecItem[] = [{ kind: "action", id: "copy", label: "Copy", icon: "copy" }];

    await expect(presentNativeMenu(items, { x: 12, y: 34, align: "end" })).resolves.toBe(
      "selected-id",
    );

    expect(mockResolveTheme).toHaveBeenCalledTimes(1);
    expect(mockWireIconFor).toHaveBeenCalledWith("copy", { iconColor: TEST_THEME.iconColor });
    expect(mockShowDesktopContextMenu).toHaveBeenCalledWith(
      [
        {
          kind: "action",
          id: "copy",
          label: "Copy",
          icon: { pngBase64: `png:copy:${TEST_THEME.iconColor}` },
        },
      ],
      { x: 12, y: 34 },
      { align: "end", theme: TEST_THEME, minWidth: undefined },
    );
  });

  it("passes minWidth and highlightStyle through to the request", async () => {
    await presentNativeMenu(
      [{ kind: "action", id: "a", label: "A" }],
      { x: 0, y: 0 },
      {
        minWidth: 300,
        highlightStyle: "themed",
      },
    );

    expect(mockShowDesktopContextMenu).toHaveBeenCalledWith(
      [{ kind: "action", id: "a", label: "A" }],
      { x: 0, y: 0 },
      { align: undefined, theme: TEST_THEME, minWidth: 300, highlightStyle: "themed" },
    );
  });

  it("returns undefined when the menu is dismissed", async () => {
    mockShowDesktopContextMenu.mockResolvedValueOnce(undefined);

    await expect(
      presentNativeMenu([{ kind: "action", id: "a", label: "A" }], { x: 0, y: 0 }),
    ).resolves.toBeUndefined();
    expect(mockShowDesktopContextMenu).toHaveBeenCalledWith(
      [{ kind: "action", id: "a", label: "A" }],
      { x: 0, y: 0 },
      { align: undefined, theme: TEST_THEME, minWidth: undefined },
    );
  });

  it("omits the token and star icons for star-less specs", async () => {
    await presentNativeMenu(
      [
        { kind: "action", id: "a", label: "A" },
        { kind: "submenu", label: "More", items: [{ kind: "action", id: "b", label: "B" }] },
      ],
      { x: 0, y: 0 },
      { onSetDefault: vi.fn() },
    );

    const options = mockShowDesktopContextMenu.mock.calls[0]?.[2];
    expect(options?.token).toBeUndefined();
    expect(options?.starIcons).toBeUndefined();
    expect(mockStarIconsFor).not.toHaveBeenCalled();
  });

  it("ships a token and the rasterized star states when the spec has star rows", async () => {
    await presentNativeMenu(
      [{ kind: "action", id: "opus", label: "Opus", star: { starred: true } }],
      { x: 0, y: 0 },
      { onSetDefault: vi.fn() },
    );

    // Pinned rasters in the vibrant token (cascade-resolved to hex), normal
    // rests at the theme's tertiary, hover lifts to primary.
    expect(mockStarIconsFor).toHaveBeenCalledExactlyOnceWith({
      pinned: "#00ffcc",
      normal: TEST_THEME.textTertiary,
      hover: TEST_THEME.textPrimary,
    });
    const options = mockShowDesktopContextMenu.mock.calls[0]?.[2];
    expect(options?.token).toEqual(expect.any(String));
    expect(options?.starIcons).toEqual(TEST_STAR_ICONS);
  });

  it("detects star rows nested inside submenus", async () => {
    await presentNativeMenu(
      [
        {
          kind: "submenu",
          label: "Agent",
          items: [{ kind: "action", id: "agent:a", label: "A", star: { starred: false } }],
        },
      ],
      { x: 0, y: 0 },
    );

    const options = mockShowDesktopContextMenu.mock.calls[0]?.[2];
    expect(options?.token).toEqual(expect.any(String));
    expect(options?.starIcons).toEqual(TEST_STAR_ICONS);
  });

  it("falls back to the primary text color when the vibrant token cannot resolve", async () => {
    const { resolveCssColorToHex } = await import("../chat/nativeMenuTheme");
    vi.mocked(resolveCssColorToHex).mockReturnValueOnce(undefined);

    await presentNativeMenu([{ kind: "action", id: "a", label: "A", star: { starred: false } }], {
      x: 0,
      y: 0,
    });

    expect(mockStarIconsFor).toHaveBeenCalledExactlyOnceWith({
      pinned: TEST_THEME.textPrimary,
      normal: TEST_THEME.textTertiary,
      hover: TEST_THEME.textPrimary,
    });
  });

  it("routes matching star-click events to onSetDefault only while the menu is open", async () => {
    const onSetDefault = vi.fn();
    let resolveMenu!: (id: string | undefined) => void;
    mockShowDesktopContextMenu.mockImplementationOnce(
      () =>
        new Promise<string | undefined>((resolve) => {
          resolveMenu = resolve;
        }),
    );

    const result = presentNativeMenu(
      [{ kind: "action", id: "opus", label: "Opus", star: { starred: false } }],
      { x: 0, y: 0 },
      { onSetDefault },
    );
    await vi.waitFor(() => expect(mockShowDesktopContextMenu).toHaveBeenCalledTimes(1));
    const options = mockShowDesktopContextMenu.mock.calls[0]?.[2];
    const token = options?.token;
    expect(token).toEqual(expect.any(String));
    expect(options?.theme).toEqual(TEST_THEME);

    const dispatchStarClick = (eventToken: string | null, id: string, starred: boolean) =>
      window.dispatchEvent(
        new CustomEvent(NATIVE_MENU_SET_DEFAULT_EVENT, {
          detail: { token: eventToken, id, starred },
        }),
      );

    // Another menu's clicks (or tokenless events) never reach this callback.
    dispatchStarClick("other-token", "opus", true);
    dispatchStarClick(null, "opus", true);
    expect(onSetDefault).not.toHaveBeenCalled();

    // The menu stays open across star clicks, so several can arrive — a pin
    // (starred true) and then an unpin (starred false) of the same row.
    dispatchStarClick(token!, "opus", true);
    expect(onSetDefault).toHaveBeenCalledExactlyOnceWith("opus", true);
    dispatchStarClick(token!, "opus", false);
    expect(onSetDefault).toHaveBeenLastCalledWith("opus", false);
    expect(onSetDefault).toHaveBeenCalledTimes(2);

    resolveMenu("opus");
    await expect(result).resolves.toBe("opus");

    // The listener detaches once the menu promise settles.
    dispatchStarClick(token!, "opus", true);
    expect(onSetDefault).toHaveBeenCalledTimes(2);
  });
});
