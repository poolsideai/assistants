<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  interface Capabilities {
    customUI?: boolean;
  }

  interface Props {
    isUnderHeader?: boolean;
    children?: Snippet;
    class?: ClassValue;
    capabilities?: Capabilities;
  }

  let { isUnderHeader = false, children, class: className, capabilities = {} }: Props = $props();

  let stickyOffsetClass = $derived(capabilities.customUI ? "top-11" : "top-9");
</script>

<div class={["pointer-events-none absolute top-0 left-0 z-10 h-full w-full", className]}>
  <div
    class="sticky {isUnderHeader
      ? stickyOffsetClass
      : 'top-1'} mt-1 mr-1 flex h-7 items-center justify-end gap-1"
  >
    {@render children?.()}
  </div>
</div>
