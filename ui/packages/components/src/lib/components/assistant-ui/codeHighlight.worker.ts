import {
  highlightToHtml,
  type HighlightWorkerRequest,
  type HighlightWorkerResponse,
} from "./codeHighlightCore.js";

// Dedicated worker entry: runs the exact same shiki pipeline as the
// main-thread fallback, so tokenization of chat code blocks never blocks
// the UI. The tsconfig targets the DOM lib, so narrow `self` to the worker
// surface actually used instead of pulling in the conflicting webworker lib.
const workerScope = self as unknown as {
  addEventListener(
    type: "message",
    listener: (event: MessageEvent<HighlightWorkerRequest>) => void,
  ): void;
  postMessage(message: HighlightWorkerResponse): void;
};

workerScope.addEventListener("message", (event) => {
  const { id, code, language } = event.data;
  highlightToHtml(code, language).then(
    (html) => workerScope.postMessage({ id, html }),
    // highlightToHtml resolves to escaped plain text on grammar/tokenize
    // failures; a rejection means the pipeline itself broke (e.g. worker-side
    // shiki init). Report it so the facade can fall back to the main thread.
    (error) => workerScope.postMessage({ id, error: String(error) }),
  );
});
