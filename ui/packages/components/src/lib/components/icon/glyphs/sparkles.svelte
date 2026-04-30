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
    d="M13.6667 10C10.1945 10 8.66675 11.5278 8.66675 15C8.66675 11.5278 7.13897 10 3.66675 10C7.13897 10 8.66675 8.47222 8.66675 5C8.66675 8.47222 10.1945 10 13.6667 10Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M5.66675 5.66667C4.27786 5.66667 3.66675 6.27778 3.66675 7.66667C3.66675 6.27778 3.05564 5.66667 1.66675 5.66667C3.05564 5.66667 3.66675 5.05556 3.66675 3.66667C3.66675 5.05556 4.27786 5.66667 5.66675 5.66667Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M8.33341 2.33333C7.40749 2.33333 7.00008 2.74074 7.00008 3.66667C7.00008 2.74074 6.59267 2.33333 5.66675 2.33333C6.59267 2.33333 7.00008 1.92593 7.00008 1C7.00008 1.92593 7.40749 2.33333 8.33341 2.33333Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
