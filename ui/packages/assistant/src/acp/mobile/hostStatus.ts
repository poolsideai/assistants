// Identity and liveness of the desktop the mobile shell remote-controls. The
// host app owns the values (it knows the transport and the paired machine);
// the shell only renders them in the top bar. Implementations should be
// reactive ($state-backed) so the connection dot tracks the socket live.

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export interface MobileHostStatus {
  /** Display name of the connected computer, e.g. "Andys-MacBook-Pro"; null until known. */
  readonly name: string | null;
  /** True while the transport socket is open. */
  readonly connected: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}
