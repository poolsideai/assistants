<script lang="ts">
  import { ChatProgress as SharedChatProgress } from "@poolsideai/components/assistant-ui";
  import type { Snippet } from "svelte";

  interface Props {
    complete?: boolean;
    children?: Snippet;
    onExpandedChange?: (expanded: boolean) => void;
  }

  let { complete, children, onExpandedChange }: Props = $props();
</script>

<SharedChatProgress {complete} {onExpandedChange}>
  {@render children?.()}
</SharedChatProgress>
