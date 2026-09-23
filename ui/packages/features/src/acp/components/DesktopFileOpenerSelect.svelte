__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { createDropdownMenu, melt } from "@melt-ui/svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { Badge } from "@poolsideai/components/badge";
  import { appState } from "../hostAdapter";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { supportsNativeMenus } from "./chat/desktopContextMenu";
  import type { NativeMenuIcon } from "./chat/nativeMenuIcons";
  import { presentNativeMenu, type MenuSpecItem } from "./ui/menuSpec";
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
  let triggerEl = $state<HTMLButtonElement>();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // macOS desktop presents this as an OS-native menu; other desktop platforms
  // fall back to the melt-driven DOM dropdown below.
  const native = $derived(supportsNativeMenus($appState.environment));
  let nativeMenuOpen = $state(false);

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const triggerClass =
    "border-psx-border bg-psx-input-background text-psx-foreground-primary outline-hidden focus-visible:outline-psx-focus flex h-9 w-full items-center gap-2 rounded-[6px] border px-2 text-left text-sm focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60";

  // melt's trigger action stamps data-disabled/aria-disabled on a button that
  // mounts disabled (openers still loading) and never removes them, leaving the
  // enabled button styled disabled via the [data-disabled] variant. Clear them
  // once enabled; the native disabled attribute covers the disabled case.
  $effect(() => {
    if (disabled || !triggerEl) return;
    triggerEl.removeAttribute("data-disabled");
    triggerEl.removeAttribute("aria-disabled");
  });

  // forceVisible portals the menu to the body so it is not clipped by the
  // settings section's overflow: hidden.
  const {
    elements: { trigger, menu, item },
    states: { open },
  } = createDropdownMenu({
    positioning: { placement: "bottom-start", gutter: 4, sameWidth: true },
    forceVisible: true,
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    $open = false;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  // Mirrors the DOM menu's appIcon snippet: a data URI wins and renders as
  // full-color artwork (never a recolored mask), otherwise fall back to a
  // product icon by opener kind.
  function openerMenuIcon(opener: DesktopFileOpener): NativeMenuIcon {
    if (opener.iconDataUri) return { image: opener.iconDataUri };
    if (opener.kind === "inApp") return "file-active";
    if (opener.kind === "editorEnv" || opener.kind === "terminal") return "terminal";
    return "file";
  }

  // Single source of truth for the menu's rows: the DOM menu below iterates
  // `openers` directly and calls select(opener); the native menu maps the
  // same list to spec items and dispatches through select too.
  const openerMenuItems = $derived<MenuSpecItem[]>(
    openers.map((opener) => ({
      kind: "action",
      id: opener.id,
      label: opener.label,
      icon: openerMenuIcon(opener),
      checked: opener.id === value,
    })),
  );

  async function openNativeMenu() {
    if (!triggerEl || nativeMenuOpen || disabled) return;
    const rect = triggerEl.getBoundingClientRect();
    nativeMenuOpen = true;
    try {
      const id = await presentNativeMenu(openerMenuItems, {
        x: rect.left,
        y: rect.bottom + 4,
      });
      const opener = openers.find((candidate) => candidate.id === id);
      if (opener) select(opener);
    } finally {
      nativeMenuOpen = false;
    }
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
<div class="w-full max-w-[360px]">
  {#if native}
    <button
      type="button"
      bind:this={triggerEl}
      class={triggerClass}
      aria-label="Open files in"
      aria-haspopup="menu"
      aria-expanded={nativeMenuOpen}
      {disabled}
      onclick={openNativeMenu}
    >
      {@render appIcon(selected)}
      <span class="min-w-0 flex-1 truncate">{selected?.label ?? "No applications detected"}</span>
      <Icon name="chevron" size={14} class="shrink-0 opacity-70" aria-hidden="true" />
    </button>
  {:else}
    <button
      type="button"
      bind:this={triggerEl}
      use:melt={$trigger}
      class={triggerClass}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {disabled}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {@render appIcon(selected)}
      <span class="min-w-0 flex-1 truncate">{selected?.label ?? "No applications detected"}</span>
      <Icon name="chevron" size={14} class="shrink-0 opacity-70" aria-hidden="true" />
    </button>

    {#if $open}
      <div
        use:melt={$menu}
        class="menu-surface z-50 max-h-72 overflow-y-auto p-1"
        aria-label="Open files in"
      >
        {#each openers as opener (opener.id)}
          <button
            type="button"
            use:melt={$item}
            class="hover:bg-psx-menu-hover-background data-[highlighted]:bg-psx-menu-hover-background data-[selected=true]:bg-psx-menu-hover-background flex h-8 w-full items-center gap-2 rounded-[4px] px-2 text-left"
            data-selected={opener.id === value}
            onclick={() => select(opener)}
          >
            {@render appIcon(opener)}
            <span class="min-w-0 flex-1 truncate">{opener.label}</span>
            {#if opener.id === value}
              <Badge size="xs" class="uppercase">Selected</Badge>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
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
    {:else if opener?.kind === "inApp"}
      <Icon name="file-active" size={13} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
