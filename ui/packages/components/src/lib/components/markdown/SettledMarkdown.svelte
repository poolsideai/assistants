<script lang="ts">
  import VirtualList from "../virtual-list/VirtualList.svelte";
  import { defaultMarkdownHost, type MarkdownHostAdapter } from "./host.js";
  import RenderedMarkdown from "./RenderedMarkdown.svelte";
  import {
    chunkSettledMarkdown,
    estimateSettledMarkdownHeight,
    MIN_VIRTUALIZED_MARKDOWN_CHARS,
  } from "./streamingMarkdown.js";

  interface Props {
    source: string;
    isUser?: boolean;
    /** Execute visualization references only in assistant replies. */
    allowVisualizations?: boolean;
    visualizationBasePath?: string;
    copyableCode?: boolean;
    host?: MarkdownHostAdapter;
    scrollElement?: HTMLElement;
  }

  let {
    source,
    isUser = false,
    allowVisualizations = false,
    visualizationBasePath,
    copyableCode = true,
    host = defaultMarkdownHost,
    scrollElement,
  }: Props = $props();

  const chunks = $derived(
    source.length >= MIN_VIRTUALIZED_MARKDOWN_CHARS ? chunkSettledMarkdown(source) : [],
  );
  const virtualized = $derived(scrollElement != null && !isUser && chunks.length > 1);
</script>

{#if virtualized}
  <div data-virtualized-markdown>
    <VirtualList
      items={chunks}
      key={(chunk) => chunk.key}
      {scrollElement}
      threshold={1}
      overscanPx={2400}
      estimateHeight={estimateSettledMarkdownHeight}
      gap={8}
      pinToBottom={false}
      preserveScrollAnchor
      relativeToScrollElement
    >
      {#snippet row(chunk)}
        <RenderedMarkdown
          source={chunk.source}
          encodeHtmlEntities={isUser}
          {allowVisualizations}
          {visualizationBasePath}
          cacheCodeHighlighting
          streaming={false}
          {copyableCode}
          {host}
        />
      {/snippet}
    </VirtualList>
  </div>
{:else}
  <RenderedMarkdown
    {source}
    encodeHtmlEntities={isUser}
    {allowVisualizations}
    {visualizationBasePath}
    cacheCodeHighlighting
    streaming={false}
    {copyableCode}
    {host}
  />
{/if}
