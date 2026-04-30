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
    d="M3.34594 5.31477L3.8089 4.38885L4.27187 5.31477L5.19779 5.77774L4.27187 6.2407L3.8089 7.16663L3.34594 6.2407L2.42001 5.77774L3.34594 5.31477Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M6.49409 1.90737L6.86446 1.16663L7.23483 1.90737L7.97557 2.27774L7.23483 2.64811L6.86446 3.38885L6.49409 2.64811L5.75335 2.27774L6.49409 1.90737Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M12.8207 9.57076L13.1911 8.83002L13.5615 9.57076L14.3022 9.94113L13.5615 10.3115L13.1911 11.0522L12.8207 10.3115L12.08 9.94113L12.8207 9.57076Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M2.2571 13.6071C1.86657 13.2166 1.86657 12.5834 2.2571 12.1929L11.4495 3.00053C11.84 2.61001 12.4732 2.61001 12.8637 3.00053L13.2173 3.35409C13.6078 3.74461 13.6078 4.37778 13.2173 4.7683L4.02486 13.9607C3.63434 14.3512 3.00117 14.3512 2.61065 13.9607L2.2571 13.6071Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
