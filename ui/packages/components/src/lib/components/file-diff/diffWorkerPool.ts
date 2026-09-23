/// <reference path="../../shared-worker.d.ts" />

import type { WorkerPoolManager } from "@pierre/diffs/worker";
import { getOrCreateWorkerPoolSingleton } from "@pierre/diffs/worker";
// Shared Vite configuration emits both highlighters in the app's module graph,
// giving common grammar/engine assets one URL across workers and the window.
// Development and tests keep Vite's standard worker constructor behavior.
import DiffsWorker from "@pierre/diffs/worker/worker.js?shared-worker";
import { preferredShikiHighlighter } from "../../utils/shikiEngine.js";
import { PIERRE_APP_THEMES } from "./pierreTheme.js";

let resolved = false;
let pool: WorkerPoolManager | undefined;

/**
 * Shared pierre worker pool that moves shiki tokenization off the main
 * thread — the pierre docs strongly recommend this for large diffs.
 * Highlight results are AST-cached inside the pool keyed by each item's
 * `cacheKey`, so re-parses of unchanged content skip the worker round-trip.
 *
 * Returns undefined when workers are unavailable (jsdom tests, a webview
 * CSP that forbids workers); pierre then falls back to main-thread
 * highlighting, which was the pre-worker behavior.
 */
export function getDiffWorkerPool(): WorkerPoolManager | undefined {
  if (resolved) return pool;
  resolved = true;
  if (typeof Worker === "undefined") return undefined;
  try {
    pool = getOrCreateWorkerPoolSingleton({
      poolOptions: {
        workerFactory: () => new DiffsWorker(),
        // Diff highlighting is bursty (open tab, scroll); a small pool keeps
        // idle threads from lingering while still parallelizing the burst.
        poolSize: 4,
      },
      highlighterOptions: {
        theme: { light: PIERRE_APP_THEMES.light, dark: PIERRE_APP_THEMES.dark },
        preferredHighlighter: preferredShikiHighlighter(),
      },
    });
  } catch {
    pool = undefined;
  }
  return pool;
}

/**
 * Spawns the pool's workers and initializes their highlighters ahead of the
 * first file or diff render, so the first open colorizes without paying
 * worker startup and shiki init. Call at idle after app startup; no-ops
 * where workers are unavailable or the pool is already warm.
 */
export function warmDiffWorkerPool(): void {
  const workerPool = getDiffWorkerPool();
  if (workerPool?.isInitialized() === false) {
    workerPool.initialize().catch(() => undefined);
  }
}
