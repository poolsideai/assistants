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
  <!-- Two overlapping play triangles, the left one in front. The right
    triangle's back edge breaks around the occluding tip, and both live in one
    path so the translucent mode colour does not double-composite. -->
  <path
    d="M2.35 4.25L8.75 8L2.35 11.75ZM7.25 5.55V4.25L13.65 8L7.25 11.75V10.45"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
