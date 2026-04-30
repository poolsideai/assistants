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
    d="M9.66667 3.33331L7 5.99998L9.66667 8.66665M7.66667 5.99998H13C13.7364 5.99998 14.3333 6.59693 14.3333 7.33331V11C14.3333 11.7364 13.7364 12.3333 13 12.3333H11"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
    opacity={0.4}
  />
  <path
    d="M5.00325 6.16502C5.00325 7.17846 4.18169 8.00002 3.16825 8.00002C2.15481 8.00002 1.33325 7.17846 1.33325 6.16502C1.33325 5.15157 2.15481 4.33002 3.16825 4.33002C4.18169 4.33002 5.00325 5.15157 5.00325 6.16502Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
