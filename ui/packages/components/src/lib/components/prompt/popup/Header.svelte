<script lang="ts">
  import type { Snippet } from "svelte";
  import Icon, { type IconName } from "../../icon/index.js";

  interface Props {
    title?: string | Snippet;
    subtitle?: string | Snippet;
    icon?: IconName;
  }

  let { title, subtitle, icon }: Props = $props();
</script>

<header
  data-prompt-header
  class="flex items-center gap-2 px-2 py-2 text-sm text-psx-foreground-secondary"
>
  {#if icon}
    <span
      class="flex shrink-0 items-center justify-center rounded-sm bg-black/5 p-2.5 text-base dark:bg-white/5"
    >
      <Icon name={icon} />
    </span>
  {/if}
  <div class="flex grow flex-col justify-between truncate">
    {#if typeof title === "function"}
      {@render title()}
    {:else}
      <span class="min-w-0 truncate font-medium">
        {title}
      </span>
    {/if}
    {#if typeof subtitle === "function"}
      {@render subtitle()}
    {:else}
      <span class="min-w-0 truncate text-psx-foreground-secondary">
        {subtitle}
      </span>
    {/if}
  </div>
</header>
