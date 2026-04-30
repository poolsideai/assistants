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
    d="M2.33325 12.9997V7.33301C2.33325 6.59663 2.93021 5.99967 3.66659 5.99967H13.3333M11.1666 8.66634L13.5975 6.23538C13.7277 6.1052 13.7277 5.89415 13.5975 5.76397L11.1666 3.33301"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M9.66659 12.0003H13.6666M7.99992 12.0003C7.99992 12.7367 7.40297 13.3337 6.66659 13.3337C5.93021 13.3337 5.33325 12.7367 5.33325 12.0003C5.33325 11.2639 5.93021 10.667 6.66659 10.667C7.40297 10.667 7.99992 11.2639 7.99992 12.0003Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
    stroke-opacity="0.6"
  />
</svg>
