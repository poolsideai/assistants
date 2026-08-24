export interface WorkspacePath {
  path: string;
}

export interface WorkspaceScopedConversation {
  cwd?: string | null;
  workingDirectories?: string[] | null;
}

// Whether the IDE sidebar shows a conversation for the folders currently open.
// With no folder open there is nothing to scope against, so every conversation
// stays visible: scoping against an empty folder list matches nothing and would
// hide the user's entire history behind an empty sidebar.
export function conversationFitsWorkspaceFolders(
  conversation: WorkspaceScopedConversation,
  workspaceFolders: WorkspacePath[],
): boolean {
  if (workspaceFolders.length === 0) return true;

  const workingDirectories = conversation.workingDirectories?.length
    ? conversation.workingDirectories
    : [conversation.cwd ?? ""];

  return workingDirectories.some((path) =>
    workspacePathFitsWorkspaceFolders(path, workspaceFolders),
  );
}

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
