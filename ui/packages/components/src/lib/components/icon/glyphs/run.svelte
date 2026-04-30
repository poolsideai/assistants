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
    d="M13.5797 7.14364L5.18301 2.08095C4.51653 1.6791 3.66666 2.15908 3.66666 2.93734V13.0627C3.66666 13.841 4.51652 14.3209 5.18301 13.9191L13.5797 8.8564C14.2245 8.46758 14.2245 7.53246 13.5797 7.14364Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
