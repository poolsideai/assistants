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
    d="M1.66667 5.99998C1.66667 5.63179 1.96514 5.33331 2.33333 5.33331H13.6667C14.0349 5.33331 14.3333 5.63179 14.3333 5.99998M2.33333 2.33331H6.32694C6.49752 2.33331 6.66161 2.3987 6.78544 2.51601L7.80715 3.48395C7.93098 3.60126 8.09507 3.66665 8.26565 3.66665H13.6667C14.0349 3.66665 14.3333 3.96512 14.3333 4.33331V12.3333C14.3333 12.7015 14.0349 13 13.6667 13H2.33333C1.96514 13 1.66667 12.7015 1.66667 12.3333V2.99998C1.66667 2.63179 1.96514 2.33331 2.33333 2.33331Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
