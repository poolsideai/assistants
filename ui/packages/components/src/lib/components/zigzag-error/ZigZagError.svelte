<script lang="ts" module>
  import type { HTMLAttributes } from "svelte/elements";

  export type ZigZagErrorVariant = "error" | "interrupted";
  export type ZigZagErrorTheme = "app" | "web";

  export interface ZigZagErrorProps extends HTMLAttributes<HTMLDivElement> {
    message: string;
    variant?: ZigZagErrorVariant;
    theme?: ZigZagErrorTheme;
    title?: string;
  }
</script>

<script lang="ts">
  import Icon from "../icon/Icon.svelte";

  let {
    message,
    variant = "error",
    theme = "app",
    title,
    class: className,
    ...rest
  }: ZigZagErrorProps = $props();

  // Per-instance, per-mount id so multiple ZigZagErrors on the page don't share an SVG <pattern> def.
  const patternId = `zigzag-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
</script>

<div
  data-testid="zigzag-error"
  {...rest}
  class={[
    "zigzag-error relative mt-px flex items-baseline gap-1 pt-6 pb-2 text-left leading-[1.25]",
    theme === "web" ? "text-(--color-mono-700)" : "text-psx-foreground-secondary",
    className,
  ]}
  data-theme={theme}
>
  <svg
    class="zigzag-line absolute top-1 left-0 h-[5px] w-full"
    style:color={theme === "web"
      ? "var(--color-mono-300, #ececeb)"
      : "var(--psx-foreground-tertiary)"}
    aria-hidden="true"
  >
    <defs>
      <pattern id={patternId} width="9" height="5" patternUnits="userSpaceOnUse">
        <path d="M0 5 L4.5 0.5 L9 5" fill="none" stroke="currentColor" stroke-width="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
  </svg>
  <span class="relative top-[3px] shrink-0">
    <Icon aria-hidden="true" name={variant === "interrupted" ? "stop" : "error"} weight={1} />
  </span>
  <span {title}>{message}</span>
</div>

<style>
  .zigzag-error[data-theme="web"] .zigzag-line {
    mask-image: linear-gradient(
      to right,
      transparent,
      black 6px,
      black calc(100% - 6px),
      transparent
    );
  }
</style>
