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
    d="M13.6667 5.33331V13C13.6667 13.5523 13.219 14 12.6667 14H3.33337C2.78109 14 2.33337 13.5523 2.33337 13V5.33331"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M14 2.5H2C1.72386 2.5 1.5 2.72386 1.5 3V4.5C1.5 4.77614 1.72386 5 2 5H14C14.2761 5 14.5 4.77614 14.5 4.5V3C14.5 2.72386 14.2761 2.5 14 2.5Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M6.5 8H9.5"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
