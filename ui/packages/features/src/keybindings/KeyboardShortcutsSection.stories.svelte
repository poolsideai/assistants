<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import KeyboardShortcutsSection from "./KeyboardShortcutsSection.svelte";

  const { Story } = defineMeta({
    component: KeyboardShortcutsSection,
    parameters: {
      layout: "fullscreen",
    },
    args: {
      host: "desktop",
      platform: "mac",
    },
  });
</script>

<Story name="Desktop">
  {#snippet template(args)}
    <div class="bg-psx-editor-background text-psx-foreground-primary min-h-screen w-full">
      <div class="mx-auto w-full max-w-[720px]">
        <KeyboardShortcutsSection {...args} />
      </div>
    </div>
  {/snippet}
</Story>
