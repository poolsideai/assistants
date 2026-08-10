<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SessionPlan from "./SessionPlan.svelte";

  const { Story } = defineMeta({
    component: SessionPlan,
    args: {
      plan: {
        entries: [
          { content: "Inspect the existing ACP transport", priority: "high", status: "completed" },
          { content: "Build ACP transcript components", priority: "high", status: "in_progress" },
          { content: "Add Storybook coverage", priority: "medium", status: "pending" },
        ],
      },
    },
  });
</script>

<Story name="Running" args={{ isPrompting: true }} />

<Story name="Completed" />

<Story
  name="LongTitle"
  args={{
    isPrompting: true,
    plan: {
      entries: [
        {
          content: "Inspect the existing ACP transport implementation across helper and UI",
          priority: "high",
          status: "completed",
        },
        {
          content:
            "Refactor the ACP transcript rendering pipeline to support streaming plan updates with extremely long entry titles that should truncate",
          priority: "high",
          status: "in_progress",
        },
        { content: "Add Storybook coverage", priority: "medium", status: "pending" },
      ],
    },
  }}
/>
