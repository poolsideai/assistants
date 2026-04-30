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
    d="M11.3333 6.5H8.66666M10.3333 9.9H8.66666M4.52865 6.74851L5.27865 7.24851L6.52641 5.58484M4.52865 10.2493L5.27865 10.7493L6.52641 9.08559M1.66666 13.6667H11C12.8409 13.6667 14.3333 12.1743 14.3333 10.3333V5.66668C14.3333 3.82573 12.8409 2.33334 11 2.33334H5C3.15905 2.33334 1.66666 3.82573 1.66666 5.66668V13.6667Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
