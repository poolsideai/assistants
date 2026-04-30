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
    d="M4.66667 5.00002C5.58714 5.00002 6.33333 4.25383 6.33333 3.33335C6.33333 2.41288 5.58714 1.66669 4.66667 1.66669C3.74619 1.66669 3 2.41288 3 3.33335C3 4.25383 3.74619 5.00002 4.66667 5.00002ZM4.66667 5.00002V11M4.66667 11C3.74619 11 3 11.7462 3 12.6667C3 13.5872 3.74619 14.3334 4.66667 14.3334C5.58714 14.3334 6.33333 13.5872 6.33333 12.6667C6.33333 11.7462 5.58714 11 4.66667 11ZM4.66667 11V8.66669C4.66667 8.2985 4.96514 8.00002 5.33333 8.00002H10.6667C11.0349 8.00002 11.3333 7.70154 11.3333 7.33335V5.00002M11.3333 5.00002C12.2538 5.00002 13 4.25383 13 3.33335C13 2.41288 12.2538 1.66669 11.3333 1.66669C10.4129 1.66669 9.66667 2.41288 9.66667 3.33335C9.66667 4.25383 10.4129 5.00002 11.3333 5.00002Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
