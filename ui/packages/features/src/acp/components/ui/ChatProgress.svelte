<script lang="ts">
  import { ChatProgress as SharedChatProgress } from "@poolsideai/components/assistant-ui";
  import type { Snippet } from "svelte";

  interface Props {
    complete?: boolean;
    children?: Snippet;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
  {@render children?.()}
</SharedChatProgress>
