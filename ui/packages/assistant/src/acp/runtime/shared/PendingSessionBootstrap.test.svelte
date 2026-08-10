<script lang="ts">
  import { PendingSessionBootstrap } from "./PendingSessionBootstrap.svelte";

  interface Props {
    bootstrap: PendingSessionBootstrap;
  }

  let { bootstrap }: Props = $props();

  bootstrap.initialize();
</script>
