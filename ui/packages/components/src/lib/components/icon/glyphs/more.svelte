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
    d="M8.00008 8.66683C8.36827 8.66683 8.66675 8.36835 8.66675 8.00016C8.66675 7.63197 8.36827 7.3335 8.00008 7.3335C7.63189 7.3335 7.33341 7.63197 7.33341 8.00016C7.33341 8.36835 7.63189 8.66683 8.00008 8.66683Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M13.6667 8.66683C14.0349 8.66683 14.3334 8.36835 14.3334 8.00016C14.3334 7.63197 14.0349 7.3335 13.6667 7.3335C13.2986 7.3335 13.0001 7.63197 13.0001 8.00016C13.0001 8.36835 13.2986 8.66683 13.6667 8.66683Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M2.33341 8.66683C2.7016 8.66683 3.00008 8.36835 3.00008 8.00016C3.00008 7.63197 2.7016 7.3335 2.33341 7.3335C1.96522 7.3335 1.66675 7.63197 1.66675 8.00016C1.66675 8.36835 1.96522 8.66683 2.33341 8.66683Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
