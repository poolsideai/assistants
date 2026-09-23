__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { appState } from "../../hostAdapter";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { supportsNativeMenus } from "./desktopContextMenu";
  import type { NativeMenuIcon } from "./nativeMenuIcons";
  import { presentNativeMenu, type MenuSpecItem } from "../ui/menuSpec";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    compact?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    compact = false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // macOS desktop presents this as an OS-native menu; other desktop platforms
  // fall back to the DOM menu below.
  const native = $derived(supportsNativeMenus($appState.environment));
  let menuTriggerButton = $state<HTMLButtonElement>();
  let nativeMenuOpen = $state(false);

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const appIconSizeClass = $derived(compact ? "size-[18px]" : "size-5");
  const appIconPixelSize = $derived(compact ? 18 : 17);
  const mainButtonSizeClass = $derived(compact ? "size-[22px]" : "size-7");
  const menuButtonSizeClass = $derived(compact ? "h-[22px] w-3" : "h-7 w-4");
  const chevronIconSize = $derived(compact ? 10 : 11);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      : "text-psx-icon hover:bg-psx-menu-hover-background",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Mirrors the DOM menu's appIcon snippet: a data URI wins and renders as
  // full-color artwork (never a recolored mask), otherwise fall back to a
  // product icon by opener kind. Padded artwork gets the same slight upscale
  // as the DOM rows' scale-105.
  function openerMenuIcon(opener: DesktopTargetOpener): NativeMenuIcon {
    if (opener.iconDataUri) {
      return hasPaddedIcon(opener)
        ? { image: opener.iconDataUri, scale: 1.05 }
        : { image: opener.iconDataUri };
    }
    if (opener.kind === "inApp") return "file-active";
    if (opener.kind === "editorEnv" || opener.kind === "terminal") return "terminal";
    return "file";
  }

  // Single source of truth for the menu's rows: the DOM menu below iterates
  // `openers` directly and calls openWith(opener); the native menu maps the
  // same list to spec items and dispatches through openWith too.
  const openerMenuItems = $derived<MenuSpecItem[]>(
    openers.map((opener) => ({
      kind: "action",
      id: opener.id,
      label: opener.label,
      icon: openerMenuIcon(opener),
    })),
  );

  function toggleMenu() {
    if (native) {
      void openNativeMenu();
      return;
    }
    open = !open;
  }

  async function openNativeMenu() {
    if (!menuTriggerButton || nativeMenuOpen || disabled) return;
    const rect = menuTriggerButton.getBoundingClientRect();
    nativeMenuOpen = true;
    try {
      const id = await presentNativeMenu(
        openerMenuItems,
        { x: rect.right, y: rect.bottom + 4, align: "end" },
        { highlightStyle: "themed" },
      );
      openWith(openers.find((opener) => opener.id === id));
    } finally {
      nativeMenuOpen = false;
    }
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  // VS Code's icon artwork has unusually wide transparent padding, so it
  // renders smaller than other app icons at the same box size.
  function hasPaddedIcon(opener: DesktopTargetOpener) {
    return opener.id.includes("VSCode") || opener.label.startsWith("Visual Studio Code");
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        "outline-hidden focus-visible:outline-psx-focus flex shrink-0 items-center justify-center rounded-l-[6px] mix-blend-multiply transition-colors ease-out focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60 dark:mix-blend-screen",
        mainButtonSizeClass,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {@render appIcon(selected, appIconSizeClass, appIconPixelSize)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      bind:this={menuTriggerButton}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        "outline-hidden focus-visible:outline-psx-focus flex shrink-0 items-center justify-center rounded-r-[6px] transition-colors ease-out focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60",
        menuButtonSizeClass,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      aria-expanded={native ? nativeMenuOpen : open}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      onclick={toggleMenu}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <Icon name="chevron" size={chevronIconSize} class="opacity-70" aria-hidden="true" />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      class="menu-surface absolute right-0 z-50 mt-1 max-h-80 w-56 overflow-y-auto p-1"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          class="hover:bg-psx-menu-hover-background flex h-8 w-full items-center gap-2 rounded-[4px] px-2 text-left"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#snippet appIcon(opener?: DesktopTargetOpener, sizeClass = "size-5", iconSize = 17)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <img
        src={opener.iconDataUri}
        alt=""
        class={["size-full object-contain", hasPaddedIcon(opener) && "scale-105"]}
      />
    {:else if opener?.kind === "inApp"}
      <Icon name="file-active" size={iconSize} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <Icon name="terminal" size={iconSize - 3} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <Icon name="file" size={iconSize} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
