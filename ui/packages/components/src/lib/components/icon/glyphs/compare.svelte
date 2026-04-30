<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
    dashed?: boolean;
  }

  let { size = 16, weight = 1, dashed, ...rest }: Props = $props();
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
    d="M8 1.66669V14.3334M5.66667 3.00002H2.33334C1.96515 3.00002 1.66667 3.2985 1.66667 3.66669V12.3334C1.66667 12.7015 1.96515 13 2.33334 13H5.66667M10.3333 13H13.6667C14.0349 13 14.3333 12.7015 14.3333 12.3334V3.66669C14.3333 3.2985 14.0349 3.00002 13.6667 3.00002H10.3333"
    stroke="currentColor"
    stroke-dasharray={dashed ? "2 1.75" : "none"}
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
