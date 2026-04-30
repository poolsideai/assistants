<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
  }

  let { size = 16, weight = 1, ...rest }: Props = $props();
</script>

<svg
  {...rest}
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M1.33334 3.00001C1.33334 2.63182 1.63182 2.33334 2.00001 2.33334H14C14.3682 2.33334 14.6667 2.63182 14.6667 3.00001V13C14.6667 13.3682 14.3682 13.6667 14 13.6667H2.00001C1.63182 13.6667 1.33334 13.3682 1.33334 13V3.00001Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M4.32999 5.32999L7.26709 7.99499L4.32999 10.66M8.16 10.66H11.66"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
