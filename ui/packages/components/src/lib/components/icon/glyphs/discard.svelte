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
    d="M10 6.00002L6 10M10 10L6 6.00002M14.3333 8.00002C14.3333 11.4978 11.4978 14.3334 8 14.3334C4.5022 14.3334 1.66667 11.4978 1.66667 8.00002C1.66667 4.50222 4.5022 1.66669 8 1.66669C11.4978 1.66669 14.3333 4.50222 14.3333 8.00002Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
