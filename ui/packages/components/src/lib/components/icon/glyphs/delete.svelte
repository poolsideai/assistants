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
    d="M5.67 8.00049H10.33M2.99967 13.6673H12.9997C13.3679 13.6673 13.6663 13.3688 13.6663 13.0007V3.00065C13.6663 2.63246 13.3679 2.33398 12.9997 2.33398H2.99967C2.63148 2.33398 2.33301 2.63246 2.33301 3.00065V13.0007C2.33301 13.3688 2.63148 13.6673 2.99967 13.6673Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
