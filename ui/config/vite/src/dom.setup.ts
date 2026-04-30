import "@testing-library/jest-dom/vitest";

// jsdom does not implement the Web Animations API, which Svelte's transition
// engine calls (svelte >= 5.5x) whenever a component uses a `transition:`
// directive. Stub `element.animate` with an immediately-finishing Animation so
// those components can mount and unmount in unit tests. This package builds
// without DOM libs, so reach for the ambient Element via globalThis.
const ElementCtor = (globalThis as Record<string, any>)["Element"];
if (ElementCtor && !ElementCtor.prototype.animate) {
  ElementCtor.prototype.animate = function animate() {
    let cancelled = false;
    const animation = {
      currentTime: 0,
      playState: "finished",
      effect: null as unknown,
      onfinish: null as (() => void) | null,
      oncancel: null as (() => void) | null,
      cancel() {
        cancelled = true;
        this.oncancel?.();
      },
      finish() {
        this.onfinish?.();
      },
      pause() {},
      play() {},
    };
    queueMicrotask(() => {
      if (!cancelled) {
        animation.onfinish?.();
      }
    });
    return animation;
  };
}
