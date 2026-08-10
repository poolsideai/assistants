<script lang="ts">
  // Phone-reception style bars used as effort icons: one bar per level, filled
  // up to the level being represented (0 = auto/none filled).
  interface Props {
    total: number;
    filled: number;
  }

  let { total, filled }: Props = $props();

  const BAR_W = 2;
  const GAP = 1.5;
  const HEIGHT = 12;
  const MIN_H = 4;

  const width = $derived(total * (BAR_W + GAP) - GAP);

  function barHeight(index: number): number {
    if (total <= 1) return HEIGHT;
    return MIN_H + ((HEIGHT - MIN_H) * index) / (total - 1);
  }
</script>

<svg
  {width}
  height={HEIGHT}
  viewBox="0 0 {width} {HEIGHT}"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class="shrink-0"
  aria-hidden="true"
>
  {#each Array.from({ length: total }) as _bar, index (index)}
    {@const h = barHeight(index)}
    <rect
      x={index * (BAR_W + GAP)}
      y={HEIGHT - h}
      width={BAR_W}
      height={h}
      rx={BAR_W / 2}
      fill="currentColor"
      opacity={index < filled ? 1 : 0.3}
    />
  {/each}
</svg>
