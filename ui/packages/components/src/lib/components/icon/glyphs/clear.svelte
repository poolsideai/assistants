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
    d="M10.1429 8.1604L13.9999 1.6665M10.1429 8.1604L9.13145 7.80823C7.98754 7.40995 6.77213 8.00554 6.11909 8.98829C5.3937 10.0799 4.99992 10.3332 3.33325 11.5184L5.33325 12.3332L6.99992 11.3332L6.82703 12.9258L10.3208 14.3332C11.633 13.0512 12.2854 11.9669 12.5047 10.4724C12.6326 9.60106 12.0188 8.81352 11.1544 8.51257L10.1429 8.1604ZM3.44436 5.44428L3.99992 4.33317L4.55547 5.44428L5.66659 5.99984L4.55547 6.55539L3.99992 7.6665L3.44436 6.55539L2.33325 5.99984L3.44436 5.44428ZM7.22214 2.55539L7.66659 1.6665L8.11103 2.55539L8.99992 2.99984L8.11103 3.44428L7.66659 4.33317L7.22214 3.44428L6.33325 2.99984L7.22214 2.55539Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
