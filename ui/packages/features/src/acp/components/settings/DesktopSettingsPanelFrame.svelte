<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { Snippet } from "svelte";
  import { desktopUpdate } from "../../desktopUpdate";

  interface DesktopSettingsBreadcrumb {
    label: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onClick?: () => void;
  }

  interface Props {
    title: string;
    subtitle?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    breadcrumbs?: readonly DesktopSettingsBreadcrumb[];
    // Only standalone panels (Connectors) can collapse the sidebar; settings
    // sections pin it open and leave this undefined. When defined, the header
    // reserves room for the macOS traffic lights while the sidebar is
    // collapsed, mirroring the chat tab bar's spacer.
    sidebarCollapsed?: boolean;
    children?: Snippet;
  }

  let { title, rootLabel = "Settings", breadcrumbs, sidebarCollapsed, children }: Props = $props();
  let headerBreadcrumbs = $derived(breadcrumbs ?? [{ label: title }]);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function updatePaneOverflow(element: HTMLDivElement): void {
    const nextTopOverflow = element.scrollTop > 1;
    const nextBottomOverflow = element.scrollHeight - element.scrollTop - element.clientHeight > 1;
    if (hasPaneTopOverflow !== nextTopOverflow) hasPaneTopOverflow = nextTopOverflow;
    if (hasPaneBottomOverflow !== nextBottomOverflow) {
      hasPaneBottomOverflow = nextBottomOverflow;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Install observers as a node action so overflow-state DOM updates cannot
  // invalidate their own lifecycle and repeatedly recreate the observers.
  function observePaneOverflow(element: HTMLDivElement) {
    updatePaneOverflow(element);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    let animationFrame: number | undefined;
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (animationFrame !== undefined) return;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = undefined;
        updatePaneOverflow(element);
      });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    let observedContent = element.firstElementChild;
    if (observedContent) resizeObserver.observe(observedContent);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const mutationObserver = new MutationObserver(() => {
      const nextContent = element.firstElementChild;
      if (nextContent !== observedContent) {
        if (observedContent) resizeObserver.unobserve(observedContent);
        observedContent = nextContent;
        if (observedContent) resizeObserver.observe(observedContent);
      }
      scheduleOverflowUpdate();
    });
    // Content and text changes can affect scroll height. Attribute changes are
    // deliberately excluded: this pane writes its own overflow data attributes,
    // and observing those writes creates a render-observer feedback cycle.
    mutationObserver.observe(element, { childList: true, subtree: true, characterData: true });

    return {
      destroy() {
        if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      },
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }
</script>

<section class="desktop-settings-panel text-psx-foreground-primary">
  <div class="desktop-settings-top-drag-region" data-tauri-drag-region="deep"></div>
  <div class="desktop-settings-frame">
    <div class="desktop-settings-header" data-tauri-drag-region="deep">
      {#if sidebarCollapsed !== undefined}
        <div
          class={[
            "desktop-settings-traffic-light-spacer",
            sidebarCollapsed ? "" : "desktop-settings-traffic-light-spacer--hidden",
            sidebarCollapsed && $desktopUpdate.available
              ? "desktop-settings-traffic-light-spacer--with-update"
              : "",
          ]}
          data-tauri-drag-region="deep"
          aria-hidden="true"
        ></div>
      {/if}
      <div class="flex w-full min-w-0 items-center gap-2 text-sm/[20px]">
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {#each headerBreadcrumbs as crumb (crumb.label)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
          {#if crumb.onClick}
            <button
              type="button"
              data-tauri-drag-region="false"
              class="text-psx-foreground-primary outline-hidden hover:bg-psx-menu-hover-background focus-visible:outline-psx-focus flex min-w-0 items-center gap-1 rounded-[5px] px-1 py-0.5 focus-visible:outline-2"
              onclick={crumb.onClick}
            >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              <span class="min-w-0 truncate">{crumb.label}</span>
            </button>
          {:else}
            <span
__POOL_SYNTHETIC_IMPORT_BASELINE__
            >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
              <span class="min-w-0 truncate">{crumb.label}</span>
            </span>
          {/if}
        {/each}
      </div>
    </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
      use:observePaneOverflow
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      onscroll={(event) => updatePaneOverflow(event.currentTarget)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {@render children?.()}
    </div>
  </div>
</section>

<style lang="postcss">
  .desktop-settings-panel {
    --desktop-splits-tab-top-margin: 6px;
    --desktop-splits-shadow-gutter: 6px;
    --settings-section-stack-inline-padding: 0px;
    /* Keep the settings card's soft, layered lift aligned with the chat pane. */
    --desktop-splits-pane-shadow:
      0 4px 12px rgba(0, 0, 0, 0.05), 0 1px 6px rgba(0, 0, 0, 0.025),
      0 0.5px 2px rgba(0, 0, 0, 0.05);
    --desktop-splits-panel-top-inset: max(
      0px,
      calc(var(--desktop-splits-tab-top-margin) - var(--desktop-splits-shadow-gutter))
    );
    --desktop-splits-panel-inset: max(
      0px,
      calc(var(--desktop-main-panel-inset, 8px) - var(--desktop-splits-shadow-gutter))
    );
    --desktop-splits-panel-sidebar-gap: max(
      0px,
      calc(var(--desktop-main-panel-sidebar-gap, 8px) - var(--desktop-splits-shadow-gutter))
    );

    position: relative;
    z-index: 10;
    box-sizing: border-box;
    padding: var(--desktop-splits-panel-top-inset) var(--desktop-splits-panel-inset)
      var(--desktop-splits-panel-inset) var(--desktop-splits-panel-sidebar-gap);
    min-width: 0;
    height: 100%;
    min-height: 0;
    align-self: stretch;
    flex: 1 1 0;
  }

  .desktop-settings-top-drag-region {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    z-index: 1;
    height: var(--desktop-splits-tab-top-margin);
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
    --desktop-splits-pane-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 6px rgba(0, 0, 0, 0.2);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  .desktop-settings-frame {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    overflow: visible;
    border-radius: var(--desktop-main-panel-radius, 10px);
    padding: var(--desktop-splits-shadow-gutter);
    background: var(--psx-panel);
  }

  .desktop-settings-header {
    display: flex;
    box-sizing: border-box;
    height: 34px;
    min-height: 34px;
    align-items: center;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  /* Mirrors .desktop-tab-bar-traffic-light-spacer in DesktopSplitsPane. */
  .desktop-settings-traffic-light-spacer {
    width: calc(var(--desktop-window-controls-space, 88px) + 24px);
    min-width: calc(var(--desktop-window-controls-space, 88px) + 24px);
    height: 100%;
    flex: 0 0 auto;
    transition:
      width 180ms cubic-bezier(0.2, 0, 0, 1),
      min-width 180ms cubic-bezier(0.2, 0, 0, 1);
  }

  .desktop-settings-traffic-light-spacer--hidden {
    width: 0;
    min-width: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .desktop-settings-traffic-light-spacer {
      transition: none;
    }
  }

  /* Collapsed sidebar + a downloaded update: reserve extra room so the sidebar
     "Update" pill doesn't overlap the header. */
  .desktop-settings-traffic-light-spacer--with-update {
    width: calc(var(--desktop-window-controls-space, 88px) + 24px + 72px);
    min-width: calc(var(--desktop-window-controls-space, 88px) + 24px + 72px);
  }

  :global(body.desktop-window-fullscreen) .desktop-settings-traffic-light-spacer {
    width: calc(var(--desktop-fullscreen-sidebar-icon-offset, 5px) + 22px + 4px);
    min-width: calc(var(--desktop-fullscreen-sidebar-icon-offset, 5px) + 22px + 4px);
  }

  :global(body.desktop-window-fullscreen) .desktop-settings-traffic-light-spacer--with-update {
    width: calc(var(--desktop-fullscreen-sidebar-icon-offset, 5px) + 22px + 4px + 72px);
    min-width: calc(var(--desktop-fullscreen-sidebar-icon-offset, 5px) + 22px + 4px + 72px);
  }

  :global(body.desktop-window-fullscreen) .desktop-settings-traffic-light-spacer--hidden {
    width: 0;
    min-width: 0;
  }

  .desktop-settings-pane {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    min-width: 0;
    min-height: 0;
    flex: 1 1 0;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    border-radius: var(--desktop-main-panel-radius, 10px);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }
</style>
