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
    d="M3.33341 3.6665L3.64657 13.6873C3.65781 14.0472 3.95282 14.3332 4.31291 14.3332H11.6873C12.0473 14.3332 12.3423 14.0472 12.3536 13.6873L12.6667 3.6665M3.33341 3.6665H12.6667M3.33341 3.6665H1.66675M12.6667 3.6665H14.3334M6.33341 6.99984V10.9998M9.66675 6.99984V10.9998M10.5827 3.6665C10.2867 2.51635 9.24265 1.6665 8.00009 1.6665C6.75753 1.6665 5.71347 2.51635 5.41744 3.6665"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
