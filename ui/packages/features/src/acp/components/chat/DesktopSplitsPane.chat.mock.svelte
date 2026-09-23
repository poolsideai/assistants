<script lang="ts">
  import { getACPChatSessionScope } from "../../features/ChatSessionScope.svelte";
  import type { ToolCall } from "../../types";
  import SubagentToolCall from "../events/tool/SubagentToolCall.svelte";

  interface Props {
    markReadWhenVisible?: boolean;
  }

  let { markReadWhenVisible = true }: Props = $props();
  const chatSession = getACPChatSessionScope();
  let subagentTool = $derived(
    chatSession.events.find(
      (event): event is ToolCall =>
        event.eventKind === "tool_call" && event.toolCallId === "task-auth",
    ),
  );
</script>

<div data-testid="chat-mark-read" data-mark-read={markReadWhenVisible ? "true" : "false"}></div>
{#if subagentTool}
  <SubagentToolCall event={subagentTool} workspaceFolders={[]} />
{/if}
