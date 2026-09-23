<script lang="ts">
  import { createDropdownMenu, melt } from "@melt-ui/svelte";
  import Icon, { type IconName } from "../../icon/index.js";
  import { tick } from "svelte";
  import { setContext, untrack, type Snippet } from "svelte";

  interface Props {
    icon: IconName;
    iconClass?: string;
    label: string;
    placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
    searchable?: boolean;
    searchPlaceholder?: string;
    disableFocusFirstItem?: boolean;
    /** Roomier menu, for lists whose items carry a description line. */
    wide?: boolean;
    header?: Snippet;
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
  }

  let {
    icon,
    iconClass,
    label,
    placement = "bottom-start",
    searchable = false,
    searchPlaceholder = "Search...",
    disableFocusFirstItem = false,
    wide = false,
    header,
    children,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }: Props = $props();

  const menu = createDropdownMenu({
    positioning: { placement: untrack(() => placement) },
    forceVisible: true,
    typeahead: untrack(() => !searchable),
    disableFocusFirstItem: untrack(() => searchable || disableFocusFirstItem),
  });

  const {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    states: { open },
  } = menu;

  let searchQuery = $state("");
  let visibleItemCount = $state(0);
  let menuRef: HTMLDivElement | undefined = $state();
  let searchInputRef: HTMLInputElement | undefined = $state();
  let suppressInitialItemFocus = false;
  const trimmedSearchQuery = $derived(searchQuery.trim());
  const showEmptySearchResults = $derived(
    searchable && trimmedSearchQuery.length > 0 && visibleItemCount === 0,
  );

  $effect(() => {
    if (!$open) {
      searchQuery = "";
      return;
    }
    if (searchable && searchInputRef) {
      requestAnimationFrame(() => searchInputRef?.focus());
    }
  });

  $effect(() => {
    if (!$open || !disableFocusFirstItem) {
      suppressInitialItemFocus = false;
      return;
    }

    suppressInitialItemFocus = true;
    const timeout = window.setTimeout(() => {
      suppressInitialItemFocus = false;
    }, 50);
    return () => window.clearTimeout(timeout);
  });

  $effect(() => {
    searchQuery;
    children;
    tick().then(() => {
      visibleItemCount = menuRef?.querySelectorAll<HTMLElement>('[role="menuitem"]').length ?? 0;
    });
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
  function handleSearchEnter() {
    if (!menuRef) return;
    const visibleItems = menuRef.querySelectorAll<HTMLElement>('[role="menuitem"]');
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleSearchEnter();
      return;
    }
    if (["Escape", "ArrowDown", "ArrowUp", "Tab"].includes(e.key)) return;
    if (e.metaKey || e.ctrlKey) return;
    e.stopPropagation();
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
  function handleMenuFocusIn(event: FocusEvent) {
    if (!suppressInitialItemFocus || event.target === menuRef) return;
    suppressInitialItemFocus = false;
    menuRef?.focus({ preventScroll: true });
  }

  setContext("dropdown", menu);
  setContext("dropdown-search", {
    get query() {
      return searchQuery;
    },
  });
</script>

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <Icon name={icon} size={14} class={["shrink-0", iconClass]} aria-hidden="true" />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

{#if $open}
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <div
    bind:this={menuRef}
    use:melt={$menuEl}
    onfocusin={handleMenuFocusIn}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    class={[
      "z-50 max-h-[300px] max-w-[calc(100vw-2rem)] overflow-y-auto menu-surface p-1",
      wide ? "w-[450px]" : "w-[300px]",
      disableFocusFirstItem && "focus:outline-none",
    ]}
  >
    {#if header || searchable}
      <div class="mb-1 pb-1">
        {#if header}
          <div class="flex items-center gap-1 px-1 py-1">
            {@render header()}
          </div>
        {/if}
        {#if searchable}
          <div class="px-0.5 pt-0.5">
            <!-- Options are identifiers (model ids, mode names), not prose.
                 autocorrect is separate from spellcheck in WebKit: without it
                 macOS rewrites a half-typed model name mid-search. -->
            <input
              bind:this={searchInputRef}
              type="text"
              bind:value={searchQuery}
              onkeydown={handleSearchKeydown}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              spellcheck="false"
              autocorrect="off"
              autocapitalize="off"
              autocomplete="off"
              class="w-full rounded-md border border-psx-border bg-psx-editor-background px-2 py-1 text-sm text-psx-foreground-primary outline-none placeholder:text-psx-foreground-secondary/50 focus:border-psx-focus"
            />
          </div>
        {/if}
      </div>
    {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if showEmptySearchResults}
      <div class="flex items-center gap-2 px-2 pt-1 pb-2 text-psx-foreground-secondary">
        <Icon name="search" size={14} aria-hidden="true" />
        <span>No results found for {trimmedSearchQuery}</span>
      </div>
    {/if}
  </div>
{/if}
