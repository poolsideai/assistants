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
    d="M5.00001 9.66666H6.33334M5.00001 4.33332H10.3333M5.00001 6.99999H7.66668M13.0809 13.7475C12.2998 14.5286 11.0335 14.5286 10.2525 13.7475C9.47141 12.9665 9.47141 11.7002 10.2525 10.9191C10.643 10.5286 11.1548 10.3333 11.6667 10.3333C12.1785 10.3333 12.6904 10.5286 13.0809 10.9191C13.8619 11.7002 13.8619 12.9665 13.0809 13.7475ZM13.0809 13.7475L14.3333 15M13 8.16666V2.33332C13 1.96513 12.7015 1.66666 12.3333 1.66666H3.00001C2.63182 1.66666 2.33334 1.96513 2.33334 2.33332V13.6667C2.33334 14.0348 2.63182 14.3333 3.00001 14.3333H7.83334"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
