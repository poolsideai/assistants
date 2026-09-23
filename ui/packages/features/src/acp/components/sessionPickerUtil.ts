__POOL_SYNTHETIC_IMPORT_BASELINE__
import { stripInjectedContextFromText } from "../features/session/hostContext";
import { isACPChatConversation, type ACPNavProject } from "../navTypes";

export interface SessionPickerMatch {
  matchIndices: number[];
  matchScore: number;
  session: ACPConversationSummary;
}

export interface SessionPickerBucket {
  key: string;
  sessions: SessionPickerMatch[];
  title: string;
}

interface TitleMatchResult {
  indices: number[];
  matches: boolean;
  score: number;
}

export function groupSessions(
  sessions: ACPConversationSummary[],
  searchQuery: string,
  now: Date = new Date(),
): SessionPickerBucket[] {
  const query = searchQuery.trim();
  const filtered = matchingSessions(sessions, query);
  const today: SessionPickerMatch[] = [];
  const thisWeek: SessionPickerMatch[] = [];
  const older: SessionPickerMatch[] = [];

  for (const item of filtered) {
    const timestamp = item.session.updatedAt;
    if (!timestamp) {
      today.push(item);
      continue;
    }

    const date = new Date(timestamp);
    if (isToday(date, now)) {
      today.push(item);
    } else if (isThisWeek(date, now)) {
      thisWeek.push(item);
    } else {
      older.push(item);
    }
  }

  if (!query) {
    const sortByRecent = (a: SessionPickerMatch, b: SessionPickerMatch) =>
      sortSessions(a.session, b.session);
    today.sort(sortByRecent);
    thisWeek.sort(sortByRecent);
    older.sort(sortByRecent);
  }

  const buckets: SessionPickerBucket[] = [];
  if (today.length > 0) {
    buckets.push({ key: "today", title: "Today", sessions: today });
  }
  if (thisWeek.length > 0) {
    buckets.push({ key: "this-week", title: "This week", sessions: thisWeek });
  }
  if (older.length > 0) {
    buckets.push({ key: "older", title: "Older conversations", sessions: older });
  }

  return buckets;
}

export function groupSessionsByProject(
  sessions: ACPConversationSummary[],
  searchQuery: string,
  projects: readonly ACPNavProject[],
): SessionPickerBucket[] {
  const query = searchQuery.trim();
  const filtered = matchingSessions(sessions, query);
  if (!query) {
    filtered.sort((a, b) => sortSessions(a.session, b.session));
  }

  const buckets = new Map<string, SessionPickerBucket>();
  for (const item of filtered) {
    const group = projectGroup(item.session, projects);
    if (!group) continue;
    const bucket = buckets.get(group.key) ?? { ...group, sessions: [] };
    bucket.sessions.push(item);
    buckets.set(group.key, bucket);
  }

  const projectBucketOrder = new Map(
    projects
      .filter((project) => !project.isWorktree)
      .sort((left, right) =>
        left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" }),
      )
      .map((project, index) => [`project:${normalizePath(project.path)}`, index]),
  );

  return [...buckets.values()].sort((left, right) => {
    if (left.key === "chats") return -1;
    if (right.key === "chats") return 1;
    return (
      (projectBucketOrder.get(left.key) ?? Number.MAX_SAFE_INTEGER) -
      (projectBucketOrder.get(right.key) ?? Number.MAX_SAFE_INTEGER)
    );
  });
}

function matchingSessions(sessions: ACPConversationSummary[], query: string): SessionPickerMatch[] {
  const matches = sessions
    .map((session) => {
      const title = stripInjectedContextFromText(session.title || "New session");
      const result = substringMatch(title, query);

      return {
        session,
        matchIndices: result.indices,
        matchScore: result.score,
      };
    })
    .filter((item) => !query || item.matchScore !== Infinity);

  return query ? matches.sort((a, b) => a.matchScore - b.matchScore) : matches;
}

function projectGroup(
  session: ACPConversationSummary,
  projects: readonly ACPNavProject[],
): { key: string; title: string } | null {
  if (isACPChatConversation(session)) {
    return { key: "chats", title: "Chats" };
  }

  const workspacePath = session.workspacePath || session.cwd;
  const normalizedWorkspacePath = normalizePath(workspacePath);
  const exactProject = projects.find(
    (project) => normalizePath(project.path) === normalizedWorkspacePath,
  );
  const containingProject = projects
    .filter((project) => containsPath(project.path, workspacePath))
    .sort((a, b) => normalizePath(b.path).length - normalizePath(a.path).length)[0];
  const matchedProject = exactProject ?? containingProject;
  const parentPath = matchedProject?.isWorktree ? matchedProject.parentPath : undefined;
  const rootProject = parentPath
    ? (projects.find((project) => normalizePath(project.path) === normalizePath(parentPath)) ??
      matchedProject)
    : matchedProject;

  if (rootProject) {
    return {
      key: `project:${normalizePath(rootProject.path)}`,
      title: rootProject.nickname || rootProject.name,
    };
  }

  return null;
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

function substringMatch(text: string, query: string): TitleMatchResult {
  if (!query) {
    return { matches: true, score: 0, indices: [] };
  }

  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const matchIndex = textLower.indexOf(queryLower);
  const matches = matchIndex >= 0;
  return {
    matches,
    score: matches ? matchIndex : Infinity,
    indices: matches
      ? Array.from({ length: queryLower.length }, (_, index) => matchIndex + index)
      : [],
  };
}

function isToday(date: Date, now: Date): boolean {
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function isThisWeek(date: Date, now: Date): boolean {
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return date > weekAgo && !isToday(date, now);
}

/**
 * Given a history session, find the matching active nav session (or fall back
 * to the history session itself when it has already been restored).
 */
export function findVisibleNavSession(
  session: ACPConversationSummary,
  navSessions: ACPConversationSummary[],
  restoredKeys: ReadonlySet<string>,
  getAgentServer: (s: { agentServer?: string }) => string,
): ACPConversationSummary | undefined {
  const agentServer = getAgentServer(session);
  const active = session.sessionId
    ? navSessions.find(
        (ns) => ns.sessionId === session.sessionId && getAgentServer(ns) === agentServer,
      )
    : navSessions.find((ns) => ns.id === session.id && getAgentServer(ns) === agentServer);
  if (active) return active;

  const key = `${agentServer}:${session.sessionId || session.id}`;
  return restoredKeys.has(key) ? session : undefined;
}

/**
 * Build a composite key for tracking restored history sessions.
 */
export function historySessionKey(
  session: ACPConversationSummary,
  getAgentServer: (s: { agentServer?: string }) => string,
): string {
  return `${getAgentServer(session)}:${session.sessionId || session.id}`;
}

function sortSessions(a: ACPConversationSummary, b: ACPConversationSummary): number {
  if (!a.updatedAt && !b.updatedAt) {
    return (a.sessionId ?? a.id).localeCompare(b.sessionId ?? b.id);
  }
  if (!a.updatedAt) {
    return 1;
  }
  if (!b.updatedAt) {
    return -1;
  }

  const timeDiff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  if (timeDiff !== 0) {
    return timeDiff;
  }

  const serverDiff = a.agentServer.localeCompare(b.agentServer);
  return serverDiff || (a.sessionId ?? a.id).localeCompare(b.sessionId ?? b.id);
}
