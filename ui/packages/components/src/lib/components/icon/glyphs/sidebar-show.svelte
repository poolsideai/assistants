<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
  }

  let { size = 16, weight = 1, class: className, ...rest }: Props = $props();
</script>

<svg
  {...rest}
  class={className}
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M1.33331 2.99998C1.33331 2.63179 1.63179 2.33331 1.99998 2.33331H14C14.3682 2.33331 14.6666 2.63179 14.6666 2.99998V13C14.6666 13.3682 14.3682 13.6666 14 13.6666H1.99998C1.63179 13.6666 1.33331 13.3682 1.33331 13V2.99998Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M9.33002 6.32996L11.165 7.99496L9.33002 9.65996"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <rect x="2.5" y="3.5" width="4" height="9" rx="0.25" fill="currentColor" fill-opacity="0.7" />
</svg>
