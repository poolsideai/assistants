import type { DesktopContextMenuSpecItem } from "./desktopContextMenu";

const ENQUEUE_ACTION_ID = "enqueue";
const SEND_NOW_ACTION_ID = "interrupt-and-send-now";

interface PromptSubmitContextMenuEnvironment {
  assistantHost: string;
  operatingSystem?: string;
}

interface PromptSubmitContextMenuActions {
  enqueue: () => void;
  sendNow: () => void;
}

export function supportsNativePromptSubmitContextMenu(
  environment: PromptSubmitContextMenuEnvironment,
): boolean {
  return environment.assistantHost === "desktop" && environment.operatingSystem === "darwin";
}

export function buildPromptSubmitContextMenuItems(
  steeringAvailable = false,
  steerWithEnter = false,
): DesktopContextMenuSpecItem[] {
  if (steeringAvailable && steerWithEnter) {
    return [
      {
        kind: "action",
        id: SEND_NOW_ACTION_ID,
        label: "Steer",
        accelerator: "Enter",
      },
      {
        kind: "action",
        id: ENQUEUE_ACTION_ID,
        label: "Enqueue",
        accelerator: "Cmd+Enter",
      },
    ];
  }
  return [
    {
      kind: "action",
      id: ENQUEUE_ACTION_ID,
      label: "Enqueue",
      accelerator: "Enter",
    },
    {
      kind: "action",
      id: SEND_NOW_ACTION_ID,
      label: steeringAvailable ? "Steer" : "Interrupt & Send Now",
      accelerator: "Cmd+Enter",
    },
  ];
}

export function performPromptSubmitContextMenuAction(
  actionId: string | undefined,
  actions: PromptSubmitContextMenuActions,
): void {
  if (actionId === ENQUEUE_ACTION_ID) {
    actions.enqueue();
  } else if (actionId === SEND_NOW_ACTION_ID) {
    actions.sendNow();
  }
}
