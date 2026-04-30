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
    d="M10.75 2.33334H2.00001C1.63182 2.33334 1.33334 2.63181 1.33334 3V13C1.33334 13.3682 1.63182 13.6667 2.00001 13.6667H14C14.3682 13.6667 14.6667 13.3682 14.6667 13V6M4.33001 5.32999L7.26711 7.99499L4.33001 10.66M8.16003 10.66H11.66M15 1.9834L12 5.65006L10.6667 4.31673"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
