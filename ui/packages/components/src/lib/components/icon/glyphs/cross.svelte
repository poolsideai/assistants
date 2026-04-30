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
    d="M3.33337 3.3335L12.6667 12.6668M12.6667 3.3335L3.33337 12.6668"
    stroke="currentColor"
    stroke-width={weight}
    stroke-linecap="round"
  />
</svg>
