<script lang="ts">
  import AcpRegistryAgentIcon from "../RegistryAgentIcon.svelte";

  interface Props {
    label?: string;
    claudeIconUrl?: string;
    codexIconUrl?: string;
    onSetup: () => void;
  }

  let { label = "set up another agent", claudeIconUrl, codexIconUrl, onSetup }: Props = $props();
</script>

<button
  type="button"
  aria-label="Set up another agent"
  class="dropzone border-psx-foreground-tertiary/50 bg-psx-editor-background/30 text-psx-foreground-primary hover:text-psx-vibrant outline-hidden hover:border-psx-vibrant/50 focus-visible:border-psx-vibrant/50 mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed px-5 py-5 text-sm transition-[transform,border-color] duration-200 focus-visible:outline-2"
  onclick={onSetup}
>
  <span class="relative flex h-8 items-center justify-center" aria-hidden="true">
    <span
      class="chip chip-back bg-psx-panel shadow-xs flex size-8 items-center justify-center rounded-lg outline outline-1 outline-black/5 dark:outline-white/20"
    >
      <AcpRegistryAgentIcon
        iconUrl={codexIconUrl}
        size={18}
        fallback="sparkles"
        class="text-psx-foreground-primary"
      />
    </span>
    <span
      class="chip chip-front bg-psx-panel shadow-xs relative z-10 -ml-2.5 flex size-8 items-center justify-center rounded-lg outline outline-1 outline-black/5 dark:outline-white/20"
    >
      <AcpRegistryAgentIcon
        iconUrl={claudeIconUrl}
        size={18}
        fallback="sparkles"
        class="text-[#d97757]"
      />
    </span>
  </span>
  <span class="text-sm">
    {label}
  </span>
</button>

<style lang="postcss">
  @reference "#tailwind.css";

  .dropzone:active {
    transform: translateY(1px);
  }

  .chip {
    transition:
      transform 220ms cubic-bezier(0.2, 0.7, 0.2, 1),
      box-shadow 220ms cubic-bezier(0.2, 0.7, 0.2, 1);
    will-change: transform, box-shadow;
  }

  /* At rest the chips already sit slightly fanned. */
  .chip-back {
    transform: rotate(-5deg);
  }

  .chip-front {
    transform: rotate(5deg);
  }

  /* On hover the fan opens further — the left one drifts left, the right one right —
     lifting up a touch and scaling up with a wider shadow, so they read as coming
     off the page. */
  .dropzone:is(:hover, :focus-visible) .chip-back {
    transform: translate(-4px, -4px) rotate(-7deg) scale(1.06);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .dropzone:is(:hover, :focus-visible) .chip-front {
    transform: translate(5px, -5px) rotate(7deg) scale(1.07);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.11);
  }

  @media (prefers-reduced-motion: reduce) {
    .chip {
      transition: none !important;
    }

    /* Keep the resting fan but do not move on hover. */
    .dropzone:is(:hover, :focus-visible) .chip-back {
      transform: rotate(-5deg);
    }

    .dropzone:is(:hover, :focus-visible) .chip-front {
      transform: rotate(5deg);
    }
  }
</style>
