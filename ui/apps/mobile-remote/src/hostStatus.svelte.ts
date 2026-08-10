// Reactive MobileHostStatus implementation: main.ts mutates it (socket status
// callbacks, the /api/me host name and spoolside worktree identity) and the
// mounted shell re-renders.

import type { MobileHostStatus, MobileSpoolsideInstance } from "@poolsideai/assistant";

export interface MutableHostStatus extends MobileHostStatus {
  name: string | null;
  connected: boolean;
  spoolside: MobileSpoolsideInstance | null;
}

export function createHostStatus(): MutableHostStatus {
  let name = $state<string | null>(null);
  let connected = $state(false);
  let spoolside = $state<MobileSpoolsideInstance | null>(null);
  return {
    get name() {
      return name;
    },
    set name(value) {
      name = value;
    },
    get connected() {
      return connected;
    },
    set connected(value) {
      connected = value;
    },
    get spoolside() {
      return spoolside;
    },
    set spoolside(value) {
      spoolside = value;
    },
  };
}
