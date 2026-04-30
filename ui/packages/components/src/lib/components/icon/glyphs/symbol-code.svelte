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
    d="M8.00004 8V14.375M8.00004 8L13.6666 4.81252M8.00004 8L2.33325 4.81252M7.67308 1.80885L2.67308 4.62135C2.46316 4.73943 2.33325 4.96155 2.33325 5.2024V10.7976C2.33325 11.0385 2.46316 11.2606 2.67308 11.3787L7.67308 14.1912C7.87602 14.3053 8.12382 14.3053 8.32676 14.1912L13.3268 11.3787C13.5367 11.2606 13.6666 11.0385 13.6666 10.7976V5.2024C13.6666 4.96155 13.5367 4.73943 13.3268 4.62135L8.32676 1.80885C8.12382 1.6947 7.87602 1.6947 7.67308 1.80885Z"
    stroke="currentColor"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
