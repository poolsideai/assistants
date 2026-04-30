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
    d="M6.5 13.5L9.5 2.5M12.1667 5.16667L14.6721 7.82867C14.7627 7.92493 14.7627 8.07509 14.6721 8.17135L12.1667 10.8333M3.83333 10.8333L1.32793 8.17135C1.23733 8.07509 1.23733 7.92493 1.32793 7.82867L3.83333 5.16667"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
