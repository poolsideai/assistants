/**
 * @module NavigationStore
 * @description This module is written in a legacy style. Do not copy it. Instead, use repositories to manage state and persistence. Refer to ui/README.md for more.
 */

import { derived, get, writable, type Readable } from "svelte/store";

type DuplicateStrategy = "ignore" | "popTo" | "replace";

export interface NavigationStoreOptions<T = string> {
  /**
   * Strategy to handle duplicate destinations in the navigation path.
   * - "ignore": Do nothing when navigating to an existing destination
   * - "popTo": Remove all destinations after the existing one and navigate to it
   * - "replace": Replace the existing destination with the new one
   * @default "popTo"
   */
  duplicateStrategy?: DuplicateStrategy;

  /**
   * Custom equality function to determine if two destinations are the same.
   * Used for duplicate detection and navigation operations.
   */
  isEqual?: (a: T, b: T) => boolean;

  /**
   * Callback triggered on any navigation operation.
   */
  onChange?: () => void;

  /**
   * Callback triggered on push, pop, and popToRoot navigation operations.
   */
  onNavigate?: () => void;

  onPush?: () => void;
  onPop?: () => void;
  onPopToRoot?: () => void;
  onReplace?: () => void;
  onClear?: () => void;

  onBeforePush?: (destination: T) => void;
  onBeforePop?: () => void;
  onBeforePopToRoot?: () => void;
  onBeforeReplace?: (destination: T) => void;
  onBeforeClear?: () => void;
}

export type NavigationStore<T = string> = Readable<T[]> & {
  push: (destination: T, strategy?: DuplicateStrategy) => void;
  pop: () => boolean;
  popToRoot: () => boolean;
  /**
   * Replace the current destination with a new one
   */
  replace: (destination: T, strategy?: DuplicateStrategy) => void;
  clear: () => void;
  current: Readable<T | undefined>;
  canPop: Readable<boolean>;
  depth: Readable<number>;
  isEmpty: Readable<boolean>;
};

export function createNavigationStore<T = string>(
  initialPath: T[] = [],
  options?: NavigationStoreOptions<T>,
): NavigationStore<T> {
  const {
    duplicateStrategy,
    isEqual,
    onChange,
    onNavigate,
    onBeforePush,
    onBeforePop,
    onBeforePopToRoot,
    onBeforeReplace,
    onBeforeClear,
    ...callbacks
  } = {
    duplicateStrategy: "popTo",
    isEqual: (a, b) => a === b,
    ...options,
  } satisfies NavigationStoreOptions<T>;

  function notifyChange(
    operation: keyof Pick<
      NavigationStoreOptions<T>,
      "onPush" | "onPop" | "onPopToRoot" | "onReplace" | "onClear"
    >,
  ) {
    onChange?.();

    if (operation === "onPush" || operation === "onPop" || operation === "onPopToRoot") {
      onNavigate?.();
    }

    const operationCallback = callbacks[operation];
    operationCallback?.();
  }

  function handleDuplicates(path: T[], strategy = duplicateStrategy) {
    const result: T[] = [];

    for (const item of path) {
      const existingIndex = result.findIndex((existing) => isEqual(existing, item));

      if (existingIndex === -1) {
        result.push(item);
        continue;
      }

      switch (strategy) {
        case "ignore":
          break;

        case "popTo":
          result.splice(existingIndex + 1);
          result.push(item);
          break;

        case "replace":
          result[existingIndex] = item;
          break;
      }
    }

    return result;
  }

  const path = writable(handleDuplicates(initialPath));
  const { subscribe } = path;

  return {
    subscribe,
    push: (destination: T, strategy = duplicateStrategy) => {
      onBeforePush?.(destination);
      const currentPath = get(path);
      const existingIndex = currentPath.findIndex((item) => isEqual(item, destination));

      if (existingIndex === -1) {
        path.update(($path) => [...$path, destination]);
      } else {
        switch (strategy) {
          case "ignore":
            return;

          case "popTo":
            path.update(($path) => $path.slice(0, existingIndex + 1));

          case "replace":
            path.update(($path) => {
              // Replace the existing instance and remove everything after it
              const newPath = $path.slice(0, existingIndex);
              return [...newPath, destination, ...$path.slice(existingIndex + 1)];
            });
        }
      }

      notifyChange("onPush");
    },
    pop: () => {
      onBeforePop?.();
      if (get(path).length === 0) return false;

      path.update(($path) => $path.slice(0, -1));

      notifyChange("onPop");
      return true;
    },
    popToRoot: () => {
      onBeforePopToRoot?.();
      const currentPath = get(path);

      if (currentPath.length <= 1) {
        return currentPath.length === 1;
      }

      path.update(($path) => [$path[0]]);
      notifyChange("onPopToRoot");
      return true;
    },
    replace: (destination: T, strategy = duplicateStrategy) => {
      onBeforeReplace?.(destination);
      const currentPath = get(path);
      if (currentPath.length === 0) {
        path.set([destination]);
        notifyChange("onReplace");
        return;
      }

      const existingIndex = currentPath.findIndex((item) => isEqual(item, destination));
      const lastIndex = currentPath.length - 1;

      // If the destination exists and it's not the current one
      if (existingIndex !== -1 && existingIndex !== lastIndex) {
        switch (strategy) {
          case "ignore":
            return;

          case "popTo":
            path.update(($path) => $path.slice(0, existingIndex + 1));
            break;

          case "replace":
            path.update(($path) => {
              const newPath = [...$path];
              newPath.splice(existingIndex, 1);
              newPath[newPath.length - 1] = destination;
              return newPath;
            });
            break;
        }
      } else {
        path.update(($path) => {
          const newPath = [...$path];
          newPath[lastIndex] = destination;
          return newPath;
        });
      }

      notifyChange("onReplace");
    },
    clear: () => {
      onBeforeClear?.();
      const currentPath = get(path);
      if (currentPath.length === 0) return;
      path.set([]);
      notifyChange("onClear");
    },
    isEmpty: derived(path, ($path) => $path.length === 0),
    current: derived(path, ($path) => $path.at(-1)),
    canPop: derived(path, ($path) => $path.length > 0),
    depth: derived(path, ($path) => $path.length),
  };
}
