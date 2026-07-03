<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    /** Small pill rendered after the title, e.g. "Experimental". */
    pill?: string;
    subtitle?: string | Snippet;
    subtitleClass?: string;
    children?: Snippet;
    class?: string;
  }

  let {
    title,
    pill,
    subtitle,
    subtitleClass = "",
    children,
    class: className = "",
  }: Props = $props();
</script>

<section class={["settings-section", className]}>
  <header class="settings-section-header">
    <div class="flex items-center gap-1.5">
      <h2 class="settings-section-title">{title}</h2>
      {#if pill}
        <span
          class="bg-psx-chrome-hover text-psx-foreground-secondary shrink-0 rounded-full px-1.5 py-px text-[10px]/[14px]"
        >
          {pill}
        </span>
      {/if}
    </div>
    {#if typeof subtitle === "string"}
      <p class={["settings-section-subtitle", subtitleClass]}>{subtitle}</p>
    {:else if subtitle}
      <p class={["settings-section-subtitle", subtitleClass]}>{@render subtitle()}</p>
    {/if}
  </header>
  <div class="settings-section-content">
    {@render children?.()}
  </div>
</section>

<style lang="postcss">
  :global(.settings-section-stack) {
    display: flex;
    box-sizing: border-box;
    min-width: 0;
    min-height: 100%;
    flex-direction: column;
    gap: 12px;
    padding: var(--desktop-splits-shadow-gutter, 6px)
      var(--settings-section-stack-inline-padding, 6px);
  }

  :global(.ide-agent-settings-section-stack) {
    gap: 20px;
    padding: 12px;
  }

  :global(.ide-agent-settings-section-stack) .settings-section {
    overflow: visible;
    outline: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  :global(.ide-agent-settings-section-stack) .settings-section-header {
    border-bottom: 0;
    border-radius: 8px;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--psx-chrome) 70%, transparent);
  }

  :global(.vscode-dark) :global(.ide-agent-settings-section-stack) .settings-section-header {
    border-bottom: 0;
    background: var(--psx-chrome);
  }

  :global(.ide-agent-settings-section-stack) .settings-section-content {
    min-width: 0;
  }

  .settings-section {
    --settings-section-border-color: color-mix(in srgb, var(--psx-border) 80%, transparent);

    min-width: 0;
    overflow: hidden;
    outline: 1px solid var(--settings-section-border-color);
    border-radius: var(--desktop-main-panel-radius, 10px);
    background: var(--psx-editor-background);
    box-shadow: var(
      --desktop-splits-pane-shadow,
      0px 1.3px 4.5px rgba(0, 0, 0, 0.04),
      0px 0.4px 1.3px rgba(0, 0, 0, 0.04)
    );
  }

  :global(.vscode-dark) .settings-section {
    --settings-section-border-color: color-mix(in srgb, white 10%, transparent);
  }

  .settings-section-header {
    background: color-mix(in srgb, var(--psx-chrome) 70%, transparent);
    border-bottom: 1px solid color-mix(in srgb, var(--psx-border) 64%, transparent);
    padding: 9px 12px 8px;
  }

  :global(.vscode-dark) .settings-section-header {
    background-color: var(--psx-chrome);
    border-bottom: 1px solid color-mix(in srgb, var(--psx-border) 90%, white);
  }

  .settings-section-title {
    color: var(--psx-foreground-primary);
    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
  }

  .settings-section-subtitle {
    color: var(--psx-foreground-secondary);
    font-size: 12px;
    line-height: 18px;
  }

  .settings-section-content {
    min-width: 0;
  }
</style>
