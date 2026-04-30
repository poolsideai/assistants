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
    d="M5.02856 5.99868L5.77856 6.49868L7.02632 4.835M9.03856 5.66684H11.0386M5.02856 10.4994L5.77856 10.9994L7.02632 9.33575M13.6666 7.66683V3.00016C13.6666 2.63197 13.3681 2.3335 12.9999 2.3335H2.99992C2.63173 2.3335 2.33325 2.63197 2.33325 3.00016V13.0002C2.33325 13.3684 2.63173 13.6668 2.99992 13.6668H7.66659M13.0808 13.081C12.2998 13.8621 11.0334 13.8621 10.2524 13.081C9.47132 12.3 9.47132 11.0337 10.2524 10.2526C10.6429 9.86209 11.1547 9.66683 11.6666 9.66683C12.1784 9.66683 12.6903 9.86209 13.0808 10.2526C13.8618 11.0337 13.8618 12.3 13.0808 13.081ZM13.0808 13.081L14.3333 14.3335"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
