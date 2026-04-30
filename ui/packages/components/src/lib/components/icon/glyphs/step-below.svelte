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
    d="M2.33325 3V8.66667C2.33325 9.40305 2.93021 10 3.66659 10H13.3333M11.1666 7.33333L13.5975 9.7643C13.7277 9.89447 13.7277 10.1055 13.5975 10.2357L11.1666 12.6667"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M9.66659 4.00033H13.6666M7.99992 4.00033C7.99992 4.73671 7.40297 5.33366 6.66659 5.33366C5.93021 5.33366 5.33325 4.73671 5.33325 4.00033C5.33325 3.26395 5.93021 2.66699 6.66659 2.66699C7.40297 2.66699 7.99992 3.26395 7.99992 4.00033Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
    stroke-opacity="0.6"
  />
</svg>
