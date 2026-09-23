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
    // Desktop only: drives the panel frame's traffic-light spacer. Unlike
    // settings sections, connectors keeps the sidebar collapsible.
    sidebarCollapsed?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let { desktopFrame = false, sidebarCollapsed = false, onDone }: Props = $props();
  let hasTopOverflow = $state(false);
  let hasBottomOverflow = $state(false);

  function updateOverflow(element: HTMLDivElement): void {
    const nextTopOverflow = element.scrollTop > 1;
    const nextBottomOverflow = element.scrollHeight - element.scrollTop - element.clientHeight > 1;
    if (hasTopOverflow !== nextTopOverflow) hasTopOverflow = nextTopOverflow;
    if (hasBottomOverflow !== nextBottomOverflow) hasBottomOverflow = nextBottomOverflow;
  }

  function observeOverflow(element: HTMLDivElement) {
    updateOverflow(element);

    let animationFrame: number | undefined;
    const scheduleOverflowUpdate = () => {
      if (animationFrame !== undefined) return;
      animationFrame = requestAnimationFrame(() => {
        animationFrame = undefined;
        updateOverflow(element);
      });
    };
    const resizeObserver = new ResizeObserver(scheduleOverflowUpdate);
    resizeObserver.observe(element);
    const mutationObserver = new MutationObserver(scheduleOverflowUpdate);
    mutationObserver.observe(element, { childList: true, subtree: true, characterData: true });

    return {
      destroy() {
        if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
        resizeObserver.disconnect();
        mutationObserver.disconnect();
      },
    };
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <DesktopSettingsPanelFrame
    title="Connectors"
    rootLabel="Connectors"
    breadcrumbs={[]}
    {sidebarCollapsed}
  >
    <div class="settings-section-stack connectors-panel-stack">
      <SettingsSection
        class="connectors-panel"
        title="Connectors"
        subtitle="MCP servers available to your agents."
      >
        <div
          use:observeOverflow
          class="connectors-panel-scroller"
          data-overflow-top={hasTopOverflow}
          data-overflow-bottom={hasBottomOverflow}
          onscroll={(event) => updateOverflow(event.currentTarget)}
        >
          <UserMCPServersSection showHeading={false} />
        </div>
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    <div
      use:observeOverflow
      class="connectors-panel-scroller min-h-0 flex-1"
      data-overflow-top={hasTopOverflow}
      data-overflow-bottom={hasBottomOverflow}
      onscroll={(event) => updateOverflow(event.currentTarget)}
    >
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

<style lang="postcss">
  .connectors-panel-stack {
    height: 100%;
    min-height: 0;
    padding-bottom: 0;
  }

  :global(.desktop-settings-pane:has(.connectors-panel-stack)) {
    overflow: visible;
    -webkit-mask-image: none;
    mask-image: none;
  }

  :global(.connectors-panel) {
    display: flex;
    min-height: 0;
    flex: 1 1 0;
    flex-direction: column;
  }

  :global(.connectors-panel > .settings-section-header) {
    flex: 0 0 auto;
  }

  :global(.connectors-panel > .settings-section-content) {
    min-height: 0;
    flex: 1 1 0;
    overflow: hidden;
  }

  .connectors-panel-scroller {
    --connectors-overflow-fade-height: 28px;
    --connectors-overflow-mask-top: #000;
    --connectors-overflow-mask-bottom: #000;

    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;
    -webkit-mask-image: linear-gradient(
      to bottom,
      var(--connectors-overflow-mask-top) 0,
      #000 var(--connectors-overflow-fade-height),
      #000 calc(100% - var(--connectors-overflow-fade-height)),
      var(--connectors-overflow-mask-bottom) 100%
    );
    mask-image: linear-gradient(
      to bottom,
      var(--connectors-overflow-mask-top) 0,
      #000 var(--connectors-overflow-fade-height),
      #000 calc(100% - var(--connectors-overflow-fade-height)),
      var(--connectors-overflow-mask-bottom) 100%
    );
    -webkit-mask-mode: alpha;
    mask-mode: alpha;
  }

  .connectors-panel-scroller[data-overflow-top="true"] {
    --connectors-overflow-mask-top: transparent;
  }

  .connectors-panel-scroller[data-overflow-bottom="true"] {
    --connectors-overflow-mask-bottom: transparent;
  }
</style>
