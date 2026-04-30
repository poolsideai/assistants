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
    d="M8.66667 2.00002V5.33335C8.66667 5.70154 8.96514 6.00002 9.33333 6.00002H12.6667M13 9.97143V6.27616C13 6.09935 12.9298 5.92978 12.8047 5.80476L8.86193 1.86195C8.7369 1.73692 8.56734 1.66669 8.39052 1.66669H3.66667C3.29848 1.66669 3 1.96516 3 2.33335V13.6667C3 14.0349 3.29848 14.3334 3.66667 14.3334H9"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <circle
    cx="12.3471"
    cy="13.3496"
    r="0.857143"
    fill="currentColor"
    stroke="currentColor"
    stroke-width={weight}
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
