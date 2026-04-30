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
    d="M4.33333 7H2.33333C1.96514 7 1.66666 7.29848 1.66666 7.66667V13C1.66666 13.3682 1.96514 13.6667 2.33333 13.6667H4.33333M4.33333 7L7.17389 2.00383C7.29239 1.79541 7.51368 1.66667 7.75344 1.66667H7.77368C8.59274 1.66667 9.21817 2.39824 9.0908 3.20734L8.67742 5.83333H12.2975C13.5361 5.83333 14.477 6.94782 14.2691 8.16893L13.6166 12.0023C13.453 12.9635 12.6201 13.6667 11.645 13.6667H4.33333M4.33333 7V13.6667"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
