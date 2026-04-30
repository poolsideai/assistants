import type { Node } from "prosemirror-model";
import { Plugin, PluginKey, TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

interface SelectionDecorationOptions {
  filter?: (node: Node, pos: number) => boolean;
}

export function selectionDecoration({
  filter = (node) => node.isInline,
}: SelectionDecorationOptions = {}) {
  const key = new PluginKey("selection-decoration");

  return new Plugin({
    key,
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr) {
        const { selection } = tr;

        if (!(selection instanceof TextSelection)) return DecorationSet.empty;

        const { $from, $to } = selection;

        const decorations: Decoration[] = [];

        const nodeBefore = $from.nodeBefore;
        if (nodeBefore) {
          const pos = $from.pos - nodeBefore.nodeSize;
          if (filter(nodeBefore, pos)) {
            decorations.push(
              Decoration.node(pos, pos + nodeBefore.nodeSize, {
                "data-active": "",
              }),
            );
          }
        }

        tr.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
          if (!filter(node, pos)) return;
          decorations.push(Decoration.node(pos, pos + node.nodeSize, { "data-selection": "" }));
        });

        return DecorationSet.create(tr.doc, decorations);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
}
