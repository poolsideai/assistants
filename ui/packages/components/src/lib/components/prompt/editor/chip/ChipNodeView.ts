import type { Node } from "prosemirror-model";
import type { EditorView } from "prosemirror-view";
import { mount } from "svelte";
import { BaseNodeView } from "../../../editor/index.js";
import type { IconName } from "../../../icon/IconName.js";
import ChipNode from "./ChipNode.svelte";
import type { ChipNodeAttrs } from "./chipNode.js";

export class ChipNodeView extends BaseNodeView<ChipNodeAttrs> {
  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    super(node, view, getPos);

    this.component = mount(ChipNode, {
      target: this.dom,
      props: {
        label: this.attrs.label,
        icon: this.attrs.icon as IconName | undefined,
        fileIconPath: this.attrs.fileIconPath as string | undefined,
        tooltip: (this.attrs.tooltip as string | undefined) ?? this.attrs.value,
      },
    });
  }
}
