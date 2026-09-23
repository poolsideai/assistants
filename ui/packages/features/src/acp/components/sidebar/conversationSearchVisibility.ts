import {
  isACPChatConversation,
  type ACPConversationSummary,
  type ACPNavProject,
} from "../../navTypes";

type SearchConversation = Pick<ACPConversationSummary, "cwd" | "workspacePath">;
type SearchProject = Pick<ACPNavProject, "path"> &
  Partial<Pick<ACPNavProject, "isWorktree" | "parentPath">>;

// Explicit projectless chats have their own sidebar section. Project
// conversations must belong to an exact root project or to a worktree whose
// parent root is still visible; cwd is only a fallback for legacy summaries
// without the persisted ownership field.
export function isConversationVisibleInSearch(
  session: SearchConversation,
  projects: readonly SearchProject[],
): boolean {
  if (isACPChatConversation(session)) return true;

  const workspacePath = session.workspacePath || session.cwd;
  const project = projects.find((candidate) => candidate.path === workspacePath);
  if (!project) return false;
  if (project.isWorktree !== true) return true;
  if (!project.parentPath) return false;
  return projects.some(
    (candidate) => candidate.isWorktree !== true && candidate.path === project.parentPath,
  );
}
