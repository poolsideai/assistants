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
    d="M10.75 2.33331H2.00001C1.63182 2.33331 1.33334 2.63179 1.33334 2.99998V13C1.33334 13.3682 1.63182 13.6666 2.00001 13.6666H14C14.3682 13.6666 14.6667 13.3682 14.6667 13V5.99998M4.33001 5.32997L7.26711 7.99497L4.33001 10.66M8.16003 10.66H11.66"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <circle
    cx="14.3471"
    cy="2.34964"
    r="0.857143"
    fill="currentColor"
    stroke="currentColor"
    stroke-width={weight}
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
