export interface WorkspacePath {
  path: string;
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
export function workspacePathFitsWorkspaceFolders(
  path: string,
  workspaceFolders: WorkspacePath[],
): boolean {
  return workspaceFolders.some((folder) => pathsFit(path, folder.path));
}

function pathsFit(path: string, workspaceFolderPath: string): boolean {
  const candidate = normalizeWorkspacePath(path);
  const folder = normalizeWorkspacePath(workspaceFolderPath);

  if (!candidate || !folder) return false;
  return candidate === folder || isInsidePath(candidate, folder) || isInsidePath(folder, candidate);
}

function isInsidePath(path: string, maybeParent: string): boolean {
  return path.startsWith(`${maybeParent}/`);
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
