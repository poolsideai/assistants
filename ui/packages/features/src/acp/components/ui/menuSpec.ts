import {
  NATIVE_MENU_SET_DEFAULT_EVENT,
  showDesktopContextMenu,
  type DesktopContextMenuRequest,
  type DesktopContextMenuSpecItem,
  type NativeMenuSetDefaultPayload,
} from "../chat/desktopContextMenu";
import { starIconsFor, wireIconFor, type NativeMenuIcon } from "../chat/nativeMenuIcons";
import { resolveCssColorToHex, resolveNativeMenuTheme } from "../chat/nativeMenuTheme";

/**
 * UI-level menu spec: the native wire shape, with icons expressed as product
 * icon names or image URLs rather than pre-encoded native icons. Present the
 * native path with `presentNativeMenu`.
 */
export type MenuSpecItem =
  | {
      kind: "action";
      /** Unique identifier returned when the user selects this item. */
      id: string;
      label: string;
      /** Secondary line rendered under the label. */
      sublabel?: string;
      icon?: NativeMenuIcon;
      /** Renders a checkmark next to the item. */
      checked?: boolean;
      enabled?: boolean;
      accelerator?: string;
      toolTip?: string;
      /** Renders with destructive (red) styling. */
      destructive?: boolean;
      /**
       * Nesting depth in levels; each level shifts the icon and label right
       * by 16pt natively (e.g. worktree rows under their parent project).
       */
      indent?: number;
      /**
       * Reserve the icon slot even though this row carries no icon, so its
       * label aligns with icon-bearing siblings at the same menu level.
       */
      reserveIconSlot?: boolean;
      /**
       * Presence makes the row a native star row (trailing hover-revealed
       * star, filled when `starred` — i.e. pinned). Clicks keep the menu open
       * and report through `presentNativeMenu`'s `onSetDefault` callback.
       */
      star?: { starred: boolean };
      /**
       * Star radio group this row belongs to: the native radio-with-toggle
       * clears the stars only on the other rows of the SAME group, so each
       * group holds its own pinned row (one per config option, one for the
       * agent list). Absent means a singleton group — starring the row
       * clears no other row's star.
       */
      starGroup?: string;
    }
  | {
      kind: "separator";
      /** When present the separator renders as a section header. */
      label?: string;
    }
  | {
      kind: "submenu";
      label: string;
      /**
       * Current selection summary, drawn as right-aligned secondary text
       * before the chevron (like the DOM panel's dimmed value column).
       */
      detail?: string;
      icon?: NativeMenuIcon;
      enabled?: boolean;
      /**
       * Reserve the icon slot even though this row carries no icon, so its
       * label aligns with icon-bearing siblings at the same menu level.
       */
      reserveIconSlot?: boolean;
      /**
       * Minimum content width in pt for this submenu's own level, with the
       * same semantics as the request-level `NativeMenuOptions.minWidth`:
       * the level lays out at least this wide and its sublabels wrap to at
       * most two lines instead of widening the menu. Omit to fit content.
       */
      minWidth?: number;
      items: MenuSpecItem[];
    };

export interface WireItemsOptions {
  /** Default glyph color (the resolved menu theme's `iconColor`). */
  iconColor?: string;
  /**
   * Default glyph color for `destructive` action rows, matching how the DOM
   * menus let a danger row's icon inherit the red label color. Explicit
   * per-icon colors still win.
   */
  destructiveColor?: string;
}

/**
 * Converts UI-level menu items to the native wire spec, rasterizing each icon
 * in color. Icons that fail to convert are simply omitted from their item.
 */
export async function toWireItems(
  items: MenuSpecItem[],
  options?: WireItemsOptions,
): Promise<DesktopContextMenuSpecItem[]> {
  const iconOptions = (destructive: boolean | undefined) => {
    const color = destructive
      ? (options?.destructiveColor ?? options?.iconColor)
      : options?.iconColor;
    return color === undefined ? undefined : { iconColor: color };
  };
  return await Promise.all(
    items.map(async (item): Promise<DesktopContextMenuSpecItem> => {
      if (item.kind === "separator") return item;
      if (item.kind === "submenu") {
        const { icon, items: children, ...rest } = item;
        return {
          ...rest,
          icon: icon === undefined ? undefined : await wireIconFor(icon, iconOptions(false)),
          items: await toWireItems(children, options),
        };
      }
      const { icon, ...rest } = item;
      return {
        ...rest,
        icon:
          icon === undefined ? undefined : await wireIconFor(icon, iconOptions(item.destructive)),
      };
    }),
  );
}

export interface NativeMenuAnchor {
  x: number;
  y: number;
  /** "end" puts the menu's right edge at `x`. Defaults to "start". */
  align?: "start" | "end";
}

export interface NativeMenuOptions {
  /** Use the app's outlined highlight for dropdowns that retain their themed appearance. */
  highlightStyle?: DesktopContextMenuRequest["highlightStyle"];
  /**
   * Star-row clicks while the menu is open: `id` is the clicked action item's
   * id and `starred` its NEW pinned state (radio-with-toggle — the native
   * menu reports `false` when the pinned row is clicked again). The menu
   * stays open, so this can fire several times before the menu promise
   * settles.
   */
  onSetDefault?: (id: string, starred: boolean) => void;
  /** Minimum menu width in pt; omit to let the menu fit its content. */
  minWidth?: number;
}

// Star rows can sit at any menu level (agent submenu rows, top-level inline
// model rows), so the star support riders attach whenever any level has one.
function specContainsStarRows(items: MenuSpecItem[]): boolean {
  return items.some((item) => {
    if (item.kind === "action") return item.star !== undefined;
    return item.kind === "submenu" && specContainsStarRows(item.items);
  });
}

/**
 * Presents a native menu built from UI-level items (custom triggers, context
 * menus, dropdown-style pickers).
 * Resolves with the selected action id, or `undefined` when dismissed.
 *
 * Resolves the webview menu theme itself (callers never pass one): the theme
 * ships on the request and drives the default icon rasterization colors.
 *
 * When the spec contains star rows the request additionally carries the
 * rasterized star states (`starIcons`) and a `token` scoping the rows' click
 * events back to this menu; both are omitted for star-less specs.
 */
export async function presentNativeMenu(
  items: MenuSpecItem[],
  anchor: NativeMenuAnchor,
  options?: NativeMenuOptions,
): Promise<string | undefined> {
  const theme = resolveNativeMenuTheme();
  const wireItems = await toWireItems(items, {
    iconColor: theme.iconColor,
    destructiveColor: theme.destructiveText,
  });
  const position = { x: anchor.x, y: anchor.y };
  const showOptions = {
    align: anchor.align,
    highlightStyle: options?.highlightStyle,
    theme,
    minWidth: options?.minWidth,
  };
  if (!specContainsStarRows(items)) {
    return await showDesktopContextMenu(wireItems, position, showOptions);
  }

  // The star raster states, in the colors DefaultStarButton renders at open
  // time: pinned keeps the vibrant token (resolved through the cascade —
  // p3-safe), unpinned rests at tertiary and lifts to primary under the
  // pointer.
  const starIcons = await starIconsFor({
    pinned: resolveCssColorToHex("var(--psx-vibrant)") ?? theme.textPrimary,
    normal: theme.textTertiary,
    hover: theme.textPrimary,
  });
  // The token scopes star-click events to this menu; the listener spans
  // exactly the menu's lifetime (clicks keep the menu open, so several can
  // arrive before the show call settles).
  const token = crypto.randomUUID();
  const starOptions = { ...showOptions, token, starIcons };
  const onSetDefault = options?.onSetDefault;
  if (!onSetDefault) {
    return await showDesktopContextMenu(wireItems, position, starOptions);
  }

  const listener = (event: Event) => {
    const detail = (event as CustomEvent<NativeMenuSetDefaultPayload>).detail;
    if (!detail || detail.token !== token) return;
    onSetDefault(detail.id, detail.starred);
  };
  window.addEventListener(NATIVE_MENU_SET_DEFAULT_EVENT, listener);
  try {
    return await showDesktopContextMenu(wireItems, position, starOptions);
  } finally {
    window.removeEventListener(NATIVE_MENU_SET_DEFAULT_EVENT, listener);
  }
}
