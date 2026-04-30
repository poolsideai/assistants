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
    d="M13.6135 10.7448C12.0976 13.845 8.35545 15.1294 5.25522 13.6135M13.6135 10.7448C15.1294 7.64455 13.845 3.90243 10.7448 2.38653M13.6135 10.7448L10.4987 9.22178M5.25522 13.6135L8 8M5.25522 13.6135C3.03985 12.5302 1.75172 10.3102 1.75 8M10.7448 2.38653C7.6822 0.889039 3.99323 2.1242 2.44274 5.14307C2.4112 5.20448 2.4368 5.2798 2.49882 5.31013L5.53326 6.79385M10.7448 2.38653C7.60991 3.52406 6.09726 5.82166 5.53326 6.79385M10.7448 2.38653C11.6485 5.22554 10.8931 8.09541 10.4987 9.22178M5.53326 6.79385L8 8M10.4987 9.22178L8 8"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
