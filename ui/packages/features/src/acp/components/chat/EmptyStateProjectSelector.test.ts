import { fireEvent, render, screen, waitFor } from "@testing-library/svelte";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ACPSessionRepository } from "../../features/SessionRepository.svelte";
import { appState } from "../../hostAdapter";
import { initializeStatefulModule } from "../../hostRpc";
import type { ACPNavProject } from "../../navTypes";
import Harness from "./EmptyStateProjectSelector.test.svelte";
import { _resetFileIconDataUriCacheForTests } from "./fileIconDataUri";
import type { NativeMenuIcon } from "./nativeMenuIcons";

// Deterministic wire icons without a canvas: glyph names and file references
// encode losslessly so tests can assert exactly which icon each row asked
// for.
vi.mock("./nativeMenuIcons", () => ({
  wireIconFor: vi.fn(async (icon: NativeMenuIcon) => {
    if (typeof icon === "string") return { pngBase64: `glyph:${icon}` };
    if ("file" in icon) return { filePath: icon.file };
    return undefined;
  }),
}));

function makeProjects(): ACPNavProject[] {
  return [
    {
      path: "/repo/a",
      name: "Project A",
      isWorktree: false,
      collapsed: false,
      displayOrder: 0,
      createdAt: "",
      updatedAt: "",
    },
    {
      path: "/repo/b",
      name: "Project B",
      isWorktree: false,
      collapsed: false,
      displayOrder: 1,
      createdAt: "",
      updatedAt: "",
    },
  ];
}

function makeWorktree(path: string, name: string, displayOrder: number): ACPNavProject {
  return {
    path,
    name,
    isWorktree: true,
    parentPath: "/repo/a",
    collapsed: false,
    displayOrder,
    createdAt: "",
    updatedAt: "",
  };
}

function makeRepo(createSession: ReturnType<typeof vi.fn>): ACPSessionRepository {
  const session = {
    sessionId: null,
    conversationId: null,
    agentServer: null,
    pendingCwd: "/repo/a",
    pendingConversationId: "draft-1",
    isChat: false,
    isSending: false,
  };
  return {
    getSessionByConversationId: () => session,
    agents: { defaultAgentServer: "poolside" },
    createSession,
  } as unknown as ACPSessionRepository;
}

// A host sender that only answers the given methods; everything else (e.g.
// the trigger's fileIconDataUri fetch) resolves undefined like a host without
// the capability.
function makeSender(responses: Record<string, unknown>): ReturnType<typeof vi.fn> {
  return vi.fn((method: string) => Promise.resolve(responses[method]));
}

function setEnvironment(assistantHost: string, operatingSystem?: string): void {
  appState.update((state) => ({
    ...state,
    environment: { ...state.environment, assistantHost, operatingSystem },
  }));
}

describe("EmptyStateProjectSelector", () => {
  afterEach(() => {
    setEnvironment("", undefined);
    _resetFileIconDataUriCacheForTests();
  });

  describe("DOM fallback", () => {
    it("selects a project from the dropdown", async () => {
      // Desktop, non-macOS: shows the picker without the native menu path.
      setEnvironment("desktop", "win32");
      const createSession = vi.fn().mockReturnValue({ conversationId: "draft-1" });
      render(Harness, {
        props: { repo: makeRepo(createSession), projects: makeProjects(), onAddProject: vi.fn() },
      });

      await fireEvent.click(screen.getByRole("button", { name: /Change chat, project/ }));
      await fireEvent.click(screen.getByRole("menuitem", { name: "Project B" }));

      expect(createSession).toHaveBeenCalledExactlyOnceWith("/repo/b", "poolside", "draft-1", {
        isChat: false,
      });
    });
  });

  describe("native menu host", () => {
    it("presents the native menu and selects a project", async () => {
      setEnvironment("desktop", "darwin");
      const sender = makeSender({ showDesktopContextMenu: "/repo/b" });
      initializeStatefulModule(sender);
      const createSession = vi.fn().mockReturnValue({ conversationId: "draft-1" });
      const onAddProject = vi.fn();

      render(Harness, {
        props: { repo: makeRepo(createSession), projects: makeProjects(), onAddProject },
      });

      await fireEvent.click(screen.getByRole("button", { name: /Change chat, project/ }));
      await waitFor(() => expect(createSession).toHaveBeenCalledTimes(1));

      expect(createSession).toHaveBeenCalledExactlyOnceWith("/repo/b", "poolside", "draft-1", {
        isChat: false,
      });
      expect(onAddProject).not.toHaveBeenCalled();

      // No DOM menu renders; the OS owns the surface.
      expect(screen.queryByRole("menuitem")).toBeNull();

      const call = sender.mock.calls.find(([method]) => method === "showDesktopContextMenu");
      expect(call).toBeDefined();
      const [, args] = call!;
      expect(args[0]).toMatchObject({
        highlightStyle: "themed",
        items: [
          {
            kind: "action",
            id: "__chat__",
            label: "Chat",
            checked: false,
            icon: { pngBase64: "glyph:chats" },
          },
          { kind: "separator", label: "Projects" },
          // Project rows carry the project's path so the OS shows its real
          // folder icon; glyph rows (Chat, Add Project…) do not.
          {
            kind: "action",
            id: "/repo/a",
            label: "Project A",
            checked: true,
            icon: { filePath: "/repo/a" },
          },
          {
            kind: "action",
            id: "/repo/b",
            label: "Project B",
            checked: false,
            icon: { filePath: "/repo/b" },
          },
          { kind: "separator" },
          {
            kind: "action",
            id: "__add_project__",
            label: "Add Project…",
            icon: { pngBase64: "glyph:folder-plus" },
          },
        ],
      });
    });

    it("groups worktrees under their parent with the git-branch glyph, indented", async () => {
      setEnvironment("desktop", "darwin");
      const sender = makeSender({});
      initializeStatefulModule(sender);
      // Worktrees arrive out of render order; the menu must still show each
      // root followed by its display-order-sorted worktrees.
      const projects = [
        ...makeProjects(),
        makeWorktree("/repo/a-wt2", "Worktree 2", 1),
        makeWorktree("/repo/a-wt1", "Worktree 1", 0),
      ];

      render(Harness, {
        props: { repo: makeRepo(vi.fn()), projects, onAddProject: vi.fn() },
      });

      await fireEvent.click(screen.getByRole("button", { name: /Change chat, project/ }));
      await waitFor(() =>
        expect(sender).toHaveBeenCalledWith("showDesktopContextMenu", expect.anything()),
      );

      const [, args] = sender.mock.calls.find(([method]) => method === "showDesktopContextMenu")!;
      expect(args[0].items).toMatchObject([
        { kind: "action", id: "__chat__" },
        { kind: "separator", label: "Projects" },
        { kind: "action", id: "/repo/a", icon: { filePath: "/repo/a" } },
        {
          kind: "action",
          id: "/repo/a-wt1",
          label: "Worktree 1",
          indent: 1,
          icon: { pngBase64: "glyph:git-branch" },
        },
        {
          kind: "action",
          id: "/repo/a-wt2",
          label: "Worktree 2",
          indent: 1,
          icon: { pngBase64: "glyph:git-branch" },
        },
        { kind: "action", id: "/repo/b", icon: { filePath: "/repo/b" } },
        { kind: "separator" },
        { kind: "action", id: "__add_project__" },
      ]);
      // Root project rows are not indented.
      expect(args[0].items[2].indent).toBeUndefined();
    });

    it("invokes onAddProject when the affordance is selected", async () => {
      setEnvironment("desktop", "darwin");
      const sender = makeSender({ showDesktopContextMenu: "__add_project__" });
      initializeStatefulModule(sender);
      const createSession = vi.fn();
      const onAddProject = vi.fn();

      render(Harness, {
        props: { repo: makeRepo(createSession), projects: makeProjects(), onAddProject },
      });

      await fireEvent.click(screen.getByRole("button", { name: /Change chat, project/ }));
      await waitFor(() => expect(onAddProject).toHaveBeenCalledOnce());

      expect(createSession).not.toHaveBeenCalled();
    });

    it("swaps the trigger's folder glyph for the host's file icon", async () => {
      setEnvironment("desktop", "darwin");
      const sender = makeSender({ fileIconDataUri: "data:image/png;base64,abc" });
      initializeStatefulModule(sender);

      render(Harness, { props: { repo: makeRepo(vi.fn()), projects: makeProjects() } });

      const button = screen.getByRole("button", { name: /Change chat, project/ });
      await waitFor(() => {
        const img = button.querySelector("img");
        expect(img).not.toBeNull();
        expect(img!.getAttribute("src")).toBe("data:image/png;base64,abc");
      });
      expect(sender).toHaveBeenCalledWith("fileIconDataUri", ["/repo/a"]);
    });

    it("keeps the folder glyph when the host yields no file icon", async () => {
      setEnvironment("desktop", "darwin");
      const sender = makeSender({});
      initializeStatefulModule(sender);

      render(Harness, { props: { repo: makeRepo(vi.fn()), projects: makeProjects() } });

      await waitFor(() => expect(sender).toHaveBeenCalledWith("fileIconDataUri", ["/repo/a"]));
      // Let the undefined result settle: the glyph must still be the icon.
      await Promise.resolve();
      await Promise.resolve();
      const button = screen.getByRole("button", { name: /Change chat, project/ });
      expect(button.querySelector("img")).toBeNull();
    });
  });
});
