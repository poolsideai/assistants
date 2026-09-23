<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
  }

  let { size = 16, weight = 1, class: className, ...rest }: Props = $props();
</script>

<svg
  {...rest}
  class={className}
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <rect
    x="2"
    y="2.75"
    width="12"
    height="10.5"
    rx="2.25"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <rect x="3.5" y="4.25" width="3.5" height="7.5" rx="1" fill="currentColor" fill-opacity="0.18" />
  <path
    d="M7.5 3.25V12.75"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
