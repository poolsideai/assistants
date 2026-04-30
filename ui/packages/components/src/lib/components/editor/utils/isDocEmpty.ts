import type { Node, Schema } from "prosemirror-model";
import type { EditorState } from "prosemirror-state";

const emptyDocCache = new WeakMap<Schema, Node>();

export function isDocEmpty(state: EditorState) {
  const { doc, schema } = state;
  let emptyDoc = emptyDocCache.get(schema);

  if (!emptyDoc) {
    emptyDoc = schema.nodes.doc.createAndFill() ?? undefined;

    if (emptyDoc) {
      emptyDocCache.set(schema, emptyDoc);
    } else {
      return false;
    }
  }

  return doc.eq(emptyDoc);
}
