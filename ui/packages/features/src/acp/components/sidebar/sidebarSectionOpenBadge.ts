import { isACPChatConversation, type ACPConversationSummary } from "../../navTypes";

export type DesktopSidebarSection = "chats" | "projects";

export function activeConversationSidebarSection(
  sessions: readonly ACPConversationSummary[],
  isSelected: (session: ACPConversationSummary) => boolean,
  selectedConversationIsChat?: (session: ACPConversationSummary) => boolean | undefined,
): DesktopSidebarSection | null {
  const selectedSession = sessions.find(isSelected);
  if (!selectedSession) return null;
  const isChat =
    selectedConversationIsChat?.(selectedSession) ?? isACPChatConversation(selectedSession);
  return isChat ? "chats" : "projects";
}

export function shouldShowSidebarSectionOpenBadge(
  section: DesktopSidebarSection,
  collapsed: boolean,
  activeSection: DesktopSidebarSection | null,
): boolean {
  return collapsed && section === activeSection;
}

export function sidebarSectionToggleLabel(
  section: DesktopSidebarSection,
  collapsed: boolean,
  containsOpenConversation: boolean,
): string {
  const action = collapsed ? "Expand" : "Collapse";
  const sectionLabel = section === "chats" ? "Chats" : "Projects";
  return `${action} ${sectionLabel}${containsOpenConversation ? ", contains open conversation" : ""}`;
}
