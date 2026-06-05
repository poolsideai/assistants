<script lang="ts">
  interface Props {
    size?: number;
    color?: string;
    usedTokens?: number | null;
    totalTokens?: number | null;
  }

  let {
    size = 16,
    color = "currentColor",
    usedTokens = null,
    totalTokens = null,
  }: Props = $props();

  const strokeWidth = 2.4;
  const viewBox = 16;
  const center = viewBox / 2;
  const radius = (viewBox - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const ratio = $derived.by(() => {
    if (
      typeof usedTokens !== "number" ||
      !Number.isFinite(usedTokens) ||
      typeof totalTokens !== "number" ||
      !Number.isFinite(totalTokens) ||
      totalTokens <= 0
    ) {
      return 0;
    }

    return Math.min(1, Math.max(0, usedTokens / totalTokens));
  });

  const dashOffset = $derived(circumference * (1 - ratio));
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 {viewBox} {viewBox}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <circle
    cx={center}
    cy={center}
    r={radius}
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-opacity="0.1"
  />

  {#if ratio > 0}
    <circle
      cx={center}
      cy={center}
      r={radius}
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashOffset}
      transform="rotate(-90 {center} {center})"
    />
  {/if}
</svg>
