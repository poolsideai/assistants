// Reactive MobileHostStatus implementation: main.ts mutates it (socket status
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

export interface MutableHostStatus extends MobileHostStatus {
  name: string | null;
  connected: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

export function createHostStatus(): MutableHostStatus {
  let name = $state<string | null>(null);
  let connected = $state(false);
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  };
}
