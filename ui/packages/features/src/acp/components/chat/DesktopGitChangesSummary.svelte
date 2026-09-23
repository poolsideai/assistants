__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   * Git-backed repository summary at the bottom of a desktop conversation.
__POOL_SYNTHETIC_IMPORT_BASELINE__
   * pane) — no task/version system involvement. The branch button opens the
   * files sidebar in its changes (review) view, while the diff-stat badges
   * open the Diff tab. Action names are exposed as tooltips rather than
   * visible labels:
   * [icon] branch › upstream ............................... [+n][-n]
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /** Total added lines vs HEAD, with untracked text files as full additions. */
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /** Match the translucent sidebar popover when floating over the desktop transcript. */
    desktop?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let {
    files,
    additions,
    deletions,
    branch,
    upstream,
    desktop = false,
    onReview,
    onOpenDiff,
  }: Props = $props();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
<div
  data-testid="desktop-git-changes-summary"
  class={[
    "@container flex h-8 w-full items-center gap-2 rounded-lg px-2 text-left text-[12px] outline-[length:var(--psx-hairline,1px)] -outline-offset-1 outline-black/10 dark:outline-white/15",
    desktop ? "desktop-tinted-glass backdrop-blur-sm" : "bg-psx-menu-hover-background",
  ]}
  transition:slide={{ duration: 180, easing: cubicInOut }}
>
  <button
    type="button"
    class="changes-summary-branch-button"
    title="Stage and Commit..."
    style:cursor="default"
    onclick={() => onReview()}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if branch}
      <GitBranchTrackingLabel {branch} {upstream} />
    {:else}
      <Icon name="git-branch" size={12} aria-hidden="true" class="shrink-0" />
    {/if}
  </button>
  {#if files > 0 && (additions > 0 || deletions > 0)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      style:cursor="default"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      <DiffLineCount count={additions} type="addition" size="xs" />
      <DiffLineCount count={deletions} type="deletion" size="xs" />
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {/if}
</div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  .desktop-tinted-glass {
    background: color-mix(in srgb, var(--psx-menu-hover-background) 70%, transparent);
  }

  /* Keep both hover pills on the same 24px box. Diff badges use `bleed-y`,
     which otherwise collapses their button below the branch button's height
     even when both buttons declare the same padding. */
  .changes-summary-branch-button,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    box-sizing: border-box;
    height: 24px;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  .changes-summary-branch-button:hover,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /* The visible branch name is the Stage and Commit affordance. The action
     name stays in the tooltip so the compact bar only shows repository state. */
  .changes-summary-branch-button {
    --git-branch-cursor: default;

    flex: 0 1 auto;
    min-width: 0;
    margin-left: -4px;
    overflow: hidden;
  }

  /* Diff stats stay right-aligned and retain the existing Review Diff action. */
  .changes-summary-diff-stats {
    flex-shrink: 0;
    gap: 4px;
    margin-right: -4px;
    margin-left: auto;
    font-size: 10px;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
