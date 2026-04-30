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
    d="M8.00004 5.33294V8.67M8.00004 11L8 10.99M7.42478 2.31508L1.75453 11.996C1.49422 12.4404 1.81473 12.9996 2.32978 12.9996H13.6703C14.1853 12.9996 14.5059 12.4404 14.2455 11.996L8.57529 2.31508C8.31779 1.87544 7.68229 1.87544 7.42478 2.31508Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
