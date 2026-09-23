__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { onMount } from "svelte";
  import spriteUrl from "./streaming-sequence-loader-sprite.webp";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const SPRITE_UNIQUE_FRAMES = 321;
  const SPRITE_TOTAL_FRAMES = SPRITE_UNIQUE_FRAMES + 1;
  const SPRITE_DURATION_MS = 21400;
  const FRAME_INTERVAL_MS = SPRITE_DURATION_MS / SPRITE_UNIQUE_FRAMES;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let { size = 16, ariaLabel = "Working" }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
  const spriteWidth = $derived(size * SPRITE_TOTAL_FRAMES);
  let spriteElement: HTMLSpanElement;
  let playing = $state(false);

  onMount(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const stop = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };
    const schedule = () => {
      stop();
      timer = setTimeout(advanceFrame, FRAME_INTERVAL_MS);
    };
    const advanceFrame = () => {
      frame = (frame + 1) % SPRITE_UNIQUE_FRAMES;
      spriteElement.style.transform = `translate3d(${-frame * size}px, 0, 0)`;
      schedule();
    };
    const syncPlayback = () => {
      stop();
      playing = !reducedMotion.matches;
      if (playing) schedule();
    };

    reducedMotion.addEventListener("change", syncPlayback);
    syncPlayback();

    return () => {
      stop();
      reducedMotion.removeEventListener("change", syncPlayback);
    };
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
<span
  class="streaming-sequence-loader"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  data-playing={playing}
  style={`--streaming-sequence-size: ${size}px; --streaming-sequence-width: ${spriteWidth}px;`}
>
  <span
    bind:this={spriteElement}
    class="streaming-sequence-loader-sprite"
    aria-hidden="true"
    style={`--streaming-sequence-url: url("${spriteUrl}");`}
  ></span>
</span>

<style lang="postcss">
  .streaming-sequence-loader {
    display: inline-block;
    width: var(--streaming-sequence-size);
    height: var(--streaming-sequence-size);
    overflow: hidden;
    flex: none;
  }

  .streaming-sequence-loader-sprite {
    display: block;
    width: var(--streaming-sequence-width);
    height: var(--streaming-sequence-size);
    background-image: var(--streaming-sequence-url);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    transform: translate3d(0, 0, 0);
  }

  .streaming-sequence-loader[data-playing="true"] .streaming-sequence-loader-sprite {
    will-change: transform;
  }
</style>
