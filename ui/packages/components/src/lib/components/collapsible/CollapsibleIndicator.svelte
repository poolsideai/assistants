<script lang="ts">
  import type { Snippet } from "svelte";
  import Icon, { type IconProps } from "../icon/Icon.svelte";

  type Props = IconProps & {
    children?: Snippet;
  };

  let { children, class: className, ...rest }: Props = $props();
</script>

{#if children}
  {@render children()}
{:else}
  <Icon
    name="chevron"
    class={[className, "transition-transform group-ui-state-closed:-rotate-90"]}
    {...rest}
  />
{/if}
