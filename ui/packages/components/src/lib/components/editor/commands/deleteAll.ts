import type { Command } from "prosemirror-state";

export const deleteAll: Command = (state, dispatch) => {
  const { tr, doc } = state;
  tr.delete(0, doc.content.size);
  dispatch?.(tr);
  return true;
};
