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
    d="M4.00011 8.00005H6.33344M4.00011 8.00005L1.95775 2.45651C1.85334 2.17312 2.14947 1.90807 2.4196 2.04313L13.7372 7.70191C13.9828 7.82475 13.9828 8.17535 13.7372 8.29819L2.4196 13.957C2.14947 14.092 1.85334 13.827 1.95775 13.5436L4.00011 8.00005Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
