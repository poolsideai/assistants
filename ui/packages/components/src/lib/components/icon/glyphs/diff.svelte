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
    d="M12.3548 2.3335H3.64516C3.28885 2.3335 3 2.63197 3 3.00016V13.0002C3 13.3684 3.28885 13.6668 3.64516 13.6668H12.3548C12.7112 13.6668 13 13.3684 13 13.0002V3.00016C13 2.63197 12.7112 2.3335 12.3548 2.3335Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M6 11H10M8 4.5V6.5M8 6.5V8.5M8 6.5H6M8 6.5H10"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
