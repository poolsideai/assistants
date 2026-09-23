<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { formatError } from "@poolsideai/lib/errors";
  import { InfoMessageType, type WorkspaceFolder } from "@poolsideai/rpc";
  import { onDestroy, onMount } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import {
    ACP_DESKTOP_CONVERSATIONS_EVENT,
    type ACPConversationSummary,
    type ACPConversationsState,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { findVisibleNavSession, groupSessions, historySessionKey } from "./sessionPickerUtil";
  import CollapsedSidebarActions from "./sidebar/CollapsedSidebarActions.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import ConversationGroup from "./sidebar/ConversationGroup.svelte";
  import ConversationPreview from "./sidebar/ConversationPreview.svelte";
  import ContextMenu, { type ContextMenuItem } from "./sidebar/ContextMenu.svelte";
  import HistoryOverlay from "./sidebar/HistoryOverlay.svelte";
  import { sidebarOpensViewLabel, sidebarRenameLabel } from "./sidebar/menuLabels";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import ConfirmationDialog from "./ui/ConfirmationDialog.svelte";
  import { getOptionalACPConnectionPoolContext } from "../connectionPoolContext";
  import ACPLogCaptureConfirmation from "./sidebar/ACPLogCaptureConfirmation.svelte";
  import { acpLogCaptureMenuAction, type ACPLogCaptureTarget } from "./sidebar/acpLogCapture";
  import SidebarIconButton from "./sidebar/SidebarIconButton.svelte";
  import SidebarSearch from "./sidebar/SidebarSearch.svelte";
  import SidebarToasts from "./sidebar/SidebarToasts.svelte";
  import { sidebarToasts } from "./sidebar/sidebarToastsState.svelte";
  import { suppressContextMenu } from "./sidebar/contextMenuHelpers";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { UNDO_COUNTDOWN_SECONDS, UndoCountdown } from "./sidebar/undoCountdown";
  import { rowExitAnimation } from "./sidebar/rowExitAnimation.svelte";

  interface Props {
    collapsed: boolean;
    showCollapsedActions?: boolean;
    currentWorkspaceFolders: WorkspaceFolder[];
    onCollapsedChange: (collapsed: boolean) => void;
    onNewConversation: () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onShowChat: () => void;
    fillWidth?: boolean;
    collapsible?: boolean;
    showHeaderActions?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  let {
    collapsed,
    showCollapsedActions = false,
    currentWorkspaceFolders,
    onCollapsedChange,
    onNewConversation,
    onShowAgents,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    onShowChat,
    fillWidth = false,
    collapsible = true,
    showHeaderActions = true,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }: Props = $props();

  const conversations = getACPConversationRepo();
  const acpConnectionPool = getOptionalACPConnectionPoolContext();
  const history = getACPLocalHistoryRepo();
  const sidebar = setAcpSidebarController({
    onShowChat,
    onNewConversation,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  });
  onDestroy(() => sidebar.destroy());

  let searchQuery = $state("");
  let showingHistory = $state(false);
  let restoredHistorySessionKeys = $state(new Set<string>());
  let navSessions = $state<ACPConversationSummary[]>([]);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    actions: ContextMenuItem[];
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let acpLogCaptureTarget = $state<ACPLogCaptureTarget | null>(null);
  let deleteConversationTarget = $state<{
    session: ACPConversationSummary;
    name: string;
  } | null>(null);
  let exitingConversationIds = $state(new Set<string>());
  let rowExitAnimating = $derived(rowExitAnimation.animating);
  const conversationArchiveCountdown = new UndoCountdown(() => {});
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let groupedHistorySessions = $derived(groupSessions(history.sessions ?? [], searchQuery));

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let visibleSessions = $derived.by(() => {
    const query = searchQuery.trim().toLowerCase();
    return navSessions.filter((session) => {
      if (exitingConversationIds.has(session.id)) return false;
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (!query) return true;
      return (
        (session.title || "Untitled Conversation").toLowerCase().includes(query) ||
        getAgentName(getSessionAgentServer(session)).toLowerCase().includes(query)
      );
    });
  });

  onMount(() => {
    const handleConversationState = (event: Event) => {
      navSessions = [...(event as CustomEvent<ACPConversationsState>).detail.sessions];
    };
    conversations.emitter.addEventListener(
      ACP_DESKTOP_CONVERSATIONS_EVENT,
      handleConversationState,
    );
    navSessions = conversations.sessions ?? [];
    if (navSessions.length === 0) {
      void conversations.refresh();
    }
    return () => {
      conversations.emitter.removeEventListener(
        ACP_DESKTOP_CONVERSATIONS_EVENT,
        handleConversationState,
      );
__POOL_SYNTHETIC_IMPORT_BASELINE__
      for (const conversationId of exitingConversationIds) {
        sidebarToasts.dismiss(conversationArchiveToastId(conversationId));
      }
    };
  });

  function getSessionAgentServer(session: { agentServer?: string }): string {
    return sidebar.getSessionAgentServer(session);
  }

  function getAgentName(agentServer: string): string {
    return sidebar.getAgentName(agentServer);
  }

  function visibleNavSessionForHistorySession(
    session: ACPConversationSummary,
  ): ACPConversationSummary | undefined {
    return findVisibleNavSession(
      session,
      navSessions,
      restoredHistorySessionKeys,
      getSessionAgentServer,
    );
  }

  function conversationArchiveToastId(conversationId: string): string {
    return `conversation-archive:${conversationId}`;
  }

  function isSessionExiting(session: ACPConversationSummary): boolean {
    return exitingConversationIds.has(session.id);
  }

  function setConversationExiting(conversationId: string, exiting: boolean) {
    if (exitingConversationIds.has(conversationId) === exiting) return;
    const next = new Set(exitingConversationIds);
    if (exiting) next.add(conversationId);
    else next.delete(conversationId);
    exitingConversationIds = next;
    if (exiting) rowExitAnimation.hold();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async function openHistory() {
    restoredHistorySessionKeys = new Set();
    searchQuery = "";
    showingHistory = true;
    await history.refresh(acpProtocolCwd(currentWorkspaceFolders));
  }

  async function restoreHistorySession(session: ACPConversationSummary) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const workingDirectories = session.workingDirectories?.length
      ? Array.from(session.workingDirectories)
      : [cwd];
    await conversations.restoreConversation(ACP_IDE_WORKSPACE_PATH, {
      ...session,
      cwd,
      workingDirectories,
    });
    restoredHistorySessionKeys = new Set(restoredHistorySessionKeys).add(
      historySessionKey(session, getSessionAgentServer),
    );
  }

  async function openRestoredHistorySession(
    session: ACPConversationSummary,
    navSession: ACPConversationSummary,
  ) {
    showingHistory = false;
    await sidebar.openSession(
      navSession,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
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
    sessionId: string | null,
    agentServer: string,
    conversationId: string,
  ) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    sidebarToasts.dismiss(conversationArchiveToastId(conversationId));
    setConversationExiting(conversationId, true);
    try {
      if (sidebar.shouldInterruptSelectedSession(sessionId, agentServer)) {
        await sidebar.cancelActiveSession();
      }
      await conversations.archiveSession(
        ACP_IDE_WORKSPACE_PATH,
        sessionId,
        agentServer,
        conversationId,
      );
      if (sessionId) {
        await rpc.closeAcpChat({ conversationId, agentServer, sessionId });
      }
    } catch (error) {
      rpc.showInfoMessage(
        formatError(error, {
          prefix: "Failed to archive conversation",
        }),
        InfoMessageType.error,
      );
    } finally {
      setConversationExiting(conversationId, false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
    setConversationExiting(session.id, true);
    sidebarToasts.addProgressToast(
      conversationArchiveToastId(session.id),
      "Archiving conversation...",
      { kind: "countdown", durationMs: UNDO_COUNTDOWN_SECONDS * 1000 },
      { label: "Cancel", onClick: () => undoArchiveSession(session.id) },
    );
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
  function undoArchiveSession(conversationId: string) {
    conversationArchiveCountdown.cancel(conversationId);
    sidebarToasts.dismiss(conversationArchiveToastId(conversationId));
    setConversationExiting(conversationId, false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  async function handleArchiveHistorySession(
    session: ACPConversationSummary,
    navSession: ACPConversationSummary,
    event: Event,
  ) {
    await handleArchiveSession(
      navSession.sessionId,
      getSessionAgentServer(navSession),
      navSession.id,
      event,
    );
    const updated = new Set(restoredHistorySessionKeys);
    updated.delete(historySessionKey(session, getSessionAgentServer));
    restoredHistorySessionKeys = updated;
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
    // Marked exiting so the row plays the same slide-out as an archive; the
    // finally re-reveals it if the delete failed.
    setConversationExiting(session.id, true);
    try {
      if (sidebar.shouldInterruptSelectedSession(session.sessionId, agentServer)) {
        await sidebar.cancelActiveSession();
      }
      await conversations.deleteConversation(session.id, session.sessionId, agentServer);
      if (session.sessionId) {
        await rpc.closeAcpChat({
          conversationId: session.id,
          agentServer,
          sessionId: session.sessionId,
        });
      }
    } finally {
      setConversationExiting(session.id, false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function openContextMenu(event: MouseEvent, actions: ContextMenuItem[]) {
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
        name: sidebarRenameLabel("Conversation"),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      acpLogCaptureMenuAction(
        acpConnectionPool?.debug?.capture,
        {
          agentServer: getSessionAgentServer(session),
          conversationId: session.id,
          sessionId: session.sessionId,
        },
        (target) => (acpLogCaptureTarget = target),
      ),
      { kind: "separator" },
      {
        name: "Copy Session ID",
        icon: "copy",
        disabled: !session.sessionId,
        callback: () => {
          if (session.sessionId) rpc.writeToClipboard(session.sessionId);
        },
      },
      { kind: "separator" },
__POOL_SYNTHETIC_IMPORT_BASELINE__
        name: "Archive Conversation",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        name: sidebarOpensViewLabel("Delete Conversation"),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        callback: () => {
          deleteConversationTarget = {
            session,
            name: session.title || "Untitled Conversation",
          };
        },
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
  function setCollapsed(nextCollapsed: boolean) {
    if (!collapsible) return;
    onCollapsedChange(nextCollapsed);
  }

  let isCollapsed = $derived(collapsible && collapsed);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#if isCollapsed}
  {#if showCollapsedActions}
    <CollapsedSidebarActions
      expandLabel="Expand conversations sidebar"
      {isLoading}
      onExpand={() => setCollapsed(false)}
      {onNewConversation}
    />
  {:else}
    <aside
      class="text-psx-foreground-primary relative z-20 h-full w-0 shrink-0 select-none"
    ></aside>
  {/if}
{:else}
  <aside
    class={[
      "border-psx-border bg-psx-panel text-psx-foreground-primary relative z-20 flex h-full shrink-0 select-none flex-col border-r",
      fillWidth ? "w-full" : "w-[260px]",
    ]}
    aria-label="ACP conversations"
  >
    {#if showHeaderActions}
      <div class="flex h-10 shrink-0 items-center gap-1 border-b border-transparent pl-2 pr-2">
        {#if collapsible}
          <SidebarIconButton
            icon="sidebar-hide"
            label="Collapse conversations sidebar"
            onclick={() => setCollapsed(true)}
          />
        {/if}
        <div class="min-w-0 flex-1"></div>
        <SidebarIconButton
          icon="new"
          label="New conversation"
          disabled={isLoading}
          onclick={onNewConversation}
        />
      </div>
    {/if}

    <SidebarSearch
      bind:value={searchQuery}
      placeholder={showingHistory ? "Search history" : "Search conversations"}
      archiveLabel="Show archived conversations"
      onArchive={openHistory}
    />

    <div class="min-h-0 flex-1 overflow-y-auto px-1.5 pb-1.5 pt-px">
      {#if conversations.refreshState.status === "failure"}
        <div class="text-psx-foreground-secondary px-2 py-4 text-center text-xs">
          {formatError(conversations.refreshState.error, {
            prefix: "Failed to load conversations",
          })}
        </div>
      {:else if visibleSessions.length === 0 && !rowExitAnimating}
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
      {:else}
        <ConversationGroup
          sessions={visibleSessions}
          workspacePath={ACP_IDE_WORKSPACE_PATH}
          {searchQuery}
          expanded
          visibleLimit={visibleSessions.length}
          onToggleExpanded={() => {}}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          {isSessionExiting}
        />
      {/if}
    </div>

    <SidebarToasts class="flex shrink-0 flex-col px-1.5 pb-12" />

    {#if showingHistory}
      <HistoryOverlay
        bind:searchQuery
        {groupedHistorySessions}
        state={history.state}
        sessionCount={history.sessions.length}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {visibleNavSessionForHistorySession}
        onBack={() => (showingHistory = false)}
        onOpenRestoredHistorySession={openRestoredHistorySession}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        onArchiveHistorySession={handleArchiveHistorySession}
        onRestoreHistorySession={restoreHistorySession}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      />
    {/if}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        class="menu-surface z-50 flex w-[224px] flex-col gap-0.5 p-1.5"
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
  </aside>
{/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
<ConversationPreview />

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
{#if deleteConversationTarget}
  <ConfirmationDialog
    destructive
    title="Delete conversation?"
    description={`Delete ${deleteConversationTarget.name}. This removes the conversation and cannot be undone.`}
    confirmLabel="Delete Conversation"
    onCancel={() => (deleteConversationTarget = null)}
    onConfirm={async () => {
      const target = deleteConversationTarget;
      if (!target) return;
      await handleDeleteSession(target.session);
      deleteConversationTarget = null;
    }}
  />
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

{#if acpLogCaptureTarget}
  <ACPLogCaptureConfirmation
    target={acpLogCaptureTarget}
    onClose={() => (acpLogCaptureTarget = null)}
  />
{/if}
