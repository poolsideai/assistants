__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    AcpDesktopSplitsPane,
    DESKTOP_SPLITS_CACHE_LIMIT,
    DESKTOP_SETTINGS_SECTIONS,
    DesktopProjectSettingsView,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    DesktopSplitsCache,
    getCurrentAssistantTerminalRepo,
    IDE_SETTINGS_SECTIONS,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    terminalIdsForDesktopSplitsEntry,
    type DesktopSettingsSection,
    type DesktopSplitNavigationLocation,
    type DesktopSplitNavigationRequest,
    type DesktopSplitsEntry,
    type DesktopFileViewerPanelProps,
    type DesktopNewTabAvailability,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { onDestroy, onMount, type Component } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import AssistantConfigErrorBanner from "./AssistantConfigErrorBanner.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import {
    DesktopNavigationHistory,
    type DesktopNavigationEntry,
  } from "./runtime/desktop/DesktopNavigationHistory";
  import type { TauriDragDropSubscriber } from "./runtime/desktop/TauriDragDrop.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  interface Props extends TargetProps {
    desktopFileViewerPanel?: Component<DesktopFileViewerPanelProps>;
    tauriDragDropSubscriber?: TauriDragDropSubscriber;
    /** Chrome and navigation handlers are mounted; agent/history work may still be pending. */
    onShellInteractive?: () => void;
    onInitialScreenSettled?: () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  const DESKTOP_NEW_CONVERSATION_EVENT = "poolside:desktop-new-conversation";
  const DESKTOP_NEW_PROJECT_EVENT = "poolside:desktop-new-project";
  const DESKTOP_OPEN_IN_IDE_EVENT = "poolside:desktop-open-in-ide";
  const DESKTOP_TOGGLE_LEFT_SIDEBAR_EVENT = "poolside:desktop-toggle-left-sidebar";
  const DESKTOP_TOGGLE_RIGHT_SIDEBAR_EVENT = "poolside:desktop-toggle-right-sidebar";
  const DESKTOP_TOGGLE_BOTTOM_PANEL_EVENT = "poolside:desktop-toggle-bottom-panel";
  const DESKTOP_NAVIGATE_BACK_EVENT = "poolside:desktop-navigate-back";
  const DESKTOP_NAVIGATE_FORWARD_EVENT = "poolside:desktop-navigate-forward";
  const DESKTOP_NAVIGATION_AVAILABILITY_EVENT = "poolside:desktop-navigation-availability";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let {
    desktopFileViewerPanel,
    tauriDragDropSubscriber,
    onShellInteractive,
    onInitialScreenSettled,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    ...runtimeProps
  }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const core = new CoreRuntime({ target: "desktop", ...runtimeProps });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const desktop = new DesktopRuntime(core, {
    tauriDragDropSubscriber,
    onNavigationChange: scheduleDesktopNavigationRecord,
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Optional startup-diagnostics hooks installed by the desktop host (see
  // desktop-assistant/src/startupDiagnostics.ts) for debugging launches stuck
  // on the startup frame: the probe samples every input to the initial-screen
  // gate. Inert on hosts that don't install the globals.
  const startupDiagnostics = globalThis as {
    __poolsideStartupDiag?: (event: string, data?: unknown) => void;
    __poolsideRegisterStartupProbe?: (name: string, probe: () => unknown) => void;
  };
  startupDiagnostics.__poolsideRegisterStartupProbe?.("initialScreenGate", () =>
    desktop.startupDiagnosticsSnapshot(),
  );
  onMount(() => {
    startupDiagnostics.__poolsideStartupDiag?.("desktopPanel.shellInteractive");
    onShellInteractive?.();
  });
  let initialScreenSettledNotified = false;
  $effect(() => {
    if (initialScreenSettledNotified || !desktop.initialScreenSettled) return;
    initialScreenSettledNotified = true;
    startupDiagnostics.__poolsideStartupDiag?.("desktopPanel.initialScreenSettled");
    onInitialScreenSettled?.();
  });
  let initialAgentReadyNotified = false;
  $effect(() => {
    if (initialAgentReadyNotified || !desktop.initialAgentReady) return;
    initialAgentReadyNotified = true;
    startupDiagnostics.__poolsideStartupDiag?.("desktopPanel.agentReadyForPrompt");
  });
  let activeSplitNavigation = $state<DesktopSplitNavigationLocation>();
  let splitNavigationRequest = $state<DesktopSplitNavigationRequest>();
  let splitNavigationRequestToken = 0;
  let navigationRecordQueued = false;
  const desktopNavigationHistory = new DesktopNavigationHistory(currentDesktopNavigationEntry());
  queueMicrotask(syncDesktopNavigationAvailability);
  const assistantTerminals = getCurrentAssistantTerminalRepo();
  let desktopNewTabAvailability = $state<DesktopNewTabAvailability>({});
  const desktopSplitsCache = new DesktopSplitsCache({
    maxEntries: DESKTOP_SPLITS_CACHE_LIMIT,
    onEvictEntry: closeDesktopSplitsEntryTerminals,
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__

  function currentDesktopNavigationEntry(): DesktopNavigationEntry {
    const split =
      desktop.view === "chat" && activeSplitNavigation?.layoutKey === desktop.desktopChatLayoutKey
        ? activeSplitNavigation
        : undefined;
    return {
      view: desktop.view,
      projectSettingsPath: desktop.projectSettingsPath,
      conversationId: desktop.activeConversationId,
      split,
    };
  }

  function scheduleDesktopNavigationRecord() {
    if (navigationRecordQueued) return;
    navigationRecordQueued = true;
    queueMicrotask(() => {
      navigationRecordQueued = false;
      desktopNavigationHistory.record(currentDesktopNavigationEntry());
      syncDesktopNavigationAvailability();
    });
  }

  function syncDesktopNavigationAvailability() {
    window.dispatchEvent(
      new CustomEvent(DESKTOP_NAVIGATION_AVAILABILITY_EVENT, {
        detail: {
          canGoBack: desktopNavigationHistory.canGoBack,
          canGoForward: desktopNavigationHistory.canGoForward,
        },
      }),
    );
  }

  function handleSplitNavigationChange(location: DesktopSplitNavigationLocation) {
    activeSplitNavigation = location;
    scheduleDesktopNavigationRecord();
  }

  function applyDesktopNavigation(entry: DesktopNavigationEntry | undefined) {
    if (!entry) return;
    desktop.restoreNavigation(entry);
    activeSplitNavigation = entry.split;
    splitNavigationRequest = entry.split
      ? { location: entry.split, token: ++splitNavigationRequestToken }
      : undefined;
  }

  function handleNavigateBack(event: Event) {
    if (!desktop.isDesktop) return;
    const entry = desktopNavigationHistory.back();
    syncDesktopNavigationAvailability();
    applyDesktopNavigation(entry);
    event.preventDefault();
  }

  function handleNavigateForward(event: Event) {
    if (!desktop.isDesktop) return;
    const entry = desktopNavigationHistory.forward();
    syncDesktopNavigationAvailability();
    applyDesktopNavigation(entry);
    event.preventDefault();
  }

  function closeDesktopSplitsEntryTerminals(entry: DesktopSplitsEntry) {
    for (const terminalId of terminalIdsForDesktopSplitsEntry(entry)) {
      void assistantTerminals.deleteTab(terminalId).catch((error) => {
        console.debug("Unable to delete cached assistant terminal", error);
      });
    }
  }

  function handleDesktopNewTabAvailabilityChange(next: DesktopNewTabAvailability) {
    if (desktopNewTabAvailabilityEquals(desktopNewTabAvailability, next)) return;
    desktopNewTabAvailability = next;
  }

  function desktopNewTabAvailabilityEquals(
    left: DesktopNewTabAvailability,
    right: DesktopNewTabAvailability,
  ): boolean {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const leftState = left[kind];
      const rightState = right[kind];
      if (leftState?.disabled !== rightState?.disabled) return false;
      if (leftState?.disabledReason !== rightState?.disabledReason) return false;
    }
    return true;
  }

  $effect(() => {
    window.addEventListener(DESKTOP_NEW_CONVERSATION_EVENT, handleNewConversationEvent);
    window.addEventListener(DESKTOP_NEW_PROJECT_EVENT, handleNewProjectEvent);
    window.addEventListener(DESKTOP_OPEN_IN_IDE_EVENT, handleOpenInIdeEvent);
    window.addEventListener(DESKTOP_TOGGLE_LEFT_SIDEBAR_EVENT, handleToggleLeftSidebarEvent);
    window.addEventListener(DESKTOP_TOGGLE_RIGHT_SIDEBAR_EVENT, handleToggleRightSidebarEvent);
    window.addEventListener(DESKTOP_TOGGLE_BOTTOM_PANEL_EVENT, handleToggleBottomPanelEvent);
    window.addEventListener(DESKTOP_NAVIGATE_BACK_EVENT, handleNavigateBack);
    window.addEventListener(DESKTOP_NAVIGATE_FORWARD_EVENT, handleNavigateForward);

    return () => {
      window.removeEventListener(DESKTOP_NEW_CONVERSATION_EVENT, handleNewConversationEvent);
      window.removeEventListener(DESKTOP_NEW_PROJECT_EVENT, handleNewProjectEvent);
      window.removeEventListener(DESKTOP_OPEN_IN_IDE_EVENT, handleOpenInIdeEvent);
      window.removeEventListener(DESKTOP_TOGGLE_LEFT_SIDEBAR_EVENT, handleToggleLeftSidebarEvent);
      window.removeEventListener(DESKTOP_TOGGLE_RIGHT_SIDEBAR_EVENT, handleToggleRightSidebarEvent);
      window.removeEventListener(DESKTOP_TOGGLE_BOTTOM_PANEL_EVENT, handleToggleBottomPanelEvent);
      window.removeEventListener(DESKTOP_NAVIGATE_BACK_EVENT, handleNavigateBack);
      window.removeEventListener(DESKTOP_NAVIGATE_FORWARD_EVENT, handleNavigateForward);
    };
  });

  function handleNewConversationEvent(event: Event) {
    if (!desktop.isDesktop) return;
    void desktop.handleNewConversation();
    event.preventDefault();
  }

  function handleNewProjectEvent(event: Event) {
    if (!desktop.isDesktop) return;
    void desktop.handleAddProject();
    event.preventDefault();
  }

  function handleOpenInIdeEvent(event: Event) {
    if (!desktop.isDesktop) return;
    desktop.handleOpenInIde();
    event.preventDefault();
  }

  function handleToggleLeftSidebarEvent(event: Event) {
    if (!desktop.isDesktop) return;
    desktop.toggleLeftPanel();
    event.preventDefault();
  }

  function handleToggleRightSidebarEvent(event: Event) {
    if (!desktop.isDesktop) return;
    desktop.toggleDesktopRightSidebarVisible();
    event.preventDefault();
  }

  function handleToggleBottomPanelEvent(event: Event) {
    if (!desktop.isDesktop) return;
    desktop.toggleDesktopBottomPanelVisible();
    event.preventDefault();
  }

  onDestroy(() => desktopSplitsCache.disposeAll());
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    return (
      view === "settings" ||
      view === "shortcuts" ||
      view === "models" ||
      view === "voice" ||
      view === "github" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
      view === "archived" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function isSettingsSidebarView(view: string): boolean {
    return isSettingsView(view) || view === "project-settings";
  }

  function activeSettingsSection(view: string, isDesktop: boolean): DesktopSettingsSection {
    if (
      view === "shortcuts" ||
      view === "models" ||
      view === "voice" ||
      view === "connectors" ||
      view === "github" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
      view === "archived" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
    ) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function showSettingsSection(section: DesktopSettingsSection) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Coalesce resize-drag mousemoves to one geometry update per frame. On
  // high-refresh displays, mousemove can fire more often than frames render;
  // applying every event forces redundant layout work mid-drag.
  let pendingResizeMoveEvent: MouseEvent | undefined;
  let resizeMoveFrame: number | undefined;

  function handleResizeMouseMove(event: MouseEvent) {
    // Only queue while a resize drag is active. Besides skipping rAF work on
    // ordinary mouse motion, this keeps a mousemove that landed just before
    // the resize mousedown from being replayed into the fresh drag (the move
    // handlers check their resizing flags at rAF time, not enqueue time).
    if (
      !desktop.desktopSidebarResizing &&
      !desktop.desktopRightSidebarResizing &&
      !desktop.desktopBottomPanelResizing
    ) {
      return;
    }
    pendingResizeMoveEvent = event;
    resizeMoveFrame ??= requestAnimationFrame(applyPendingResizeMove);
  }

  function applyPendingResizeMove() {
    resizeMoveFrame = undefined;
    const event = pendingResizeMoveEvent;
    pendingResizeMoveEvent = undefined;
    if (!event) return;
    desktop.moveDesktopSidebarResize(event);
    desktop.moveDesktopRightSidebarResize(event);
    desktop.moveDesktopBottomPanelResize(event);
  }

  function handleResizeMouseUp() {
    if (resizeMoveFrame !== undefined) {
      cancelAnimationFrame(resizeMoveFrame);
      resizeMoveFrame = undefined;
    }
    // Apply the final position before ending the gesture so the release
    // point is never dropped.
    const event = pendingResizeMoveEvent;
    pendingResizeMoveEvent = undefined;
    if (event) {
      desktop.moveDesktopSidebarResize(event);
      desktop.moveDesktopRightSidebarResize(event);
      desktop.moveDesktopBottomPanelResize(event);
    }
    desktop.stopDesktopSidebarResize();
    desktop.stopDesktopRightSidebarResize();
    desktop.stopDesktopBottomPanelResize();
  }

  onDestroy(() => {
    if (resizeMoveFrame !== undefined) {
      cancelAnimationFrame(resizeMoveFrame);
    }
  });
</script>

<svelte:window onmousemove={handleResizeMouseMove} onmouseup={handleResizeMouseUp} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    branches (chrome and settings sections) are temporary and should be removed once VS gets
    dedicated panels.
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
        onShowConnectors={desktop.showConnectors}
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
      {#if desktop.isDesktop}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          collapseDisabled={isSettingsSidebarView(desktop.view)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            desktop.view === "models" ||
            desktop.view === "voice" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            desktop.view === "archived" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
            desktop.view === "chat" ||
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          onNewChat={desktop.handleNewChat}
__POOL_SYNTHETIC_IMPORT_BASELINE__
          onShowShortcuts={desktop.showShortcuts}
          onShowModels={desktop.showModels}
          onShowVoice={desktop.showVoice}
          onShowConnectors={desktop.showConnectors}
__POOL_SYNTHETIC_IMPORT_BASELINE__
          onShowAgents={desktop.showAgents}
          onShowArchived={desktop.showArchived}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          newTabAvailability={desktopNewTabAvailability}
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
      {#if desktop.isDesktop && isSettingsView(desktop.view)}
        <DesktopSettingsView
          desktopFrame
          section={activeSettingsSection(desktop.view, desktop.isDesktop)}
          availableSections={DESKTOP_SETTINGS_SECTIONS}
          onSectionChange={showSettingsSection}
          onShowConnectors={desktop.showConnectors}
          onShowChat={desktop.showChat}
          activeConversationId={desktop.activeConversationId}
          onActiveConversationIdChange={desktop.handleActiveConversationIdChange}
        />
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <AcpConnectorsView
          desktopFrame
          sidebarCollapsed={desktop.sidebarCollapsed}
          onDone={desktop.showChat}
        />
      {:else if desktop.view === "project-settings" && desktop.isDesktop}
        <DesktopProjectSettingsView projectPath={desktop.projectSettingsPath} />
      {:else if desktop.view === "project-settings" && desktop.projectSettingsPath}
        <div class="min-w-0 flex-1">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            desktopFrame={desktop.isDesktop}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {:else if desktop.isDesktop}
        <AcpDesktopSplitsPane
          layoutKey={desktop.desktopChatLayoutKey}
          splitsCache={desktopSplitsCache}
          terminalWorktreePath={desktop.terminalWorktreePath}
          sidebarCollapsed={desktop.sidebarCollapsed}
          desktopSidebarWidth={desktop.desktopSidebarWidth}
          rightSidebarVisible={desktop.desktopRightSidebarVisible}
          rightSidebarWidth={desktop.desktopRightSidebarWidth}
          rightSidebarMinWidth={desktop.DESKTOP_RIGHT_SIDEBAR_MIN_WIDTH}
          rightSidebarMaxWidth={desktop.DESKTOP_RIGHT_SIDEBAR_MAX_WIDTH}
          rightSidebarResizing={desktop.desktopRightSidebarResizing}
          bottomPanelVisible={desktop.desktopBottomPanelVisible}
          bottomPanelHeight={desktop.desktopBottomPanelHeight}
          bottomPanelMinHeight={desktop.DESKTOP_BOTTOM_PANEL_MIN_HEIGHT}
          bottomPanelMaxHeight={desktop.DESKTOP_BOTTOM_PANEL_MAX_HEIGHT}
          bottomPanelResizing={desktop.desktopBottomPanelResizing}
          {desktopFileViewerPanel}
          activeConversationId={desktop.activeConversationId}
          onActiveConversationIdChange={desktop.handleActiveConversationIdChange}
          onNewTabAvailabilityChange={handleDesktopNewTabAvailabilityChange}
          navigationRequest={splitNavigationRequest}
          onNavigationChange={handleSplitNavigationChange}
          onExpandSidebar={desktop.expandSidebar}
          onRightSidebarVisibleChange={desktop.setDesktopRightSidebarVisible}
          onRightSidebarResizeStart={desktop.startDesktopRightSidebarResize}
          onRightSidebarWidthChange={desktop.setDesktopRightSidebarWidth}
          onBottomPanelVisibleChange={desktop.setDesktopBottomPanelVisible}
          onBottomPanelResizeStart={desktop.startDesktopBottomPanelResize}
          onBottomPanelHeightChange={desktop.setDesktopBottomPanelHeight}
          onNewConversation={desktop.handleNewConversation}
          onAddProject={desktop.handleAddProject}
          onShowAgentSettings={desktop.showAgents}
          onShowModelSettings={desktop.isDesktop ? desktop.showModels : undefined}
        >
          {#snippet promptBanners()}
            <AssistantConfigErrorBanner />
            <ACPAgentUpdateBanner />
          {/snippet}
        </AcpDesktopSplitsPane>
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
          onShowModelSettings={desktop.isDesktop ? desktop.showModels : undefined}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            <AssistantConfigErrorBanner />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  :global(body.desktop-sidebar-resizing),
  :global(body.desktop-right-sidebar-resizing) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  :global(body.desktop-sidebar-resizing *),
  :global(body.desktop-right-sidebar-resizing *) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  :global(body.desktop-bottom-panel-resizing) {
    cursor: row-resize !important;
    user-select: none;
  }

  :global(body.desktop-bottom-panel-resizing *) {
    cursor: row-resize !important;
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
