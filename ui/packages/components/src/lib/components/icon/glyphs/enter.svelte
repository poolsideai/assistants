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
    d="M4.33328 12.6665L1.90232 10.2355C1.77214 10.1054 1.77214 9.89431 1.90232 9.76413L4.33328 7.33317M2.16662 9.99984H12.9999C13.7363 9.99984 14.3333 9.40288 14.3333 8.6665V4.99984C14.3333 4.26346 13.7363 3.6665 12.9999 3.6665H7.99995"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
