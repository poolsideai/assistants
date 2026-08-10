<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { ComponentProps } from "svelte";
  import FileCodeView from "./FileCodeView.svelte";

  const content = Array.from(
    { length: 240 },
    (_, index) =>
      `export const value${index + 1} = ${index + 1}; // virtualized TypeScript line ${index + 1}`,
  ).join("\n");

  const { Story } = defineMeta({
    component: FileCodeView,
    args: {
      class: "h-full",
      content,
      filename: "src/example.ts",
      gitDecorations: {
        added: [{ start: 3, end: 5 }],
        modified: [{ start: 8, end: 10 }],
        deletedAfter: [13],
      },
    },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof FileCodeView>)}
  <div style="height: 520px; overflow: hidden; background: var(--psx-editor-background);">
    <FileCodeView {...args} />
  </div>
{/snippet}

<Story name="Virtualized file" />
<Story
  name="Partial read"
  args={{ startLine: 100, content: content.split("\n").slice(0, 30).join("\n") }}
/>
