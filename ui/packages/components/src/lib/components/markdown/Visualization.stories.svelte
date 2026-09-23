<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, waitFor } from "storybook/test";
  import { readable } from "svelte/store";
  import MarkdownBlock from "./MarkdownBlock.svelte";
  import { defaultMarkdownHostState, type MarkdownHostAdapter } from "./host.js";
  import { comparisonVisualization } from "./__fixtures__/visualization.js";
  import { navigationDocuments } from "./__fixtures__/visualizationNavigation.js";

  const { Story } = defineMeta({ title: "Components/Markdown Visualizations" });
  const host: MarkdownHostAdapter = {
    state: readable(defaultMarkdownHostState),
    readVisualizationFile: async (path) =>
      path === "/repo/worktree/geneb-multiple-comparisons.html"
        ? comparisonVisualization
        : undefined,
  };
</script>

<Story
  name="Interactive preview"
  play={async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector("iframe")?.getAttribute("sandbox")).toBe("allow-scripts"),
    );
  }}
>
  <div class="max-w-2xl p-4">
    <MarkdownBlock
      allowVisualizations
      visualizationBasePath="/repo/worktree"
      {host}
      content={'visualize{"path":geneb-multiple-comparisons.html }'}
    />
  </div>
</Story>

<Story
  name="Navigation isolation"
  tags={["!dev", "!autodocs"]}
  play={async () => {
    // Playwright commands are available in the Storybook Vitest project.
    if (import.meta.env.MODE !== "test") return;
    const { commands } = await import("@vitest/browser/context");
    expect(await commands.checkVisualizationNavigation(navigationDocuments)).toEqual(Object.keys(navigationDocuments));
  }}
>
  <p>Browser regression checks for visualization navigation isolation.</p>
</Story>

<Story name="File unavailable">
  <div class="max-w-2xl p-4">
    <MarkdownBlock
      allowVisualizations
      host={{ ...host, readVisualizationFile: async () => undefined }}
      content={'visualize{"path":"missing.html"}'}
    />
  </div>
</Story>
