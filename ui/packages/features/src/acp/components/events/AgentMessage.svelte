<script lang="ts">
  import type { AgentMessage } from "../../types";
  import ContentRenderer from "../content/ContentRenderer.svelte";

  interface Props {
    event: AgentMessage;
    streaming?: boolean;
    scrollElement?: HTMLElement;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
</script>

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <ContentRenderer content={event.content} allowVisualizations {streaming} {scrollElement} />
</div>
