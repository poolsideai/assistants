import {
  acpProtocolCwd,
  acpWorkingDirectories,
  acpWorkspaceFolders,
  acpWorkspacePath,
  resolveSessionCwd,
  type ACPNavProject,
  type AppState,
} from "@poolsideai/features/acp";

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
export function defaultDesktopConversationCwd({
  appState,
  isDesktop,
  firstProject,
}: {
  appState: AppState;
  isDesktop: boolean;
  firstProject?: ACPNavProject;
}): string {
  if (isDesktop) {
    return firstProject?.path ?? resolveSessionCwd(appState);
  }
  return acpProtocolCwd(acpWorkspaceFolders(appState), resolveSessionCwd(appState));
}

export function resolveDesktopWorkspaceRoot(cwd: string, projects: ACPNavProject[]): string {
  const normalizedCwd = normalizeWorkspacePath(cwd);
  const project = projects
    .filter((candidate) => pathContains(candidate.path, normalizedCwd))
    .sort(
      (left, right) =>
        normalizeWorkspacePath(right.path).length - normalizeWorkspacePath(left.path).length,
    )
    .at(0);

  return project?.path ?? cwd;
}

export function resolveConversationWorkspaceScope(appState: AppState, cwd: string) {
  const workspaceFolders = acpWorkspaceFolders(appState, cwd);
  const protocolCwd = acpProtocolCwd(workspaceFolders, cwd);

  return {
    cwd: protocolCwd,
    workspacePath: acpWorkspacePath(appState, workspaceFolders, protocolCwd),
    workingDirectories: acpWorkingDirectories(workspaceFolders, protocolCwd),
  };
}

function pathContains(parentPath: string, path: string): boolean {
  const parent = normalizeWorkspacePath(parentPath);
  if (!parent || !path) return false;
  return path === parent || path.startsWith(`${parent}/`);
}

function normalizeWorkspacePath(path: string): string {
  let normalized = path.trim().replace(/\\/g, "/").replace(/\/+/g, "/");
  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/g, "");
  }
  if (/^[A-Z]:\//.test(normalized)) {
    normalized = normalized[0].toLowerCase() + normalized.slice(1);
  }
  return normalized;
}
