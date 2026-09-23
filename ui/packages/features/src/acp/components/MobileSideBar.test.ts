import { fireEvent, render, screen, within } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import type { ACPConversationSummary, ACPNavProject } from "../navTypes";
import { ACP_CHAT_WORKSPACE_PATH } from "../workspaceScope";
import Harness from "./MobileSideBar.test.svelte";

describe("MobileSideBar", () => {
  it("renders standalone chats separately from project conversations and collapses them", async () => {
    const project = makeProject("/repo");
    const chat = makeConversation("chat", "/state/chats/chat", "Standalone chat", {
      workspacePath: ACP_CHAT_WORKSPACE_PATH,
    });
    const projectConversation = makeConversation("project", project.path, "Project conversation", {
      workspacePath: project.path,
    });

    render(Harness, {
      props: {
        projects: [project],
        sessions: [chat, projectConversation],
      },
    });

    const chats = within(screen.getByRole("region", { name: "Chats" }));
    expect(chats.getByText("Standalone chat")).toBeInTheDocument();
    expect(chats.queryByText("Project conversation")).toBeNull();

    const projectSection = within(screen.getByRole("region", { name: "repo" }));
    expect(projectSection.getByText("Project conversation")).toBeInTheDocument();
    expect(projectSection.queryByText("Standalone chat")).toBeNull();

    const collapseChats = screen.getByRole("button", { name: "Collapse Chats" });
    expect(collapseChats).toHaveAttribute("aria-expanded", "true");
    await fireEvent.click(collapseChats);

    expect(screen.getByRole("button", { name: "Expand Chats" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(chats.queryByText("Standalone chat")).toBeNull();
    expect(projectSection.getByText("Project conversation")).toBeInTheDocument();
  });
});

function makeProject(path: string): ACPNavProject {
  return {
    path,
    name: path.split("/").at(-1) ?? path,
    isWorktree: false,
    collapsed: false,
    displayOrder: 0,
    createdAt: "2026-07-29T00:00:00Z",
    updatedAt: "2026-07-29T00:00:00Z",
  };
}

function makeConversation(
  id: string,
  cwd: string,
  title: string,
  overrides: Partial<ACPConversationSummary> = {},
): ACPConversationSummary {
  return {
    id,
    sessionId: id,
    cwd,
    title,
    updatedAt: null,
    agentServer: "poolside",
    source: "native_session",
    readOnly: false,
    errorMessage: null,
    cancellationReason: null,
    conversationId: id,
    conversationKind: null,
    workingDirectories: [cwd],
    agentId: null,
    _meta: {},
    ...overrides,
  };
}
