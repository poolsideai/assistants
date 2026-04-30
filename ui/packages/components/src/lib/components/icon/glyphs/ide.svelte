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
    d="M14.3333 8.33333V3.66667C14.3333 3.29848 14.0349 3 13.6667 3H2.33333C1.96514 3 1.66667 3.29848 1.66667 3.66667V13C1.66667 13.3682 1.96514 13.6667 2.33333 13.6667H8.33333M14.3333 10.8718L9.33333 9.33333L10.8718 14.3333L12.0256 12.0256L14.3333 10.8718Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M3.54167 5.33333C3.54167 5.58646 3.74687 5.79167 4 5.79167C4.25313 5.79167 4.45833 5.58646 4.45833 5.33333C4.45833 5.0802 4.25313 4.875 4 4.875C3.74687 4.875 3.54167 5.0802 3.54167 5.33333ZM5.875 5.33333C5.875 5.58646 6.0802 5.79167 6.33333 5.79167C6.58646 5.79167 6.79167 5.58646 6.79167 5.33333C6.79167 5.0802 6.58646 4.875 6.33333 4.875C6.0802 4.875 5.875 5.0802 5.875 5.33333ZM8.20833 5.33333C8.20833 5.58646 8.41354 5.79167 8.66667 5.79167C8.9198 5.79167 9.125 5.58646 9.125 5.33333C9.125 5.0802 8.9198 4.875 8.66667 4.875C8.41354 4.875 8.20833 5.0802 8.20833 5.33333Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
