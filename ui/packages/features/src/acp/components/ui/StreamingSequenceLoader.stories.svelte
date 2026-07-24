<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import StreamingSequenceLoader from "./StreamingSequenceLoader.svelte";

  const { Story } = defineMeta({
    component: StreamingSequenceLoader,
    args: { size: 16 },
  });
</script>

<!-- Streaming row (weight-500 title + blue sequence loader) above a normal idle row. -->
<Story name="Sidebar row">
  {#snippet template(args)}
    <div class="bg-psx-chrome text-psx-foreground-secondary w-[280px] p-3">
      <div class="flex items-center gap-2 rounded-[6px] px-2 py-1.5">
        <span>✦</span>
        <span class="text-psx-foreground-primary flex-1 truncate text-[13px]/[16px] font-medium">
          My conversation title…
        </span>
        <span class="text-psx-info-foreground flex min-w-[44px] justify-end">
          <StreamingSequenceLoader {...args} />
        </span>
      </div>
      <div class="flex items-center gap-2 rounded-[6px] px-2 py-1.5">
        <span>✦</span>
        <span class="flex-1 truncate text-[13px]/[16px]">Refactor the auth guard</span>
        <span class="min-w-[44px] text-right text-[12px]">3m</span>
      </div>
    </div>
  {/snippet}
</Story>

<!-- Enlarged so the six sequenced motions are easy to inspect. -->
<Story name="Zoom (48px)">
  {#snippet template()}
    <div class="text-psx-info-foreground p-6">
      <StreamingSequenceLoader size={48} />
    </div>
  {/snippet}
</Story>
