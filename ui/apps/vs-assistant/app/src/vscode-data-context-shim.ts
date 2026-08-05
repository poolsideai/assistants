/** VSCode has a mechanism whereby you can convey context from a web view to a command in the extension,
 * to conditionally show it and to provide data for the context menu command. CefSharp doesn't give us a
 * way to do that, so instead we subscribe to changes implicating changes to the `data-vscode-context` data
 * or the bounds of the elements it is attached to. */

export interface VSCodeContextElementData {
  sectionPsx: "userMessage";
  messageIdPsx: string;
  conversationIdPsx: string;
  trajectoryLinkPsx: string | undefined;
  requestIdPsx: string | undefined;
}

type VSCodeContextElementBounds = {
  context: VSCodeContextElementData;
  bounds: {
    top: number;
    left: number;
    width: number;
    height: number;
    right: number;
    bottom: number;
  };
};

function getVisibleVSCodeContextElements(): VSCodeContextElementBounds[] {
  const elements = document.querySelectorAll<HTMLElement>("[data-vscode-context]");

  function isPartiallyInViewport(rect: DOMRect): boolean {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= viewportHeight &&
      rect.left <= viewportWidth
    );
  }

  const results: VSCodeContextElementBounds[] = [];
  elements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (isPartiallyInViewport(rect)) {
      const rawContext = el.getAttribute("data-vscode-context");
      if (!rawContext) return;

      try {
        const parsedContext = JSON.parse(rawContext);
        results.push({
          context: parsedContext,
          bounds: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            right: rect.right,
            bottom: rect.bottom,
          },
        });
      } catch (err) {
        console.warn("Failed to parse data-vscode-context:", rawContext, err);
      }
    }
  });

  return results;
}

function throttle<T extends (...args: any[]) => void>(fn: T, wait: number): T {
  let lastTime = 0;
  let timeout: number | undefined;

  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0) {
      if (timeout) {
        window.clearTimeout(timeout);
        timeout = undefined;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timeout) {
      timeout = window.setTimeout(() => {
        lastTime = Date.now();
        timeout = undefined;
        fn.apply(this, args);
      }, remaining);
    }
  } as T;
}

export function trackVSCodeContextElements(
  callback: (elements: VSCodeContextElementBounds[]) => void,
  throttleMs = 200,
): () => void {
  const handler = throttle(() => {
    callback(getVisibleVSCodeContextElements());
  }, throttleMs);

  // scroll + resize
  window.addEventListener("scroll", handler, true);
  window.addEventListener("resize", handler, true);

  // DOM mutations
  const observer = new MutationObserver(handler);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["data-vscode-context"],
  });

  // Polling loop to catch "silent" layout shifts
  let rafId: number;
  let lastCheck = 0;
  const loop = (time: number) => {
    if (time - lastCheck >= throttleMs) {
      handler();
      lastCheck = time;
    }
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  // Initial run
  handler();

  // Cleanup function
  return () => {
    window.removeEventListener("scroll", handler, true);
    window.removeEventListener("resize", handler, true);
    observer.disconnect();
    cancelAnimationFrame(rafId);
  };
}
