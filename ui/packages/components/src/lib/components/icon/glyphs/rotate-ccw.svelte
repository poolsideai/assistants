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
    d="M2.66516 9.88887C3.44307 12.0898 5.54208 13.6666 8.00938 13.6666C11.139 13.6666 13.6761 11.1296 13.6761 7.99998C13.6761 4.87037 11.139 2.33331 8.00938 2.33331C5.97262 2.33331 4.64682 3.24985 3.33328 4.79918M2.99994 2.49998V4.83331C2.99994 5.01741 3.14918 5.16665 3.33328 5.16665H5.66661"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
