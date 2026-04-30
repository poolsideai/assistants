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
    d="M8.00016 1.65997C4.50235 1.65997 1.66682 4.4955 1.66682 7.99331C1.66682 11.4911 4.50235 14.3266 8.00016 14.3266C11.498 14.3266 14.3335 11.4911 14.3335 7.99331C14.3335 6.25536 13.6335 4.68092 12.5 3.53656M12.5 3.53656L12 6.49396M12.5 3.53656L15.5 4.49396M7.99999 4.99005V8.49005L9.83984 9.49005"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
