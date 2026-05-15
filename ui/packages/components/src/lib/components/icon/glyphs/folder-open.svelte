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
    d="M14.3333 12.3333C14.3333 12.7015 14.0349 13 13.6667 13H2.58333C2.21514 13 1.91666 12.7015 1.91666 12.3333L1.66666 2.99998C1.66666 2.63179 1.96514 2.33331 2.33333 2.33331H6.32694C6.49752 2.33331 6.66161 2.3987 6.78544 2.51601L7.80715 3.48395C7.93098 3.60126 8.09507 3.66665 8.26565 3.66665H13.6667C14.0349 3.66665 14.3333 3.96512 14.3333 4.33331V5.33332M14.3333 12.3333L15.3211 6.07748C15.3292 6.0259 15.3348 5.97353 15.3288 5.92166C15.29 5.59038 15.0084 5.33332 14.6667 5.33332H14.3333M14.3333 12.3333C14.2461 12.6875 14.0039 13 13.6367 13H3.33333C2.99164 13 2.70999 12.7429 2.67122 12.4116C2.66515 12.3598 2.67076 12.3074 2.6789 12.2558L3.66666 5.99998C3.74609 5.66407 4.03906 5.33204 4.5 5.33332H14.3333"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
