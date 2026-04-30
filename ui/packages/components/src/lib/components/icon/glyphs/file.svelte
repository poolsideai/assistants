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
    d="M8.66667 1.99984V5.33317C8.66667 5.70136 8.96514 5.99984 9.33333 5.99984H12.6667M3.66667 1.6665H8.39052C8.56734 1.6665 8.7369 1.73674 8.86193 1.86177L12.8047 5.80458C12.9298 5.9296 13 6.09917 13 6.27598V13.6665C13 14.0347 12.7015 14.3332 12.3333 14.3332H3.66667C3.29848 14.3332 3 14.0347 3 13.6665V2.33317C3 1.96498 3.29848 1.6665 3.66667 1.6665Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
