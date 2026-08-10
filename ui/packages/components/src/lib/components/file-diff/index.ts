export { parsePatchFiles, type FileDiffMetadata, type ParsedPatch } from "@pierre/diffs";
export {
  default as DiffCodeView,
  type DiffCodeViewItem,
  type DiffCodeViewScrollBehavior,
} from "./DiffCodeView.svelte";
export { warmDiffWorkerPool } from "./diffWorkerPool.js";
export { default as FileCodeView } from "./FileCodeView.svelte";
export { default as PatchDiff } from "./PatchDiff.svelte";
export type { GitGutterDecorations, GitGutterRange } from "./types.js";
