import { DOMSerializer, type Attrs, type Node } from "prosemirror-model";
import type { EditorView, NodeView } from "prosemirror-view";
import { unmount, type mount } from "svelte";

export abstract class BaseNodeView<T extends Attrs = Attrs> implements NodeView {
  dom: HTMLElement;
  attrs: T;
  protected component: ReturnType<typeof mount> | undefined;

  constructor(
    readonly node: Node,
    readonly view: EditorView,
    readonly getPos: () => number | undefined,
  ) {
    this.attrs = node.attrs as T;

    const structure = node.type.spec.toDOM?.(node);
    if (structure) {
      const { dom } = DOMSerializer.renderSpec(document, structure);
      this.dom = dom as HTMLElement;
    } else {
      this.dom = document.createElement(node.isInline ? "span" : "div");
    }
  }

  destroy() {
    if (this.component) {
      unmount(this.component);
    }
  }
}
