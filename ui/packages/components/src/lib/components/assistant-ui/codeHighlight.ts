/// <reference path="../../shared-worker.d.ts" />

import { escape } from "html-escaper";
// Shared Vite's `?shared-worker` suffix turns the entry into an emitted chunk and returns
// its constructor. Every host that bundles this package (desktop, VS Code
// webview, storybook, vitest) builds with Vite.
import { ByteBudgetLru } from "./byteBudgetLru.js";
import HighlightWorker from "./codeHighlight.worker.js?shared-worker";
import {
  highlightToHtml,
  type HighlightWorkerRequest,
  type HighlightWorkerResponse,
} from "./codeHighlightCore.js";
import { hashString } from "./hash.js";
import { resolveHighlightLanguage } from "./resolveHighlightLanguage.js";

export { resolveHighlightLanguage };

const HIGHLIGHT_CACHE_MAX_BYTES = 12 * 1024 * 1024;
const HIGHLIGHT_CACHE_ENTRY_OVERHEAD_BYTES = 256;

const highlightCache = new ByteBudgetLru<Promise<string>>(HIGHLIGHT_CACHE_MAX_BYTES);

interface PendingHighlight {
  code: string;
  language: string | undefined;
  resolve: (html: string) => void;
}

let workerResolved = false;
let worker: Worker | undefined;
let nextRequestId = 0;
const pendingHighlights = new Map<number, PendingHighlight>();

/**
 * Dedicated shiki worker so tokenizing chat code blocks never blocks the
 * main thread — streaming re-highlights a growing block on every settled
 * render, so large blocks would otherwise stall the UI per update. Returns
 * undefined where workers are unavailable (jsdom tests, a webview CSP that
 * forbids workers); highlighting then runs on the main thread as before.
 * One worker is enough: blocks are small and requests queue in its event
 * loop.
 */
function getHighlightWorker(): Worker | undefined {
  if (workerResolved) return worker;
  workerResolved = true;
  if (typeof Worker === "undefined") return undefined;
  try {
    const instance = new HighlightWorker();
    instance.addEventListener("message", (event: MessageEvent<HighlightWorkerResponse>) => {
      const pending = pendingHighlights.get(event.data.id);
      if (!pending) return;
      pendingHighlights.delete(event.data.id);
      if (typeof event.data.html === "string") {
        pending.resolve(event.data.html);
      } else {
        void highlightToHtml(pending.code, pending.language).then(pending.resolve);
      }
    });
    instance.addEventListener("error", () => {
      // The worker script failed to load or crashed; finish in-flight work
      // on the main thread and stay there for the rest of the session.
      worker = undefined;
      instance.terminate();
      const drained = [...pendingHighlights.values()];
      pendingHighlights.clear();
      for (const pending of drained) {
        void highlightToHtml(pending.code, pending.language).then(pending.resolve);
      }
    });
    worker = instance;
  } catch {
    worker = undefined;
  }
  return worker;
}

/**
 * Highlight a settled block through the global byte-bounded LRU. Promises are
 * cached so concurrent renders share grammar loading and tokenization, then
 * resized to the retained HTML string once complete.
 */
export function memoizedHighlight(code: string, language: string | undefined): Promise<string> {
  const key = `${language ?? ""}:${code.length}:${hashString(code)}`;
  const cached = highlightCache.get(key);
  if (cached) return cached;

  const result = highlight(code, language);
  highlightCache.set(key, result, retainedStringBytes(key) + HIGHLIGHT_CACHE_ENTRY_OVERHEAD_BYTES);
  void result.then((html) => {
    highlightCache.resize(
      key,
      result,
      retainedStringBytes(key) + retainedStringBytes(html) + HIGHLIGHT_CACHE_ENTRY_OVERHEAD_BYTES,
    );
  });
  return result;
}

/** Highlight a complete static block, loading only its grammar on first use. */
export function highlight(code: string, language: string | undefined): Promise<string> {
  // Plain text needs no tokenization — skip the worker round trip.
  if (!resolveHighlightLanguage(language)) return Promise.resolve(escape(code));

  const instance = getHighlightWorker();
  if (!instance) return highlightToHtml(code, language);
  return new Promise((resolve) => {
    const id = ++nextRequestId;
    pendingHighlights.set(id, { code, language, resolve });
    const request: HighlightWorkerRequest = { id, code, language };
    instance.postMessage(request);
  });
}

function retainedStringBytes(value: string): number {
  // JavaScriptCore can compact some strings, but UTF-16 is the conservative
  // upper bound and keeps the cache below its intended retained-heap budget.
  return value.length * 2;
}
