import type { Node } from "prosemirror-model";
import {
  Plugin,
  PluginKey,
  type Command,
  type EditorState,
  type Transaction,
} from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { isDocEmpty } from "../utils/isDocEmpty.js";

const KEY = new PluginKey<DocHistoryState>("doc-history");

interface DocHistoryState {
  docs: Node[];
  initialDoc: Node | undefined;
  currentIndex: number;
  isDirty: boolean;
}

type DocHistoryMeta = "save" | "restorePrevious" | "restoreNext" | { type: "load"; docs: Node[] };

interface DocHistoryOptions {
  maxSize?: number;
}

export function docHistory(options?: DocHistoryOptions) {
  const { maxSize } = {
    maxSize: 100,
    ...options,
  } satisfies DocHistoryOptions;

  return new Plugin<DocHistoryState>({
    key: KEY,
    state: {
      init(_, { doc }) {
        return {
          docs: [],
          currentIndex: -1,
          initialDoc: doc,
          isDirty: false,
        };
      },
      apply(tr, pluginState, oldState, newState) {
        if (tr.getMeta("appendedTransaction")) return pluginState;

        const meta = tr.getMeta(KEY) as DocHistoryMeta | undefined;
        if (!meta) {
          return tr.docChanged
            ? {
                ...pluginState,
                isDirty: !isDocEmpty(newState),
                currentIndex: -1,
              }
            : pluginState;
        }

        if (typeof meta === "object" && meta.type === "load") {
          if (areDocsEqual(pluginState.docs, meta.docs)) {
            return pluginState;
          }

          return {
            ...pluginState,
            docs: meta.docs.slice(-maxSize),
            currentIndex: -1,
          };
        }

        switch (meta) {
          case "save": {
            const docs = pluginState.docs.slice();
            docs.push(oldState.doc);
            if (docs.length > maxSize) docs.shift();

            return {
              docs,
              isDirty: false,
              currentIndex: -1,
              initialDoc: undefined,
            };
          }

          case "restorePrevious": {
            if (pluginState.currentIndex === -1) {
              return {
                ...pluginState,
                initialDoc: oldState.doc,
                currentIndex: pluginState.docs.length - 1,
              };
            }

            if (pluginState.currentIndex <= 0) return pluginState;

            return {
              ...pluginState,
              currentIndex: pluginState.currentIndex - 1,
            };
          }

          case "restoreNext": {
            if (pluginState.currentIndex >= pluginState.docs.length - 1) {
              return { ...pluginState, currentIndex: -1 };
            }

            return {
              ...pluginState,
              currentIndex: pluginState.currentIndex + 1,
            };
          }

          default:
            break;
        }

        return pluginState;
      },
    },
    appendTransaction(transactions, _, newState) {
      const state = KEY.getState(newState);
      if (!state) return;

      const tr = transactions.find((tr) => tr.getMeta(KEY));
      if (!tr) return;
      const meta = tr.getMeta(KEY) as DocHistoryMeta;

      if (meta === "restorePrevious" || meta === "restoreNext") {
        const doc = state.docs[state.currentIndex] ?? state.initialDoc;
        if (doc) {
          const { tr } = newState;
          tr.replaceWith(0, tr.doc.content.size, doc.content);
          return tr;
        }
      }
    },
  });
}

export function loadDocsMeta(tr: Transaction, docs: Node[]) {
  return tr.setMeta(KEY, { type: "load", docs } satisfies DocHistoryMeta);
}

export function saveDocMeta(tr: Transaction) {
  return tr.setMeta(KEY, "save" satisfies DocHistoryMeta);
}

function restorePreviousDocMeta(tr: Transaction) {
  return tr.setMeta(KEY, "restorePrevious" satisfies DocHistoryMeta);
}

function restoreNextDocMeta(tr: Transaction) {
  return tr.setMeta(KEY, "restoreNext" satisfies DocHistoryMeta);
}

export function canRestorePreviousDoc(state: EditorState, view: EditorView) {
  const pluginState = KEY.getState(state);

  return (
    pluginState &&
    !pluginState.isDirty &&
    pluginState.docs.length > 0 &&
    pluginState.currentIndex !== 0 &&
    isSelectionOnBoundary(view, "start")
  );
}

export function canRestoreNextDoc(state: EditorState, view: EditorView) {
  const pluginState = KEY.getState(state);

  return (
    pluginState &&
    !pluginState.isDirty &&
    pluginState.currentIndex !== -1 &&
    isSelectionOnBoundary(view, "end")
  );
}

export const restorePreviousDoc: Command = (state, dispatch, view) => {
  if (!dispatch || !view || !canRestorePreviousDoc(state, view)) {
    return false;
  }

  dispatch(restorePreviousDocMeta(state.tr));
  return true;
};

export const restoreNextDoc: Command = (state, dispatch, view) => {
  if (!dispatch || !view || !canRestoreNextDoc(state, view)) {
    return false;
  }

  dispatch(restoreNextDocMeta(state.tr));
  return true;
};

function isSelectionOnBoundary(view: EditorView, boundary: "start" | "end") {
  const isStart = boundary === "start";
  const { state } = view;
  const { selection, doc } = state;
  const { $head } = selection;
  const coords = view.coordsAtPos($head.pos);

  const pos = isStart ? $head.start($head.depth) : $head.end($head.depth);
  const boundaryCoords = view.coordsAtPos(pos);

  const isOnBoundaryLine = Math.abs(coords.top - boundaryCoords.top) < 5; // Small threshold for rounding errors
  if (!isOnBoundaryLine) return false;

  const isOnBoundaryBlock = isStart ? pos === 1 : $head.node($head.depth) === doc.lastChild;
  return isOnBoundaryBlock;
}

function areDocsEqual(docsA: Node[], docsB: Node[]) {
  return docsA.length === docsB.length && docsA.every((doc, index) => doc.eq(docsB[index]));
}
