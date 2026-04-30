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
    d="M1.66667 5.66668C1.66667 3.82573 3.15906 2.33334 5 2.33334H11C12.841 2.33334 14.3333 3.82573 14.3333 5.66668V10.3333C14.3333 12.1743 12.841 13.6667 11 13.6667H1.66667V5.66668Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M8 8.70189V5.25073M8 10.7019V10.7119"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
