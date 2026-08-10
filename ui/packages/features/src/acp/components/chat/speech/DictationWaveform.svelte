<script lang="ts">
  import { onMount } from "svelte";
  import { voiceInputStore } from "./voiceInputStore.svelte";

  interface Props {
    /** Level/clock sources are injectable for stories; default to the mic. */
    readLevel?: () => number;
    readStartedAt?: () => number | null;
  }

  let {
    readLevel = () => voiceInputStore.inputLevel(),
    readStartedAt = () => voiceInputStore.recordingStartedAt,
  }: Props = $props();

  /** One bar per sample; matches the recorder's ~64ms analyser window. */
  const SAMPLE_INTERVAL_MS = 80;
  /** Enough bars to fill the widest prompt; older ones scroll out of view. */
  const MAX_BARS = 120;

  let levels = $state<number[]>([]);
  let elapsedMs = $state(0);

  onMount(() => {
    const timer = setInterval(() => {
      // Speech RMS rarely exceeds ~0.25; the square root stretches quiet
      // levels so normal speaking volume visibly moves the bars.
      const height = Math.min(1, Math.sqrt(readLevel()) * 2.2);
      levels = [...levels.slice(-(MAX_BARS - 1)), height];
      const startedAt = readStartedAt();
      if (startedAt != null) elapsedMs = performance.now() - startedAt;
    }, SAMPLE_INTERVAL_MS);
    return () => clearInterval(timer);
  });

  let timeLabel = $derived.by(() => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  });
</script>

<div
  class="text-psx-foreground-primary flex min-w-0 flex-1 items-center gap-3 pl-2"
  role="status"
  aria-label="Recording"
  data-testid="dictation-waveform"
>
  <div class="bars" aria-hidden="true">
    {#each levels as level}
      <span class="bar" style="height: {Math.max(10, Math.round(level * 100))}%"></span>
    {/each}
  </div>
  <span class="text-psx-foreground-secondary text-xs tabular-nums">{timeLabel}</span>
</div>

<style lang="postcss">
  .bars {
    position: relative;
    display: flex;
    flex: 1;
    min-width: 0;
    height: 20px;
    align-items: center;
    justify-content: flex-end;
    gap: 2px;
    overflow: hidden;
  }

  /* Dotted idle track the bars advance over, like a voice-memo timeline. */
  .bars::before {
    content: "";
    position: absolute;
    inset: 0;
    margin: auto 0;
    height: 1px;
    background-image: repeating-linear-gradient(to right, currentColor 0 2px, transparent 2px 6px);
    opacity: 0.25;
  }

  .bar {
    position: relative;
    flex: 0 0 2px;
    border-radius: 1px;
    background: currentColor;
  }
</style>
