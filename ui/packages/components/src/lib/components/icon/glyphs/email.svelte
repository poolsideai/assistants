<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
  }

  let { size = 14, weight = 1, ...rest }: Props = $props();
</script>

<svg
  {...rest}
  width={size}
  height={size}
  viewBox="0 0 14 14"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M4.5922 6.51276C4.80336 5.6259 5.59577 5 6.50743 5V5C7.77915 5 8.71723 6.18765 8.42267 7.42478L8.4078 7.48724C8.19664 8.3741 7.40423 9 6.49257 9V9C5.22085 9 4.28277 7.81235 4.57733 6.57522L4.5922 6.51276Z"
    stroke="currentColor"
    stroke-width={weight}
  />
  <path
    d="M9.75862 11.1379L9.58499 11.2464C8.79709 11.7389 7.88665 12 6.95751 12V12C4.21956 12 2 9.75929 2 7.02133V7.02133C2 4.25991 4.23858 2 7 2V2C9.76142 2 12 4.23857 12 7V7.12748C12 8.05119 11.2512 8.8 10.3275 8.8V8.8C9.13965 8.8 8.26315 7.69114 8.53742 6.53542L8.85912 5.17984"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-width={weight}
  />
</svg>
