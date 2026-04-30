<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    width?: number;
    height?: number;
  }

  let { width = 12, height = 13, ...rest }: Props = $props();
</script>

<svg {...rest} {width} {height} viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M3.25 10L1.427 8.177a.25.25 0 010-.354L3.25 6M1.625 8H9.75a1 1 0 001-1V4.25a1 1 0 00-1-1H6"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
