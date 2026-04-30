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
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M12 1.5C13.3807 1.5 14.5 2.61929 14.5 4V12C14.5 13.3807 13.3807 14.5 12 14.5H4C2.61929 14.5 1.5 13.3807 1.5 12V4C1.5 2.61929 2.61929 1.5 4 1.5H12Z"
    fill="white"
  />
  <path
    d="M12 1.5C13.3807 1.5 14.5 2.61929 14.5 4V12C14.5 13.3807 13.3807 14.5 12 14.5H4C2.61929 14.5 1.5 13.3807 1.5 12V4C1.5 2.61929 2.61929 1.5 4 1.5H12Z"
    stroke="#E2E4E8"
  />
  <path
    d="M11.4375 4.875L6.67788 11.125L4.5625 8.85227"
    stroke="#6A6C6F"
    stroke-width="1.25"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
