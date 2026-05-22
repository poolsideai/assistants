<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import ZigZagError, { type ZigZagErrorProps } from "./ZigZagError.svelte";

  const { Story } = defineMeta({
    component: ZigZagError,
    args: {
      message: "Could not send prompt: request timed out",
      variant: "error",
      theme: "app",
    },
    argTypes: {
      variant: {
        control: "inline-radio",
        options: ["error", "interrupted"],
      },
      theme: {
        control: "inline-radio",
        options: ["app", "web"],
      },
    },
    render,
  });
</script>

{#snippet render(args: ZigZagErrorProps)}
  <ZigZagError {...args} />
{/snippet}

{#snippet appRetryButton()}
  <div>
    <button
      type="button"
      class="inline-flex items-center gap-1 rounded-md border border-psx-button-secondary-border bg-psx-button-secondary-background px-2.5 py-1 text-sm text-psx-button-secondary-foreground hover:bg-psx-button-secondary-hover-background"
    >
      Retry
    </button>
  </div>
{/snippet}

{#snippet webRetryButton()}
  <div class="mt-2">
    <button
      type="button"
      class="inline-flex items-center gap-1 rounded-md border border-(--color-mono-300) bg-(--color-mono-100) px-2.5 py-1 text-sm text-(--color-mono-700) hover:bg-(--color-mono-200)"
    >
      Retry
    </button>
  </div>
{/snippet}

<Story name="Default" />

<Story
  name="Interrupted"
  args={{ message: "This response was interrupted before it finished", variant: "interrupted" }}
/>

<Story
  name="Long Message"
  args={{
    message:
      "Could not send prompt: the model reported a 500 Internal Server Error while processing the request, please try again later or reach out to support if the problem persists.",
    title:
      "Could not send prompt: the model reported a 500 Internal Server Error while processing the request, please try again later or reach out to support if the problem persists.",
  }}
/>

<Story name="With Retry Action">
  {#snippet template(args)}
    <ZigZagError {...args} />
    {@render appRetryButton()}
  {/snippet}
</Story>

<Story
  name="Web Theme"
  args={{
    message: "Failed to load conversation: session not found",
    theme: "web",
  }}
/>

<Story
  name="Web Theme - Interrupted"
  args={{
    message: "This response was interrupted before it finished",
    variant: "interrupted",
    theme: "web",
  }}
/>

<Story
  name="Web Theme - With Retry"
  args={{
    message: "Failed to load conversation: session not found",
    theme: "web",
  }}
>
  {#snippet template(args)}
    <ZigZagError {...args} />
    {@render webRetryButton()}
  {/snippet}
</Story>
