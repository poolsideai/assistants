<script lang="ts">
  import { ACPConversationStatusRepositoryWriter } from "@poolsideai/features/acp";
  import { setElicitationContext } from "@poolsideai/features/elicitation";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__

  const conversationStatus = new ACPConversationStatusRepositoryWriter().publicAPI();
  const elicitation = setElicitationContext(conversationStatus);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }
</script>

{@render children()}
