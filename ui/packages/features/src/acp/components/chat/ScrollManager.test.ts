import { describe, expect, it, vi } from "vitest";
import { ScrollManager } from "./ScrollManager";

// jsdom performs no layout, so drive scrollTop/scrollHeight/clientHeight
// directly and dispatch synthetic scroll events; ScrollManager's attach/detach
// logic is pure position math over those values.
function makeScrollEl(opts: { scrollHeight: number; clientHeight: number; scrollTop?: number }) {
  const el = document.createElement("div") as HTMLDivElement;
  let scrollTop = opts.scrollTop ?? 0;
  Object.defineProperty(el, "scrollHeight", { get: () => opts.scrollHeight, configurable: true });
  Object.defineProperty(el, "clientHeight", { get: () => opts.clientHeight, configurable: true });
  Object.defineProperty(el, "scrollTop", {
    get: () => scrollTop,
    set: (v: number) => {
      scrollTop = v;
    },
    configurable: true,
  });
  el.scrollTo = vi.fn() as unknown as typeof el.scrollTo;
  return el;
}

function scrollTo(el: HTMLDivElement, top: number) {
  el.scrollTop = top;
  el.dispatchEvent(new Event("scroll"));
}

// A real scrollbar drag emits pointerdown on the container, scroll events
// while the thumb moves, and a pointerup that may land outside the container
// (observed at the window). A bare scroll event with no input is
// indistinguishable from a browser clamp and must NOT detach — so tests that
// mean "the user dragged the scrollbar" must say so.
function dragScrollbarTo(el: HTMLDivElement, top: number) {
  el.dispatchEvent(new Event("pointerdown"));
  scrollTo(el, top);
  window.dispatchEvent(new Event("pointerup"));
}

function wheelUp(el: HTMLDivElement) {
  el.dispatchEvent(new WheelEvent("wheel", { deltaY: -10 }));
}

// jsdom has no Touch/TouchEvent constructors; the handlers only read
// touches[0].clientY, so a plain Event with a touches array stands in.
function touch(el: HTMLDivElement, type: "touchstart" | "touchmove" | "touchend", clientY: number) {
  const event = new Event(type);
  Object.defineProperty(event, "touches", { value: [{ clientY }] });
  el.dispatchEvent(event);
}

// Click a collapsed disclosure inside the container (bubbles to the manager's
// capture-phase listener with the pre-toggle aria-expanded="false" state).
// Its own bubble-phase handler flips the attribute — as the real toggles do —
// which pins that the manager reads the attribute in the capture phase.
function clickExpander(el: HTMLDivElement) {
  const button = document.createElement("button");
  button.setAttribute("data-disclosure", "");
  button.setAttribute("aria-expanded", "false");
  button.addEventListener("click", () => button.setAttribute("aria-expanded", "true"));
  el.appendChild(button);
  button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  button.remove();
}

// jsdom performs no layout-driven ResizeObserver delivery, so tests invoke the
// same public reconciliation entry point after adjusting the geometry.
function mutate(mgr: ScrollManager) {
  mgr.reconcileContentSize();
}

describe("ScrollManager", () => {
  it("coalesces mutation and layout reconciliation into one animation frame", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    let notify: MutationCallback | undefined;
    let frame: FrameRequestCallback | undefined;
    const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
      frame = callback;
      return 1;
    });

    class TestMutationObserver {
      constructor(callback: MutationCallback) {
        notify = callback;
      }

      observe() {}
      disconnect() {}
      takeRecords(): MutationRecord[] {
        return [];
      }
    }

    vi.stubGlobal("MutationObserver", TestMutationObserver);
    vi.stubGlobal("requestAnimationFrame", requestAnimationFrameMock);
    try {
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      opts.scrollHeight = 1086;

      notify?.([], {} as MutationObserver);
      mgr.scheduleContentSizeReconciliation();

      expect(requestAnimationFrameMock).toHaveBeenCalledOnce();
      expect(el.scrollTo).not.toHaveBeenCalled();
      frame?.(performance.now());
      expect(el.scrollTo).toHaveBeenCalledWith({ top: 886, behavior: "instant" });
      mgr.disconnect();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("reconciles via the timeout fallback when animation frames are suspended", () => {
    // WKWebView suspends requestAnimationFrame while the window is hidden or
    // fully occluded, but streamed content keeps mutating the DOM. Without the
    // timer fallback the pin stalls until the window is next revealed.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const rafMock = vi.fn(() => 1); // frame callback never runs
    vi.stubGlobal("requestAnimationFrame", rafMock);
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    try {
      const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
      const el = makeScrollEl(opts);
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      opts.scrollHeight = 1300;

      mgr.scheduleContentSizeReconciliation();
      expect(el.scrollTo).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(el.scrollTo).toHaveBeenCalledWith({ top: 1100, behavior: "instant" });
      expect(mgr.attached).toBe(true);
      mgr.disconnect();
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("cancels the timeout fallback once the animation frame reconciles", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    let frame: FrameRequestCallback | undefined;
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        frame = callback;
        return 1;
      }),
    );
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
    try {
      const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
      const el = makeScrollEl(opts);
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      opts.scrollHeight = 1300;

      mgr.scheduleContentSizeReconciliation();
      frame?.(performance.now());
      expect(el.scrollTo).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100); // the fallback must not double-reconcile
      expect(el.scrollTo).toHaveBeenCalledTimes(1);
      mgr.disconnect();
    } finally {
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });

  it("re-pins when the viewport shrinks without a scrollHeight change", () => {
    // The composer area growing (queued prompt, plan, review bar) shrinks the
    // scroller's clientHeight while scrollHeight stays the same; an attached
    // reader must still be chased to the (now more distant) bottom.
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    opts.clientHeight = 158;

    mgr.reconcileContentSize();

    expect(el.scrollTo).toHaveBeenCalledWith({ top: 842, behavior: "instant" });
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("leaves a detached reader alone when the viewport shrinks", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    dragScrollbarTo(el, 400); // past the band => detach
    expect(mgr.attached).toBe(false);
    opts.clientHeight = 158;

    mgr.reconcileContentSize();

    expect(el.scrollTo).not.toHaveBeenCalled();
    expect(mgr.attached).toBe(false);
    mgr.disconnect();
  });

  it("pins layout-driven growth when it is reconciled", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    opts.scrollHeight = 1128;

    mgr.reconcileContentSize();

    expect(el.scrollTo).toHaveBeenCalledWith({ top: 928, behavior: "instant" });
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("does not write scrollTop when layout settles at the new bottom", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    opts.scrollHeight = 1128;
    el.scrollTop = 928;

    mgr.reconcileContentSize();

    expect(el.scrollTo).not.toHaveBeenCalled();
    mgr.disconnect();
  });

  // scrollHeight 1000, clientHeight 200 => maxScroll 800; distance = 800 - scrollTop.
  it("stays attached while sitting at the bottom", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800); // distance 0
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("detaches on a wheel-driven upward scroll even within the detach band", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    expect(mgr.attached).toBe(true);
    // Nudge up 100px: distance-from-bottom is 100, still inside the 150px band,
    // so the position-only rule would keep us attached — but the wheel-driven
    // upward move is detach intent, so we must let go (this is the anti-yank fix).
    wheelUp(el);
    scrollTo(el, 700);
    expect(mgr.attached).toBe(false);
    mgr.disconnect();
  });

  it("detaches on an upward touch drag within the detach band", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    touch(el, "touchstart", 100);
    touch(el, "touchmove", 140); // finger moving down the screen drags content up
    scrollTo(el, 700);
    expect(mgr.attached).toBe(false);
    mgr.disconnect();
  });

  it("does not treat a downward fling's end-of-turn clamp as touch intent", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 600 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 600);
    // Fling DOWN to the bottom (finger moves up the screen) and lift off…
    touch(el, "touchstart", 300);
    touch(el, "touchmove", 200);
    scrollTo(el, 800);
    touch(el, "touchend", 200);
    expect(mgr.attached).toBe(true);
    // …then the turn ends within the inertia window: the streaming indicator
    // collapses, scrollHeight shrinks, and the browser clamps scrollTop. That
    // upward scroll is not the user's — auto-scroll must keep chasing.
    scrollTo(el, 780);
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("expires wheel intent so a later clamp scroll cannot detach", () => {
    vi.useFakeTimers({ toFake: ["performance"] });
    try {
      const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      wheelUp(el);
      vi.advanceTimersByTime(300); // past the 200ms wheel-intent window
      scrollTo(el, 700); // upward, in-band, but the wheel was too long ago
      expect(mgr.attached).toBe(true);
      mgr.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });

  it("stays attached through an upward scroll with no user input (scrollHeight-shrink clamp)", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    // The browser clamps scrollTop when scrollHeight shrinks while pinned at the
    // bottom (e.g. a virtualized row's estimated height resolving smaller, or
    // the streaming indicator collapsing at end of turn). That fires a scroll
    // event that "moved up" without any user input — it must NOT detach, or
    // auto-scroll dies at the end of every response.
    scrollTo(el, 700);
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("detaches on a scrollbar drag past the band (no wheel/touch events)", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    dragScrollbarTo(el, 400); // distance 400 > 150px band, pointer held
    expect(mgr.attached).toBe(false);
    mgr.disconnect();
  });

  it("detaches on keyboard scrolling past the band", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "PageUp", bubbles: true }));
    scrollTo(el, 400);
    expect(mgr.attached).toBe(false);
    mgr.disconnect();
  });

  it("stays attached when a composer-collapse clamp lands after content growth (long submit)", () => {
    // Submitting a tall multi-line prompt collapses the composer: clientHeight
    // grows back, maxScrollTop momentarily drops, and the browser clamps
    // scrollTop UP — with no user input. The clamp's async scroll event is
    // delivered after the submitted message has grown scrollHeight, so it
    // observes a large upward move far from the new bottom. Distance alone
    // must not detach, or every long submit strands the reader above their
    // own message (the ChatPane submit pin then chases the real bottom).
    const opts = { scrollHeight: 118302, clientHeight: 1216, scrollTop: 117086 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 117086); // pinned at the bottom, tall composer
    // Composer collapses (+240px viewport) and the message mounts (+341px)
    // before the clamp's scroll event arrives at the clamped position.
    opts.clientHeight = 1456;
    opts.scrollHeight = 118643;
    scrollTo(el, 116846); // upward move, 341px from the new bottom
    expect(mgr.attached).toBe(true);
    // Reconciliation then chases the new bottom instead of stranding.
    mutate(mgr);
    expect(el.scrollTo).toHaveBeenCalledWith({ top: 117187, behavior: "instant" });
    mgr.disconnect();
  });

  it("does not treat a downward scroll as detach intent", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 0 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800); // moving down to the bottom
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("re-attaches once scrolled back near the bottom", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    dragScrollbarTo(el, 400); // past the band => detach
    expect(mgr.attached).toBe(false);
    scrollTo(el, 770); // distance 30, within the 50px re-attach band
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("does not re-attach while still moving upward inside the re-attach band", () => {
    // A slow wheel-up from the bottom: the first notch detaches, and the next
    // notches — still inside the 50px re-attach band — must not flip back to
    // attached, or the next mutation would yank the reader to the bottom.
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    wheelUp(el);
    scrollTo(el, 790); // detaches (upward + wheel intent)
    expect(mgr.attached).toBe(false);
    wheelUp(el);
    scrollTo(el, 770); // distance 30 — inside the band, but still moving up
    expect(mgr.attached).toBe(false);
    mgr.disconnect();
  });

  it("reports attach/detach transitions through onAttachedChange", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const changes: boolean[] = [];
    const mgr = new ScrollManager(el, (attached) => changes.push(attached));
    scrollTo(el, 800); // still attached — no callback
    dragScrollbarTo(el, 400); // detach
    scrollTo(el, 780); // re-attach
    expect(changes).toEqual([false, true]);
    mgr.disconnect();
  });

  it("keeps the clicked row stationary and detaches when an expansion grows past the band", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 800); // pinned at the bottom
    clickExpander(el);
    opts.scrollHeight = 1300; // the expansion mounts: content grows 300px
    mutate(mgr);
    // No chase — the clicked header must not move — and 300px from the bottom
    // reads as "I'm going to read this", so auto-scroll lets go.
    expect(el.scrollTo).not.toHaveBeenCalled();
    expect(mgr.attached).toBe(false);
    mgr.disconnect();
  });

  it("stays attached through a small expansion but still skips the chase", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    clickExpander(el);
    opts.scrollHeight = 1030; // 30px — inside the 50px re-attach band
    mutate(mgr);
    expect(el.scrollTo).not.toHaveBeenCalled();
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("chases growth that has no preceding expansion click (streaming)", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    opts.scrollHeight = 1300;
    mutate(mgr);
    expect(el.scrollTo).toHaveBeenCalledWith({ top: 1100, behavior: "instant" });
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("expires expansion intent so later streamed growth chases again", () => {
    vi.useFakeTimers({ toFake: ["performance"] });
    try {
      const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
      const el = makeScrollEl(opts);
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      clickExpander(el);
      vi.advanceTimersByTime(500); // past the 400ms expand-intent window
      opts.scrollHeight = 1300;
      mutate(mgr);
      expect(el.scrollTo).toHaveBeenCalledWith({ top: 1100, behavior: "instant" });
      expect(mgr.attached).toBe(true);
      mgr.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });

  it("never chases growth while detached (with or without an expansion click)", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    dragScrollbarTo(el, 400); // detach (past the band)
    expect(mgr.attached).toBe(false);
    clickExpander(el);
    opts.scrollHeight = 1300;
    mutate(mgr);
    expect(el.scrollTo).not.toHaveBeenCalled();
    expect(mgr.attached).toBe(false);
    mgr.disconnect();
  });

  it("ignores clicks on aria-expanded controls that are not disclosures (menus)", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    // A menu/combobox trigger carries aria-expanded but opts out of
    // data-disclosure: its popup floats, so growth right after the click is
    // streamed content and must still be chased.
    const menuTrigger = document.createElement("button");
    menuTrigger.setAttribute("aria-expanded", "false");
    el.appendChild(menuTrigger);
    menuTrigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    opts.scrollHeight = 1300;
    mutate(mgr);
    expect(el.scrollTo).toHaveBeenCalledWith({ top: 1100, behavior: "instant" });
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("detaches at the end of the window when an animated expansion grew unobserved", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "clearTimeout"] });
    try {
      const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
      const el = makeScrollEl(opts);
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      clickExpander(el);
      // The reveal animation grows the content via style changes only — the
      // MutationObserver never fires — so by window's end the viewport sits
      // 300px above the bottom while still "attached".
      opts.scrollHeight = 1300;
      vi.advanceTimersByTime(400);
      expect(mgr.attached).toBe(false);
      expect(el.scrollTo).not.toHaveBeenCalled();
      mgr.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });

  it("stays attached at the end of the window after a small animated expansion", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "clearTimeout"] });
    try {
      const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
      const el = makeScrollEl(opts);
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      clickExpander(el);
      opts.scrollHeight = 1030; // 30px — inside the 50px re-attach band
      vi.advanceTimersByTime(400);
      expect(mgr.attached).toBe(true);
      mgr.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });

  it("scrollToBottom clears a pending expansion intent", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "clearTimeout"] });
    try {
      const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
      const el = makeScrollEl(opts);
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      clickExpander(el);
      // The user explicitly asks for the bottom (send, or the jump button)
      // while the window is still open: growth must chase again immediately,
      // and the end-of-window check must not detach.
      mgr.scrollToBottom();
      opts.scrollHeight = 1300;
      mutate(mgr);
      expect(el.scrollTo).toHaveBeenCalledWith({ top: 1100, behavior: "instant" });
      vi.advanceTimersByTime(400);
      expect(mgr.attached).toBe(true);
      mgr.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });

  it("scrollToBottom re-attaches and notifies", () => {
    const el = makeScrollEl({ scrollHeight: 1000, clientHeight: 200, scrollTop: 800 });
    const changes: boolean[] = [];
    const mgr = new ScrollManager(el, (attached) => changes.push(attached));
    dragScrollbarTo(el, 400); // detach
    mgr.scrollToBottom();
    expect(mgr.attached).toBe(true);
    expect(changes).toEqual([false, true]);
    expect(el.scrollTo).toHaveBeenCalledWith({ top: 800, behavior: "instant" });
    mgr.disconnect();
  });

  it("pauses the bottom chase while wheel-up intent is fresh so the user can detach", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    // The user wheels up while a fast stream mutates every frame. A chase
    // written here would land between the wheel and its scroll event, so
    // onScroll would only ever read the pinned position — the upward movement
    // that detaches would never be observed and the pin would win every frame
    // ("can't scroll up while streaming").
    wheelUp(el);
    opts.scrollHeight = 1200;
    mutate(mgr);
    expect(el.scrollTo).not.toHaveBeenCalled();
    // With no competing write, the wheel's upward scroll is observed and
    // detaches; further growth must not chase.
    scrollTo(el, 760);
    expect(mgr.attached).toBe(false);
    opts.scrollHeight = 1400;
    mutate(mgr);
    expect(el.scrollTo).not.toHaveBeenCalled();
    mgr.disconnect();
  });

  it("resumes the paused chase once wheel intent expires without an upward scroll", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "clearTimeout"] });
    try {
      // A wheel-up over a nested scroller (code block, terminal scrollback)
      // bubbles to the transcript but never scrolls it: no detach follows, and
      // the paused chase must catch back up after the intent window closes.
      const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
      const el = makeScrollEl(opts);
      const mgr = new ScrollManager(el);
      scrollTo(el, 800);
      wheelUp(el);
      opts.scrollHeight = 1200;
      mutate(mgr);
      expect(el.scrollTo).not.toHaveBeenCalled();
      vi.advanceTimersByTime(200); // the deferred reconciliation fires
      expect(el.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: "instant" });
      expect(mgr.attached).toBe(true);
      mgr.disconnect();
    } finally {
      vi.useRealTimers();
    }
  });

  it("re-pins an attached reader when content shrinks past their position", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    scrollTo(el, 800);
    opts.scrollHeight = 900; // max scrollTop 700 < the reader's 800
    mutate(mgr);
    expect(el.scrollTo).toHaveBeenCalledWith({ top: 700, behavior: "instant" });
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });

  it("does not re-attach a detached reader when content below them collapses", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    dragScrollbarTo(el, 400); // past the band => detach
    expect(mgr.attached).toBe(false);
    // The streamed tail re-renders shorter (a code fence closing, a
    // virtualized row's estimate resolving smaller) and the reader's position
    // now exceeds the new maximum. The browser clamps their scrollTop; the
    // manager must not hijack them back into auto-follow.
    opts.scrollHeight = 500; // max scrollTop 300 < the reader's 400
    mutate(mgr);
    expect(mgr.attached).toBe(false);
    expect(el.scrollTo).not.toHaveBeenCalled();
    mgr.disconnect();
  });

  it("stays attached when content grows before a programmatic bottom scroll event", () => {
    const opts = { scrollHeight: 1000, clientHeight: 200, scrollTop: 800 };
    const el = makeScrollEl(opts);
    const mgr = new ScrollManager(el);
    dragScrollbarTo(el, 400); // detach

    mgr.scrollToBottom();
    // The browser applies the old bottom immediately, but dispatches its
    // scroll event after the tall composer clears and the submitted message
    // has grown the transcript. The delayed event moved downward, so its large
    // distance from the new bottom must not cancel the explicit re-attachment.
    el.scrollTop = 800;
    opts.clientHeight = 300;
    opts.scrollHeight = 1500;
    el.dispatchEvent(new Event("scroll"));

    expect(mgr.attached).toBe(true);
    mutate(mgr);
    expect(el.scrollTo).toHaveBeenLastCalledWith({ top: 1200, behavior: "instant" });
    expect(mgr.attached).toBe(true);
    mgr.disconnect();
  });
});
