<script lang="ts">
  import type { AgentMessage } from "../../types";
  import ContentRenderer from "../content/ContentRenderer.svelte";

  interface Props {
    event: AgentMessage;
    streaming?: boolean;
    scrollElement?: HTMLElement;
  }

  let { event, streaming = false, scrollElement }: Props = $props();
</script>

<!-- min-h-6 matches the live "Think" block's height (24px) so when a reply
     opens with a short one-liner that replaces the thought, the content below
     doesn't jump up. justify-center balances the slack (a one-liner sits centered
     like the "Think" label did, not top-aligned). Taller replies exceed the
     min-height, so the centering is a no-op for them. -->
<div data-agent-message class="group/message relative flex min-h-6 flex-col justify-center gap-2">
  <ContentRenderer content={event.content} allowVisualizations {streaming} {scrollElement} />
</div>
