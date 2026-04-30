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
    d="M6.89077 1.97379V5.04485M9.72409 4.5L7.07067 1.84659C6.95548 1.7314 6.79926 1.66669 6.63636 1.66669H2.28419C1.94497 1.66669 1.66998 1.94168 1.66998 2.2809V12.7225C1.66998 13.0617 1.94497 13.3367 2.28419 13.3367H6.27656"
    stroke="currentColor"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M14.3367 9.50169C14.3367 12.172 12.172 14.3367 9.50169 14.3367C6.83139 14.3367 4.66669 12.172 4.66669 9.50169C4.66669 6.83139 6.83139 4.66669 9.50169 4.66669C12.172 4.66669 14.3367 6.83139 14.3367 9.50169Z"
    stroke="currentColor"
    stroke-linejoin="round"
    stroke-width={weight}
  />
  <path
    d="M10.8534 7.83754L8.76437 8.40727C8.59051 8.45469 8.45469 8.59051 8.40727 8.76437L7.83755 10.8534C7.78574 11.0433 7.96004 11.2176 8.15001 11.1658L10.239 10.5961C10.4129 10.5487 10.5487 10.4129 10.5961 10.239L11.1658 8.15001C11.2176 7.96004 11.0433 7.78574 10.8534 7.83754Z"
    stroke="currentColor"
    stroke-linejoin="round"
    stroke-width={weight}
  />
</svg>
