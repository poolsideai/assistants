<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
  }

  let { size = 16, weight = 1.2, ...rest }: Props = $props();
</script>

<svg
  {...rest}
  width={size}
  height={size}
  viewBox="0 0 16 16"
  fill="none"
  overflow="visible"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M13.098 8.337A6.7 6.7 0 1 1 7.663 2.902M8.862 10.32A2.5 2.5 0 1 1 5.68 7.138"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width={weight}
  />
  <path d="M9.2 6.8L6.5 9.5" stroke="currentColor" stroke-linecap="round" stroke-width={weight} />
  <path
    d="M11.3 2.3L8.75 4.85V6.35L9.65 7.25H11.15L13.7 4.7L10.588 5.412L11.3 2.3Z"
    fill="currentColor"
  />
</svg>
