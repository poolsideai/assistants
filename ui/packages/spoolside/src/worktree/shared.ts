export interface WorktreePorts {
  vite: number;
  spoolside: number;
  desktopVite: number;
  desktopSpoolside: number;
  /** Helper remote-access (mobile remote control) server. */
  remote: number;
  /** Vite dev server for ui/apps/mobile-remote. */
  mobileVite: number;
}

const SLOT_COLORS = [
  "#2563eb",
  "#16a34a",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#ca8a04",
  "#0891b2",
  "#dc2626",
];

export function portsForSlot(slot: number): WorktreePorts {
  return {
    vite: 5173 + slot * 10,
    desktopVite: 5177 + slot * 10,
    mobileVite: 5179 + slot * 10,
    spoolside: 9500 + slot * 10,
    desktopSpoolside: 9505 + slot * 10,
    remote: 8737 + slot * 10,
  };
}

export function targetSpoolsidePort(slot: number, target: "vscode" | "desktop"): number {
  const ports = portsForSlot(slot);
  return target === "desktop" ? ports.desktopSpoolside : ports.spoolside;
}

export function slotColor(slot?: number): string {
  const normalizedSlot = slot && slot >= 1 ? slot : 1;
  return SLOT_COLORS[(normalizedSlot - 1) % SLOT_COLORS.length];
}
