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
    d="M4.83334 13.6667L2.52023 11.3536C2.32497 11.1583 2.32497 10.8417 2.52023 10.6465L4.83334 8.33334M11.1667 7.66668L13.4798 5.35356C13.6751 5.1583 13.6751 4.84172 13.4798 4.64646L11.1667 2.33334M2.66668 11H13.6667M2.33334 5.00001H13.3333"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
