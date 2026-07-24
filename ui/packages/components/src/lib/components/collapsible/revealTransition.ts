import { cubicOut } from "svelte/easing";

export function revealTransition(
  node: HTMLElement,
  _params: unknown,
  options: { direction?: string } = {},
) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    return { duration: 0 };
  }

  const height = node.offsetHeight;
  const opacity = Number.parseFloat(getComputedStyle(node).opacity);
  const duration = options.direction === "out" ? 120 : 160;

  return {
    duration,
    easing: cubicOut,
    css: (t: number) => `
      height: ${t * height}px;
      opacity: ${Math.min(t * 1.15, 1) * opacity};
      overflow: hidden;
      transform: translateY(${(1 - t) * -2}px);
      will-change: height, opacity, transform;
    `,
  };
}
