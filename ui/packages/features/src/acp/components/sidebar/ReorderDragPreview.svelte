<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    style?: string;
    children: Snippet;
  }

  let { style, children }: Props = $props();

  function portalToBody(node: HTMLElement) {
    document.body.appendChild(node);
    return {
      destroy() {
        node.remove();
      },
    };
  }
</script>

<div use:portalToBody class="reorder-drag-preview" {style} aria-hidden="true">
  {@render children()}
</div>

<style>
  .reorder-drag-preview {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-sizing: border-box;
    border: 1px solid color-mix(in srgb, var(--psx-border) 80%, transparent);
    border-radius: 8px;
    padding: 0 0.625rem;
    background: var(--psx-panel);
    color: var(--psx-foreground-primary);
    font-size: 13px;
    line-height: 16px;
    box-shadow:
      0 8px 24px color-mix(in srgb, black 18%, transparent),
      0 2px 8px color-mix(in srgb, black 12%, transparent);
    cursor: default;
    opacity: 0.94;
    pointer-events: none;
    user-select: none;
  }
</style>
