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
    d="M2.70833 10.3333V13C2.70833 13.5523 3.15605 14 3.70833 14H12.3333C12.8856 14 13.3333 13.5523 13.3333 13V3C13.3333 2.44772 12.8856 2 12.3333 2H3.70833C3.15605 2 2.70833 2.44772 2.70833 3V5.66667M2.70833 10.3333V8M2.70833 10.3333H2M2.70833 10.3333H3.33333M2.70833 8V5.66667M2.70833 8H2M2.70833 8H3.33333M2.70833 5.66667H2M2.70833 5.66667H3.33333M6.33333 8H8.33333M6.33333 5.66667H9.66667"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
