<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Badge, { badge, type BadgeProps } from "./Badge.svelte";
  import Icon from "../icon/Icon.svelte";
  import { prominences } from "../../utils/prominence.js";
  import { sizes } from "../../utils/size.js";

  const intents = Object.keys(badge.variants.intent) as NonNullable<BadgeProps["intent"]>[];
  const radii = Object.keys(badge.variants.radius) as NonNullable<BadgeProps["radius"]>[];

  const { Story } = defineMeta({
    component: Badge,
    args: {
      intent: "info",
      radius: "default",
    },
    render,
  });
</script>

{#snippet render(args: BadgeProps)}
  <Badge {...args}>Badge</Badge>
{/snippet}

<Story name="Default" />

<Story
  name="Intent"
  argTypes={{
    intent: { table: { disable: true } },
  }}
>
  {#snippet template(args)}
    <div class="flex items-center gap-2">
      {#each intents as intent}
        <Badge {...args} {intent}>{intent}</Badge>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Prominence"
  argTypes={{
    prominence: { table: { disable: true } },
  }}
>
  {#snippet template(args)}
    <div class="flex items-center gap-2">
      {#each prominences as prominence}
        <Badge {...args} {prominence}>{prominence}</Badge>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Size"
  argTypes={{
    size: { table: { disable: true } },
  }}
>
  {#snippet template(args)}
    <div class="grid grid-cols-4 place-items-start gap-4">
      {#each sizes as size}
        <Badge {...args} {size}>
          <Icon name="package" />
          {size}
        </Badge>
        <Badge {...args} {size}>
          {size}
          <Icon name="arrow-right" />
        </Badge>
        <Badge {...args} {size}>
          <Icon name="admin" />
          {size}
          <Icon name="chevron" />
        </Badge>
        <Badge {...args} {size}>
          <Icon name="arrow-up-right" />
        </Badge>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="Radius"
  argTypes={{
    radius: { table: { disable: true } },
  }}
>
  {#snippet template(args)}
    <div class="flex items-center gap-2">
      {#each radii as radius}
        <Badge {...args} {radius}>{radius}</Badge>
      {/each}
    </div>
  {/snippet}
</Story>

<Story
  name="With Icons"
  args={{
    intent: "positive",
  }}
>
  <Icon name="package" />
  20
</Story>
