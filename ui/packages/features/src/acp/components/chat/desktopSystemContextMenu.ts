import { get } from "svelte/store";
import { appState } from "../../hostAdapter";
import { rpc, type RPCClient } from "../../hostRpc";

export type DesktopSystemContextMenuItem =
  | {
      kind: "action";
      id: string;
      label: string;
      enabled?: boolean;
      accelerator?: string;
    }
  | { kind: "separator" };

export interface DesktopSystemContextMenuRequest {
  position: { x: number; y: number };
  items: DesktopSystemContextMenuItem[];
}

type DesktopSystemContextMenuRPC = RPCClient & {
  showDesktopSystemContextMenu(request: DesktopSystemContextMenuRequest): Promise<string | null>;
};

/**
 * Show an ordinary OS-native context menu on the desktop host.
 *
 * This is intentionally separate from `showDesktopContextMenu`, whose custom
 * AppKit rows match the product's picker surfaces. Use this path for standard
 * right-click menus that should retain the operating system's menu styling.
 */
export async function showDesktopSystemContextMenu(
  items: DesktopSystemContextMenuItem[],
  position: { x: number; y: number },
): Promise<string | undefined> {
  if (get(appState).environment.assistantHost !== "desktop") return undefined;

  const desktopRpc = rpc as DesktopSystemContextMenuRPC;
  try {
    const selected = await desktopRpc.showDesktopSystemContextMenu({ position, items });
    return selected ?? undefined;
  } catch (error) {
    console.debug("Unable to show system context menu", error);
    return undefined;
  }
}
