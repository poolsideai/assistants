__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /** Brand tint (a CSS colour) for the logo glyph; defaults to the neutral foreground. */
    tint?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let { iconUrl, label = "Working...", size = 22, tint }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let logoStyle = $derived(
    tint
      ? `--mask: ${maskValue}; --logo-base: color-mix(in srgb, ${tint} 55%, transparent); --logo-peak: ${tint}`
      : `--mask: ${maskValue}`,
  );
  let indicatorWidth = $state(0);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    bind:clientWidth={indicatorWidth}
    style={`--sz: ${size}px; --indicator-w: ${indicatorWidth}px; ${logoStyle}`}
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    --shimmer-duration: 3.4s;
    --shimmer-easing: cubic-bezier(0.32, 0, 0.18, 1);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    white-space: nowrap;
__POOL_SYNTHETIC_IMPORT_BASELINE__

  .shimmer-text-peak {
    color: var(--peak);
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  .shimmer-text-peak::before,
  .combo-content-peak .combo-text::before {
    content: attr(data-label);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    --shimmer-duration: 2.8s;
    --shimmer-easing: cubic-bezier(0.32, 0, 0.18, 1);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    display: inline-block;
  }

  .combo-content {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    white-space: nowrap;
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    background-color: var(--logo-base, var(--base));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  .combo-content-peak .combo-logo {
    background-color: var(--logo-peak, var(--peak));
  }

  .combo-content-peak .combo-text {
    color: var(--peak);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    .shimmer-window {
      display: none;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
