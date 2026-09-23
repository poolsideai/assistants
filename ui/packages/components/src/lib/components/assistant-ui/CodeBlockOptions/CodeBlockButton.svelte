<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  interface Capabilities {
    customUI?: boolean;
  }

  interface Props extends HTMLButtonAttributes {
    bgClass?: string;
    capabilities?: Capabilities;
  }

  let { bgClass = "", children, class: className, capabilities = {}, ...rest }: Props = $props();

  let customUI = $derived(capabilities.customUI);
</script>

<button
  class={[
    className,
    customUI ? "rounded-lg" : "rounded-md",
    "group pointer-events-auto relative flex h-6 w-6 items-center justify-center overflow-clip bg-psx-panel p-0.5 text-psx-foreground-secondary transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-psx-focus",
  ]}
  {...rest}
>
  <span
    aria-hidden="true"
    class="{bgClass} absolute inset-0 h-full w-full bg-transparent transition-colors group-hover:bg-psx-chrome-hover group-active:bg-psx-chrome-active"
  ></span>

  <span class="relative flex h-4 w-4 items-center justify-center">
    {@render children?.()}
  </span>
</button>
