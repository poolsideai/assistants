import type { Attachment } from "svelte/attachments";

export type ChildrenObserverContext = {
  node: HTMLElement;
  /**
   * All current elements that match the same tag name and filter criteria
   */
  siblingElements: HTMLElement[];
};

export type ChildrenObserverOptions<T = DefaultEventDetail> = {
  /**
   * Tag name to filter elements by
   */
  tagName?: string;

  /**
   * Custom filter function to further filter elements which elements to observe
   */
  filter?: (element: HTMLElement) => boolean;

  /**
   * Transform function to create custom detail object from an element
   */
  createDetail?: (element: HTMLElement) => T;

  /**
   * Callback when a child element is removed
   */
  onRemove?: (detail: T, context: ChildrenObserverContext) => void;

  /**
   * Callback when a child element is added
   */
  onAdd?: (detail: T, context: ChildrenObserverContext) => void;

  /**
   * Callback after all child elements are added
   */
  onAddAll?: (details: T[], context: ChildrenObserverContext) => void;

  /**
   * Callback after all child elements are removed
   */
  onRemoveAll?: (details: T[], context: ChildrenObserverContext) => void;

  /**
   * Callback for raw mutation observations
   */
  onObserve?: (mutations: MutationRecord[]) => void;

  /**
   * Whether to observe nested children
   * @default false
   */
  subtree?: boolean;
};

function createDefaultDetail(element: HTMLElement) {
  return {
    id: element.id,
    element,
    tagName: element.tagName.toLowerCase(),
    dataset: element.dataset,
  };
}

export type DefaultEventDetail = ReturnType<typeof createDefaultDetail>;

/**
 * Attachment that observes children elements being added or removed.
 */
export function childrenObserver<T = DefaultEventDetail>(
  options: ChildrenObserverOptions<T> = {},
): Attachment {
  return (node) => {
    if (!(node instanceof HTMLElement)) return;

    const {
      tagName,
      filter = () => true,
      createDetail = (element) => createDefaultDetail(element) as unknown as T,
      onAdd,
      onRemove,
      onAddAll,
      onRemoveAll,
      onObserve,
      subtree = false,
    } = options;

    const combinedFilter = (n: Node): n is HTMLElement => {
      if (!(n instanceof HTMLElement)) return false;
      if (tagName && n.tagName.toLowerCase() !== tagName.toLowerCase()) return false;
      return filter(n);
    };

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      const addedDetails: T[] = [];
      const removedDetails: T[] = [];

      onObserve?.(mutations);

      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;

        for (const removedNode of mutation.removedNodes) {
          if (!combinedFilter(removedNode)) continue;
__POOL_SYNTHETIC_IMPORT_BASELINE__
        }

        for (const addedNode of mutation.addedNodes) {
          if (!combinedFilter(addedNode)) continue;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          }
        }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      }
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      }
    });

    observer.observe(node, {
      childList: true,
      subtree,
    });

    return () => {
      observer.disconnect();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    };
  };
}
