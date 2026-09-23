<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MarkdownBlock from "./MarkdownBlock.svelte";

  const { Story } = defineMeta({
    title: "Components/Streaming Markdown",
  });
</script>

<!-- Completed paragraphs are separate stable renderer instances; only the
     final, synthetically closed bold paragraph remains live. -->
<Story name="Settled blocks and styled tail">
  <div class="max-w-2xl p-4">
    <MarkdownBlock
      streaming
      content={"The first paragraph is settled.\n\n- This list is settled as one block\n- Its items stay together\n\nThe **styled live tail"}
    />
  </div>
</Story>

<!-- An unfinished fence is closed only in renderSource, so syntax highlighting
     stays live without changing the exact streamed source. -->
<Story name="Open code fence">
  <div class="max-w-2xl p-4">
    <MarkdownBlock streaming content={"A completed introduction.\n\n```ts\nconst live = true;"} />
  </div>
</Story>
