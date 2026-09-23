<script lang="ts">
  import type { SessionEvent } from "../types";
  import { Boundary } from "@poolsideai/components/boundary";
  import { VirtualList } from "@poolsideai/components/virtual-list";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    setToolCallExpansionContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    type ToolCallExpansionState,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import AgentMessage from "./events/AgentMessage.svelte";
  import AgentThought from "./events/AgentThought.svelte";
  import ModeChange from "./events/ModeChange.svelte";
  import SessionHandoff from "./events/SessionHandoff.svelte";
  import UserMessage from "./events/UserMessage.svelte";
  import ToolCall from "./events/ToolCall.svelte";
  import ToolCallGroup from "./events/tool/ToolCallGroup.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { WorkspaceFolder } from "@poolsideai/rpc";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import {
    VIRTUALIZE_THRESHOLD,
    OVERSCAN_PX,
    ESTIMATED_ROW_HEIGHT,
    AT_BOTTOM_THRESHOLD_PX,
  } from "./chat/threadVirtualization";

  interface Props {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
     * Drives the fallback grouping built here from `events`; when the
     * pre-grouped `items` prop is passed, the owner's timeline state has
     * already applied the mode and this only tells the rows which mode they
     * were grouped under (see showRule below). Owners passing `items` must pass
     * the mode those items were built with.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    workspaceFolders?: WorkspaceFolder[];
    /**
     * Pass alongside a pre-grouped `items` prop: the expansion state of the
     * owner's timeline state, so user expands reach the fold logic that
     * produced the rows. Defaults to the fallback grouping's own state.
     */
    expansion?: ToolCallExpansionState;
    /**
     * When provided, enables opt-in windowing for long threads. Only the chat
     * pane passes this; all other consumers leave it undefined so every item
     * renders.
     */
    scrollElement?: HTMLElement;
    /** Keep the visible row fixed while a detached transcript corrects estimates. */
    preserveScrollAnchor?: boolean;
  }

  let {
    events,
    items,
    turns = [],
    isPrompting = false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    workspaceFolders = [],
    expansion,
    scrollElement,
    preserveScrollAnchor = false,
  }: Props = $props();

  export function isSwitchModeToolCall(event: SessionEvent) {
    if (event.eventKind !== "tool_call") return;
    return event.kind === "switch_mode" && event.status === "completed";
  }

  const eventsState = new SessionEventsState({
    get events() {
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
  });

  setToolCallExpansionContext(() => expansion ?? eventsState.expansion);

  const renderItems = $derived(items ?? eventsState.grouped);

  // Only the newest agent message in the live response can still be appended
  // to. Earlier messages in the same turn may precede tool calls and are
  // already stable, so leave them on the canonical one-shot Markdown path.
  const streamingAgentMessageIndex = $derived.by(() => {
    if (!isPrompting) return -1;
    const orderedEvents = renderItems.flatMap((item) =>
      item.kind === "event_group" ? item.events : [{ event: item.event, index: item.index }],
    );
    let latestUserMessageIndex = -1;
    for (let index = orderedEvents.length - 1; index >= 0; index -= 1) {
      const item = orderedEvents[index];
      if (item?.event.eventKind === "user_message" && !item.event.steer) {
        latestUserMessageIndex = item.index;
        break;
      }
    }
    for (let index = orderedEvents.length - 1; index >= 0; index -= 1) {
      const item = orderedEvents[index];
      if (item && item.index <= latestUserMessageIndex) break;
      if (item?.event.eventKind === "agent_message") return item.index;
    }
    return -1;
  });

  type RenderItem = {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  };

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

  const renderItemsWithFooters = $derived.by<RenderItem[]>(() => {
    const result: RenderItem[] = [];
    let activeResponseEntries: RenderItem[] = [];
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
      result.push(entry);

      if (item.kind === "event" && item.event.eventKind === "user_message" && !item.event.steer) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
        activeResponseEntries = [];
      } else {
        activeResponseEntries.push(entry);

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
      }
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__

    if (isPrompting) {
      for (const entry of activeResponseEntries) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      }
    }

    return result;
  });
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        class="pointer-events-none flex shrink-0 opacity-0 focus-within:pointer-events-auto focus-within:opacity-100 group-hover/response:pointer-events-auto group-hover/response:opacity-100"
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <CopyToClipboard text={entry.copyText} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
<!-- Long threads are windowed (only near-viewport rows in the DOM); short ones
     and every non-chat-pane consumer render every row. gap 10px == gap-2.5. -->
<VirtualList
  items={renderItemsWithFooters}
  key={(entry) => entry.item.id}
  {scrollElement}
  threshold={VIRTUALIZE_THRESHOLD}
  overscanPx={OVERSCAN_PX}
  estimateHeight={ESTIMATED_ROW_HEIGHT}
  pinThresholdPx={AT_BOTTOM_THRESHOLD_PX}
  gap={10}
  {preserveScrollAnchor}
>
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {@const item = entry.item}
    <Boundary name={`ACPSessionEvent:${item.id}`}>
      {#snippet failed(_error, _reset)}
        <div
          class="border-psx-border bg-psx-editor-background text-psx-foreground-secondary shadow-low dark:shadow-low-dark self-start rounded-lg border px-2.5 py-2 text-xs"
        >
          <span>This session event could not be rendered.</span>
        </div>
      {/snippet}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          <!-- showRule: at most one rule per turn. An end-of-turn summary is
               always the turn's single fold, and so is compact mode's live
               fold — but grouped mode raises and drops several live folds as a
               turn streams, which would draw a rule for each. -->
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            showRule={!item.live || toolActivity === "compact"}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {:else}
        {@const event = item.event}
        {@const previousEvent = item.index > 0 ? events[item.index - 1] : undefined}
        {#if event.eventKind === "user_message"}
          <UserMessage {event} />
        {:else if event.eventKind === "agent_message"}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {:else if event.eventKind === "agent_thought"}
          <AgentThought {event} complete={!item.liveThought} />
        {:else if event.eventKind === "tool_call"}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {:else if event.eventKind === "mode_change"}
          <ModeChange
            {event}
            source={previousEvent && isSwitchModeToolCall(previousEvent) ? "tool_call" : "user"}
          />
        {:else if event.eventKind === "handoff"}
          <SessionHandoff {event} />
        {/if}
      {/if}
    </Boundary>
  {/snippet}
</VirtualList>
