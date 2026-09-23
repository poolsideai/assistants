import type { GitStatusOutput } from "@poolsideai/helperapi";

export const DESKTOP_NEW_TAB_EVENT = "poolside:desktop-new-tab";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export const DESKTOP_OPEN_CONVERSATION_SEARCH_EVENT = "poolside:desktop-open-conversation-search";
export const DESKTOP_OPEN_FILE_TAB_EVENT = "poolside:desktop-open-file-tab";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

export interface DesktopNewTabActionAvailability {
  disabled?: boolean;
  disabledReason?: string;
}

export type DesktopNewTabAvailability = Partial<
  Record<DesktopNewTabKind, DesktopNewTabActionAvailability>
>;

export interface DesktopNewTabEventDetail {
  kind?: DesktopNewTabKind;
}

export interface DesktopOpenConversationSearchEventDetail {
  initialQuery?: string;
}

export interface DesktopOpenFileTabEventDetail {
  path?: string;
  line?: number;
  column?: number;
}
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

export function gitViewDisabledReason(
  worktreePath: string | undefined,
  status: GitStatusOutput | undefined,
): string | undefined {
  if (!worktreePath) return "No working directory";
  if (!status) return "Checking Git availability";
  if (status.isRepo) return undefined;
  return status.gitMissing ? "Git is not installed" : "Not a git repository";
}
