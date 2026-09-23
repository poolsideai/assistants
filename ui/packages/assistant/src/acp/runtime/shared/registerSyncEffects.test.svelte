<script lang="ts">
  import type { Repositories } from "./Repositories.svelte";
  import { registerSyncEffects } from "./registerSyncEffects.svelte";

  const { repositories }: { repositories: Repositories } = $props();

  registerSyncEffects({ repositories });
</script>
