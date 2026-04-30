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
    d="M2.33008 5.6C2.33008 5.03995 2.33008 4.75992 2.43907 4.54601C2.53494 4.35785 2.68793 4.20487 2.87609 4.10899C3.09 4 3.37003 4 3.93008 4H12.0601C12.6201 4 12.9002 4 13.1141 4.10899C13.3022 4.20487 13.4552 4.35785 13.5511 4.54601C13.6601 4.75992 13.6601 5.03995 13.6601 5.6V10.4C13.6601 10.9601 13.6601 11.2401 13.5511 11.454C13.4552 11.6422 13.3022 11.7951 13.1141 11.891C12.9002 12 12.6201 12 12.0601 12H3.93008C3.37003 12 3.09 12 2.87609 11.891C2.68793 11.7951 2.53494 11.6422 2.43907 11.454C2.33008 11.2401 2.33008 10.9601 2.33008 10.4V5.6Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <line
    x1="5.5"
    y1="6.83"
    x2="10.5"
    y2="6.83"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <line
    x1="5.5"
    y1="9.17"
    x2="10.5"
    y2="9.17"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
