<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
    dashed?: boolean;
  }

  let { size = 16, weight = 1, dashed, ...rest }: Props = $props();
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
    d="M6.66341 10.3334L3.66341 12.0001V10.3334H1.99674C1.62856 10.3334 1.33008 10.0349 1.33008 9.66675V2.99674C1.33008 2.62856 1.62855 2.33008 1.99674 2.33008H10.6634C11.0316 2.33008 11.3301 2.62855 11.3301 2.99674V7.67M11.3301 7.67H7.33667C6.96848 7.67 6.67 7.96848 6.67 8.33667V12.0067C6.67 12.3749 6.96848 12.6733 7.33667 12.6733H10.3367L13.3367 14.34V12.6733H14.0033C14.3715 12.6733 14.67 12.3749 14.67 12.0067V8.33667C14.67 7.96848 14.3715 7.67 14.0033 7.67H11.3301Z"
    stroke="currentColor"
    stroke-dasharray={dashed ? "3 2" : "none"}
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
