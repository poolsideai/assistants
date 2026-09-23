<script lang="ts">
  import RenderedMarkdown from "./RenderedMarkdown.svelte";
  import SettledMarkdown from "./SettledMarkdown.svelte";
  import StreamingMarkdown from "./StreamingMarkdown.svelte";
  import StreamingText from "./StreamingText.svelte";
  import { defaultMarkdownHost, type MarkdownHostAdapter } from "./host.js";

  export interface MarkdownBlockProps {
    content: string;
    isUser?: boolean;
    /** Execute visualization references only in assistant replies. */
    allowVisualizations?: boolean;
    /** Conversation working directory for relative visualization references. */
    visualizationBasePath?: string;
    copyableCode?: boolean;
    host?: MarkdownHostAdapter;
    /** Set while content is append-only to settle completed Markdown blocks. */
    streaming?: boolean;
    /** Shared transcript scroller used to window very large settled replies. */
    scrollElement?: HTMLElement;
  }

  let {
    isUser = false,
    allowVisualizations = false,
    visualizationBasePath,
    copyableCode = true,
    host = defaultMarkdownHost,
    streaming = false,
    scrollElement,
    ...rest
  }: MarkdownBlockProps = $props();

  let content = $derived(rest.content.trim());
</script>

{#if content.length > 0}
  <div
    class="markdown leading-6"
    class:user={isUser}
    data-markdown-streaming={streaming || undefined}
  >
    {#if streaming}
      <StreamingMarkdown source={content}>
        {#snippet children(segment)}
          {#if segment.renderMode === "markdown"}
            <RenderedMarkdown
              source={segment.renderSource}
              encodeHtmlEntities={isUser}
              {allowVisualizations}
              {visualizationBasePath}
              cacheCodeHighlighting={segment.settled}
              streaming={!segment.settled}
              {copyableCode}
              {host}
            />
          {:else}
            <StreamingText
              text={segment.streamingText ?? ""}
              mode={segment.renderMode}
              language={segment.language}
            />
          {/if}
        {/snippet}
      </StreamingMarkdown>
    {:else}
      <SettledMarkdown
        source={content}
        {isUser}
        {allowVisualizations}
        {visualizationBasePath}
        {copyableCode}
        {host}
        {scrollElement}
      />
    {/if}
  </div>
{/if}
