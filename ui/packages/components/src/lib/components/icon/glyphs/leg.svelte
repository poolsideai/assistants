<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
  }

  let { size = 16, ...rest }: Props = $props();
</script>

<svg
  {...rest}
  width={size}
  height={size}
  viewBox="0 0 8 17"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M7.5 16.5a.5.5 0 000-1v1zM.5 14H1 .5zm.5 0V.5H0V14h1zm1.5 2.5h5v-1h-5v1zM0 14a2.5 2.5 0 002.5 2.5v-1A1.5 1.5 0 011 14H0z"
    fill="currentColor"
  />
</svg>
