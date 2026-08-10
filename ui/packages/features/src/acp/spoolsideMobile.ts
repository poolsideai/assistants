// Spoolside worktree development support for the mobile remote app. When the
// serving helper was launched by `spoolside worktree up`, /api/me reports the
// helper's worktree identity and the other live worktree slots on the same
// machine (see pkg/poolside-helper/internal/handler/remoteaccess/spoolside.go).
// The mobile shell shows the worktree name (with its slot colour) in place of
// the host name, and the sidebar offers "Open Worktree's Mobile App" on
// worktree long-press to jump to another slot's mobile surface.

import type { ACPNavProject } from "./navTypes";

export interface MobileSpoolsideInstance {
  /** Slot serving this app; 0 is the main workspace. */
  readonly slot: number;
  /** Worktree id/branch name; empty for the main workspace. */
  readonly worktreeName?: string;
  /** Slot accent colour (hex), matching the desktop app's title chip. */
  readonly color?: string;
  /** Live worktree slots on this machine. */
  readonly slots: readonly MobileSpoolsideSlot[];
  /** Host-provided, resolved at jump time: a URL fragment (e.g.
   * "#poolsideDeviceToken=…") appended to slot-jump URLs so device auth
   * carries across origins — each slot's app is a different origin, so
   * localStorage (and the device token in it) does not follow. Fragments
   * never reach the server, keeping the token out of request lines and
   * logs. See remote-client's deviceTokenHandoffHash / adoptHandoffDeviceToken. */
  readonly getHandoffHash?: () => string;
}

export interface MobileSpoolsideSlot {
  readonly slot: number;
  /** Worktree id (matches ACPNavProject.name for spoolside worktrees). */
  readonly id: string;
  /** The slot's remote-access port — swap it into the current origin to
   * reach that worktree's mobile app. */
  readonly remotePort: number;
}

/**
 * The live slot serving the given worktree project, or null when the project
 * is not a spoolside worktree with a running mobile surface — or when it is
 * the slot already serving this app (jumping to yourself is noise).
 */
export function spoolsideSlotForWorktree(
  project: Pick<ACPNavProject, "name" | "isWorktree">,
  spoolside: MobileSpoolsideInstance | null | undefined,
): MobileSpoolsideSlot | null {
  if (!spoolside || !project.isWorktree) return null;
  const slot = spoolside.slots.find((candidate) => candidate.id === project.name);
  if (!slot || slot.slot === spoolside.slot) return null;
  return slot;
}

/**
 * The URL of a slot's mobile app root: the current protocol and hostname with
 * the slot's remote-access port, path reset to "/" (deep routes are
 * per-instance state and would not resolve on the target). The phone reaches
 * every slot's helper the same way (Tailscale hostname, same TLS story), only
 * the port differs (portsForSlot in ui/packages/spoolside/src/worktree/shared.ts).
 * IPv6 literals are fine: Location.hostname keeps the brackets ("[::1]") per
 * the WHATWG URL standard.
 */
export function spoolsideSlotMobileUrl(
  slot: Pick<MobileSpoolsideSlot, "remotePort">,
  location: Pick<Location, "protocol" | "hostname">,
  handoffHash = "",
): string {
  return `${location.protocol}//${location.hostname}:${slot.remotePort}/${handoffHash}`;
}
