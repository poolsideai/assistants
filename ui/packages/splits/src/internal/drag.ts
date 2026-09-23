import type { SplitsController } from "../controller.js";
import type { PaneID, TabID } from "../types.js";

const tabTransferType = "application/x-splits-tab";

export type TabDropZone = "center" | "left" | "right" | "top" | "bottom";
export type TabDropTargetZone = TabDropZone | "tab-bar";

export interface TabTransferData {
  tabId: TabID;
  sourcePaneId: PaneID;
  sourceController?: SplitsController;
  tabWidth?: number;
}

export type TabPointerDragEventType = "start" | "move" | "end" | "cancel";

export interface TabPointerDragEvent {
  type: TabPointerDragEventType;
  transfer?: TabTransferData;
  clientX?: number;
  clientY?: number;
}

const tabPointerDragTarget = new EventTarget();
const tabPointerDragEventName = "splits-tab-pointer-drag";
const paneControllers = new Map<PaneID, SplitsController>();
let activeTabPointerDrag: TabTransferData | undefined;

export function registerPaneController(paneId: PaneID, controller: SplitsController): () => void {
  paneControllers.set(paneId, controller);

  return () => {
    if (paneControllers.get(paneId) === controller) {
      paneControllers.delete(paneId);
    }
  };
}

export function controllerForPaneId(paneId: PaneID): SplitsController | undefined {
  return paneControllers.get(paneId);
}

export function sourceControllerForTabTransfer(
  transfer: TabTransferData,
  fallbackController?: SplitsController,
): SplitsController | undefined {
  return (
    transfer.sourceController ?? controllerForPaneId(transfer.sourcePaneId) ?? fallbackController
  );
}

export function canDropTabInPane(
  transfer: TabTransferData,
  targetController: SplitsController,
  targetPaneId: PaneID,
  fallbackSourceController?: SplitsController,
): boolean {
  const sourceController = sourceControllerForTabTransfer(transfer, fallbackSourceController);
  if (!sourceController) {
    return false;
  }

  if (
    !sourceController.allPaneIds.includes(transfer.sourcePaneId) ||
    !targetController.allPaneIds.includes(targetPaneId)
  ) {
    return false;
  }

  if (sourceController === targetController) {
    if (
      transfer.sourcePaneId !== targetPaneId &&
      !targetController.configuration.allowCrossPaneTabMove
    ) {
      return false;
    }
  } else if (
    !sourceController.configuration.allowCrossControllerTabMove ||
    !targetController.configuration.allowCrossControllerTabMove
  ) {
    return false;
  }

  return (
    sourceController.configuration.allowTabReordering &&
    targetController.configuration.allowTabReordering
  );
}

export function canDropTabOnTarget(
  transfer: TabTransferData,
  targetController: SplitsController,
  targetPaneId: PaneID,
  zone: TabDropTargetZone,
  fallbackSourceController?: SplitsController,
): boolean {
  if (!canDropTabInPane(transfer, targetController, targetPaneId, fallbackSourceController)) {
    return false;
  }

  if (zone === "tab-bar") {
    return true;
  }

  const sourceController = sourceControllerForTabTransfer(transfer, fallbackSourceController);
  if (!sourceController) {
    return false;
  }

  const isSamePane =
    sourceController === targetController && transfer.sourcePaneId === targetPaneId;
  if (zone === "center") {
    return !isSamePane;
  }

  if (!targetController.configuration.allowSplits) {
    return false;
  }

  return !isSamePane || sourceController.tabs(transfer.sourcePaneId).length > 1;
}

export function readTabTransfer(dataTransfer: DataTransfer): TabTransferData | undefined {
  const value = dataTransfer.getData(tabTransferType) || dataTransfer.getData("text/plain");
  if (!value) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(value) as Partial<TabTransferData>;
    if (typeof parsed.tabId === "string" && typeof parsed.sourcePaneId === "string") {
      const tabWidth =
        typeof parsed.tabWidth === "number" && Number.isFinite(parsed.tabWidth)
          ? parsed.tabWidth
          : undefined;

      return {
        tabId: parsed.tabId,
        sourcePaneId: parsed.sourcePaneId,
        tabWidth,
      };
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function hasTabTransfer(dataTransfer: DataTransfer): boolean {
  const types = [...dataTransfer.types];
  return types.includes(tabTransferType) || types.includes("text/plain");
}

export function startTabPointerDrag(data: TabTransferData, clientX: number, clientY: number): void {
  activeTabPointerDrag = data;
  dispatchTabPointerDragEvent("start", data, clientX, clientY);
}

export function updateTabPointerDrag(clientX: number, clientY: number): void {
  if (!activeTabPointerDrag) return;
  dispatchTabPointerDragEvent("move", activeTabPointerDrag, clientX, clientY);
}

export function endTabPointerDrag(clientX: number, clientY: number): TabTransferData | undefined {
  const transfer = activeTabPointerDrag;
  activeTabPointerDrag = undefined;
  dispatchTabPointerDragEvent("end", transfer, clientX, clientY);
  return transfer;
}

export function cancelTabPointerDrag(): void {
  const transfer = activeTabPointerDrag;
  activeTabPointerDrag = undefined;
  dispatchTabPointerDragEvent("cancel", transfer);
}

export function addTabPointerDragListener(
  listener: (event: TabPointerDragEvent) => void,
): () => void {
  const wrappedListener = (event: Event) => {
    listener((event as CustomEvent<TabPointerDragEvent>).detail);
  };

  tabPointerDragTarget.addEventListener(tabPointerDragEventName, wrappedListener);

  return () => {
    tabPointerDragTarget.removeEventListener(tabPointerDragEventName, wrappedListener);
  };
}

function dispatchTabPointerDragEvent(
  type: TabPointerDragEventType,
  transfer?: TabTransferData,
  clientX?: number,
  clientY?: number,
): void {
  tabPointerDragTarget.dispatchEvent(
    new CustomEvent<TabPointerDragEvent>(tabPointerDragEventName, {
      detail: {
        type,
        transfer,
        clientX,
        clientY,
      },
    }),
  );
}
