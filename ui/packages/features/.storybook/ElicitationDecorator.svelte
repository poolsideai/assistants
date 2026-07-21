<script lang="ts">
  import { ACPConversationStatusRepositoryWriter } from "../src/acp";
  import { setElicitationContext } from "../src/elicitation";
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
