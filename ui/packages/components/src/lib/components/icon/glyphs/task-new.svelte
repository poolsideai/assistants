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
    d="M11.3333 6.49999H8.66667M4.52865 6.7485L5.27865 7.2485L6.52641 5.58483M4.52865 10.2493L5.27865 10.7493L6.52641 9.08558M12.0017 9.32999L12.0017 11.665M12.0017 11.665L12.0017 14M12.0017 11.665H9.66675M12.0017 11.665H14.3367M8 13.6666H1.66675V5.66665C1.66675 3.8257 3.15913 2.33331 5.00008 2.33331H11.0001C12.841 2.33331 14.3334 3.8257 14.3334 5.66665V7"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
