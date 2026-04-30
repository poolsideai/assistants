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
    d="M1.66667 5.66668C1.66667 3.82573 3.15905 2.33334 5 2.33334H11C12.8409 2.33334 14.3333 3.82573 14.3333 5.66668V10.3333C14.3333 12.1743 12.8409 13.6667 11 13.6667H1.66667V5.66668Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M8 9.2019C8 7.70192 10 7.70191 10 6.70192C10 3.99879 6 4.20191 6 6.70193M8 11.2019V11.2119"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
