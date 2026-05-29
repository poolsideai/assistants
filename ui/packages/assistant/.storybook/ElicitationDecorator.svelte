<script lang="ts">
  import { ACPConversationStatusRepositoryWriter } from "@poolsideai/features/acp";
  import { setElicitationContext } from "@poolsideai/features/elicitation";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    pendingElicitationIds?: string[];
  }

  let { children, pendingElicitationIds = [] }: Props = $props();

  const conversationStatus = new ACPConversationStatusRepositoryWriter().publicAPI();
  const elicitation = setElicitationContext(conversationStatus);
  for (const id of pendingElicitationIds) {
    void elicitation.register({ elicitationId: id, mode: "form", message: "" });
  }
</script>

{@render children()}
