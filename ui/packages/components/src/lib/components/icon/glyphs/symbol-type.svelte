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
  <rect
    x="2.33008"
    y="2.33"
    width="11.33"
    height="6"
    rx="1"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M2.33008 11.93C2.33008 11.3699 2.33008 11.0899 2.43907 10.876C2.53494 10.6878 2.68793 10.5349 2.87609 10.439C3.09 10.33 3.37003 10.33 3.93008 10.33H5.40008C5.96013 10.33 6.24016 10.33 6.45407 10.439C6.64223 10.5349 6.79521 10.6878 6.89108 10.876C7.00008 11.0899 7.00008 11.3699 7.00008 11.93V12.06C7.00008 12.6201 7.00008 12.9001 6.89108 13.114C6.79521 13.3022 6.64223 13.4551 6.45407 13.551C6.24016 13.66 5.96013 13.66 5.40008 13.66H3.93008C3.37003 13.66 3.09 13.66 2.87609 13.551C2.68793 13.4551 2.53494 13.3022 2.43907 13.114C2.33008 12.9001 2.33008 12.6201 2.33008 12.06V11.93Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M9 11.93C9 11.3699 9 11.0899 9.10899 10.876C9.20487 10.6878 9.35785 10.5349 9.54601 10.439C9.75992 10.33 10.0399 10.33 10.6 10.33H12.07C12.6301 10.33 12.9101 10.33 13.124 10.439C13.3122 10.5349 13.4651 10.6878 13.561 10.876C13.67 11.0899 13.67 11.3699 13.67 11.93V12.06C13.67 12.6201 13.67 12.9001 13.561 13.114C13.4651 13.3022 13.3122 13.4551 13.124 13.551C12.9101 13.66 12.6301 13.66 12.07 13.66H10.6C10.0399 13.66 9.75992 13.66 9.54601 13.551C9.35785 13.4551 9.20487 13.3022 9.10899 13.114C9 12.9001 9 12.6201 9 12.06V11.93Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
