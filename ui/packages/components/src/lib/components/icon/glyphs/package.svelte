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
    d="M13.6667 5.33333V13C13.6667 13.5523 13.219 14 12.6667 14H3.33337C2.78109 14 2.33337 13.5523 2.33337 13V5.33333M13.6667 5.33333L11.958 2.4855C11.7773 2.1843 11.4518 2 11.1005 2H4.89956C4.5483 2 4.22279 2.1843 4.04207 2.4855L2.33337 5.33333M13.6667 5.33333L11 5.33334M2.33337 5.33333L11 5.33334M8.66671 5.33333L8.66671 7.41334C8.66671 7.55141 8.77864 7.66334 8.91671 7.66334H10.75C10.8881 7.66334 11 7.55141 11 7.41334V5.33334"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
