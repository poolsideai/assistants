<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import DictationWaveform from "./DictationWaveform.svelte";

  const { Story } = defineMeta({
    component: DictationWaveform,
  });

  const startedAt = performance.now();

  /** Synthetic speech: syllable-rate bursts separated by short silences. */
  function speechLevel(): number {
    const t = (performance.now() - startedAt) / 1000;
    const talking = Math.sin(t * 0.9) > -0.4 ? 1 : 0;
    const syllable = (Math.sin(t * 18) + 1) / 2;
    const jitter = Math.random() * 0.3;
    return talking * (0.02 + 0.12 * syllable + 0.08 * jitter);
  }
</script>

<Story name="Recording" args={{ readLevel: speechLevel, readStartedAt: () => startedAt }} />

<Story name="Silence" args={{ readLevel: () => 0, readStartedAt: () => startedAt }} />
