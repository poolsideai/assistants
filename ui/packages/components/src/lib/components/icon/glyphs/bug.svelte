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
    d="M5 5.00002V4.66669C5 3.00983 6.34315 1.66669 8 1.66669C9.65686 1.66669 11 3.00983 11 4.66669V5.00002M3.83334 11.8334L1.83334 12.6667M12.1667 11.8334L14.1667 12.6667M1.66667 9.00002H3.66667M12.3333 9.00002H14.3333M8 9.00002V14M3.5 6.00002L1.83334 5.33335M12.5 6.00002L14.1667 5.33335M3.66667 10V5.66669C3.66667 5.2985 3.96515 5.00002 4.33334 5.00002H11.6667C12.0349 5.00002 12.3333 5.2985 12.3333 5.66669V10C12.3333 12.3933 10.3932 14.3334 8 14.3334C5.60677 14.3334 3.66667 12.3933 3.66667 10Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
