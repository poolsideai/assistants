<script lang="ts">
  import SplitsView from "./SplitsView.svelte";
  import type { SplitsController } from "./controller.js";

  interface Props {
    controller: SplitsController;
    availableTabIds: Set<string>;
    onUnavailableRender: (tabId: string) => void;
  }

  let { controller, availableTabIds, onUnavailableRender }: Props = $props();

  export function swap(nextController: SplitsController, nextAvailableTabIds: Set<string>): void {
    controller = nextController;
    availableTabIds = nextAvailableTabIds;
  }

  function isAvailable(tabId: string): boolean {
    const available = availableTabIds.has(tabId);
    if (!available) {
      onUnavailableRender(tabId);
    }
    return available;
  }
</script>

<SplitsView {controller}>
  {#snippet children(tab)}
    {#if isAvailable(tab.id)}
      <div data-test-content={tab.id}></div>
    {:else}
      <div data-test-unavailable={tab.id}></div>
    {/if}
  {/snippet}
</SplitsView>
