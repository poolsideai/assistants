<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { storyWorkspaceFolders } from "../fixtures";
  import ToolCall from "./ToolCall.svelte";

  const { Story } = defineMeta({
    component: ToolCall,
  });
</script>

<Story
  name="Read"
  args={{
    event: {
      eventKind: "tool_call",
      toolCallId: "call_001",
      title: "Read README.md",
      kind: "read",
      status: "completed",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      rawOutput: { lines: 42 },
      content: [
        {
          type: "content",
          content: {
            type: "text",
            text: "Read 42 lines from README.md",
          },
        },
      ],
    },
    workspaceFolders: storyWorkspaceFolders,
  }}
/>
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

<!--
  Pool reports a delegated task as a plain tool call tagged `_meta.tool_name:
  "subagent"`, holds it at `pending` for the whole run, and only sends the
  child's final message when it finishes.
-->
<Story
  name="Subagent (Poolside, running)"
  args={{
    event: {
      eventKind: "tool_call",
      toolCallId: "call_sub_001",
      title: "Subagent: Review the implementation plan in PLAN.md and report gaps",
      kind: "other",
      status: "pending",
      rawInput: {
        task: "Review the implementation plan in PLAN.md and report gaps as a bullet list.",
      },
      _meta: { tool_name: "subagent" },
    },
    workspaceFolders: storyWorkspaceFolders,
  }}
/>

<Story
  name="Subagent (Poolside, completed)"
  args={{
    event: {
      eventKind: "tool_call",
      toolCallId: "call_sub_002",
      title: "Subagent: Review the implementation plan in PLAN.md and report gaps",
      kind: "other",
      status: "completed",
      rawInput: {
        task: "Review the implementation plan in PLAN.md and report gaps as a bullet list.",
      },
      rawOutput: { observation: "Reported three gaps." },
      _meta: { tool_name: "subagent" },
      content: [
        {
          type: "content",
          content: {
            type: "text",
            text: "Three gaps in PLAN.md:\n\n- No rollback step for the schema migration\n- The cache invalidation section does not say who owns the key format\n- Load testing is listed but has no success criteria",
          },
        },
      ],
    },
    workspaceFolders: storyWorkspaceFolders,
  }}
/>
