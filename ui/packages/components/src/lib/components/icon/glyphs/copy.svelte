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
    d="M10.9999 2.99984H12.9999C13.3681 2.99984 13.6666 3.29831 13.6666 3.6665V13.6665C13.6666 14.0347 13.3681 14.3332 12.9999 14.3332H2.99992C2.63173 14.3332 2.33325 14.0347 2.33325 13.6665V3.6665C2.33325 3.29831 2.63173 2.99984 2.99992 2.99984H4.99992M5.66659 4.33317H10.3333C10.7014 4.33317 10.9999 4.03469 10.9999 3.6665V2.33317C10.9999 1.96498 10.7014 1.6665 10.3333 1.6665H5.66659C5.2984 1.6665 4.99992 1.96498 4.99992 2.33317V3.6665C4.99992 4.03469 5.2984 4.33317 5.66659 4.33317Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
