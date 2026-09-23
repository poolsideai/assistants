<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import MarkdownBlock from "./MarkdownBlock.svelte";
  import { flowchart } from "./__fixtures__/flowchart.js";

  const { Story } = defineMeta({ title: "Components/Markdown Diagrams" });
</script>

<Story
  name="Untagged flowchart"
  play={async ({ canvas }) => {
    const diagram = await canvas.findByRole("img", { name: "Mermaid diagram" });
    await expect(diagram).toHaveTextContent("Catalog definitions in forge");
    await expect(diagram).toHaveTextContent("Your ~/.aws/config");
    await expect(diagram).toHaveAccessibleDescription(flowchart.replace(/\s+/g, " "));
  }}
>
  <div class="max-w-2xl p-4">
    <MarkdownBlock content={`\`\`\`\n${flowchart}\n\`\`\``} />
  </div>
</Story>

<Story name="Mermaid sequence diagram">
  <div class="max-w-2xl p-4">
    <MarkdownBlock
      content={"```mermaid\nsequenceDiagram\nAlice->>Bob: Hello\nBob-->>Alice: Hi\n```"}
    />
  </div>
</Story>

<Story name="Invalid diagram">
  <div class="max-w-2xl p-4">
    <MarkdownBlock content={"```mermaid\nflowchart TD\nA[\n```"} />
  </div>
</Story>
