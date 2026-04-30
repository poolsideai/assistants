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
    d="M8.66667 1.99999V5.33332C8.66667 5.70151 8.96514 5.99999 9.33333 5.99999H12.6667M3 11V2.33332C3 1.96513 3.29848 1.66666 3.66667 1.66666H8.39052C8.56734 1.66666 8.7369 1.73689 8.86193 1.86192L12.8047 5.80473C12.9298 5.92975 13 6.09932 13 6.27613V13.6667C13 14.0348 12.7015 14.3333 12.3333 14.3333H6.5"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M5.33333 9.32999H8M8 9.32999V11.9967M8 9.32999L4 13.33"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
