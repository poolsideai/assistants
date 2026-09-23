<script lang="ts">
  import type { SplitsController } from "./controller.js";
  import type { PaneID } from "./types.js";

  interface Props {
    controller: SplitsController;
    paneId: PaneID;
    version: number;
  }

  let { controller, paneId, version }: Props = $props();

  const canClosePane = $derived.by(() => {
    version;
    return controller.allPaneIds.length > 1;
  });
</script>

<div class="splits-empty" aria-label="No open tabs">
  <span class="splits-empty-icon" aria-hidden="true"></span>
  <span>No Open Tabs</span>

  {#if canClosePane}
    <button
      type="button"
      class="splits-empty-close"
      aria-label="Close empty pane"
      title="Close Pane"
      onclick={() => controller.closePane(paneId)}
    >
      <span aria-hidden="true"></span>
    </button>
  {/if}
</div>

<style>
  .splits-empty {
    display: flex;
    min-height: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    color: var(--splits-muted-foreground);
    font:
      500 13px/1.35 system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .splits-empty-icon {
    position: relative;
    width: 38px;
    height: 46px;
    border: 2px solid currentColor;
    border-radius: 4px;
    opacity: 0.45;
  }

  .splits-empty-icon::before {
    content: "";
    position: absolute;
    top: -2px;
    right: -2px;
    width: 13px;
    height: 13px;
    border-bottom: 2px solid currentColor;
    border-left: 2px solid currentColor;
    background: var(--splits-pane-background);
  }

  .splits-empty-close {
    display: inline-flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--splits-separator);
    border-radius: 6px;
    background: color-mix(in srgb, var(--splits-pane-background) 92%, var(--splits-foreground));
    color: var(--splits-muted-foreground);
    cursor: default;
  }

  .splits-empty-close:hover {
    background: var(--splits-tab-hover-background);
    color: var(--splits-foreground);
  }

  .splits-empty-close span {
    position: relative;
    width: 12px;
    height: 12px;
  }

  .splits-empty-close span::before,
  .splits-empty-close span::after {
    content: "";
    position: absolute;
    top: 5px;
    left: 1px;
    width: 10px;
    height: 2px;
    border-radius: 999px;
    background: currentColor;
  }

  .splits-empty-close span::before {
    transform: rotate(45deg);
  }

  .splits-empty-close span::after {
    transform: rotate(-45deg);
  }
</style>
