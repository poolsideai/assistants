import {
  autoPlacement,
  autoUpdate,
  computePosition,
  offset,
  size,
  type AutoUpdateOptions,
  type ComputePositionConfig,
  type ReferenceElement,
} from "@floating-ui/dom";
import type { Action } from "svelte/action";

export type Destructor = () => void;

export interface FloatingOptions extends ComputePositionConfig {
  anchor: ReferenceElement | undefined;
  autoUpdateOptions?: AutoUpdateOptions;
  onPointerDownOutside?: (event: PointerEvent) => void;
  onFocusOutside?: (event: FocusEvent) => void;
}

const defaultOptions = {
  placement: "top",
  strategy: "absolute",
  middleware: [
    autoPlacement(),
    offset(8),
    size({
      apply({ availableHeight, elements }) {
        elements.floating.style.setProperty("--floating-available-height", `${availableHeight}px`);
      },
    }),
  ],
} satisfies Partial<FloatingOptions>;

export const floating: Action<HTMLElement, FloatingOptions> = (node, options: FloatingOptions) => {
  let {
    anchor,
    placement,
    strategy,
    middleware,
    autoUpdateOptions,
    onPointerDownOutside,
    onFocusOutside,
  } = {
    ...defaultOptions,
    ...options,
  };

  let stopPositionTracking: Destructor | undefined;
  let removePointerListeners: Destructor | undefined;
  let removeFocusListener: Destructor | undefined;

  function updatePosition() {
    if (!anchor || !node) return;

    computePosition(anchor, node, {
      placement,
      strategy,
      middleware,
    }).then(({ x, y, placement }) => {
      function roundByDPR(value: number) {
        const dpr = window.devicePixelRatio || 1;
        return Math.round(value * dpr) / dpr;
      }

      node.style.position = strategy;
      node.style.left = "0";
      node.style.top = "0";
      node.style.transform = `translate(${roundByDPR(x)}px,${roundByDPR(y)}px)`;
      node.setAttribute("data-placement", placement);
    });
  }

  function handlePointerDownOutside(event: PointerEvent) {
    if (event.pointerType === "touch" && event.type === "pointerdown") {
      // Skip if the pointer type is touch and it's just starting (to allow scrolling)
      // We'll handle this in pointerup for touch to distinguish between scrolling and tapping
      return;
    }

    const isOutsideNode = node && !node.contains(event.target as Node);
    if (isOutsideNode) {
      onPointerDownOutside?.(event);
    }
  }

  function handleBlur(event: FocusEvent) {
    if (!event.relatedTarget) return;
    const isOutsideNode = node && !node.contains(event.relatedTarget as Node);
    if (isOutsideNode) {
      onFocusOutside?.(event);
    }
  }

  function addPointerListeners() {
    if (!onPointerDownOutside) return;

    document.addEventListener("pointerdown", handlePointerDownOutside);
    document.addEventListener("pointerup", handlePointerDownOutside);

    removePointerListeners = () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      document.removeEventListener("pointerup", handlePointerDownOutside);
    };
  }

  function addBlurListener() {
    if (!onFocusOutside) return;

    window.addEventListener("blur", handleBlur);

    removeFocusListener = () => {
      window.removeEventListener("blur", handleBlur);
    };
  }

  function setup() {
    if (!anchor || !node) return;

    updatePosition();

    stopPositionTracking = autoUpdate(anchor, node, updatePosition, autoUpdateOptions);

    addPointerListeners();
    addBlurListener();
  }

  function removeEventListeners() {
    if (removePointerListeners) {
      removePointerListeners();
      removePointerListeners = undefined;
    }

    if (removeFocusListener) {
      removeFocusListener();
      removeFocusListener = undefined;
    }
  }

  function destroy() {
    if (stopPositionTracking) {
      stopPositionTracking();
      stopPositionTracking = undefined;
    }

    removeEventListeners();
  }

  setup();

  return {
    update: (options) => {
      destroy();

      ({
        anchor,
        placement,
        strategy,
        middleware,
        autoUpdateOptions,
        onPointerDownOutside,
        onFocusOutside,
      } = {
        ...defaultOptions,
        ...options,
      });

      setup();
    },

    destroy,
  };
};
