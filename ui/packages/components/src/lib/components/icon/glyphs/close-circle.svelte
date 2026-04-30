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
  <mask id="mask">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M8.00002 2.16663C4.77836 2.16663 2.16669 4.7783 2.16669 7.99996C2.16669 11.2216 4.77836 13.8333 8.00002 13.8333C11.2217 13.8333 13.8334 11.2216 13.8334 7.99996C13.8334 4.7783 11.2217 2.16663 8.00002 2.16663Z"
      fill="white"
    />
    <path
      d="M10 6L6 10M10 10L6 6"
      stroke="black"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width={weight}
    />
  </mask>

  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M8.00002 2.16663C4.77836 2.16663 2.16669 4.7783 2.16669 7.99996C2.16669 11.2216 4.77836 13.8333 8.00002 13.8333C11.2217 13.8333 13.8334 11.2216 13.8334 7.99996C13.8334 4.7783 11.2217 2.16663 8.00002 2.16663Z"
    fill="currentColor"
    mask="url(#mask)"
  />
</svg>
