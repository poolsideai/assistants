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
    d="M13.6667 8C13.6667 11.1296 11.1296 13.6667 8 13.6667C4.87039 13.6667 2.33333 11.1296 2.33333 8C2.33333 4.87039 4.87039 2.33333 8 2.33333C11.1296 2.33333 13.6667 4.87039 13.6667 8Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M8 5.33333V10.3333M8 10.3333L5.83333 8.16667M8 10.3333L10.1667 8.16667"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
