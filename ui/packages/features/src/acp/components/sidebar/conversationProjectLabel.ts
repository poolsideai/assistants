import {
  isACPChatConversation,
  type ACPConversationSummary,
  type ACPNavProject,
} from "../../navTypes";

export function conversationProjectLabel(
  conversation: ACPConversationSummary,
  projects: readonly ACPNavProject[],
): string | null {
  if (isACPChatConversation(conversation)) return null;
  const workspacePath = conversation.workspacePath || conversation.cwd;
  const matchedProject =
    exactProject(workspacePath, projects) ?? containingProject(workspacePath, projects);
  const rootProject =
    matchedProject?.isWorktree && matchedProject.parentPath
      ? (exactProject(matchedProject.parentPath, projects) ?? matchedProject)
      : matchedProject;
  return rootProject ? rootProject.nickname || rootProject.name : basename(workspacePath);
}

function exactProject(path: string, projects: readonly ACPNavProject[]): ACPNavProject | undefined {
  const normalizedPath = normalizePath(path);
  return projects.find((project) => normalizePath(project.path) === normalizedPath);
}

function containingProject(
  path: string,
  projects: readonly ACPNavProject[],
): ACPNavProject | undefined {
  return projects
    .filter((project) => containsPath(project.path, path))
    .sort((a, b) => normalizePath(b.path).length - normalizePath(a.path).length)[0];
}

function containsPath(parentPath: string, path: string): boolean {
  const parent = normalizePath(parentPath);
  const child = normalizePath(path);
  if (!parent || !child) return false;
  return child === parent || child.startsWith(`${parent}/`);
}

function normalizePath(path: string): string {
  let normalized = path.trim().replace(/\\/g, "/").replace(/\/+/g, "/");
  if (normalized.length > 1) normalized = normalized.replace(/\/+$/g, "");
  return normalized;
}

function basename(path: string): string {
  const normalized = normalizePath(path);
  return normalized.split("/").filter(Boolean).at(-1) || normalized || "Project";
}
