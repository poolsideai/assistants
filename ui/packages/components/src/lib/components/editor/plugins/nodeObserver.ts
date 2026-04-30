import type { Node } from "prosemirror-model";
import { Plugin, PluginKey } from "prosemirror-state";

export type NodeDetail = {
  node: Node;
  pos: number;
};

export type NodeObserverContext<T> = {
  /**
   * All other nodes that match the same filter criteria
   */
  siblings: T[];
};

export type NodeObserverOptions<T = NodeDetail> = {
  /**
   * Custom filter function to further filter which nodes to observe
   */
  filter?: (node: Node, pos: number) => boolean;

  /**
   * Transform function to create custom detail object from a node
   */
  getNodeDetail?: (node: Node, pos: number) => T;

  /**
   * Called when a matching node is inserted into the document
   */
  onInsertNode?: (detail: T, context: NodeObserverContext<T>) => void;

  /**
   * Called after a transaction that inserted multiple matching nodes
   */
  onInsertNodes?: (details: T[], context: NodeObserverContext<T>) => void;

  /**
   * Called when a matching node is removed from the document
   */
  onRemoveNode?: (detail: T, context: NodeObserverContext<T>) => void;

  /**
   * Called after a transaction that removed multiple matching nodes
   */
  onRemoveNodes?: (details: T[], context: NodeObserverContext<T>) => void;
};

type NodeObserverState<T> = {
  observed: Map<string, T>;
  inserted?: T[];
  removed?: T[];
};

export function nodeObserver<T extends NodeDetail = NodeDetail>(
  options: NodeObserverOptions<T> = {},
) {
  const KEY = new PluginKey<NodeObserverState<T>>("nodeObserver");

  const {
    filter = () => true,
    getNodeDetail = (node, pos) => ({ node, pos }) as T,
    onInsertNode,
    onRemoveNode,
    onInsertNodes,
    onRemoveNodes,
  } = options;

  return new Plugin<NodeObserverState<T>>({
    key: KEY,
    state: {
      init() {
        return { observed: new Map() };
      },
      apply(tr, pluginState, _, newState) {
        if (!tr.docChanged) return pluginState;

        const observed = new Map<string, T>();

        newState.doc.descendants((node, pos) => {
          if (!filter(node, pos)) return true;

          const { id } = node.attrs;
          if (!id) throw new Error('nodeObserver: Node is missing an "id" attribute.');

          observed.set(id, getNodeDetail(node, pos));
          return true;
        });

        return { observed };
      },
    },
    view() {
      return {
        update(view, prevState) {
          const prev = KEY.getState(prevState);
          const next = KEY.getState(view.state);
          if (!prev || !next) return;

          const inserted: T[] = [];
          next.observed.forEach((value, id) => {
            if (!prev.observed.has(id)) inserted.push(value);
          });

          const removed: T[] = [];
          prev.observed.forEach((value, id) => {
            if (!next.observed.has(id)) removed.push(value);
          });

          if (inserted.length === 0 && removed.length === 0) return;

          const siblings = Array.from(next.observed.values());

          if (onRemoveNode) {
            removed.forEach((detail) => {
              onRemoveNode(detail, { siblings });
            });
          }

          if (onRemoveNodes && removed.length > 0) {
            onRemoveNodes(removed, { siblings });
          }

          if (onInsertNode) {
            inserted.forEach((detail) => {
              // For inserted nodes, siblings are all matching nodes except this one
              onInsertNode(detail, {
                siblings: siblings.filter((sibling) => !sibling.node.eq(detail.node)),
              });
            });
          }

          if (onInsertNodes && inserted.length > 0) {
            // For batch operations, siblings are all nodes except those in the batch
            const insertedIds = new Set(inserted.map(({ node }) => node.attrs.id));
            onInsertNodes(inserted, {
              siblings: siblings.filter(({ node }) => {
                return !insertedIds.has(node.attrs.id);
              }),
            });
          }
        },
      };
    },
  });
}
