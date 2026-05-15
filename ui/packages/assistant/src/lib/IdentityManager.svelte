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
__POOL_SYNTHETIC_IMPORT_BASELINE__
<style lang="postcss">
  @reference "#tailwind.css";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  .app.vscode {
    position: relative;
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
