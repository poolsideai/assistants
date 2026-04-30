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
    d="M14.3334 7.99984C14.3334 11.4976 11.4979 14.3332 8.00008 14.3332C4.50228 14.3332 1.66675 11.4976 1.66675 7.99984C1.66675 4.50203 4.50228 1.6665 8.00008 1.6665C11.4979 1.6665 14.3334 4.50203 14.3334 7.99984Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M6.04175 6.13087C6.04175 5.36093 6.9038 4.90533 7.53995 5.33907L10.2816 7.20836C10.8395 7.58878 10.8395 8.41153 10.2816 8.79196L7.53995 10.6612C6.9038 11.095 6.04175 10.6394 6.04175 9.86944V6.13087Z"
    fill="currentColor"
  />
</svg>
