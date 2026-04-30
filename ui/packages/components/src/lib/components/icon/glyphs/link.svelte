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
    d="M7 3.66668H3.39999C3.02663 3.66668 2.83994 3.66668 2.69733 3.73934C2.57189 3.80325 2.46991 3.90524 2.40599 4.03068C2.33333 4.17329 2.33333 4.35998 2.33333 4.73334V12.6C2.33333 12.9734 2.33333 13.1601 2.40599 13.3027C2.46991 13.4281 2.57189 13.5301 2.69733 13.594C2.83994 13.6667 3.02663 13.6667 3.4 13.6667H11.2667C11.64 13.6667 11.8267 13.6667 11.9693 13.594C12.0948 13.5301 12.1968 13.4281 12.2607 13.3027C12.3333 13.1601 12.3333 12.9734 12.3333 12.6V9.00001M9.66666 2.33334H13.6667M13.6667 2.33334V6.33334M13.6667 2.33334L7.66666 8.33334"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
