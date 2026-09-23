<script lang="ts">
  import { VirtualList } from "./index.js";

  type Item = { id: string; group?: string; label?: string };

  let {
    items,
    scrollElement,
    enabled = true,
    estimateHeight,
    overscanPx,
    preserveScrollAnchor = false,
    groupAnchors = false,
    relativeToScrollElement = false,
  }: {
    items: Item[];
    scrollElement?: HTMLElement;
    enabled?: boolean;
    estimateHeight?: number | ((item: Item, index: number) => number);
    overscanPx?: number;
    preserveScrollAnchor?: boolean;
    groupAnchors?: boolean;
    relativeToScrollElement?: boolean;
  } = $props();

  let virtualList = $state<ReturnType<typeof VirtualList>>();

  // Mirror the public controller so tests exercise the same API as consumers.
  export async function scrollToKey(
    itemKey: string,
    options?: { offsetPx?: number },
  ): Promise<boolean> {
    return (await virtualList?.scrollToKey(itemKey, options)) ?? false;
  }
</script>

<VirtualList
  bind:this={virtualList}
  {items}
  key={(it) => it.id}
  anchorGroup={groupAnchors ? (item) => item.group : undefined}
  {scrollElement}
  {enabled}
  {estimateHeight}
  {overscanPx}
  {preserveScrollAnchor}
  {relativeToScrollElement}
  threshold={5}
  gap={10}
>
  {#snippet row(item)}
    <div class="test-row">{item.id}{item.label ?? ""}</div>
  {/snippet}
</VirtualList>
