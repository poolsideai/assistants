// Shared styling for the connector-row actions popover menu, used by
// UserMcpServerRow and PoolMcpServerRow so the two can't drift.
export const mcpMenuItemClass =
  "text-psx-foreground-primary hover:bg-psx-menu-hover-background outline-hidden focus-visible:outline-psx-focus flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs focus-visible:outline-2";

export const mcpMenuDangerItemClass =
  "text-psx-error-foreground hover:bg-psx-menu-hover-background outline-hidden focus-visible:outline-psx-focus flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs focus-visible:outline-2";
