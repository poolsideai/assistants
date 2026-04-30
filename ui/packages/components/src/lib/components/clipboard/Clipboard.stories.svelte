<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Clipboard from "./Clipboard.svelte";
  import { ClipboardIndicator, ClipboardLabel } from "./index.js";
  import { fn } from "storybook/test";
  import ClipboardTrigger from "./ClipboardTrigger.svelte";

  const { Story } = defineMeta({
    component: Clipboard,
    args: {
      onCopy: fn(),
      onError: fn(),
    },
  });
</script>

<Story name="Default" args={{ value: "hello" }}>
  {#snippet template(args)}
    <Clipboard {...args}>
      <ClipboardTrigger>
        <ClipboardIndicator />
        <ClipboardLabel />
      </ClipboardTrigger>
    </Clipboard>
  {/snippet}
</Story>
