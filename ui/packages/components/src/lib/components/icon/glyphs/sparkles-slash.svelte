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
    d="M8.66667 15C8.66667 11.5278 10.1945 9.99999 13.6667 9.99999C10.9908 9.99999 9.46974 9.09263 8.91279 7.08722L5.75391 10.2461C7.75932 10.8031 8.66667 12.3241 8.66667 15Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M5.66666 5.66666C4.27777 5.66666 3.66666 6.27777 3.66666 7.66666C3.66666 6.27777 3.05555 5.66666 1.66666 5.66666C3.05555 5.66666 3.66666 5.05555 3.66666 3.66666C3.66666 5.05555 4.27777 5.66666 5.66666 5.66666Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M8.33332 2.33333C7.4074 2.33333 6.99999 2.74074 6.99999 3.66667C6.99999 2.74074 6.59258 2.33333 5.66666 2.33333C6.59258 2.33333 6.99999 1.92593 6.99999 1C6.99999 1.92593 7.4074 2.33333 8.33332 2.33333Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M13.5 2.5L11.7011 4.29887L9.41421 6.58579L6.58579 9.41421L4.29887 11.7011L2.5 13.5"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
