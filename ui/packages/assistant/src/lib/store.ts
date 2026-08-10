__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { ColorTheme, FileIconTheme } from "@poolsideai/components/providers";
import { normalize } from "@poolsideai/lib/path";
import type { Configuration, Keybindings, Language, WorkspaceFolder } from "@poolsideai/rpc";
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
  terminalPanel?: boolean;
  openWorkspace?: boolean;
  addFolderToWorkspace?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  desktopInstance?: DesktopInstanceInfo;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
export interface DesktopInstanceInfo {
  worktreeName?: string;
  folderName?: string;
  color?: string;
}

export interface PoolsideInitialState {
  accessToken?: string;
  keybindings?: Keybindings;
  colorTheme?: ColorTheme;
  fileIconTheme?: FileIconTheme;
  userSettings?: Configuration;
  environment?: Environment;
  workspaces?: WorkspaceFolder[];
  homeDirectory?: string;
  defaultCwd?: string;
  languages?: Language[];
  isAgenticMode?: boolean;
  isHelperSupported?: boolean;
  isEditorFocused?: boolean;
}

type AuthManagedInitialState = PoolsideInitialState & {
  identity?: unknown;
  is_tenant_admin?: boolean;
  isAuthenticated?: boolean;
  canAutoApproveCommands?: boolean;
  userAvatarBase64?: string;
  features?: unknown;
  [key: string]: unknown;
};

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    boolFeatures: {},
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
  homeDirectory: "",
  // Fallback cwd when no folder is open. Set by the host (e.g. VS Code
  // extension resolves $HOME). Empty in environments without a host.
  defaultCwd: "",
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
// Resolves the cwd for new ACP sessions and history refreshes. Prefers the
// first open workspace folder, then the host-provided default (typically
// $HOME), then "/" as a last resort.
export function resolveSessionCwd(appState: Pick<AppState, "workspaces" | "defaultCwd">): string {
  return appState.workspaces[0]?.path || appState.defaultCwd || "/";
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  ensureWorkspaceForCwd: (cwd: string | null | undefined) => Updater<AppState>;
  setInitialState: (initial: PoolsideInitialState) => Updater<AppState>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
function workspaceName(path: string): string {
  const parts = path.split(/[\\/]/).filter(Boolean);
  return parts.at(-1) ?? path;
}

export function workspaceFromCwd(cwd: string | null | undefined): WorkspaceFolder | undefined {
  const trimmedCwd = cwd?.trim();
  if (!trimmedCwd || normalize(trimmedCwd) === "/") return;

  return {
    path: trimmedCwd,
    name: workspaceName(trimmedCwd),
    index: -1,
  };
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  setInitialState: (initial) => ($state) => {
    const nextState = stripAuthFields(initial);

    return {
      ...$state,
      ...nextState,
      userSettings: {
        ...$state.userSettings,
        ...(nextState.userSettings ?? {}),
      },
    };
  },
  ensureWorkspaceForCwd: (cwd) => ($state) => {
    if ($state.environment?.assistantHost === "desktop") return $state;
    if ($state.workspaces.some((workspace) => workspace.index >= 0)) return $state;

    const workspace = workspaceFromCwd(cwd);
    if (!workspace) return $state;

    if (
      $state.workspaces.some((existing) => normalize(existing.path) === normalize(workspace.path))
    ) {
      return $state;
    }

    return {
      ...$state,
      workspaces: [workspace],
    };
  },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  initial: PoolsideInitialState | undefined,
): Omit<PoolsideInitialState, "accessToken"> {
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
  } = initial as AuthManagedInitialState;
  return rest as Omit<PoolsideInitialState, "accessToken">;
__POOL_SYNTHETIC_IMPORT_BASELINE__
