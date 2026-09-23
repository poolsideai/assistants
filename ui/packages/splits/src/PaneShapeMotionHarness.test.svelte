<script lang="ts">
  import SplitsView from "./SplitsView.svelte";
  import type { SplitsController } from "./controller.js";

  interface Props {
    controller: SplitsController;
  }

  let { controller }: Props = $props();
  let animating = $state(false);

  export function setAnimating(value: boolean): void {
    animating = value;
  }
</script>

<SplitsView {controller} usePaneShape paneShapeAnimating={animating}>
  {#snippet children(tab)}
    <div data-test-content={tab.id}></div>
  {/snippet}
</SplitsView>
