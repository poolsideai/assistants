import { createReorderable } from "./createReorderable.js";
import type { ReorderableConfig, ReorderableHandle } from "./types.js";

/**
 * Svelte action wrapper around {@link createReorderable}.
 *
 * Usage:
 * ```svelte
 * <div use:reorderable={{ handleSelector: "[data-reorderable-handle]", onReorder }}>
 *   {#each items as item (item.id)}
 *     <div data-reorderable-item>...</div>
 *   {/each}
 * </div>
 * ```
 *
 * Typed structurally so the package stays framework-agnostic (no Svelte import).
 */
export function reorderable(
  node: HTMLElement,
  config: ReorderableConfig,
): { update(config: ReorderableConfig): void; destroy(): void } {
  const handle: ReorderableHandle = createReorderable(node, config);
  return {
    update(next: ReorderableConfig): void {
      handle.update(next);
    },
    destroy(): void {
      handle.destroy();
    },
  };
}
