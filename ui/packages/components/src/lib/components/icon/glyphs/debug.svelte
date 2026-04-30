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
    d="M6.52004 3.5462L4.56375 3.13038C4.2036 3.05382 3.84959 3.28372 3.77304 3.64387L1.97114 12.1211C1.89459 12.4813 2.12449 12.8353 2.48463 12.9119L8.35352 14.1593C8.71366 14.2359 9.06767 14.006 9.14422 13.6458L10.9461 5.16855C11.0227 4.80841 10.7928 4.4544 10.4326 4.37785L8.47634 3.96202M6.52004 3.5462L6.79726 2.242C6.87381 1.88186 7.22782 1.65196 7.58797 1.72851L8.24006 1.86712C8.60021 1.94367 8.83011 2.29768 8.75355 2.65783L8.47634 3.96202M6.52004 3.5462L8.47634 3.96202M5.43165 7.06344L6.45863 8.64485M6.45863 8.64485L7.48561 10.2263M6.45863 8.64485L8.04005 7.61787M6.45863 8.64485L4.87722 9.67183"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M10.9 2.83002H10.91M12.5 3.83002H12.51M12.5 1.83002H12.51M14.1 0.830017H14.11M14.1 2.83002H14.11M14.1 4.83002H14.11"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
