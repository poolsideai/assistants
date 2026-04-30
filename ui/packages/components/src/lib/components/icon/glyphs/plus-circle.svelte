<script lang="ts">
  import type { SVGAttributes } from "svelte/elements";

  interface Props extends SVGAttributes<SVGSVGElement> {
    size?: number;
    weight?: number;
    gradient?: boolean;
  }

  let { size = 16, weight = 1, gradient, ...rest }: Props = $props();
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
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM8.625 4.5C8.625 4.15482 8.34518 3.875 8 3.875C7.65482 3.875 7.375 4.15482 7.375 4.5V7.375H4.5C4.15482 7.375 3.875 7.65482 3.875 8C3.875 8.34518 4.15482 8.625 4.5 8.625H7.375V11.5C7.375 11.8452 7.65482 12.125 8 12.125C8.34518 12.125 8.625 11.8452 8.625 11.5V8.625H11.5C11.8452 8.625 12.125 8.34518 12.125 8C12.125 7.65482 11.8452 7.375 11.5 7.375H8.625V4.5Z"
    fill={gradient ? "url(#grad)" : "currentColor"}
    stroke-width={weight}
  />
  {#if gradient}
    <defs>
      <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
        <stop class="stop-1" offset="23.12%" />
        <stop offset="112.19%" class="stop-2" />
      </linearGradient>
    </defs>
  {/if}
</svg>

<style lang="postcss">
  .stop-1 {
    stop-color: #9385ff;

    :global(.psx-dark) & {
      stop-color: #c1acff;
    }
  }

  .stop-2 {
    stop-color: #3b54fc;

    :global(.psx-dark) & {
      stop-color: #618cff;
    }
  }
</style>
