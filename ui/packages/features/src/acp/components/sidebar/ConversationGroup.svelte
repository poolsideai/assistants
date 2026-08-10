<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { DEFAULT_AGENT_SERVER, LOCAL_AGENT_SERVER } from "../../agentServers";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  interface Props {
    sessions: ACPConversationSummary[];
    workspacePath: string;
    searchQuery: string;
    expanded: boolean;
    visibleLimit: number;
    indent?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    rowIconSlotSize?: number;
    rowLeadingPaddingClass?: string;
    onToggleExpanded: (workspacePath: string) => void;
    onArchiveSession?: (session: ACPConversationSummary, event: MouseEvent) => void | Promise<void>;
    onArchiveSessionNow?: (
      session: ACPConversationSummary,
      event: MouseEvent,
    ) => void | Promise<void>;
    onSessionContextMenu?: (session: ACPConversationSummary, event: MouseEvent) => void;
    sessionShortcutHint?: (session: ACPConversationSummary) => string | undefined;
    isSessionExiting?: (session: ACPConversationSummary) => boolean;
  }

  let {
    sessions,
    workspacePath,
    searchQuery,
    expanded,
    visibleLimit,
    indent = false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    rowIconSlotSize,
    rowLeadingPaddingClass = "pl-2",
    onToggleExpanded,
    onArchiveSession,
    onArchiveSessionNow,
    onSessionContextMenu,
    sessionShortcutHint,
    isSessionExiting,
  }: Props = $props();

  const sidebar = getAcpSidebarController();

  let visibleSessions = $derived(expanded ? sessions : sessions.slice(0, visibleLimit));
  let hiddenSessionCount = $derived(sessions.length - visibleSessions.length);

  function desktopAgentIconSize(agentServer: string): number {
    return agentServer === DEFAULT_AGENT_SERVER || agentServer === LOCAL_AGENT_SERVER ? 14 : 13;
  }
</script>

{#if sessions.length > 0}
  <div
    class={indent
__POOL_SYNTHETIC_IMPORT_BASELINE__
      : ""}
  >
    {#each visibleSessions as session (`${sidebar.getSessionAgentServer(session)}:${session.id}`)}
      {@const row = sidebar.rowState(session)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {session}
        agentName={row.agentName}
        iconUrl={row.iconUrl}
        selected={row.selected}
        iconClass={desktop ? "text-psx-foreground-secondary" : row.iconClass}
        titleClass={row.titleClass}
        iconSize={desktop ? desktopAgentIconSize(row.agentServer) : undefined}
        iconSlotSize={desktop ? (rowIconSlotSize ?? 14) : rowIconSlotSize}
        leadingPaddingClass={rowLeadingPaddingClass}
        working={row.working}
        waitingForUser={row.waitingForUser}
        unread={row.unread}
        shortcutHint={sessionShortcutHint?.(session)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        isExiting={() => isSessionExiting?.(session) === true}
        onOpen={() => sidebar.openSession(session)}
        onArchive={(event) => onArchiveSession?.(session, event)}
        onArchiveNow={(event) => onArchiveSessionNow?.(session, event)}
        onContextMenu={(event) => onSessionContextMenu?.(session, event)}
      />
    {/each}

    {#if searchQuery.trim() === "" && sessions.length > visibleLimit}
      <button
        type="button"
        class="text-psx-foreground-tertiary outline-hidden hover:bg-psx-menu-hover-background hover:text-psx-foreground-secondary focus-visible:outline-psx-focus flex w-full items-center gap-1 rounded-[6px] px-2 py-1.5 text-left text-[13px]/[16px] focus-visible:outline-2"
        onclick={() => onToggleExpanded(workspacePath)}
      >
        {hiddenSessionCount > 0 ? `Show ${hiddenSessionCount} more` : "Show less"}
      </button>
    {/if}
  </div>
{/if}
