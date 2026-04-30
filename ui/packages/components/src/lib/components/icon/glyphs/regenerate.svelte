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
    d="M2.99219 13.6665V11.3332C2.99219 11.1491 3.14143 10.9998 3.32552 10.9998L5.65885 10.9998M13.0001 2.33317V4.6665C13.0001 4.8506 12.8508 4.99984 12.6667 4.99984H10.3334M13.6229 7.2915C13.6518 7.52355 13.6667 7.75995 13.6667 7.99984C13.6667 11.1295 11.1297 13.6665 8.00008 13.6665C6.11639 13.6665 4.28462 12.7474 3.22865 11.3332M2.37726 8.70817C2.34832 8.47612 2.33341 8.23972 2.33341 7.99984C2.33341 4.87022 4.87047 2.33317 8.00008 2.33317C9.88377 2.33317 11.7155 3.25228 12.7715 4.6665"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
