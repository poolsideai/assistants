<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FileChip from "../markdown/FileChip.svelte";
  import UserMessageBubble from "./UserMessageBubble.svelte";

  const { Story } = defineMeta({
    title: "Components/UserMessageBubble Pills",
  });
</script>

<!--
  Renders inline file pills the same way rendered user markdown does: a
  `.markdown.user` wrapper with a `[data-file-path]` host span around the real
  FileChip component (so the chip's scoped styles apply). Used to verify pill
  contrast across bubble variants and themes (pills were unreadable on
  the enqueued/pending-prompt bubble because they reused the brand bubble's
  foreground colour).
-->
{#snippet pills()}
  <div class="markdown user leading-6">
    Please review
    <span
      class="inline-block align-baseline"
      data-file-path="/repo/src/lib/markdown/FileChip.svelte"
    >
      <FileChip
        absolutePath="/repo/src/lib/markdown/FileChip.svelte"
        displayPath="FileChip.svelte"
      />
    </span>
    and
    <span class="inline-block align-baseline" data-file-path="/repo/src/acp/markdownHost.ts">
      <FileChip
        absolutePath="/repo/src/acp/markdownHost.ts"
        displayPath="markdownHost.ts:42"
        line={42}
      />
    </span>
    thanks.
  </div>
{/snippet}

<Story name="Both variants">
  <div class="flex flex-col items-end gap-4 p-4">
    <UserMessageBubble variant="default">
      {@render pills()}
    </UserMessageBubble>
    <UserMessageBubble variant="enqueued" nubbinPosition="bottom-right">
      {@render pills()}
    </UserMessageBubble>
  </div>
</Story>

<Story name="Enqueued only">
  <div class="flex flex-col items-end p-4">
    <UserMessageBubble variant="enqueued" nubbinPosition="bottom-right">
      {@render pills()}
    </UserMessageBubble>
  </div>
</Story>
