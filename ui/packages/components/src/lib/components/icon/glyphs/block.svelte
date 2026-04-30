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
    d="M12.4784 3.52149C11.3323 2.37539 9.74898 1.6665 8.00008 1.6665C4.50228 1.6665 1.66675 4.50203 1.66675 7.99984C1.66675 9.74874 2.37563 11.3321 3.52174 12.4782M12.4784 3.52149C13.6245 4.6676 14.3334 6.25094 14.3334 7.99984C14.3334 11.4976 11.4979 14.3332 8.00008 14.3332C6.25118 14.3332 4.66785 13.6243 3.52174 12.4782M12.4784 3.52149L3.52174 12.4782"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
