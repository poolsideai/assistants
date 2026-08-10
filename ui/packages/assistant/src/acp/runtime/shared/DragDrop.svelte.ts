// Owns shared file drag/drop state and event handlers for ACP targets.
export class DragDrop {
  #isDraggingFile = $state(false);

  get isDraggingFile() {
    return this.#isDraggingFile;
  }

  // Drive drag state directly, e.g. from Tauri drag-drop events on desktop where
  // HTML5 drag events are suppressed by the native drag-drop handler.
  setIsDragging(value: boolean) {
    this.#isDraggingFile = value;
  }

  handleDragOver(event: DragEvent) {
    event.preventDefault();
    this.#isDraggingFile = true;
  }

  handleDragLeave(event: DragEvent) {
    const relatedTarget = event.relatedTarget as Node;
    if (!relatedTarget || !document.body.contains(relatedTarget)) {
      this.#isDraggingFile = false;
    }
  }

  handleDrop() {
    this.#isDraggingFile = false;
  }
}
