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
__POOL_SYNTHETIC_IMPORT_BASELINE__
>
  {#if icon}
    <span
__POOL_SYNTHETIC_IMPORT_BASELINE__
    >
      <Icon name={icon} />
    </span>
  {/if}
  <div class="flex grow flex-col justify-between truncate">
    {#if typeof title === "function"}
      {@render title()}
    {:else}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {title}
      </span>
    {/if}
    {#if typeof subtitle === "function"}
      {@render subtitle()}
    {:else}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {subtitle}
      </span>
    {/if}
  </div>
</header>
