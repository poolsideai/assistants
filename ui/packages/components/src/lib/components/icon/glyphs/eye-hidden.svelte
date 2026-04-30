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
    d="M11.7012 4.29889C13.682 5.66937 15 7.67578 15 8.00002C15 8.50002 11.866 13 8.00002 13C6.64109 13 5.37261 12.444 4.29889 11.7012"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M9.41424 6.58582C9.77617 6.94774 10 7.44774 10 8.00003C10 9.1046 9.1046 10 8.00003 10C7.44774 10 6.94774 9.77617 6.58582 9.41424"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M9.71444 3.28556C9.16583 3.10533 8.59148 3 8 3C4.13401 3 1 7.5 1 8C1 8.22445 1.63155 9.25497 2.67737 10.3226"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M13.5 2.5L11.7011 4.29887L9.41421 6.58579L6.58579 9.41421L4.29887 11.7011L2.5 13.5"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
