<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StreamingIndicator from "./StreamingIndicator.svelte";

  // Stand-in for an ACP agent's registry icon (a monochrome silhouette the
  // indicator masks the glint with). Real agents pass their own iconUrl.
  const SAMPLE_AGENT_ICON =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 1 L13.8 10.2 L23 12 L13.8 13.8 L12 23 L10.2 13.8 L1 12 L10.2 10.2 Z'/%3E%3C/svg%3E";

  const { Story } = defineMeta({
    component: StreamingIndicator,
    args: { label: "Working...", size: 48 },
  });
</script>

<Story name="Agent icon + text" args={{ iconUrl: SAMPLE_AGENT_ICON }} />
<Story name="Transcript size" args={{ iconUrl: SAMPLE_AGENT_ICON, size: 22 }} />
<Story name="Text only" />
