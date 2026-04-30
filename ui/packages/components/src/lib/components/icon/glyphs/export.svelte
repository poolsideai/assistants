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
    d="M13.6667 9.66668V13C13.6667 13.3682 13.3682 13.6667 13 13.6667H3.00001C2.63182 13.6667 2.33334 13.3682 2.33334 13V9.66668M8 10.3333V2.33334M8 10.3333L5.66668 8.00001M8 10.3333L10.3333 8.00001"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
