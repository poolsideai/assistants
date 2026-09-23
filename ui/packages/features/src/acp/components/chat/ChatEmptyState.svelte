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
    showHeader?: boolean;
    adjacentHeaderControls?: boolean;
    /** Use intrinsic heights so the parent can center the complete new-conversation stack. */
    centeredLayout?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /** Hidden on desktop, which paints its own pane-wide grid backdrop behind this component. */
    showGrid?: boolean;
    /** Desktop hero treatment: taller stage with the parasol centred in it and rendered larger. */
    hero?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    showHeader = true,
    adjacentHeaderControls = false,
    centeredLayout = false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    showGrid = true,
    hero = false,
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  // mb-8 mirrors the composer's gap below the "Start a new conversation"
  // header so the header gets equal breathing room on both sides. It lives at
  // the bottom of the scrolled-away side, so a squeezed pane reclaims it
  // before cropping the logo itself. The hero stage is taller so the
  // (centred) parasol sits in the middle of the pane-wide grid rather than
  // hugging the header.
  const centeredStageClass = $derived(
    hero
      ? "mb-8 h-[min(44dvh,26rem)] min-h-48 shrink-0"
      : "mb-8 h-[min(32dvh,18rem)] min-h-40 shrink-0",
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
<div
  data-centered-layout={centeredLayout}
  class={["@container relative flex w-full flex-col", centeredLayout ? "shrink-0" : "h-full"]}
>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      compact
        ? centeredLayout
          ? "h-44 shrink-0"
          : "mt-4 h-44 shrink-0"
        : centeredLayout
          ? centeredStageClass
          : "mt-11 h-2/5",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if showGrid}
      <div
        aria-hidden="true"
        class={["grid-background absolute inset-0", compact || centeredLayout ? "" : "-top-11"]}
      ></div>
    {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      class={[
        "absolute inset-0 flex h-full items-center justify-center",
        compact || centeredLayout ? "" : "-top-11",
      ]}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {#if hero}
        <InteractiveLogo centerModel modelScale={1.4} />
      {:else}
        <InteractiveLogo />
      {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {#if showHeader}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      class={[
        "mx-auto flex w-full max-w-[48rem] items-start justify-center px-4",
        compact ? "pb-4 pt-2" : centeredLayout ? "pb-4" : "pb-8 pt-4",
      ]}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="grid w-full auto-cols-fr items-start justify-center gap-4 overflow-visible"
        onpointerdown={keepComposerFocused}
      >
__POOL_SYNTHETIC_IMPORT_BASELINE__
          class={[
            "mx-auto flex w-full items-start",
            adjacentHeaderControls ? "max-w-full justify-center" : "max-w-sm justify-start",
          ]}
__POOL_SYNTHETIC_IMPORT_BASELINE__
          <div
            class={[
              "flex min-w-0 flex-row",
              adjacentHeaderControls
                ? "w-fit max-w-full flex-wrap items-center justify-center gap-[3px]"
                : "w-full items-center justify-between gap-2",
            ]}
            data-testid="empty-state-container"
          >
            <span class="text-psx-foreground-secondary shrink-0 text-lg font-medium leading-tight">
              {title}
            </span>
            {@render headerControls?.()}
          </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <div class="flex w-full max-w-full flex-col items-center justify-center gap-3 text-center">
          <div class="relative flex w-full flex-col items-center gap-2">
            {#if showLeadingControls}
              <div
                class="border-psx-input-border/75 dark:border-psx-button-secondary-border/50 bg-psx-editor-background/25 flex w-full max-w-sm flex-col gap-2 overflow-hidden rounded-lg border p-2.5 text-left"
              >
                {@render leadingControls?.()}
              </div>
            {/if}
            <div class="w-full max-w-sm text-left">
              {@render afterControls?.()}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  .grid-background {
    --fade-start: 75%;
    /* line color themed per light/dark via --psx-grid-line-color */
    background-image:
      linear-gradient(to right, var(--psx-grid-line-color) 1px, transparent 1px),
      linear-gradient(to bottom, var(--psx-grid-line-color) 1px, transparent 1px);
    background-size: 15px 15px;
    background-position: center;

    mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 5%,
      black var(--fade-start),
      transparent 100%
    );
    -webkit-mask-image: linear-gradient(
      to bottom,
      transparent 0%,
      black 5%,
      black var(--fade-start),
      transparent 100%
    );
  }

  :global(body.vscode-high-contrast) .grid-background,
  :global(body.vscode-high-contrast-light) .grid-background {
    background-image: none;
    mask-image: none;
    -webkit-mask-image: none;
  }
__POOL_SYNTHETIC_IMPORT_BASELINE__
