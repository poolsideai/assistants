<script lang="ts">
  import type { ACPConversationSummary } from "../../navTypes";
  import { DEFAULT_AGENT_SERVER, LOCAL_AGENT_SERVER } from "../../agentServers";
  import ConversationRowPopover from "./ConversationRowPopover.svelte";
  import { getAcpSidebarController } from "./SidebarController.svelte";

  interface Props {
    sessions: ACPConversationSummary[];
    workspacePath: string;
    searchQuery: string;
    expanded: boolean;
    visibleLimit: number;
    indent?: boolean;
    desktop?: boolean;
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
    desktop = false,
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
      ? "desktop-conversation-connector before:border-psx-border relative ml-[11.5px] pl-[14px] before:pointer-events-none before:absolute before:bottom-[14px] before:left-0 before:top-0 before:w-[10px] before:rounded-bl-[5px] before:border-b before:border-l before:content-['']"
      : ""}
  >
    {#each visibleSessions as session (`${sidebar.getSessionAgentServer(session)}:${session.id}`)}
      {@const row = sidebar.rowState(session)}
      <ConversationRowPopover
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
        {desktop}
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
