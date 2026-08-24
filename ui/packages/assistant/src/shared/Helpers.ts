/**
 * Focus the prompt editor
 */
export function focusPrompt() {
  // This is a hack to focus the textarea after the component has been hydrated
  // FIXME: This is a hack and should be removed
  setTimeout(() => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const prompt = document.getElementById("prompt-editor");
    // preventScroll: revealing the editor must not scroll ancestors — the
    // document can transiently overflow during conversation switches, and a
    // scrolled document sticks (see "command menu scroll shift", #124).
    prompt?.focus({ preventScroll: true });
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

/** Automatic navigation focus must not override a later user action. */
export function focusPromptIfUnchanged(stillCurrent: () => boolean): () => void {
  const focused = document.activeElement;
  const editingElsewhere =
    focused?.closest("input, textarea, [contenteditable=true]") && focused.id !== "prompt-editor";
  if (editingElsewhere) return () => {};
  const timer = setTimeout(() => {
    if (stillCurrent() && document.activeElement === focused) {
      document.getElementById("prompt-editor")?.focus({ preventScroll: true });
    }
  }, 100);
  return () => clearTimeout(timer);
}
