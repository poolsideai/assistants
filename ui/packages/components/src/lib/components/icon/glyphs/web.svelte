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
    d="M14.3334 7.99984C14.3334 11.4976 11.4979 14.3332 8.00008 14.3332C4.50228 14.3332 1.66675 11.4976 1.66675 7.99984C1.66675 4.50203 4.50228 1.6665 8.00008 1.6665C11.4979 1.6665 14.3334 4.50203 14.3334 7.99984Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M9.77064 5.81999L7.03428 6.56627C6.80654 6.62838 6.62862 6.80629 6.56651 7.03403L5.82023 9.77039C5.75237 10.0192 5.98069 10.2475 6.22953 10.1797L8.96589 9.43341C9.19362 9.37129 9.37154 9.19338 9.43365 8.96564L10.1799 6.22928C10.2478 5.98045 10.0195 5.75213 9.77064 5.81999Z"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
