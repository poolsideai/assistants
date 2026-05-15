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
    d="M10.5 9.5C12.7091 9.5 14.5 7.70914 14.5 5.5C14.5 3.29086 12.7091 1.5 10.5 1.5C8.29086 1.5 6.5 3.29086 6.5 5.5C6.5 6.03045 6.60325 6.53678 6.79076 7L1.5 12.2908V14.5H4L4.5 14V12.5H6L6.5 12V10.5H8L9.21192 9.28808C9.61611 9.42548 10.0493 9.5 10.5 9.5Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M11 5.5C11.2761 5.5 11.5 5.27614 11.5 5C11.5 4.72386 11.2761 4.5 11 4.5C10.7239 4.5 10.5 4.72386 10.5 5C10.5 5.27614 10.7239 5.5 11 5.5Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
