__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    poolsideGitDiffClose,
    poolsideGitDiffOpen,
    poolsideGitDiffStats,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    type GitDiffOpenOutput,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    type GitDiffStats as GitDiffStatsValue,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import { onDestroy, untrack } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import {
    DESKTOP_FILE_TREE_CHANGED_EVENT,
    DESKTOP_GIT_CHANGED_EVENT,
    type DesktopFileTreeChangedEventDetail,
  } from "../../features/DesktopGitChangesState.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  import DesktopDiffDocument from "./DesktopDiffDocument.svelte";
  import DesktopDiffEmptyState from "./DesktopDiffEmptyState.svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   * All-files git diff shown in the main zone's singleton Diff tab. File
   * summaries and bounded patch chunks stream into one virtual document, so
   * opening the tab never materializes the complete worktree patch.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  type DiffDocumentController = ReturnType<typeof DesktopDiffDocument>;
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    | { status: "unavailable"; gitMissing: boolean }
__POOL_SYNTHETIC_IMPORT_BASELINE__
    | { status: "ready"; diff: GitDiffOpenOutput }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

  /**
   * A mounted diff document. At most two exist at once: the displayed one
   * and — during a scope switch — a hidden incoming one that settles
   * off-screen and then replaces the displayed one in a single swap, so
   * updates never show a loading state over existing content. Silent
   * reloads don't add an entry at all; the newest entry adopts the new
   * sessionId in place (same scroll position, same rows, only genuinely
   * changed content re-renders).
   */
  interface DiffEntry {
    /** Identity for the keyed render — a new epoch mounts a new document. */
    epoch: number;
    diff: GitDiffOpenOutput;
    ref?: DiffDocumentController;
    /** Last collapsed-card count this document reported. */
    collapsedCount: number;
  }
  let diffEntries = $state<DiffEntry[]>([]);
  let displayedEpoch = $state(0);
  let documentEpoch = 0;
  // Session of an empty-diff result: no entry owns it, but the stats poll
  // still reads it, so it is closed on the next result or on destroy.
  let looseSessionId: string | undefined;
  const displayedDocument = $derived(
    diffEntries.find((entry) => entry.epoch === displayedEpoch)?.ref,
  );
  let diffStats = $state<GitDiffStatsValue>();
  let statsPollTimer: ReturnType<typeof setTimeout> | undefined;
  let fileRefreshTimer: ReturnType<typeof setTimeout> | undefined;
  const FILE_REFRESH_DEBOUNCE_MS = 750;
  // Collapsed-card count reported by the virtual document; drives the footer's
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Hides the body while the very first document (or a replacement after
  // an error/worktree change) settles behind the gate — the only time a
  // spinner shows. Updates over existing content (silent reloads, scope
  // switches) never fade: the old diff stays visible until the incoming
  // one is ready, then the swap is instant.
__POOL_SYNTHETIC_IMPORT_BASELINE__
  let visibleDiffStats = $derived(bodyFaded ? undefined : diffStats);
  let canToggleAll = $derived(
    diffState.status === "ready" && !bodyFaded && (visibleDiffStats?.files ?? 0) > 0,
  );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    if (!path) return;
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
  // Session the current diffStats were computed for: per-file stats are
  // only applied to the document mounted for that session — feeding an
  // outgoing scope's stats into the incoming document would seed wrong
  // badges and height estimates during the settle window.
  let diffStatsSessionId: string | undefined;

  function acceptStats(stats: GitDiffStatsValue, sessionId: string): void {
    diffStats = stats;
    diffStatsSessionId = sessionId;
    const entry = diffEntries.find((candidate) => candidate.diff.sessionId === sessionId);
    entry?.ref?.applyFileStats(stats.fileStats ?? []);
  }

  /** Closes every mounted document's session and unmounts them. */
  function closeAllEntries(): void {
    for (const entry of diffEntries) closeSession(entry.diff.sessionId);
    diffEntries = [];
    displayedEpoch = 0;
  }

  /** Takes ownership of a session no document entry owns (empty diffs). */
  function adoptLooseSession(sessionId: string | undefined): void {
    if (looseSessionId && looseSessionId !== sessionId) closeSession(looseSessionId);
    looseSessionId = sessionId;
  }

  async function load(options: { silent?: boolean; seamless?: boolean } = {}): Promise<void> {
    // Empty only transiently, while a stale tab's content is being torn down
    // (see desktopTabContent in DesktopSplitsPane): skip the doomed fetch.
    if (!worktreePath) return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // Seamless reloads (scope switches) keep the displayed diff fully
    // visible and interactive while the replacement settles off-screen;
    // silent reloads (a git mutation elsewhere invalidated this diff)
    // reconcile into the displayed document. Neither shows a loading
    // state. Everything else — initial load, worktree change, retry —
    // replaces the pane with a spinner because there is no valid content
    // to keep.
    const seamless = options.seamless && diffEntries.length > 0;
    if (!options.silent && !seamless) {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      diffStats = undefined;
      collapsedCount = 0;
      bodyFaded = false;
      closeAllEntries();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const result = await poolsideGitDiffOpen({
        path: worktreePath,
        scope,
        targetPath: relativePath,
      });
      if (token !== diffToken) {
        if (result.sessionId) closeSession(result.sessionId);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (result.unavailable) {
        diffState = { status: "unavailable", gitMissing: result.gitMissing ?? false };
        diffStats = undefined;
        collapsedCount = 0;
        bodyFaded = false;
        closeAllEntries();
        adoptLooseSession(undefined);
        return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if (result.stats) acceptStats(result.stats, result.sessionId);
      else scheduleStatsPoll(result.sessionId, token);

      const emptyDiff = result.complete && result.files.length === 0 && !result.target;
      if (emptyDiff) {
        // The static empty state replaces any mounted documents directly.
        closeAllEntries();
        adoptLooseSession(result.sessionId);
        if (!result.stats) diffStats = undefined;
        collapsedCount = 0;
        bodyFaded = false;
        return;
__POOL_SYNTHETIC_IMPORT_BASELINE__
      adoptLooseSession(undefined);

      const latest = diffEntries.at(-1);
      if (options.silent && latest) {
        // Adopt in place: the newest document (displayed, or an incoming
        // one still settling) reconciles the new session into its rows.
        const previousSession = latest.diff.sessionId;
        latest.diff = result;
        if (previousSession !== result.sessionId) closeSession(previousSession);
        return;
      }
      if (seamless) {
        // Replace any not-yet-settled incoming document, then mount the
        // new one hidden; handleEntryReady swaps it in when it settles.
        for (const entry of diffEntries) {
          if (entry.epoch !== displayedEpoch) closeSession(entry.diff.sessionId);
        }
        diffEntries = [
          ...diffEntries.filter((entry) => entry.epoch === displayedEpoch),
          { epoch: ++documentEpoch, diff: result, collapsedCount: 0 },
        ];
        return;
      }
      // Fresh pane (initial load, worktree change, retry, or a silent
      // reload arriving with nothing mounted): gate the document until it
      // settles so its first viewport streams at opacity 0 instead of
      // jumping headers around in front of the reader.
      const epoch = ++documentEpoch;
      diffEntries = [{ epoch, diff: result, collapsedCount: 0 }];
      displayedEpoch = epoch;
      collapsedCount = 0;
      consumedRevealToken = undefined;
      bodyFaded = true;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      if ((options.silent || seamless) && diffState.status === "ready") return;
      diffStats = undefined;
      collapsedCount = 0;
      bodyFaded = false;
      closeAllEntries();
      adoptLooseSession(undefined);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function scheduleStatsPoll(sessionId: string, token: number, delay = 50): void {
    if (statsPollTimer !== undefined) clearTimeout(statsPollTimer);
    statsPollTimer = setTimeout(async () => {
      statsPollTimer = undefined;
      try {
        const result = await poolsideGitDiffStats({ sessionId });
        if (token !== diffToken || diffState.status !== "ready") return;
        if (diffState.diff.sessionId !== sessionId) return;
        if (result.ready && result.stats) {
          acceptStats(result.stats, sessionId);
        } else {
          scheduleStatsPoll(sessionId, token, Math.min(1_000, delay * 2));
        }
      } catch {
        // Totals are supplementary; the diff remains usable if polling fails.
__POOL_SYNTHETIC_IMPORT_BASELINE__
    }, delay);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function closeSession(sessionId: string): void {
    void poolsideGitDiffClose({ sessionId }).catch(() => undefined);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /**
   * A mounted document's first viewport has settled. For the displayed
   * document this lifts the initial-load gate; for a hidden incoming one
   * it triggers the swap — the outgoing document unmounts and the settled
   * replacement becomes visible in the same frame, with no loading state
   * in between.
   */
  function handleEntryReady(epoch: number): void {
    const entry = diffEntries.find((candidate) => candidate.epoch === epoch);
    if (!entry) return;
    if (entry.epoch !== displayedEpoch) {
      for (const outgoing of diffEntries) {
        if (outgoing.epoch !== entry.epoch) closeSession(outgoing.diff.sessionId);
      }
      diffEntries = [entry];
      displayedEpoch = entry.epoch;
      collapsedCount = entry.collapsedCount;
      consumedRevealToken = undefined;
      bodyFaded = false;
      return;
    }
    // The displayed document settled — but if the user already switched
    // scopes while it was gated, keep the gate up rather than flashing the
    // abandoned scope; the newer entry's ready performs the reveal.
    if (diffEntries.at(-1)?.epoch === entry.epoch) bodyFaded = false;
  }

  onDestroy(() => {
    diffToken++;
    if (statsPollTimer !== undefined) clearTimeout(statsPollTimer);
    if (fileRefreshTimer !== undefined) clearTimeout(fileRefreshTimer);
    closeAllEntries();
    adoptLooseSession(undefined);
  });
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
    // Scope switches keep the current diff fully visible while the new
    // scope's document settles hidden, then swap it in — no loading state
    // over existing content, and no triple-mounted scopes.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    untrack(() => void load({ seamless: true }));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  // The reveal consumes one openToken per mounted document (reset by
  // non-silent loads): a silent reload swaps diffState but must not yank
  // the scroll position back to the requested file.
  let consumedRevealToken = $state<number | undefined>(undefined);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const token = openToken;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const mountedDocument = displayedDocument;
    if (!mountedDocument || consumedRevealToken === token) return;
    consumedRevealToken = token;
    void mountedDocument.revealFile(path);
  });

  $effect(() => {
    // Re-applies stats when the owning document (re)binds its ref — only
    // to the entry whose session produced them, never across scopes.
    const latest = diffEntries.at(-1);
    if (!latest || latest.diff.sessionId !== diffStatsSessionId) return;
    latest.ref?.applyFileStats(diffStats?.fileStats ?? []);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // In-app git actions refresh immediately. File-watcher events cover edits
    // made by the agent or an external editor; debounce those because one edit
    // often arrives as a burst of filesystem notifications.
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const onFileTreeChanged = (event: Event) => {
      const detail = (event as CustomEvent<DesktopFileTreeChangedEventDetail>).detail;
      if (!fileTreeChangeAffectsWorktree(detail)) return;
      scheduleFileRefresh();
    };
    const onWindowFocus = () => scheduleFileRefresh();
    window.addEventListener(DESKTOP_FILE_TREE_CHANGED_EVENT, onFileTreeChanged);
__POOL_SYNTHETIC_IMPORT_BASELINE__
    window.addEventListener("focus", onWindowFocus);
    return () => {
      window.removeEventListener(DESKTOP_FILE_TREE_CHANGED_EVENT, onFileTreeChanged);
      window.removeEventListener(DESKTOP_GIT_CHANGED_EVENT, onGitChanged);
      window.removeEventListener("focus", onWindowFocus);
    };
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  function scheduleFileRefresh(): void {
    if (fileRefreshTimer !== undefined) clearTimeout(fileRefreshTimer);
    fileRefreshTimer = setTimeout(() => {
      fileRefreshTimer = undefined;
      void load({ silent: true });
    }, FILE_REFRESH_DEBOUNCE_MS);
  }

  function fileTreeChangeAffectsWorktree(
    detail: DesktopFileTreeChangedEventDetail | undefined,
  ): boolean {
    const changes = detail?.changes;
    if (!changes || changes.length === 0) return true;
    const root = normalizePath(worktreePath);
    return changes.some((change) => {
      if (!change.path) return true;
      const changed = normalizePath(change.path);
      return changed === root || changed.startsWith(`${root}/`);
    });
  }

  function normalizePath(path: string): string {
    let normalized = path.trim().replace(/\\/g, "/").replace(/\/+/g, "/");
    if (normalized.length > 1) normalized = normalized.replace(/\/+$/g, "");
    if (/^[A-Z]:\//.test(normalized)) {
      normalized = normalized[0].toLowerCase() + normalized.slice(1);
    }
    return normalized;
  }

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        <GitBranchTrackingLabel branch={branchLabel} upstream={gitStatus?.upstream} />
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <!-- Overlaid on the gated (hidden) body while the first document
       settles, so the pane shows a spinner rather than a blank. Updates
       over existing content never fade the body, so this never covers a
       visible diff. -->
  {#if bodyFaded}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {#if diffState.status === "loading" && diffEntries.length === 0}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {:else if diffState.status === "unavailable"}
      <div class="diff-panel-centered diff-panel-message">
        <Icon name="git-branch" size={18} class="text-psx-foreground-tertiary" />
        <p>{diffState.gitMissing ? "Git is not installed." : "Not a git repository."}</p>
      </div>
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {:else if diffState.status === "ready" && diffEntries.length === 0 && diffState.diff.complete && diffState.diff.files.length === 0 && !diffState.diff.target}
      <div class="diff-panel-centered">
        <DesktopDiffEmptyState {scope} {gitStatus} />
__POOL_SYNTHETIC_IMPORT_BASELINE__
    {/if}
    <!-- The displayed document plus, during a scope switch, a hidden
         incoming one settling off-screen. Keyed by epoch so the swap only
         changes visibility — the settled document is never remounted. -->
    {#each diffEntries as entry (entry.epoch)}
      <div class="diff-panel-doc" class:is-hidden={entry.epoch !== displayedEpoch}>
        <DesktopDiffDocument
          bind:this={entry.ref}
          sessionId={entry.diff.sessionId}
          initialFiles={entry.diff.files}
          nextCursor={entry.diff.nextCursor}
          manifestComplete={entry.diff.complete}
          target={entry.diff.target}
          {scope}
          {gitStatus}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          onCollapsedChange={(collapsed) => {
            entry.collapsedCount = collapsed;
            if (entry.epoch === displayedEpoch) collapsedCount = collapsed;
          }}
          onStats={(stats) => {
            if (entry.epoch === diffEntries.at(-1)?.epoch) acceptStats(stats, entry.diff.sessionId);
          }}
          onReady={() => handleEntryReady(entry.epoch)}
__POOL_SYNTHETIC_IMPORT_BASELINE__
      </div>
    {/each}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  <footer class="diff-panel-footer">
    <div class="diff-panel-footer-stats">
      <span class="diff-panel-footer-title">{scopeLabel} changes</span>
      <div
        class="diff-panel-footer-values"
        class:is-faded={bodyFaded || !diffStats}
        aria-hidden={bodyFaded || !diffStats}
      >
        {#if diffStats}
          <GitDiffStats
            files={diffStats.files}
            additions={diffStats.additions}
            deletions={diffStats.deletions}
__POOL_SYNTHETIC_IMPORT_BASELINE__
        {/if}
__POOL_SYNTHETIC_IMPORT_BASELINE__
    </div>
    <div class="diff-panel-footer-actions">
      <button
        type="button"
        class="diff-panel-footer-button"
        disabled={!canToggleAll}
        onclick={() => displayedDocument?.setAllCollapsed(!anyCollapsed)}
      >
        <Icon name={anyCollapsed ? "expand-both" : "collapse-both"} size={14} aria-hidden="true" />
        {anyCollapsed ? "Expand All" : "Collapse All"}
      </button>
      <button
        type="button"
        class="diff-panel-footer-button diff-panel-footer-button--primary"
        title="Stage and Commit..."
        onclick={() => requestDesktopChangesView(worktreePath)}
      >
        Stage and Commit...
      </button>
    </div>
  </footer>
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /* Loading hint while a replacement diff fetches/settles, centred over the
     faded-out body (matching the in-body loading spinner's position so the
     handoff between the two doesn't hop). Its own fade-in keeps the
     appearance gentle rather than a hard pop. */
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /* The body area: below the 36px header, above the 52px footer. */
    inset: 36px 0 52px;
__POOL_SYNTHETIC_IMPORT_BASELINE__
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /* Positioning context for the stacked documents; fades in when the
     first document's settle gate lifts. */
__POOL_SYNTHETIC_IMPORT_BASELINE__
    position: relative;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  }

  .diff-panel-body,
  .diff-panel-footer-values {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  .diff-panel-body.is-faded,
  .diff-panel-footer-values.is-faded {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  /* One mounted document. During a scope switch two are stacked: the
     displayed one stays interactive while the incoming one lays out and
     settles underneath at full size, invisible and untouchable, until
     handleEntryReady swaps the visibility in a single frame.

     visibility (not opacity): an opacity-0 element still paints into its
     own compositing layer, and a full-pane layer appearing/streaming/
     disappearing forces the splits pane's filtered edge SVGs to
     re-rasterize — a visible flash around the pane rim. A visibility-
     hidden subtree lays out identically but paints nothing. */
  .diff-panel-doc {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .diff-panel-doc.is-hidden {
    visibility: hidden;
    pointer-events: none;
  }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    box-sizing: border-box;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    flex: 0 0 52px;
    height: 52px;
    min-height: 52px;
    max-height: 52px;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    height: 44px;
    min-height: 44px;
    max-height: 44px;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    overflow: hidden;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .diff-panel-footer-values {
    min-height: 20px;
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
