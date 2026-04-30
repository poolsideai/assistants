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
    d="M2.33479 2.33331H13.6681C14.0363 2.33331 14.3348 2.63179 14.3348 2.99998V11.6666C14.3348 12.0348 14.0363 12.3333 13.6681 12.3333H8.00145L4.66812 14.1666V12.3333H2.33479C1.9666 12.3333 1.66812 12.0348 1.66812 11.6666V2.99998C1.66812 2.63179 1.9666 2.33331 2.33479 2.33331Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M10.0769 7.40694H12.5M10.0769 7.40694C10.0769 8.55399 9.14705 9.48386 8 9.48386C6.85295 9.48386 5.92308 8.55399 5.92308 7.40694M10.0769 7.40694C10.0769 6.25989 9.14705 5.33002 8 5.33002C6.85295 5.33002 5.92308 6.25989 5.92308 7.40694M3.5 7.40694H5.92308"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
