<script lang="ts">
  interface Props {
    text: string;
    mode: "code" | "plain";
    language?: string;
  }

  let { text, mode, language }: Props = $props();

  let textElement = $state<HTMLElement>();
  let renderedText = "";

  $effect(() => {
    const element = textElement;
    const nextText = text;
    if (!element) return;

    const child = element.firstChild;
    if (
      nextText.startsWith(renderedText) &&
      child instanceof Text &&
      element.childNodes.length === 1
    ) {
      child.appendData(nextText.slice(renderedText.length));
    } else if (nextText !== renderedText) {
      element.textContent = nextText;
    }
    renderedText = nextText;
  });
</script>

{#if mode === "code"}
  <div class="streaming-code" data-streaming-render-mode="code">
    {#if language}
      <div class="streaming-code-language">{language}</div>
    {/if}
    <pre><code bind:this={textElement}></code></pre>
  </div>
{:else}
  <div class="streaming-plain" data-streaming-render-mode="plain" bind:this={textElement}></div>
{/if}

<style>
  .streaming-code {
    position: relative;
    overflow: clip;
    border: 1px solid var(--psx-border);
    border-radius: 0.375rem;
    background: var(--psx-editor-background);
  }

  .streaming-code-language {
    border-bottom: 1px solid var(--psx-border);
    padding: 0.25rem 0.5rem;
    color: var(--psx-foreground-secondary);
    font-size: 0.75rem;
  }

  .streaming-code pre {
    overflow: auto;
    margin: 0;
    padding: 0.5rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .streaming-plain {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
</style>
