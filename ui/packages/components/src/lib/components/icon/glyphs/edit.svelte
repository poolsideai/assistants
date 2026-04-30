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
    d="M7.99508 2.33008H3.0382C2.64712 2.33008 2.33008 2.64712 2.33008 3.0382V12.952C2.33008 13.343 2.64712 13.6601 3.0382 13.6601H12.952C13.343 13.6601 13.6601 13.343 13.6601 12.952V7.99508"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M8.33325 7.66673V5.66673L11.8618 2.13813C12.1222 1.87778 12.5443 1.87778 12.8047 2.13813L13.8618 3.19532C14.1222 3.45567 14.1222 3.87778 13.8618 4.13813L10.3333 7.66673H8.33325Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
