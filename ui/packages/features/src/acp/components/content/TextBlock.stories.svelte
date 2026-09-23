<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import TextBlock from "./TextBlock.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import type { ComponentProps } from "svelte";

  const { Story } = defineMeta({
    component: TextBlock,
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof TextBlock>)}
  <AcpSessionProvider
    availableCommands={[
      { name: "plan", description: "Plan the next steps" },
      { name: "goal", description: "Set a goal to keep pursuing" },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    ]}
  >
    <TextBlock text={args.text} isUser={args.isUser ?? false} />
  </AcpSessionProvider>
{/snippet}

<Story
  name="Default"
  args={{
    text: [
      "ACP text supports `inlineCode`, **strong emphasis**, and regular _emphasis_.",
      "",
      "| Area | Status |",
      "| --- | --- |",
      "| Markdown | Styled through the classic path |",
      "| Tables | Match assistant table treatment |",
    ].join("\n"),
  }}
/>

<Story
  name="Slash command pill"
  args={{
    text: "Try running /plan to outline the work.",
    isUser: true,
  }}
/>

<Story
  name="Slash skill pill"
  args={{
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isUser: true,
  }}
/>

<Story
  name="Slash goal pill"
  args={{
    text: "/goal Ship the target icon everywhere",
    isUser: true,
  }}
/>

<Story
  name="Mixed slash tokens"
  args={{
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isUser: true,
  }}
/>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
