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
    d="M1.66666 8.33331V6.99998C1.66666 6.63179 1.96513 6.33331 2.33332 6.33331H13.6667C14.0348 6.33331 14.3333 6.63179 14.3333 6.99998V8.33331M2.33332 2.33331H6.32693C6.49751 2.33331 6.6616 2.3987 6.78543 2.51601L7.80714 3.48395C7.93097 3.60126 8.09506 3.66665 8.26564 3.66665H13.6667C14.0348 3.66665 14.3333 3.96512 14.3333 4.33331V12.3333C14.3333 12.7015 14.0348 13 13.6667 13H2.33332C1.96513 13 1.66666 12.7015 1.66666 12.3333V2.99998C1.66666 2.63179 1.96513 2.33331 2.33332 2.33331Z"
    stroke="currentColor"
    stroke-dasharray={dashed ? "3 2" : "none"}
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
