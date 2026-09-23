<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ContentRenderer from "./ContentRenderer.svelte";
  import { expect } from "storybook/test";

  const { Story } = defineMeta({
    component: ContentRenderer,
    args: {
      content: [
        {
          type: "text",
          text: "What's the weather like today?",
        },
      ],
    },
  });
</script>

<Story
  name="Default"
  play={async ({ canvas }) => {
    await expect(canvas.getByText(/weather/i)).toBeInTheDocument();
  }}
/>
