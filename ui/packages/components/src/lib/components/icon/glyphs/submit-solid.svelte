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
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2ZM8 4C7.73478 4 7.4805 4.10543 7.29297 4.29297L4.79297 6.79297C4.40245 7.18349 4.40245 7.81651 4.79297 8.20703C5.18349 8.59756 5.81651 8.59755 6.20703 8.20703L7 7.41406V11C7 11.5523 7.44772 12 8 12C8.55228 12 9 11.5523 9 11V7.41406L9.79297 8.20703C10.1835 8.59756 10.8165 8.59756 11.207 8.20703C11.5976 7.81651 11.5976 7.18349 11.207 6.79297L8.70703 4.29297L8.63379 4.22656C8.45583 4.08073 8.23209 4 8 4Z"
    fill="currentColor"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="miter"
    stroke-width={weight}
  />
</svg>
