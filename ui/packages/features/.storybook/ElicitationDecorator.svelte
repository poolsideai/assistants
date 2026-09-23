<script lang="ts">
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { setElicitationContext } from "../src/elicitation";
  import type { Snippet } from "svelte";

  interface Props {
    children: Snippet;
    pendingElicitationIds?: string[];
  }

  let { children, pendingElicitationIds = [] }: Props = $props();

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  for (const id of pendingElicitationIds) {
    void elicitation.register({ elicitationId: id, mode: "form", message: "" });
  }
</script>

{@render children()}
