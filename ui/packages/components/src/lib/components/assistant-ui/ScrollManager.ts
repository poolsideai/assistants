import { UserScrollIntentTracker } from "../../utils/userScrollIntent.js";

export interface ScrollManagerOptions {
  /** Called when auto-scroll attaches to or detaches from the bottom. */
  onAttachedChange?: (attached: boolean) => void;

  /** Called after the manager processes a scroll event. */
  onScroll?: () => void;

  /** Distance from the bottom at which a scroll detaches. */
  detachThreshold?: number;

  /** Distance from the bottom at which a downward scroll re-attaches. */
  attachThreshold?: number;

  /** Preserve the viewport when a disclosure inside the scroller is opened. */
  trackDisclosureExpansions?: boolean;

  /** Observe streamed DOM changes and chase them while attached. */
  observeMutations?: boolean;
}

/**
 * Keeps a scrollable container pinned to the bottom as new content is added.
 *
 * Uses a MutationObserver to detect DOM changes and auto-scrolls when the user
 * is "attached" (near the bottom). If the user scrolls up past a threshold,
 * auto-scroll is paused until they scroll back down.
 */
export class ScrollManager {
  private readonly el: HTMLDivElement;
  private observer: MutationObserver | undefined;
  private readonly options: Required<
    Pick<ScrollManagerOptions, "attachThreshold" | "detachThreshold" | "trackDisclosureExpansions">
  > &
    ScrollManagerOptions;

  /** Whether auto-scroll is active — true when the user is near the bottom. */
  private isAttached = true;

  /** True while auto-scroll is chasing the bottom. */
  get attached(): boolean {
    return this.isAttached;
  }

  private lastScrollHeight: number;

  /**
   * Last reconciled clientHeight. The scroller shrinks without any scrollHeight
   * change when the area below it grows (queued prompt, plan, review bar), and
   * an attached reader must be re-pinned to the bottom then too.
   */
  private lastClientHeight: number;

  /** Last observed scrollTop, used to tell an upward scroll (detach intent). */
  private lastScrollTop: number;

  /** Shared wheel/touch/pointer/key input tracking — see its module docs. */
  private readonly intent: UserScrollIntentTracker;

  /** When the user last clicked a collapsed disclosure — its expansion is about to mount. */
  private lastExpandClickAt = Number.NEGATIVE_INFINITY;

  /** One-shot end-of-window check for expansions whose growth was animated. */
  private expandSettleTimer: ReturnType<typeof setTimeout> | undefined;

  /** Ensures we process at most one mutation per animation frame. */
  private rafId: number | undefined;

  /**
   * Timeout backing up the scheduled animation frame. WKWebView suspends
   * requestAnimationFrame while the window is hidden or fully occluded, but
   * streamed content keeps mutating the DOM — without a timer the pin would
   * stall far above the bottom until the window is next revealed.
   */
  private reconcileFallbackTimer: ReturnType<typeof setTimeout> | undefined;

  /** Re-runs a reconciliation that was paused by fresh user scroll intent. */
  private intentReconcileTimer: ReturnType<typeof setTimeout> | undefined;

  /** How long the timeout fallback gives the animation frame to run first. */
  private static readonly RECONCILE_FALLBACK_MS = 100;

  /** Upward scrollTop delta (px) that counts as intent to detach (ignores jitter). */
  private static readonly SCROLL_UP_INTENT_PX = 2;

  /** Ignore fractional layout jitter when deciding whether a scroll write is needed. */
  private static readonly SCROLL_POSITION_EPSILON_PX = 0.5;

  /**
   * How long after a click on a collapsed disclosure content growth is treated
   * as that expansion arriving rather than new streamed content. Covers the
   * reveal animation (~160ms) with headroom.
   */
  private static readonly EXPAND_INTENT_MS = 400;

  constructor(el: HTMLDivElement, options: ScrollManagerOptions = {}) {
    this.el = el;
    this.options = {
      attachThreshold: 50,
      detachThreshold: 150,
      trackDisclosureExpansions: false,
      ...options,
    };
    this.lastScrollHeight = el.scrollHeight;
    this.lastClientHeight = el.clientHeight;
    this.lastScrollTop = el.scrollTop;

    el.addEventListener("scroll", this.onScroll, { passive: true });
    this.intent = new UserScrollIntentTracker(el);

    if (this.options.trackDisclosureExpansions) {
      // Capture phase: the attribute must be read before the disclosure's own
      // handler flips it to "true".
      el.addEventListener("pointerdown", this.onExpandArm, { capture: true, passive: true });
      el.addEventListener("click", this.onExpandArm, { capture: true, passive: true });
    }

    if (options.observeMutations !== false) {
      this.observer = new MutationObserver(() => {
        this.scheduleContentSizeReconciliation();
      });

      this.observer.observe(el, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
  }

  private onScroll = () => {
    const scrollTop = this.el.scrollTop;
    const movedUp = scrollTop < this.lastScrollTop - ScrollManager.SCROLL_UP_INTENT_PX;
    this.lastScrollTop = scrollTop;

    const dist = this.distanceFromBottom();
    if (this.isAttached) {
      // A bare upward scroll is not always user intent: browsers also clamp
      // scrollTop when scrollHeight shrinks OR when clientHeight grows (the
      // composer collapsing after a long submit) — and the clamp's async
      // scroll event can land after new content has already grown the
      // distance past the detach threshold, so even a large upward move is
      // not proof of intent by itself. Wheel/touch direction disambiguates
      // small in-band movement; `active()` (pointer held, touch down, or a
      // hot wheel/key window) covers scrollbar dragging and keyboard
      // scrolling, which emit no wheel events. A clamp has neither, stays
      // attached, and reconciliation re-pins to the new bottom.
      if (
        movedUp &&
        (this.userScrollIntent() || (this.intent.active() && dist > this.options.detachThreshold))
      ) {
        this.setAttached(false);
      }
    } else if (dist <= this.options.attachThreshold && !movedUp) {
      this.setAttached(true);
    }

    this.options.onScroll?.();
  };

  /** Whether current upward scroll movement is driven by the user (wheel or touch). */
  private userScrollIntent(): boolean {
    return this.intent.upwardIntent();
  }

  private onExpandArm = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const toggle = target.closest("[data-disclosure]");
    if (toggle && this.el.contains(toggle) && toggle.getAttribute("aria-expanded") === "false") {
      this.lastExpandClickAt = performance.now();
      clearTimeout(this.expandSettleTimer);
      this.expandSettleTimer = setTimeout(() => {
        this.expandSettleTimer = undefined;
        if (this.isAttached && this.distanceFromBottom() > this.options.attachThreshold) {
          this.setAttached(false);
        }
      }, ScrollManager.EXPAND_INTENT_MS);
    }
  };

  private expandIntent(): boolean {
    return performance.now() - this.lastExpandClickAt < ScrollManager.EXPAND_INTENT_MS;
  }

  private clearExpandIntent(): void {
    this.lastExpandClickAt = Number.NEGATIVE_INFINITY;
    clearTimeout(this.expandSettleTimer);
    this.expandSettleTimer = undefined;
  }

  private setAttached(attached: boolean) {
    if (this.isAttached === attached) return;
    this.isAttached = attached;
    this.options.onAttachedChange?.(attached);
  }

  /** Coalesce DOM- and layout-driven size changes into one post-layout check. */
  scheduleContentSizeReconciliation() {
    if (this.rafId !== undefined) return;
    this.rafId = requestAnimationFrame(() => {
      this.cancelScheduledReconciliation();
      this.reconcileContentSize();
    });
    this.reconcileFallbackTimer = setTimeout(() => {
      this.cancelScheduledReconciliation();
      this.reconcileContentSize();
    }, ScrollManager.RECONCILE_FALLBACK_MS);
  }

  private cancelScheduledReconciliation() {
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
    if (this.reconcileFallbackTimer !== undefined) {
      clearTimeout(this.reconcileFallbackTimer);
      this.reconcileFallbackTimer = undefined;
    }
  }

  /** Reconcile a measured content-size change immediately. */
  reconcileContentSize() {
    const { scrollHeight, clientHeight } = this.el;

    if (scrollHeight === this.lastScrollHeight && clientHeight === this.lastClientHeight) return;

    // While the user is actively wheeling or dragging upward, never write
    // scrollTop. Detaching requires onScroll to OBSERVE an upward movement,
    // but a chase written here can land between the user's input and its
    // scroll event — the event then reads the pinned position, the upward
    // delta is never seen, and the pin wins every frame ("can't scroll up
    // while streaming"). Pause the chase and re-check once the intent window
    // closes: if the wheel was over a nested scroller (code block, terminal)
    // nothing scrolled here, no detach happened, and the chase resumes.
    if (this.isAttached && this.userScrollIntent()) {
      this.deferReconciliationPastIntent();
      return;
    }

    const grew = scrollHeight > this.lastScrollHeight;
    this.lastScrollHeight = scrollHeight;
    this.lastClientHeight = clientHeight;

    const maxScrollTop = Math.max(scrollHeight - clientHeight, 0);
    if (this.el.scrollTop > maxScrollTop + ScrollManager.SCROLL_POSITION_EPSILON_PX) {
      // Content below the viewport shrank past the reader's position. Re-pin
      // an attached reader; leave a detached one where the browser clamps
      // them — re-attaching here would hijack a reader who scrolled up just
      // before the tail re-rendered shorter (a code fence closing, a
      // virtualized row's estimate resolving smaller).
      if (this.isAttached) {
        this.el.scrollTo({ top: maxScrollTop, behavior: "instant" });
      }
      return;
    }

    if (!this.isAttached || scrollHeight <= clientHeight) return;

    // Opening a disclosure means the user intends to read it. Keep its row
    // stationary instead of mistaking that growth for streamed content.
    if (grew && this.options.trackDisclosureExpansions && this.expandIntent()) {
      if (this.distanceFromBottom() > this.options.attachThreshold) {
        this.setAttached(false);
      }
      return;
    }

    if (maxScrollTop - this.el.scrollTop <= ScrollManager.SCROLL_POSITION_EPSILON_PX) return;
    this.el.scrollTo({ top: maxScrollTop, behavior: "instant" });
  }

  /**
   * Re-run a reconciliation paused by user scroll intent once the shortest
   * intent window can have closed. The rerun re-checks intent (and re-defers)
   * so a still-fresh touch window keeps the pause; without this follow-up, a
   * pause over the stream's final mutation would leave an attached reader
   * stranded above the bottom until the next mutation.
   */
  private deferReconciliationPastIntent() {
    if (this.intentReconcileTimer !== undefined) return;
    this.intentReconcileTimer = setTimeout(() => {
      this.intentReconcileTimer = undefined;
      this.reconcileContentSize();
    }, UserScrollIntentTracker.WHEEL_INTENT_MS);
  }

  private distanceFromBottom() {
    return this.el.scrollHeight - this.el.scrollTop - this.el.clientHeight;
  }

  scrollToBottom(behavior: ScrollBehavior = "instant") {
    this.clearExpandIntent();
    this.setAttached(true);
    this.el.scrollTo({ top: Math.max(this.el.scrollHeight - this.el.clientHeight, 0), behavior });
  }

  stopObservingMutations() {
    this.observer?.disconnect();
    this.observer = undefined;
    this.cancelScheduledReconciliation();
    if (this.intentReconcileTimer !== undefined) {
      clearTimeout(this.intentReconcileTimer);
      this.intentReconcileTimer = undefined;
    }
  }

  disconnect() {
    this.el.removeEventListener("scroll", this.onScroll);
    this.intent.disconnect();
    if (this.options.trackDisclosureExpansions) {
      this.el.removeEventListener("pointerdown", this.onExpandArm, { capture: true });
      this.el.removeEventListener("click", this.onExpandArm, { capture: true });
    }
    clearTimeout(this.expandSettleTimer);
    this.stopObservingMutations();
  }
}
