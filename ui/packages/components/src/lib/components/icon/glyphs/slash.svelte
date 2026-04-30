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
    d="M6 11L10 5M2.99992 13.6668H12.9999C13.3681 13.6668 13.6666 13.3684 13.6666 13.0002V3.00016C13.6666 2.63197 13.3681 2.3335 12.9999 2.3335H2.99992C2.63173 2.3335 2.33325 2.63197 2.33325 3.00016V13.0002C2.33325 13.3684 2.63173 13.6668 2.99992 13.6668Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
