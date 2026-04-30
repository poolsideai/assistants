<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Icon from "./Icon.svelte";
  import { iconMap } from "./icons.js";
  import type { IconName } from "./IconName.js";

  const { Story } = defineMeta({
    component: Icon,
  });

  let names = Object.keys(iconMap) as IconName[];
</script>

<Story name="Default" />

<Story
  name="All"
  argTypes={{
    name: { table: { disable: true } },
  }}
>
  {#snippet template(args)}
    <div class="grid gap-4 xs:grid-cols-3 md:grid-cols-6">
      {#each names as name}
        <div class="flex flex-col items-center gap-1">
          <Icon {...args} type="product" {name} />
          <span class="text-center">{name}</span>
        </div>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="File"
  args={{
    type: "file",
    name: "index.ts",
  }}
/>
