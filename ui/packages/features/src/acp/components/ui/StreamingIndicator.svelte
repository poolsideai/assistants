<script lang="ts">
  interface Props {
    /** Active agent registry icon URL. Without it, the indicator renders text-only. */
    iconUrl?: string;
    label?: string;
    /** Logo glyph size in px. */
    size?: number;
    /** Brand tint (a CSS colour) for the logo glyph; defaults to the neutral foreground. */
    tint?: string;
  }

  let { iconUrl, label = "Working...", size = 22, tint }: Props = $props();

  let maskValue = $derived(iconUrl ? `url("${iconUrl}")` : undefined);
  let logoStyle = $derived(
    tint
      ? `--mask: ${maskValue}; --logo-base: color-mix(in srgb, ${tint} 55%, transparent); --logo-peak: ${tint}`
      : `--mask: ${maskValue}`,
  );
  let indicatorWidth = $state(0);
</script>

{#if maskValue}
  <span
    class="indicator combo"
    role="status"
    aria-label={label}
    bind:clientWidth={indicatorWidth}
    style={`--sz: ${size}px; --indicator-w: ${indicatorWidth}px; ${logoStyle}`}
  >
    <span class="combo-content" aria-hidden="true">
      <span class="combo-logo"></span>
      <span class="combo-text">{label}</span>
    </span>
    <span class="shimmer-window" aria-hidden="true">
      <span class="shimmer-counter combo-content combo-content-peak">
        <span class="combo-logo"></span>
        <span class="combo-text" data-label={label}></span>
      </span>
    </span>
  </span>
{:else}
  <span
    class="indicator shimmer-text"
    role="status"
    aria-label={label}
    bind:clientWidth={indicatorWidth}
    style={`--indicator-w: ${indicatorWidth}px`}
  >
    <span aria-hidden="true">{label}</span>
    <span class="shimmer-window" aria-hidden="true">
      <span class="shimmer-counter shimmer-text-peak" data-label={label}></span>
    </span>
  </span>
{/if}

<style lang="postcss">
  .indicator {
    --base: color-mix(in srgb, var(--psx-foreground-primary) 45%, transparent);
    --peak: var(--psx-foreground-primary);
    --band: calc(var(--sz, 22px) * 0.95);
    --travel: calc(var(--indicator-w, 140px) + var(--band));
    position: relative;
  }

  /*
   * Keep every painted pixel fixed and move only this feathered clipping window.
   * The duplicate content moves by the exact inverse transform, so it stays aligned
   * with the base while the compositor reveals a narrow highlight across it.
   */
  .shimmer-window {
    position: absolute;
    inset-block: 0;
    left: calc(-1 * var(--band));
    width: var(--band);
    overflow: hidden;
    pointer-events: none;
    -webkit-mask-image: linear-gradient(90deg, transparent, black 45%, black 55%, transparent);
    mask-image: linear-gradient(90deg, transparent, black 45%, black 55%, transparent);
    will-change: transform;
    animation: shimmer-window-travel var(--shimmer-duration) var(--shimmer-easing) infinite;
  }

  .shimmer-counter {
    position: absolute;
    top: 0;
    left: var(--band);
    width: var(--indicator-w);
    will-change: transform;
    animation: shimmer-content-counter-travel var(--shimmer-duration) var(--shimmer-easing) infinite;
  }

  @keyframes shimmer-window-travel {
    0%,
    18% {
      transform: translate3d(0, 0, 0);
    }
    78%,
    100% {
      transform: translate3d(var(--travel), 0, 0);
    }
  }

  @keyframes shimmer-content-counter-travel {
    0%,
    18% {
      transform: translate3d(0, 0, 0);
    }
    78%,
    100% {
      transform: translate3d(calc(-1 * var(--travel)), 0, 0);
    }
  }

  .shimmer-text {
    --shimmer-duration: 3.4s;
    --shimmer-easing: cubic-bezier(0.32, 0, 0.18, 1);
    display: inline-block;
    color: var(--psx-foreground-tertiary);
    font-size: 0.8125rem;
    font-weight: 450;
    line-height: 1.2;
    white-space: nowrap;
  }

  .shimmer-text-peak {
    color: var(--peak);
    white-space: nowrap;
  }

  .shimmer-text-peak::before,
  .combo-content-peak .combo-text::before {
    content: attr(data-label);
  }

  .combo {
    --shimmer-duration: 2.8s;
    --shimmer-easing: cubic-bezier(0.32, 0, 0.18, 1);
    --logo: calc(var(--sz, 22px) * 0.72);
    --gap: calc(var(--sz, 22px) * 0.34);
    display: inline-block;
  }

  .combo-content {
    display: inline-flex;
    align-items: center;
    gap: var(--gap);
    white-space: nowrap;
  }

  .combo-logo {
    display: inline-block;
    width: var(--logo);
    height: var(--logo);
    flex: none;
    -webkit-mask: var(--mask) center / contain no-repeat;
    mask: var(--mask) center / contain no-repeat;
    background-color: var(--logo-base, var(--base));
  }

  .combo-text {
    display: inline-block;
    height: var(--logo);
    line-height: var(--logo);
    color: var(--base);
    font-size: calc(var(--sz, 22px) * 0.56);
    font-weight: 450;
  }

  .combo-content-peak .combo-logo {
    background-color: var(--logo-peak, var(--peak));
  }

  .combo-content-peak .combo-text {
    color: var(--peak);
  }

  @media (prefers-reduced-motion: reduce) {
    .shimmer-window {
      display: none;
    }
  }
</style>
