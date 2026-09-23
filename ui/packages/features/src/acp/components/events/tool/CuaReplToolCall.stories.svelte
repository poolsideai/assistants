<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { ToolCall as ToolCallEvent } from "../../../types";
  import ToolCall from "../ToolCall.svelte";

  const { Story } = defineMeta({
    title: "ACP/Tools/Computer use",
    component: ToolCall,
  });

  const event: ToolCallEvent = {
    eventKind: "tool_call",
    toolCallId: "cua-1",
    title: "mcp.cua_repl.js",
    kind: "execute",
    status: "completed",
    rawInput: {
      server: "cua_repl",
      tool: "js",
      arguments: {
        title: "Inspect the checkout page",
        code: 'const tab = await cua.getTab("checkout", { browser: "chrome" });\nawait tab.getState();',
      },
    },
    rawOutput: {
      result: {
        content: [
          {
            type: "text",
            text: 'Page: Checkout\nURL: https://example.com/checkout\n\n- heading "Checkout"\n- textbox "Email"\n- button "Continue"',
          },
        ],
      },
      error: null,
    },
  };
</script>

<Story name="Completed" args={{ event }} />
<Story name="Running" args={{ event: { ...event, status: "in_progress", rawOutput: undefined } }} />
<Story
  name="Failed"
  args={{
    event: {
      ...event,
      status: "failed",
      rawOutput: { result: null, error: "The selected tab is no longer available." },
    },
  }}
/>
<Story name="Cancelled" args={{ event: { ...event, status: "cancelled", rawOutput: undefined } }} />
<Story
  name="Reset"
  args={{
    event: {
      ...event,
      title: "mcp.cua_repl.js_reset",
      rawInput: { server: "cua_repl", tool: "js_reset", arguments: {} },
      rawOutput: { result: { content: [{ type: "text", text: "Session reset." }] }, error: null },
    },
  }}
/>
