<script lang="ts">
  import type { SvelteHTMLElements } from "svelte/elements";
  import { getDiffContext } from "./Diff.svelte";
  import Icon from "../icon/Icon.svelte";
  import { Badge } from "../badge/index.js";

  type DiffStatsValue = {
    additions: number;
    deletions: number;
  };

  type Props = SvelteHTMLElements["div"] & {
    stats?: DiffStatsValue;
  };

  let { stats: statsOverride, class: className, ...rest }: Props = $props();

  const context = statsOverride ? null : getDiffContext();

  let stats = $derived(statsOverride ?? context?.stats ?? { additions: 0, deletions: 0 });
</script>

{#if stats.additions || stats.deletions}
  <div {...rest} class={[className, "flex flex-row gap-1.5"]}>
    {#if stats.additions}
      <Badge intent="positive" class="font-mono">
        <Icon aria-hidden="true" name="plus" />
        {stats.additions}
      </Badge>
    {/if}
    {#if stats.deletions}
      <Badge intent="critical" class="font-mono">
        <Icon aria-hidden="true" name="minus" />
        {stats.deletions}
      </Badge>
    {/if}
  </div>
{/if}
