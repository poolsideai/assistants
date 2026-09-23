<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import MarkdownBlock from "../markdown/MarkdownBlock.svelte";
  import UserMessageBubble from "./UserMessageBubble.svelte";

  const { Story } = defineMeta({
    title: "Components/UserMessageBubble Markdown",
  });

  const variants = ["default", "steer", "enqueued"] as const;
  const content = [
    "### Markdown in a prompt",
    "Regular text with `inline code`, [a link](https://example.com), **bold** and *italic* text.",
    "> A blockquote with `quoted code` and [a link](https://example.com).",
    "- A bullet with `code`\n- Another bullet with [a link](https://example.com)",
    "1. A numbered item\n2. Another numbered item",
    "```ts\nconst message = 'Hello';\nconsole.log(message);\n```",
  ].join("\n\n");
</script>

<Story name="All variants">
  <div class="grid gap-6 p-6 md:grid-cols-3">
    {#each variants as variant}
      <section>
        <h2 class="mb-4 text-psx-foreground-primary">{variant}</h2>
        <UserMessageBubble {variant}>
          <MarkdownBlock {content} isUser />
        </UserMessageBubble>
      </section>
    {/each}
  </div>
</Story>
