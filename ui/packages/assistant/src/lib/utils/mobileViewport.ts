// Tracks the mobile visual viewport so the shell can size itself to the area
// *above* the software keyboard.
//
// iOS Safari does not shrink the layout viewport (100dvh stays the large,
// keyboard-less height) when the keyboard opens, so a shell sized to 100dvh
// renders its bottom-anchored prompt behind the keyboard. Mirroring
// window.visualViewport.height into a CSS variable lets the shell size to the
// visible area instead; the prompt then sits just above the keyboard.
//
// The variable is set on <html> so any shell rule can read it, with a 100dvh
// fallback for browsers without visualViewport (older desktops, SSR) — there
// the behavior is unchanged.
export function installMobileViewportTracking(target: Window = window): () => void {
  const viewport = target.visualViewport;
  if (!viewport) return () => {};

  const root = target.document.documentElement;
  // The tallest viewport seen in the current orientation; the keyboard-open test
  // compares against it rather than window.innerHeight so it also fires in
  // standalone PWAs, where the whole web view resizes for the keyboard and
  // innerHeight shrinks in lockstep. Reset when the width flips (rotation) — a
  // portrait max is not a valid keyboard reference in landscape.
  let maxHeight = 0;
  let lastWidth = 0;
  const update = () => {
    const { width, height } = viewport;
    if (width !== lastWidth) {
      lastWidth = width;
      maxHeight = 0;
    }
    maxHeight = Math.max(maxHeight, height);
    root.style.setProperty("--visual-viewport-height", `${height}px`);
    root.toggleAttribute("data-keyboard-open", maxHeight - height > 120);
    // iOS may pan the page to reveal the focused field before we resize the
    // shell; reset that so the shell's top stays aligned with the visible area.
    if (target.scrollY) target.scrollTo(0, 0);
  };
  update();

  // resize fires as the keyboard opens/closes and toolbars retract; scroll fires
  // when the browser pans the visual viewport.
  viewport.addEventListener("resize", update);
  viewport.addEventListener("scroll", update);

  return () => {
    viewport.removeEventListener("resize", update);
    viewport.removeEventListener("scroll", update);
    root.style.removeProperty("--visual-viewport-height");
    root.removeAttribute("data-keyboard-open");
  };
}
