<script lang="ts">
  import type { SessionEvent, ToolCall } from "../../../types";
  import { setACPChatSessionScope } from "../../../features/ChatSessionScope.svelte";
  import { setACPAgentRegistryContext } from "../../../features/AgentRegistryRepository.svelte";
  import { setSubagentTranscriptNavigation } from "../../chat/subagentTranscriptNavigation";
  import type { SubagentReference } from "../../../subagents";
  import {
    setToolCallExpansionContext,
    type ToolCallExpansionState,
  } from "../../SessionEventsState.svelte";
  import SubagentToolCall from "./SubagentToolCall.svelte";

  interface Props {
    events: SessionEvent[];
    eventId: string;
    turnActive?: boolean;
    turnInterrupted?: boolean;
    onOpen?: (reference: SubagentReference) => void;
    /** Supplied to exercise expansion state surviving a remount, as a transcript does. */
    expansion?: ToolCallExpansionState;
  }

  let {
    events,
    eventId,
    turnActive = false,
    turnInterrupted = false,
    onOpen = () => {},
    expansion,
  }: Props = $props();
  if (expansion) setToolCallExpansionContext(() => expansion);
  const session = {
    get events() {
      return events;
    },
    get turns() {
      if (turnActive || events.length === 0) return [];
      return [
        {
          startedAt: "2026-08-02T12:00:00.000Z",
          endedAt: "2026-08-02T12:00:01.000Z",
          startIndex: 0,
          endIndex: events.length - 1,
          ...(turnInterrupted ? { interrupted: true } : {}),
        },
      ];
    },
    get isPromptActive() {
      return turnActive;
    },
    get activeTurnStartIndex() {
      return turnActive ? 0 : null;
    },
    isSending: false,
  };
  setACPAgentRegistryContext();
  const repo = {
    getSessionByConversationId: () => session,
    agents: { defaultAgentServer: "poolside" },
  };
  setACPChatSessionScope(repo as never, () => "conversation:test");
  setSubagentTranscriptNavigation({ open: (reference) => onOpen(reference) });

  let event = $derived(
    events.find(
      (candidate): candidate is ToolCall =>
        candidate.eventKind === "tool_call" && candidate.toolCallId === eventId,
    ),
  );
</script>

{#if event}
  <SubagentToolCall {event} workspaceFolders={[]} />
{/if}
