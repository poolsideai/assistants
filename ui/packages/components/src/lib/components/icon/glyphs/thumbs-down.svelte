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
    d="M11.7 9H13.3667C13.919 9 14.3667 8.55228 14.3667 8V3.33333C14.3667 2.78105 13.919 2.33333 13.3667 2.33333H11.7M11.7 9L8.86945 13.9786C8.74477 14.1979 8.51192 14.3333 8.25965 14.3333V14.3333C7.44059 14.3333 6.81517 13.6018 6.94254 12.7927L7.35592 10.1667H3.73587C2.49719 10.1667 1.55637 9.05218 1.76422 7.83107L2.41671 3.99773C2.58032 3.03649 3.41328 2.33333 4.38835 2.33333H11.7M11.7 9V2.33333"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
