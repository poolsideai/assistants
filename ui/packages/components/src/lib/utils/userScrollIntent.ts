/**
 * Shared user scroll-input tracking for components that write `scrollTop`.
 *
 * Several systems write scroll positions to the same containers: the
 * pinned-scroll ScrollManager (assistant-ui), and VirtualList's keyed scroll
 * targets and visible-anchor restores. Every "correction fights the user"
 * regression to date (#312, #393, #440, #500, PE-2454) came from one of those
 * writers missing an input mode another writer already knew about. This
 * tracker is the single definition of "the user is scrolling", so a new input
 * mode only ever needs to be taught once.
 *
 * Two complementary signals:
 *
 * - {@link UserScrollIntentTracker.upwardIntent} — the user recently wheeled
 *   or dragged upward (with an inertia window for touch). Used to pause
 *   bottom-chasing without misreading browser clamp scrolls as user intent.
 * - {@link UserScrollIntentTracker.generation} — a counter bumped on ANY
 *   scroll input (wheel in either direction, touch drag, pointerdown, scroll
 *   keys). Input events fire before the scroll events they cause, so capture
 *   the generation before deferring a scroll write and compare it before
 *   applying: a change means the user acted in between and the deferred write
 *   would replay a stale position over their movement.
 *
 * Scrollbar drags need one more piece: they emit a single `pointerdown` at the
 * grab and then only scroll events, so a generation captured mid-drag would
 * never change. The tracker therefore also listens to `scroll` and counts a
 * scroll as user input while a pointer is down on the container (or a wheel or
 * touch window is still hot). Programmatic writes while the user is idle bump
 * nothing.
 */

/** Keys that scroll a focused container. */
const SCROLL_KEYS = ["ArrowDown", "ArrowUp", "End", "Home", "PageDown", "PageUp", " "];

export interface UserScrollIntentTrackerOptions {
  /** How long after a wheel-up a resulting upward scroll still counts as user intent. */
  wheelIntentMs?: number;

  /** How long after an upward drag that upward (inertia) scrolls still count as user intent. */
  touchInertiaMs?: number;

  /** Called on every input that bumps {@link UserScrollIntentTracker.generation}. */
  onIntent?: () => void;
}

export class UserScrollIntentTracker {
  /** Default {@link UserScrollIntentTrackerOptions.wheelIntentMs}. */
  static readonly WHEEL_INTENT_MS = 200;

  /** Default {@link UserScrollIntentTrackerOptions.touchInertiaMs}. */
  static readonly TOUCH_INERTIA_MS = 1000;

  private readonly el: HTMLElement;
  private readonly wheelIntentMs: number;
  private readonly touchInertiaMs: number;
  private readonly onIntent: (() => void) | undefined;

  /** When the user last wheeled upward. */
  private lastWheelUpAt = Number.NEGATIVE_INFINITY;

  /** When the user last dragged the content upward (finger moving down the screen). */
  private lastTouchUpAt = Number.NEGATIVE_INFINITY;

  /** Last touch Y while a finger is down, used to derive the drag direction. */
  private lastTouchY: number | null = null;

  /** When the user last wheeled in either direction. */
  private lastWheelAt = Number.NEGATIVE_INFINITY;

  /** When the user last moved a touch in either direction. */
  private lastTouchMoveAt = Number.NEGATIVE_INFINITY;

  /** True from pointerdown until pointerup/pointercancel — covers scrollbar drags. */
  private pointerIsDown = false;

  /** When the user last pressed a scroll key (PgUp/PgDn, arrows, Home/End, Space). */
  private lastScrollKeyAt = Number.NEGATIVE_INFINITY;

  private generationCounter = 0;

  constructor(el: HTMLElement, options: UserScrollIntentTrackerOptions = {}) {
    this.el = el;
    this.wheelIntentMs = options.wheelIntentMs ?? UserScrollIntentTracker.WHEEL_INTENT_MS;
    this.touchInertiaMs = options.touchInertiaMs ?? UserScrollIntentTracker.TOUCH_INERTIA_MS;
    this.onIntent = options.onIntent;

    el.addEventListener("wheel", this.onWheel, { passive: true });
    el.addEventListener("touchstart", this.onTouchStart, { passive: true });
    el.addEventListener("touchmove", this.onTouchMove, { passive: true });
    el.addEventListener("touchend", this.onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", this.onTouchEnd, { passive: true });
    el.addEventListener("pointerdown", this.onPointerDown, { passive: true });
    // A scrollbar drag often ends with the pointer outside the container, so
    // the release must be observed at the window or pointerIsDown sticks true
    // and every later programmatic scroll would read as user input.
    window.addEventListener("pointerup", this.onPointerUp, { passive: true });
    window.addEventListener("pointercancel", this.onPointerUp, { passive: true });
    el.addEventListener("scroll", this.onScroll, { passive: true });
    el.addEventListener("keydown", this.onKeyDown);
  }

  /**
   * Monotonic count of user scroll inputs. Capture before deferring a scroll
   * write; a different value at apply time means the user acted in between.
   */
  get generation(): number {
    return this.generationCounter;
  }

  /**
   * Whether the user is plausibly mid-gesture right now: a pointer or finger
   * is down (a held scrollbar thumb emits no further events), or a wheel /
   * touch-inertia window is still hot. Deferred scroll writes should not land
   * while this is true.
   */
  active(): boolean {
    return this.inputIsLive();
  }

  /** Whether current upward scroll movement is driven by the user (wheel or touch). */
  upwardIntent(): boolean {
    const now = performance.now();
    return (
      now - this.lastWheelUpAt < this.wheelIntentMs ||
      now - this.lastTouchUpAt < this.touchInertiaMs
    );
  }

  disconnect(): void {
    this.el.removeEventListener("wheel", this.onWheel);
    this.el.removeEventListener("touchstart", this.onTouchStart);
    this.el.removeEventListener("touchmove", this.onTouchMove);
    this.el.removeEventListener("touchend", this.onTouchEnd);
    this.el.removeEventListener("touchcancel", this.onTouchEnd);
    this.el.removeEventListener("pointerdown", this.onPointerDown);
    window.removeEventListener("pointerup", this.onPointerUp);
    window.removeEventListener("pointercancel", this.onPointerUp);
    this.el.removeEventListener("scroll", this.onScroll);
    this.el.removeEventListener("keydown", this.onKeyDown);
  }

  private bump(): void {
    this.generationCounter += 1;
    this.onIntent?.();
  }

  /** Whether a scroll event arriving now was plausibly caused by the user. */
  private inputIsLive(): boolean {
    const now = performance.now();
    return (
      this.pointerIsDown ||
      this.lastTouchY != null ||
      now - this.lastWheelAt < this.wheelIntentMs ||
      now - this.lastTouchMoveAt < this.touchInertiaMs ||
      now - this.lastScrollKeyAt < this.wheelIntentMs
    );
  }

  private onWheel = (event: WheelEvent) => {
    const now = performance.now();
    if (event.deltaY < 0) this.lastWheelUpAt = now;
    this.lastWheelAt = now;
    this.bump();
  };

  private onTouchStart = (event: TouchEvent) => {
    this.lastTouchY = event.touches[0]?.clientY ?? null;
  };

  private onTouchMove = (event: TouchEvent) => {
    const y = event.touches[0]?.clientY;
    if (y == null) return;
    const now = performance.now();
    if (this.lastTouchY != null && y > this.lastTouchY) {
      this.lastTouchUpAt = now;
    }
    this.lastTouchY = y;
    this.lastTouchMoveAt = now;
    this.bump();
  };

  private onTouchEnd = () => {
    this.lastTouchY = null;
  };

  private onPointerDown = () => {
    this.pointerIsDown = true;
    this.bump();
  };

  private onPointerUp = () => {
    this.pointerIsDown = false;
  };

  private onScroll = () => {
    // Scrollbar drags emit only pointerdown + scroll events; wheel momentum
    // and touch inertia keep scrolling after the last input event. Count a
    // scroll as user input only while one of those windows is live, so
    // programmatic scrollTo writes never bump the generation.
    if (this.inputIsLive()) this.bump();
  };

  private onKeyDown = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.includes(event.key)) {
      this.lastScrollKeyAt = performance.now();
      this.bump();
    }
  };
}
