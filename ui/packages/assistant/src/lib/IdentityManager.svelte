<script lang="ts">
  import type { Snippet } from "svelte";
  import { appState } from "./store";

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<div
  class="app relative flex flex-col text-base text-psx-foreground-primary"
  id="app-content"
  class:vscode={$appState.environment.assistantHost === "vscode"}
>
  {@render children?.()}
</div>

<style lang="postcss">
  @reference "#tailwind.css";
  .app {
    height: var(--psx-app-height, 100vh);
    min-height: var(--psx-app-min-height, auto);
  }

  .app.vscode {
    position: relative;
  }
</style>
