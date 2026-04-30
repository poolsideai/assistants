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
    d="M1.66667 5.66665C1.66667 3.8257 3.15906 2.33331 5 2.33331H11C12.841 2.33331 14.3333 3.8257 14.3333 5.66665V10.3333C14.3333 12.1743 12.841 13.6666 11 13.6666H1.66667V5.66665Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M8.00001 5.66998L8 8.0033M8 8.0033L8 10.3367M8 8.0033H5.66667M8 8.0033H10.3333"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
