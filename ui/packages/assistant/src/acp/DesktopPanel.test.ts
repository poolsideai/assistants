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
  setACPSetupScriptOutputContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
  setLocalInferenceContext,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { initializeStatefulModule as initializeHelperApi } from "@poolsideai/helperapi";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { fireEvent, render, screen, waitFor, within } from "@testing-library/svelte";
import { tick } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import {
  writeStoredDefaultDesktopLayout,
  type PersistedDesktopLayout,
} from "../../../features/src/acp/components/chat/desktopLayoutPersistence";
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
    initializeHelperApi({
      jsonrpcCall: vi
        .fn()
        .mockImplementation(async (method: string) =>
          method === "poolside/acpNav/createChat" ? { path: "/state/poolside/chat" } : {},
        ),
      jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("signals an interactive shell while agent configuration is still pending", async () => {
    const repositories = new TestRepositories({ projects: [project("/tmp/project-a")] });
    repositories.acpAgentServers.state = { status: "loading" };
    const onShellInteractive = vi.fn();
    const onInitialScreenSettled = vi.fn();
    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
      onShellInteractive,
      onInitialScreenSettled,
    });
    await waitFor(() => expect(onShellInteractive).toHaveBeenCalledTimes(1));
    expect(onInitialScreenSettled).not.toHaveBeenCalled();
    await fireEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByRole("dialog", { name: "Search conversations" })).toBeInTheDocument();
  });

  it("does not leave Settings when a delayed automatic chat directory arrives", async () => {
    let finish!: (value: { path: string }) => void;
    const directory = new Promise<{ path: string }>((resolve) => {
      finish = resolve;
    });
    initializeHelperApi({
      jsonrpcCall: vi
        .fn()
        .mockImplementation((method: string) =>
          method === "poolside/acpNav/createChat" ? directory : Promise.resolve({}),
        ),
      jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
    });
    const repositories = new TestRepositories();
    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp" }),
    });
    await fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    finish({ path: "/tmp/delayed-chat" });
    await tick();
    await tick();
    expect(repositories.acpRepo.createSession).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Back" })).toBeInTheDocument();
  });

  it("keeps the new draft selected when an older sidebar history load completes", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("old-session", "/tmp/project-a", "Old conversation")],
    });
    const loadSessionRecord = repositories.acpRepo.loadSessionRecord.getMockImplementation();
    let finishRestore!: () => void;
    repositories.acpRepo.loadSessionRecord.mockImplementationOnce((...args: unknown[]) => {
      const session = loadSessionRecord(...args);
      session.loadState = { status: "loading" };
      return new Promise((resolve) => {
        finishRestore = () => {
          session.loadState = { status: "idle" };
          resolve(session);
        };
      });
    });
    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });
    await fireEvent.click(await screen.findByText("Old conversation"));
    await waitFor(() => expect(repositories.acpRepo.loadSessionRecord).toHaveBeenCalledTimes(1));

    // Native New Conversation / Cmd+N bypasses the sidebar's createSession path.
    window.dispatchEvent(new CustomEvent("poolside:desktop-new-conversation"));
    await waitFor(() =>
      expect(screen.getByTestId("prompt-session-key")).toHaveTextContent("conversation-local"),
    );
    const editor = screen.getByRole("textbox", { name: "Prompt" });
    editor.textContent = "Keep this new draft";
    editor.focus();

    finishRestore();
    await tick();
    await tick();

    expect(screen.getByTestId("prompt-session-key")).toHaveTextContent("conversation-local");
    expect(screen.getByRole("textbox", { name: "Prompt" })).toBe(editor);
    expect(editor).toHaveTextContent("Keep this new draft");
    expect(editor).toHaveFocus();
  });

  it.each(["chat directory", "agent discovery"] as const)(
    "preserves the selected conversation and editor when a delayed new conversation's %s finishes",
    async (prerequisite) => {
      let finish!: () => void;
      const repositories = new TestRepositories({
        projects: [project("/tmp/project-a")],
        conversations: [conversationSummary("selected-later", "/tmp/project-a", "Selected later")],
      });
      if (prerequisite === "chat directory") {
        const directory = new Promise<{ path: string }>((resolve) => {
          finish = () => resolve({ path: "/tmp/delayed-chat" });
        });
        initializeHelperApi({
          jsonrpcCall: vi
            .fn()
            .mockImplementation((method: string) =>
              method === "poolside/acpNav/createChat" ? directory : Promise.resolve({}),
            ),
          jsonrpcNotify: vi.fn().mockResolvedValue(undefined),
        });
      } else {
        repositories.acpAgentServers.state = { status: "loading" };
        const discovery = new Promise<void>((resolve) => {
          finish = () => {
            repositories.acpAgentServers.state = { status: "success", value: {} };
            resolve();
          };
        });
        repositories.acpAgentServers.refresh.mockReturnValue(discovery);
      }
      await renderDesktopPanel({
        repositories,
        initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
      });
      if (prerequisite === "chat directory") {
        await fireEvent.click(screen.getByRole("button", { name: "New chat" }));
      } else {
        window.dispatchEvent(new CustomEvent("poolside:desktop-new-conversation"));
        await waitFor(() => expect(repositories.acpAgentServers.refresh).toHaveBeenCalled());
      }
      await fireEvent.click(await screen.findByText("Selected later"));
      await waitFor(() =>
        expect(screen.getByTestId("prompt-session-key")).toHaveTextContent("selected-later"),
      );
      const editor = screen.getByRole("textbox", { name: "Prompt" });
      editor.textContent = "Keep typing in this conversation";
      editor.focus();
      const createdBeforeCompletion = repositories.acpRepo.createSession.mock.calls.length;

      finish();
      await tick();
      await tick();

      expect(repositories.acpRepo.createSession).toHaveBeenCalledTimes(createdBeforeCompletion);
      expect(screen.getByTestId("prompt-session-key")).toHaveTextContent("selected-later");
      expect(screen.getByRole("textbox", { name: "Prompt" })).toBe(editor);
      expect(editor).toHaveTextContent("Keep typing in this conversation");
      expect(editor).toHaveFocus();
    },
  );

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(screen.queryByRole("button", { name: "New chat" })).toBeNull();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("copies session IDs from IDE sidebar conversation menus", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("session-to-copy", "/tmp/project-a", "Copyable conversation"),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({
        assistantHost: "vscode",
        workspaces: [{ path: "/tmp/project-a", name: "project-a", index: 0 }],
        defaultCwd: "/tmp/project-a",
      }),
    });

    const conversation = await screen.findByRole("button", {
      name: /^Copyable conversation - /,
    });
    await fireEvent.contextMenu(conversation);
    const copySessionId = screen.getByRole("menuitem", { name: "Copy Session ID" });
    expect(copySessionId.previousElementSibling).toHaveAttribute("role", "separator");
    expect(copySessionId.nextElementSibling).toHaveAttribute("role", "separator");
    await fireEvent.click(copySessionId);

    expect(hostMessageSender).toHaveBeenCalledWith("writeToClipboard", ["session-to-copy"]);
  });

  it("lands directly in a standalone chat on desktop when there are no projects", async () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // No projects: instead of a "get started" page, the user lands in a ready-to-type chat
    // seeded in an isolated chat working directory.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        "/state/poolside/chat",
__POOL_SYNTHETIC_IMPORT_BASELINE__
        expect.stringMatching(/^conversation:/),
        { isChat: true },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(await screen.findByRole("button", { name: "Submit" })).toBeInTheDocument();
    expect(screen.queryByText("Get Started")).toBeNull();
    // With only the built-in Poolside agent configured, the set-up-agent nudge shows.
    expect(screen.getByRole("button", { name: "Set up another agent" })).toBeInTheDocument();
    // Draft chat is not persisted to the sidebar until the first message is sent.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("hides the set-up-agent action once more than one extra agent is configured", async () => {
    const repositories = new TestRepositories();
    // Two agents beyond the built-in Poolside and Poolside local agents.
    repositories.acpRepo.agents.agentServerNames = ["poolside", "local", "claude-acp", "codex-acp"];

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp" }),
    });

    // The launch chat still offers opening a project, but no longer nudges to set up an agent.
    expect(await screen.findByText("add a new project to work with files")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Set up another agent" })).toBeNull();
  });

  it("adds a project from the sidebar when there are none", async () => {
    hostMessageSender.mockImplementation((method: string) => {
      if (method === "selectProjectFolder") {
        return Promise.resolve({ path: "/tmp/first-project", name: "first-project" });
      }
      return Promise.resolve(undefined);
    });
    const repositories = new TestRepositories();

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp" }),
    });

    // The sidebar "Add a Project" affordance remains even though the full-page prompt is gone.
    await fireEvent.click(await screen.findByText("Add a Project"));

    expect(repositories.acpProjectRepo.upsertProject).toHaveBeenCalledWith({
      path: "/tmp/first-project",
      name: "first-project",
    });
    await waitFor(() =>
      expect(repositories.acpRepo.createSession).toHaveBeenCalledWith(
        "/tmp/first-project",
        "poolside",
        null,
      ),
    );
  });

  it("uses title-free delete copy and warns about temporary files only for chats", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("chat-session", "/state/poolside/chat-session", "Standalone chat", {
          workspacePath: "CHAT",
        }),
        conversationSummary("project-session", "/tmp/project-a", "Project conversation", {
          workspacePath: "/tmp/project-a",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await selectFromNativeContextMenu(
      await screen.findByRole("button", { name: /^Standalone chat - / }),
      "Delete Conversation...",
    );
    let dialog = await screen.findByRole("dialog", { name: "Delete Conversation?" });
    expect(dialog).toHaveTextContent(
      "This removes the conversation and any associated files and cannot be undone.",
    );
    expect(dialog).not.toHaveTextContent("Standalone chat");
    await fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await selectFromNativeContextMenu(
      screen.getByRole("button", { name: /^Project conversation - / }),
      "Delete Conversation...",
    );
    dialog = await screen.findByRole("dialog", { name: "Delete Conversation?" });
    expect(dialog).toHaveTextContent("This removes the conversation and cannot be undone.");
    expect(dialog).not.toHaveTextContent("Project conversation");
    expect(dialog).not.toHaveTextContent("temporary working directory");
  });

  it("suppresses right-click menus on desktop sidebar controls", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const controls = [
      await screen.findByRole("button", { name: "New conversation" }),
      await screen.findByRole("button", { name: "Connectors" }),
      await screen.findByRole("button", { name: "Search" }),
      await screen.findByRole("button", { name: "Settings" }),
    ];

    hostMessageSender.mockClear();
    for (const control of controls) {
      const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
      expect(control.dispatchEvent(event)).toBe(false);
      expect(event.defaultPrevented).toBe(true);
    }

    expect(
      hostMessageSender.mock.calls.some(
        ([method]) =>
          method === "showDesktopContextMenu" || method === "showDesktopSystemContextMenu",
      ),
    ).toBe(false);
  });

  it("shows a lighter empty-conversations row for expanded empty desktop projects", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a"), project("/tmp/project-b", { collapsed: true })],
      conversations: [],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const expandedProject = within(await screen.findByRole("group", { name: "project-a" }));
    expect(expandedProject.getByRole("button", { name: "Collapse project-a" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(expandedProject.getByText("No conversations")).toBeInTheDocument();

    const collapsedProject = within(screen.getByRole("group", { name: "project-b" }));
    expect(collapsedProject.getByRole("button", { name: "Expand project-b" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(collapsedProject.queryByText("No conversations")).toBeNull();
    expect(screen.getAllByText("No conversations")).toHaveLength(1);
  });

  it("lists standalone chats in a sidebar section separate from projects", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("chat-session", "/state/poolside/chat-session", "Standalone chat", {
          workspacePath: "CHAT",
        }),
        conversationSummary("project-session", "/tmp/project-a", "Project conversation", {
          workspacePath: "/tmp/project-a",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const chats = within(await screen.findByLabelText("Chats"));
    expect(chats.getByText("Standalone chat")).toBeInTheDocument();
    expect(chats.queryByText("Project conversation")).toBeNull();

    const projects = within(screen.getByLabelText("Projects"));
    expect(projects.getByText("Project conversation")).toBeInTheDocument();
    expect(projects.queryByText("Standalone chat")).toBeNull();
    expect(screen.getByRole("button", { name: "New chat" })).toBeInTheDocument();
  });

  it("collapses the top-level Chats and Projects sections independently", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("chat-session", "/state/poolside/chat-session", "Standalone chat", {
          workspacePath: "CHAT",
        }),
        conversationSummary("project-session", "/tmp/project-a", "Project conversation"),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const chats = await screen.findByRole("group", { name: "Chats" });
    const projects = screen.getByRole("group", { name: "Projects" });
    const collapseChats = screen.getByRole("button", { name: "Collapse Chats" });
    const collapseProjects = screen.getByRole("button", { name: "Collapse Projects" });
    expect(collapseChats).toHaveAttribute("aria-expanded", "true");
    expect(collapseProjects).toHaveAttribute("aria-expanded", "true");

    await fireEvent.click(collapseChats);

    expect(screen.getByRole("button", { name: "Expand Chats" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(chats).toHaveAttribute("aria-hidden", "true");
    expect(projects).not.toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "New chat" })).toBeInTheDocument();

    await fireEvent.click(collapseProjects);

    expect(screen.getByRole("button", { name: "Expand Projects" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(projects).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "Add project" })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: "Expand Chats" }));
    expect(screen.getByRole("button", { name: "Collapse Chats" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(chats).not.toHaveAttribute("aria-hidden", "true");
  });

  it("reorders the top-level Chats and Projects sections by dragging their headings", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("chat-session", "/state/poolside/chat-session", "Standalone chat", {
          workspacePath: "CHAT",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const sectionHeadings = Array.from(
      document.querySelectorAll<HTMLElement>("[data-sidebar-section-reorder-item]"),
    );
    expect(sectionHeadings.map((heading) => heading.textContent)).toEqual([
      expect.stringContaining("Chats"),
      expect.stringContaining("Projects"),
    ]);
    mockVerticalRects(sectionHeadings);

    dispatchPointer(screen.getByRole("button", { name: "Collapse Chats" }), "pointerdown", {
      clientX: 10,
      clientY: 10,
    });
    dispatchPointer(window, "pointermove", { clientX: 10, clientY: 50 });

    await waitFor(() => {
      expect(reorderMotionContent(sectionHeadings[0])).toHaveClass("opacity-0");
      expect(document.querySelector(".reorder-drag-preview")).toHaveTextContent("Chats");
    });

    dispatchPointer(window, "pointerup", { clientX: 10, clientY: 50 });

    await waitFor(() => {
      const reordered = Array.from(
        document.querySelectorAll<HTMLElement>("[data-sidebar-section-reorder-item]"),
      );
      expect(reordered.map((heading) => heading.textContent)).toEqual([
        expect.stringContaining("Projects"),
        expect.stringContaining("Chats"),
      ]);
    });
    expect(window.localStorage.getItem("poolside.desktop.sidebarSectionOrder.v1")).toBe(
      JSON.stringify(["projects", "chats"]),
    );
  });

  it("shows a project drag preview without committing a cancelled drag", async () => {
    const repositories = new TestRepositories({
      projects: [
        project("/tmp/project-a", { collapsed: true }),
        project("/tmp/project-b", { collapsed: true }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const projectA = await screen.findByRole("button", { name: "Expand project-a" });
    const projectB = screen.getByRole("button", { name: "Expand project-b" });
    const projectItems = [
      projectA.closest<HTMLElement>("[data-reorderable-item]"),
      projectB.closest<HTMLElement>("[data-reorderable-item]"),
    ];
    expect(projectItems.every(Boolean)).toBe(true);
    mockVerticalRects(projectItems as HTMLElement[]);

    dispatchPointer(projectA, "pointerdown", { clientX: 10, clientY: 10 });
    dispatchPointer(window, "pointermove", { clientX: 10, clientY: 50 });

    await waitFor(() => {
      expect(reorderMotionContent(projectItems[0] as HTMLElement)).toHaveClass("opacity-0");
      expect(document.querySelector(".reorder-drag-preview")).toHaveTextContent("project-a");
    });

    dispatchPointer(window, "pointercancel", { clientX: 10, clientY: 50 });
    expect(repositories.acpProjectRepo.projects.map((entry: ACPNavProject) => entry.path)).toEqual([
      "/tmp/project-a",
      "/tmp/project-b",
    ]);
  });

  it("finishes the Chats gap animation before committing a quick drop", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("chat-session", "/state/poolside/chat-session", "Standalone chat", {
          workspacePath: "CHAT",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const sectionItems = Array.from(
      document.querySelectorAll<HTMLElement>("[data-sidebar-section-reorder-item]"),
    );
    mockVerticalRects(sectionItems);

    dispatchPointer(screen.getByRole("button", { name: "Collapse Chats" }), "pointerdown", {
      clientX: 10,
      clientY: 10,
    });
    dispatchPointer(window, "pointermove", { clientX: 10, clientY: 50 });
    dispatchPointer(window, "pointerup", { clientX: 10, clientY: 50 });
    await tick();

    await waitFor(() => {
      expect(sectionItems.map((item) => item.textContent)).toEqual([
        expect.stringContaining("Chats"),
        expect.stringContaining("Projects"),
      ]);
      expect(reorderMotionContent(sectionItems[0])).toHaveClass("opacity-0");
    });

    await waitFor(() => {
      const reordered = Array.from(
        document.querySelectorAll<HTMLElement>("[data-sidebar-section-reorder-item]"),
      );
      expect(reordered.map((item) => item.textContent)).toEqual([
        expect.stringContaining("Projects"),
        expect.stringContaining("Chats"),
      ]);
    });
  });

  it("restores the saved top-level sidebar section order", async () => {
    window.localStorage.setItem(
      "poolside.desktop.sidebarSectionOrder.v1",
      JSON.stringify(["projects", "chats"]),
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const sectionHeadings = Array.from(
      document.querySelectorAll<HTMLElement>("[data-sidebar-section-reorder-item]"),
    );
    expect(sectionHeadings.map((heading) => heading.textContent)).toEqual([
      expect.stringContaining("Projects"),
      expect.stringContaining("Chats"),
    ]);
  });

  it("puts Chat above the Projects group in the new-conversation picker", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(
      await screen.findByRole("button", {
        name: "Change chat, project, or worktree — current: project-a",
      }),
    );

    const menu = within(await screen.findByRole("menu"));
    const items = menu.getAllByRole("menuitem");
    expect(items[0]).toHaveTextContent("Chat");
    expect(menu.getByRole("separator")).toBeInTheDocument();
    expect(menu.getByText("Projects")).toBeInTheDocument();
    expect(items[1]).toHaveTextContent("project-a");
  });

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("reorders worktrees by dragging their rows", async () => {
    const repositories = new TestRepositories({
      projects: [
        project("/tmp/project-a"),
        project("/tmp/project-a/worktree-a", {
          isWorktree: true,
          parentPath: "/tmp/project-a",
          displayOrder: 0,
        }),
        project("/tmp/project-a/worktree-b", {
          isWorktree: true,
          parentPath: "/tmp/project-a",
          displayOrder: 1,
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const worktreeA = await screen.findByRole("button", { name: "worktree-a" });
    const worktreeB = screen.getByRole("button", { name: "worktree-b" });
    const worktreeItems = [
      worktreeA.closest<HTMLElement>("[data-reorderable-item]"),
      worktreeB.closest<HTMLElement>("[data-reorderable-item]"),
    ];
    expect(worktreeItems.every(Boolean)).toBe(true);
    mockVerticalRects(worktreeItems as HTMLElement[]);

    dispatchPointer(worktreeA, "pointerdown", { clientX: 10, clientY: 10 });
    dispatchPointer(window, "pointermove", { clientX: 10, clientY: 50 });

    await waitFor(() => {
      expect(reorderMotionContent(worktreeItems[0] as HTMLElement)).toHaveClass("opacity-0");
      expect(document.querySelector(".reorder-drag-preview")).toHaveTextContent("worktree-a");
    });

    dispatchPointer(window, "pointerup", { clientX: 10, clientY: 50 });

    await waitFor(() =>
      expect(repositories.acpProjectRepo.reorderWorktrees).toHaveBeenCalledWith("/tmp/project-a", [
        "/tmp/project-a/worktree-b",
        "/tmp/project-a/worktree-a",
      ]),
    );
  });

  it("copies session and worktree details from desktop sidebar menus", async () => {
    const worktreePath = "/tmp/project-a/worktree";
    const repositories = new TestRepositories({
      projects: [
        project("/tmp/project-a", { nickname: "Project Alpha" }),
        project(worktreePath, {
          isWorktree: true,
          parentPath: "/tmp/project-a",
        }),
      ],
      conversations: [conversationSummary("desktop-session", worktreePath, "Desktop conversation")],
      githubBranches: { [worktreePath]: "poolside/worktree" },
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: worktreePath }),
    });

    const conversation = await screen.findByRole("button", {
      name: /^Desktop conversation - /,
    });
    await selectFromNativeContextMenu(conversation, "Copy Session ID", (items) =>
      expectNativeMenuSection(items, ["Copy Session ID"]),
    );
    expect(hostMessageSender).toHaveBeenCalledWith("writeToClipboard", ["desktop-session"]);

    const worktree = screen.getByRole("button", { name: "worktree" });
    await selectFromNativeContextMenu(worktree, "Copy Worktree Path", (items) =>
      expectNativeMenuSection(items, ["Copy Worktree Path", "Copy Branch Name"]),
    );
    expect(hostMessageSender).toHaveBeenCalledWith("writeToClipboard", [worktreePath]);

    await selectFromNativeContextMenu(worktree, "Copy Branch Name");
    expect(hostMessageSender).toHaveBeenCalledWith("writeToClipboard", ["poolside/worktree"]);

    const projectGroup = screen.getByRole("group", { name: "Project Alpha" });
    const projectToggle = within(projectGroup).getByRole("button", {
      name: "Collapse Project Alpha",
    });
    await selectFromNativeContextMenu(projectToggle, "Copy Project Path", (items) =>
      expectNativeMenuSection(items, ["Copy Project Path", "Copy Project Name"]),
    );
    expect(hostMessageSender).toHaveBeenCalledWith("writeToClipboard", ["/tmp/project-a"]);

    await selectFromNativeContextMenu(projectToggle, "Copy Project Name");
    expect(hostMessageSender).toHaveBeenCalledWith("writeToClipboard", ["Project Alpha"]);
  });

  it("creates a worktree on the visible conversation's project with the keyboard shortcut", async () => {
    const worktreePath = "/tmp/project-a/worktree";
    const repositories = new TestRepositories({
      projects: [
        // Listed first: the shortcut must ignore it in favor of the project
        // owning the visible conversation.
        project("/tmp/project-b"),
        project("/tmp/project-a"),
        project(worktreePath, { isWorktree: true, parentPath: "/tmp/project-a" }),
      ],
      conversations: [conversationSummary("s-wt", worktreePath, "Worktree chat")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: worktreePath }),
    });

    await fireEvent.click(await screen.findByText("Worktree chat"));
    await waitFor(() => expect(repositories.acpRepo.loadSessionRecord).toHaveBeenCalled());

    // jsdom reports a non-mac platform, so the chord's `mod` resolves to Ctrl.
    await fireEvent.keyDown(window, { key: "W", code: "KeyW", ctrlKey: true, shiftKey: true });

    // The conversation lives in a worktree; the shortcut targets its parent project.
    await waitFor(() =>
      expect(repositories.acpWorktreeRepo.prepareWorktree).toHaveBeenCalledWith("/tmp/project-a"),
    );
    expect(repositories.acpWorktreeRepo.prepareWorktree).toHaveBeenCalledTimes(1);
  });

  it("no-ops the new-worktree shortcut when the visible conversation's project is not a git repo", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a"), project("/tmp/project-b")],
      conversations: [conversationSummary("s-plain", "/tmp/project-b", "Non-repo chat")],
      githubNonRepos: ["/tmp/project-b"],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-b" }),
    });

    await fireEvent.click(await screen.findByText("Non-repo chat"));
    await waitFor(() => expect(repositories.acpRepo.loadSessionRecord).toHaveBeenCalled());

    await fireEvent.keyDown(window, { key: "W", code: "KeyW", ctrlKey: true, shiftKey: true });
    await tick();

    expect(repositories.acpWorktreeRepo.prepareWorktree).not.toHaveBeenCalled();
  });

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
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("shows the active worktree nickname in the desktop sidebar header", async () => {
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
        desktopInstance: { worktreeName: "worktree", color: "#1f6feb" },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const initialLabel = await screen.findByTitle("Initial nickname");
    expect(initialLabel).toBeInTheDocument();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const renamedLabel = await screen.findByTitle("Renamed worktree");
    expect(renamedLabel).toBeInTheDocument();
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("renders project details in shared conversation search rows", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a", { nickname: "Project Alpha" })],
      conversations: [
        conversationSummary("search-result", "/tmp/project-a", "Conversation result", {
          workspacePath: "/tmp/project-a",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    const option = within(dialog).getByRole("option", { name: /^Conversation result/ });
    expect(within(option).getByText("Conversation result")).toBeInTheDocument();
    expect(within(option).getByText("Project Alpha")).toBeInTheDocument();
    expect(option.querySelector(".desktop-conversation-row-agent-icon")).toHaveClass(
      "text-psx-vibrant",
    );
  });

  it("orders the blank command search by last changed", async () => {
    window.localStorage.setItem(
      "poolside.desktop.recentlyViewedConversations.v1",
      JSON.stringify(["poolside:older-conversation"]),
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("older-conversation", "/tmp/project-a", "Older conversation", {
          updatedAt: "2026-05-14T00:00:00Z",
        }),
        conversationSummary("newer-conversation", "/tmp/project-a", "Newer conversation", {
          updatedAt: "2026-05-16T00:00:00Z",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    const options = within(dialog).getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Newer conversation");
    expect(options[1]).toHaveTextContent("Older conversation");
  });

  it("floats conversations needing attention to the top of the blank command search", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("waiting-conversation", "/tmp/project-a", "Waiting conversation", {
          updatedAt: "2026-05-14T00:00:00Z",
          liveStatus: { working: false, waitingForUser: true, unread: false },
        }),
        conversationSummary("unread-conversation", "/tmp/project-a", "Unread conversation", {
          updatedAt: "2026-05-15T00:00:00Z",
          liveStatus: { working: false, waitingForUser: false, unread: true },
        }),
        conversationSummary("newest-conversation", "/tmp/project-a", "Newest conversation", {
          updatedAt: "2026-05-16T00:00:00Z",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    const options = within(dialog).getAllByRole("option");
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Waiting conversation");
    expect(options[1]).toHaveTextContent("Unread conversation");
    expect(options[2]).toHaveTextContent("Newest conversation");
  });

  it("indexes and renders the embedded conversation title instead of handoff context", async () => {
    const handoffTitle = `continuepoolside://handoff/source-session.md
<context ref="poolside://handoff/source-session.md">
<poolside-handoff>
# Poolside ACP Session Handoff

This is a semantic handoff between agents.

## Conversation
Title: Fix ACP event capture end-to-end streaming
Workspace: \`/tmp/project-a\`
</poolside-handoff>
</context>`;
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("handoff-conversation", "/tmp/project-a", handoffTitle)],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    const input = within(dialog).getByRole("combobox", { name: "Search conversations" });
    const option = within(dialog).getByRole("option", {
      name: /^Fix ACP event capture end-to-end streaming/,
    });
    expect(option).not.toHaveTextContent("poolside://handoff");
    expect(option).not.toHaveTextContent("Poolside ACP Session Handoff");

    await fireEvent.input(input, { target: { value: "semantic handoff" } });
    expect(within(dialog).queryByRole("option")).toBeNull();

    await fireEvent.input(input, { target: { value: "event capture" } });
    const matchingOption = within(dialog).getByRole("option", {
      name: /^Fix ACP event capture end-to-end streaming/,
    });
    expect(matchingOption).toBeInTheDocument();
    expect(
      Array.from(matchingOption.querySelectorAll('[data-state="matched"]')).map(
        (element) => element.textContent,
      ),
    ).toEqual(["event capture"]);
  });

  it("limits rendered conversations while searching the full conversation index", async () => {
    const conversations = Array.from({ length: 50 }, (_, index) =>
      conversationSummary(
        `recent-conversation-${index}`,
        "/tmp/project-a",
        `Recent conversation ${index}`,
        {
          updatedAt: new Date(Date.UTC(2026, 4, 16, 0, index)).toISOString(),
        },
      ),
    );
    conversations.push(
      conversationSummary(
        "older-indexed-conversation",
        "/tmp/project-a",
        "Needle outside the first page",
        {
          updatedAt: "2026-05-14T00:00:00Z",
        },
      ),
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations,
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    expect(within(dialog).getAllByRole("option")).toHaveLength(50);
    expect(
      within(dialog).queryByRole("option", { name: /^Needle outside the first page/ }),
    ).toBeNull();

    const input = within(dialog).getByRole("combobox", { name: "Search conversations" });
    await fireEvent.input(input, { target: { value: "needle" } });

    expect(
      within(dialog).getByRole("option", { name: /^Needle outside the first page/ }),
    ).toBeInTheDocument();
  });

  it("orders conversation searches by match quality", async () => {
    window.localStorage.setItem(
      "poolside.desktop.recentlyViewedConversations.v1",
      JSON.stringify(["poolside:loose-match"]),
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("exact-match", "/tmp/project-a", "Match", {
          updatedAt: "2026-05-14T00:00:00Z",
        }),
        conversationSummary("loose-match", "/tmp/project-a", "A much looser matching result", {
          updatedAt: "2026-05-16T00:00:00Z",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    const input = within(dialog).getByRole("combobox", { name: "Search conversations" });
    await fireEvent.input(input, { target: { value: "match" } });

    const options = within(dialog).getAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent(/^Match/);
    expect(options[1]).toHaveTextContent(/^A much looser matching result/);
    expect(
      Array.from(options[0].querySelectorAll('[data-state="matched"]')).map(
        (element) => element.textContent,
      ),
    ).toEqual(["Match"]);
  });

  it("hides conversations owned by projects that are not in the sidebar", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("visible-conversation", "/tmp/project-a", "Visible conversation", {
          workspacePath: "/tmp/project-a",
        }),
        conversationSummary("orphaned-conversation", "/tmp/project-a", "Orphaned conversation", {
          workspacePath: "/tmp/removed-project",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    expect(
      within(dialog).getByRole("option", { name: /^Visible conversation/ }),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole("option", { name: /^Orphaned conversation/ })).toBeNull();
  });

  it("never loads or shows archived conversations in command search", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [
        conversationSummary("current-match", "/tmp/project-a", "Matching current conversation"),
        conversationSummary("current-other", "/tmp/project-a", "Another current conversation"),
      ],
      localHistory: [
        conversationSummary("archived-match", "/tmp/project-a", "Matching archived conversation"),
        conversationSummary("archived-other", "/tmp/project-a", "Another archived conversation"),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    const input = within(dialog).getByRole("combobox", { name: "Search conversations" });
    expect(
      within(dialog).getByRole("option", { name: /^Matching current conversation/ }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("option", { name: /^Another current conversation/ }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("option", { name: /^Matching archived conversation/ }),
    ).toBeNull();
    expect(repositories.acpConversationRepo.archivedConversations).not.toHaveBeenCalled();

    await fireEvent.input(input, { target: { value: "Matching" } });

    const matchingOptions = within(dialog).getAllByRole("option");
    expect(matchingOptions).toHaveLength(1);
    expect(matchingOptions[0]).toHaveTextContent("Matching current conversation");
    expect(
      within(dialog).queryByRole("option", { name: /^Matching archived conversation/ }),
    ).toBeNull();
    expect(repositories.acpConversationRepo.archivedConversations).not.toHaveBeenCalled();
  });

  it("shows desktop new-tab actions in the command search", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "New tab" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    const input = within(dialog).getByRole("combobox", { name: "Search conversations" });
    await waitFor(() => expect(input).toHaveFocus());
    expect(within(dialog).getByRole("option", { name: /^Terminal/ })).toBeInTheDocument();
    expect(within(dialog).getByRole("option", { name: /^Files/ })).toBeInTheDocument();
    expect(within(dialog).queryByRole("option", { name: /^Open file/i })).toBeNull();
  });

  it("opens conversation search when the terminal has focus and the app shortcut fires", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });
    await screen.findByRole("button", { name: "New tab" });

    const terminalInput = document.createElement("textarea");
    terminalInput.className = "xterm-helper-textarea";
    document.body.append(terminalInput);
    terminalInput.focus();

    try {
      const primaryModifier = /^Mac/i.test(navigator.platform)
        ? { metaKey: true }
        : { ctrlKey: true };
      await fireEvent.keyDown(terminalInput, {
        key: "k",
        code: "KeyK",
        ...primaryModifier,
      });

      const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
      expect(within(dialog).getByRole("combobox", { name: "Search conversations" })).toHaveFocus();
    } finally {
      terminalInput.remove();
    }
  });

  it("keeps Command-P app-owned while preserving Ctrl-P for the terminal", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });
    await screen.findByRole("button", { name: "New tab" });

    const terminalInput = document.createElement("textarea");
    terminalInput.className = "xterm-helper-textarea";
    document.body.append(terminalInput);
    terminalInput.focus();

    try {
      await fireEvent.keyDown(terminalInput, { key: "p", code: "KeyP", ctrlKey: true });
      expect(screen.queryByRole("dialog", { name: "Search conversations" })).toBeNull();

      await fireEvent.keyDown(terminalInput, { key: "p", code: "KeyP", metaKey: true });
      const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
      const input = within(dialog).getByRole("combobox", { name: "Search conversations" });
      await waitFor(() => expect(input).toHaveFocus());
      expect(within(dialog).getByRole("option", { name: /^Terminal/ })).toBeInTheDocument();
    } finally {
      terminalInput.remove();
    }
  });

  it("focuses a visible bottom-panel terminal with one next-tab command from chat", async () => {
    hostMessageSender.mockImplementation((method: string) => {
      if (method === "createAssistantTerminal") {
        return Promise.resolve({
          id: "bottom-terminal",
          title: "zsh",
          cwd: "/tmp/project-a",
          worktreePath: "/tmp/project-a",
          createdAt: new Date().toISOString(),
        });
      }
      return Promise.resolve(undefined);
    });
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Show panel" }));
    const terminalInput = await waitFor(() => {
      const input = document.querySelector<HTMLTextAreaElement>(".xterm-helper-textarea");
      expect(input).not.toBeNull();
      return input!;
    });
    await waitFor(() => expect(terminalInput).toHaveFocus());

    // Simulate focusPrompt(): it focuses chat programmatically, so no pane
    // pointer event updates the split controller's logical active surface.
    const chatControl = screen.getByRole("button", { name: "Submit" });
    chatControl.focus();
    expect(chatControl).toHaveFocus();

    window.dispatchEvent(new CustomEvent("poolside:desktop-select-next-tab"));

    await waitFor(() => expect(terminalInput).toHaveFocus());
  });

  it("shows a worktree setup terminal without taking focus from the prompt", async () => {
    hostMessageSender.mockImplementation((method: string) => {
      if (method === "createAssistantTerminal") {
        return Promise.resolve({
          id: "setup-terminal",
          title: "zsh",
          cwd: "/tmp/project-a",
          worktreePath: "/tmp/project-a",
          createdAt: new Date().toISOString(),
        });
      }
      return Promise.resolve(undefined);
    });
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const chatControl = await screen.findByRole("button", { name: "Submit" });
    chatControl.focus();
    expect(chatControl).toHaveFocus();

    // How a worktree's setup script opens its terminal: visible, so the user
    // can watch it, but never at the cost of the keyboard.
    void repositories.assistantTerminals.runCommandAndWait(
      "/tmp/project-a",
      "sleep 30",
      undefined,
      {
        visible: true,
        placement: "splitRight",
        reuseExisting: true,
        keepAliveAfterCommand: true,
        focus: false,
      },
    );

    const terminalInput = await waitFor(() => {
      const input = document.querySelector<HTMLTextAreaElement>(".xterm-helper-textarea");
      expect(input).not.toBeNull();
      return input!;
    });
    expect(terminalInput).not.toHaveFocus();
    expect(chatControl).toHaveFocus();
  });

  it("keeps the prompt focused when the setup terminal hydrates a saved default layout", async () => {
    // The saved layout opens the right sidebar during hydration — before the
    // reveal even runs — so the visibility change must be recognised as
    // background work wherever in the open it happens, or the sidebar takes
    // focus as it appears.
    writeStoredDefaultDesktopLayout(defaultLayoutWithSidebarTerminal());
    let terminalCount = 0;
    hostMessageSender.mockImplementation((method: string) => {
      if (method === "createAssistantTerminal") {
        terminalCount += 1;
        return Promise.resolve({
          id: `terminal-${terminalCount}`,
          title: "zsh",
          cwd: "/tmp/project-a",
          worktreePath: "/tmp/project-a",
          createdAt: new Date().toISOString(),
        });
      }
      return Promise.resolve(undefined);
    });
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const chatControl = await screen.findByRole("button", { name: "Submit" });
    chatControl.focus();
    expect(chatControl).toHaveFocus();

    void repositories.assistantTerminals.runCommandAndWait(
      "/tmp/project-a",
      "sleep 30",
      undefined,
      {
        visible: true,
        placement: "splitRight",
        reuseExisting: true,
        keepAliveAfterCommand: true,
        focus: false,
      },
    );

    // The setup command reuses the layout's sidebar terminal tab, swapping its
    // restored shell for the command's — the rendered xterm is replaced, and
    // the replacement must not take focus with it.
    const terminalInput = await waitFor(() => {
      const input = document.querySelector<HTMLTextAreaElement>(".xterm-helper-textarea");
      expect(input).not.toBeNull();
      return input!;
    });
    expect(terminalInput).not.toHaveFocus();
    // Hydration rebuilds the main surface, so the exact element the user was
    // in no longer exists — focus must land on the recreated prompt, not in
    // the terminal and not on <body>.
    expect(document.querySelector('[data-testid="prompt-input"]')).toHaveFocus();
  });

  it("opens the next new tab where the user was, not where the setup terminal went", async () => {
    let terminalCount = 0;
    hostMessageSender.mockImplementation((method: string) => {
      if (method === "createAssistantTerminal") {
        terminalCount += 1;
        return Promise.resolve({
          id: `terminal-${terminalCount}`,
          title: "zsh",
          cwd: "/tmp/project-a",
          worktreePath: "/tmp/project-a",
          createdAt: new Date().toISOString(),
        });
      }
      return Promise.resolve(undefined);
    });
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });
    await screen.findByRole("button", { name: "Submit" });

    void repositories.assistantTerminals.runCommandAndWait(
      "/tmp/project-a",
      "sleep 30",
      undefined,
      {
        visible: true,
        placement: "splitRight",
        reuseExisting: true,
        keepAliveAfterCommand: true,
        focus: false,
      },
    );
    await waitFor(() => {
      expect(document.querySelector(".xterm-helper-textarea")).not.toBeNull();
    });

    // ⌘T routes here. A background open must not have moved the active
    // surface: the user's next tab belongs where they were working (main),
    // not in the sidebar the setup terminal claimed.
    window.dispatchEvent(
      new CustomEvent("poolside:desktop-new-tab", { detail: { kind: "terminal" } }),
    );

    await waitFor(() => {
      expect(
        document.querySelector(
          '[data-desktop-tab-content-surface="main"] .desktop-terminal-split-content',
        ),
      ).not.toBeNull();
    });
  });

  it("pre-selects the terminal action so Enter opens it immediately (⌘T)", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    // ⌘T routes through the same picker as the "New tab" button.
    await fireEvent.click(await screen.findByRole("button", { name: "New tab" }));

    const dialog = await screen.findByRole("dialog", { name: "Search conversations" });
    const input = within(dialog).getByRole("combobox", { name: "Search conversations" });
    await waitFor(() => expect(input).toHaveFocus());

    const terminalOption = within(dialog).getByRole("option", { name: /^Terminal/ });
    await waitFor(() => expect(terminalOption).toHaveAttribute("aria-selected", "true"));

    const newTabEvents: string[] = [];
    const onNewTab = (event: Event) => {
      newTabEvents.push((event as CustomEvent<{ kind?: string }>).detail?.kind ?? "");
      event.preventDefault();
    };
    window.addEventListener("poolside:desktop-new-tab", onNewTab);
    try {
      await fireEvent.keyDown(input, { key: "Enter" });
      await waitFor(() => expect(newTabEvents).toEqual(["terminal"]));
    } finally {
      window.removeEventListener("poolside:desktop-new-tab", onNewTab);
    }
    expect(screen.queryByRole("dialog", { name: "Search conversations" })).toBeNull();
  });

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      projects: [project("/tmp/zulu"), project("/tmp/restored-project"), project("/tmp/Alpha")],
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      initialState: state({
        assistantHost: "desktop",
        defaultCwd: "/tmp/restored-project",
        homeDirectory: "/tmp",
      }),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await openArchivedChats();
    expectSettingsHeader("Archived Chats");
    const archiveSearch = screen.getByPlaceholderText("Search archived chats");
    expect(archiveSearch).toBeInTheDocument();
    expect(archiveSearch.closest(".archive-catalog")).toBeInTheDocument();
    const projectFilter = screen.getByRole("combobox", { name: "Filter archive by project" });
    expect(archiveSearch.closest("label")?.nextElementSibling).toBe(projectFilter.parentElement);
    expect(archiveSearch.parentElement?.querySelector('[data-type="product"]')).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(archiveSearch).toHaveClass(
      "border-psx-input-border",
      "bg-psx-input-background",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
    expect(archiveSearch.parentElement?.querySelector('[data-type="product"]')).toHaveClass(
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    );
    const projectFilterOptions = Array.from((projectFilter as HTMLSelectElement).options);
    expect(projectFilterOptions.map((option) => option.textContent)).toEqual([
      "All projects",
      "Chats",
      "Alpha",
      "restored-project",
      "zulu",
    ]);
    expect(projectFilterOptions[1]).toBeDisabled();
    expect(projectFilter.querySelector("hr")).toBeInTheDocument();
    expect(Array.from(projectFilter.children).map((child) => child.tagName)).toEqual([
      "OPTION",
      "HR",
      "OPTION",
      "OPTION",
      "OPTION",
      "OPTION",
    ]);
    expect(screen.queryByRole("button", { name: "Collapse projects sidebar" })).toBeNull();
    expect(
      within(historyConversationButton("Archived conversation")).queryByText("restored-project"),
    ).toBeNull();
    expect(
      historyConversationButton("Archived conversation").querySelector(
        ".desktop-conversation-row-agent-icon",
      ),
    ).toHaveClass("text-psx-vibrant");
    expect(
      historyConversationButton("Archived conversation").closest(".desktop-conversation-connector"),
    ).toHaveClass("before:left-[9px]");
    expect(
      historyConversationButton("Archived conversation").closest(".desktop-conversation-row"),
    ).not.toHaveClass("hover:bg-psx-menu-hover-background");
    expect(screen.getByRole("heading", { name: "restored-project" })).toHaveClass(
      "bg-psx-editor-background",
      "sticky",
      "top-0",
    );
    expect(
      screen.getByRole("heading", { name: "restored-project" }).closest(".history-bucket"),
    ).toContainElement(historyConversationButton("Archived conversation"));
    const collapseProject = screen.getByRole("button", { name: "Collapse restored-project" });
    expect(collapseProject.closest(".archived-chats-settings-section")).toHaveClass(
      "[&_button]:cursor-default",
    );
    await fireEvent.pointerEnter(
      within(collapseProject).getByText("restored-project").parentElement!,
    );
    expect(await screen.findByText("~/restored-project")).toBeInTheDocument();
    const projectConversations = screen.getByRole("group", {
      name: "restored-project conversations",
    });
    expect(projectConversations.closest(".archive-catalog")).toBeInTheDocument();
    expect(projectConversations.closest(".archive-history-list")).not.toHaveClass(
      "min-h-0",
      "flex-1",
      "overflow-y-auto",
    );
    expect(
      projectConversations
        .closest(".archived-chats-settings-section")
        ?.querySelector(".settings-section-content > div"),
    ).not.toHaveClass("h-full", "min-h-0");
    expect(collapseProject).toHaveClass("text-[13px]/[16px]");
    expect(
      within(historyConversationButton("Archived conversation")).getByText("Archived conversation"),
    ).toHaveClass("desktop-conversation-row-title-compact");
    expect(
      historyConversationButton("Archived conversation").closest(".desktop-conversation-row"),
    ).toHaveClass("desktop-conversation-row-compact");
    expect(collapseProject).not.toHaveClass("hover:bg-psx-menu-hover-background");
    expect(collapseProject.querySelector(".transition-transform")).not.toHaveClass("-rotate-90");
    expect(projectConversations).toHaveClass(
      "grid",
      "grid-rows-[1fr]",
      "transition-[grid-template-rows]",
      "duration-200",
      "ease-out",
    );
    await fireEvent.click(collapseProject);
    expect(projectConversations).toHaveClass("grid-rows-[0fr]");
    expect(projectConversations).toHaveAttribute("aria-hidden", "true");
    expect(projectConversations.inert).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "Expand restored-project" })
        .querySelector(".transition-transform"),
    ).toHaveClass("-rotate-90");
    expect(screen.queryByRole("button", { name: "Restore Archived conversation" })).toBeNull();
    await fireEvent.click(screen.getByRole("button", { name: "Expand restored-project" }));
    expect(projectConversations).toHaveClass("grid-rows-[1fr]");
    expect(projectConversations).toHaveAttribute("aria-hidden", "false");
    expect(projectConversations.inert).toBe(false);
    expect(
      screen.getByRole("button", { name: "Restore Archived conversation" }),
    ).toBeInTheDocument();
    const restoreButton = screen.getByRole("button", {
      name: "Restore Archived conversation",
    });
    expect(restoreButton).toHaveAttribute("data-prominence", "standard");
    expect(restoreButton).toHaveClass(
      "ui-standard:bg-psx-button-secondary-background",
      "ui-standard:text-psx-button-secondary-foreground",
      "rounded-full",
      "w-16",
      "text-[11px]/[14px]",
      "archive-restore-button",
    );
    expect(restoreButton.parentElement).not.toHaveClass("opacity-0");
    expect(
      screen.getByRole("button", { name: "Delete Archived conversation" }).parentElement,
    ).not.toHaveClass("opacity-0");
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
    const undoRestore = await screen.findByRole("button", {
      name: "Undo restore Archived conversation",
    });
    expect(screen.queryByText("Restored")).toBeNull();
    expect(within(undoRestore).getByText("Undo")).toBeInTheDocument();
    expect(within(undoRestore).getByText("5")).toBeInTheDocument();
    expect(undoRestore).toHaveClass(
      "bg-psx-panel",
      "ring-1",
      "ring-psx-border",
      "rounded-full",
      "w-16",
      "text-[11px]/[14px]",
      "archive-restore-button",
    );
    expect(undoRestore).not.toHaveClass("underline");
    expect(undoRestore.querySelector('[data-type="product"]')).toBeNull();
    expect(screen.queryByRole("button", { name: "Archive Archived conversation" })).toBeNull();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      { fallbackCwds: [], readOnlyInspection: true },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("undoes a restored archived conversation during the countdown", async () => {
    const archivedSession = conversationSummary(
      "s-undo-restore",
      "/tmp/restored-project",
      "Undo restoration",
    );
    let resolveRestore!: (session: ACPConversationSummary) => void;
    const restoreConversation = vi.fn(
      () =>
        new Promise<ACPConversationSummary>((resolve) => {
          resolveRestore = resolve;
        }),
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/restored-project")],
      conversations: [],
      localHistory: [archivedSession],
      restoreConversation,
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/restored-project" }),
    });

    await openArchivedChats();
    vi.useFakeTimers();
    try {
      await fireEvent.click(screen.getByRole("button", { name: "Restore Undo restoration" }));
      let undoButton = screen.getByRole("button", { name: "Undo restore Undo restoration" });
      expect(within(undoButton).getByText("5")).toBeInTheDocument();
      expect(screen.queryByText("Restoring…")).toBeNull();

      resolveRestore(archivedSession);
      await Promise.resolve();
      await tick();

      await vi.advanceTimersByTimeAsync(1000);
      await tick();
      undoButton = screen.getByRole("button", { name: "Undo restore Undo restoration" });
      expect(within(undoButton).getByText("4")).toBeInTheDocument();

      await fireEvent.click(undoButton);
      expect(repositories.acpConversationRepo.archiveSession).toHaveBeenCalledWith(
        "/tmp/restored-project",
        "s-undo-restore",
        "poolside",
        "s-undo-restore",
      );
      expect(screen.queryByText("Restored")).toBeNull();
      expect(screen.queryByRole("button", { name: "Undo restore Undo restoration" })).toBeNull();

      await vi.advanceTimersByTimeAsync(5000);
      await tick();
      expect(historyConversationButton("Undo restoration")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("fades a restored archived conversation after the undo countdown", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/restored-project")],
      conversations: [],
      localHistory: [
        conversationSummary("s-fade-restore", "/tmp/restored-project", "Fade restoration"),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/restored-project" }),
    });

    await openArchivedChats();
    const archiveSection = document.querySelector<HTMLElement>(".archived-chats-settings-section");
    expect(archiveSection).not.toBeNull();
    vi.useFakeTimers();
    try {
      await fireEvent.click(screen.getByRole("button", { name: "Restore Fade restoration" }));

      await vi.advanceTimersByTimeAsync(4000);
      await tick();
      expect(
        within(screen.getByRole("button", { name: "Undo restore Fade restoration" })).getByText(
          "1",
        ),
      ).toBeInTheDocument();
      expect(
        historyConversationButton("Fade restoration").closest(".desktop-conversation-row"),
      ).not.toHaveClass("opacity-0");

      await vi.advanceTimersByTimeAsync(1000);
      await tick();
      expect(
        historyConversationButton("Fade restoration").closest(".desktop-conversation-row"),
      ).toHaveClass("opacity-0", "transition-opacity", "duration-200");

      await vi.advanceTimersByTimeAsync(200);
      await tick();
      expect(
        within(archiveSection!).queryByRole("button", { name: /^Fade restoration/ }),
      ).toBeNull();
      expect(within(archiveSection!).getByText("No archived chats")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps search-expanded archived projects open only after interaction", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/search-project")],
      conversations: [],
      localHistory: [
        conversationSummary(
          "s-search-result",
          "/tmp/search-project",
          "Matching archived conversation",
        ),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/search-project" }),
    });

    await openArchivedChats();
    const archiveSearch = screen.getByPlaceholderText("Search archived chats");
    await fireEvent.click(screen.getByRole("button", { name: "Collapse search-project" }));
    expect(
      screen.queryByRole("button", { name: "Restore Matching archived conversation" }),
    ).toBeNull();

    await fireEvent.input(archiveSearch, { target: { value: "Matching archived" } });
    expect(historyConversationButton("Matching archived conversation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse search-project" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    await fireEvent.input(archiveSearch, { target: { value: "" } });
    expect(
      screen.queryByRole("button", { name: "Restore Matching archived conversation" }),
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Expand search-project" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );

    await fireEvent.input(archiveSearch, { target: { value: "Matching archived" } });
    await fireEvent.click(historyConversationButton("Matching archived conversation"));
    const previewDialog = await screen.findByRole("dialog", {
      name: "Matching archived conversation",
    });
    await fireEvent.click(
      within(previewDialog).getByRole("button", { name: "Close archived conversation" }),
    );
    await fireEvent.input(archiveSearch, { target: { value: "" } });

    expect(historyConversationButton("Matching archived conversation")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Collapse search-project" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("shows the eight most recent archived chats per project with show-more controls", async () => {
    const archivedSessions = [
      ...Array.from({ length: 12 }, (_, index) =>
        conversationSummary(
          `project-a-${index + 1}`,
          "/tmp/project-a",
          `Project A archive ${index + 1}`,
          { updatedAt: `2026-05-${String(index + 1).padStart(2, "0")}T00:00:00Z` },
        ),
      ),
      ...Array.from({ length: 11 }, (_, index) =>
        conversationSummary(
          `project-b-${index + 1}`,
          "/tmp/project-b",
          `Project B archive ${index + 1}`,
          { updatedAt: `2026-05-${String(index + 1).padStart(2, "0")}T00:00:00Z` },
        ),
      ),
    ];
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a"), project("/tmp/project-b")],
      conversations: [],
      localHistory: archivedSessions,
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await openArchivedChats();
    const projectA = within(screen.getByRole("group", { name: "project-a conversations" }));
    const projectB = within(screen.getByRole("group", { name: "project-b conversations" }));

    expect(projectA.getByText("Project A archive 12")).toBeInTheDocument();
    expect(projectA.queryByText("Project A archive 2")).toBeNull();
    expect(projectA.getByRole("button", { name: "Show 4 more" })).toHaveClass(
      "text-psx-foreground-tertiary",
      "hover:bg-psx-menu-hover-background",
      "rounded-[6px]",
      "px-2",
      "py-1.5",
    );
    expect(projectB.queryByText("Project B archive 1")).toBeNull();
    expect(projectB.getByRole("button", { name: "Show 3 more" })).toBeInTheDocument();

    await fireEvent.click(projectA.getByRole("button", { name: "Show 4 more" }));
    expect(projectA.getByText("Project A archive 1")).toBeInTheDocument();
    expect(projectA.getByRole("button", { name: "Show less" })).toBeInTheDocument();
    expect(projectB.queryByText("Project B archive 1")).toBeNull();

    await fireEvent.click(projectA.getByRole("button", { name: "Show less" }));
    expect(projectA.queryByText("Project A archive 1")).toBeNull();

    const archiveSearch = screen.getByPlaceholderText("Search archived chats");
    await fireEvent.input(archiveSearch, { target: { value: "Project A archive 1" } });
    expect(projectA.getByText("Project A archive 1")).toBeInTheDocument();
    expect(projectA.queryByRole("button", { name: /Show/ })).toBeNull();
  });

  it("enables the archived Chats filter when chat history exists", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project")],
      conversations: [],
      localHistory: [
        conversationSummary("s-chat", "/tmp/chat", "Archived chat", {
          workspacePath: "CHAT",
        }),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project" }),
    });

    await openArchivedChats();
    const projectFilter = screen.getByRole("combobox", { name: "Filter archive by project" });
    const chatsOption = within(projectFilter).getByRole("option", { name: "Chats" });
    await waitFor(() => expect(chatsOption).not.toBeDisabled());

    await fireEvent.change(projectFilter, { target: { value: "CHAT" } });

    expect(projectFilter).toHaveValue("CHAT");
    expect(repositories.acpLocalHistoryRepo.refresh).toHaveBeenLastCalledWith("CHAT");
  });

  it("replaces archived group folder icons with spinners while refreshing", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project")],
      conversations: [],
      localHistory: [conversationSummary("s-archived", "/tmp/project", "Archived conversation")],
    });
    repositories.acpLocalHistoryRepo.reconciling = true;

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project" }),
    });

    await openArchivedChats();

    expect(screen.queryByText("Refreshing…")).toBeNull();
    expect(screen.getByText("Refreshing archived conversations")).toHaveClass("sr-only");
    const header = screen.getByRole("button", { name: "Collapse project" });
    expect(header.firstElementChild).toHaveAttribute("role", "status");
    expect(header.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("hides archived conversations from projects that are no longer configured", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/current-project")],
      conversations: [],
      localHistory: [
        conversationSummary("s-removed", "/tmp/removed-project", "Removed conversation"),
      ],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/current-project" }),
    });

    await openArchivedChats();

    expect(screen.queryByRole("heading", { name: "removed-project" })).toBeNull();
    expect(screen.queryByText("Removed conversation")).toBeNull();
    expect(screen.getByText("No archived chats")).toBeInTheDocument();
  });

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
    await openArchivedChats();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      {
        fallbackCwds: expect.arrayContaining(["/tmp/restored-project"]),
        readOnlyInspection: true,
      },
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const previewDialog = await screen.findByRole("dialog", { name: "Archived conversation" });
    // An app-level modal: portaled to <body> with a fixed overlay, not
    // anchored inside the settings panel that opened it.
    expect(previewDialog.closest(".archived-chats-settings-section")).toBeNull();
    expect(previewDialog.closest(".archive-preview-dialog-portal")?.parentElement).toBe(
      document.body,
    );
    expect(previewDialog.parentElement).toHaveClass("fixed", "inset-0");
    expect(previewDialog).toHaveClass("w-[75%]", "h-[80%]");
    expect(within(previewDialog).getByText("Read-only conversation")).toBeVisible();
    expect(
      within(previewDialog).queryByRole("button", { name: "Dismiss read-only notice" }),
    ).toBeNull();
    expect(within(previewDialog).queryByTestId("prompt-interaction-container")).toBeNull();
    const previewRestore = within(previewDialog).getByRole("button", { name: "Restore" });
    expect(previewRestore).toHaveAttribute("data-prominence", "standard");
    expect(previewRestore).toHaveClass(
      "ui-standard:bg-psx-button-secondary-background",
      "ui-standard:text-psx-button-secondary-foreground",
    );
    const previewDelete = within(previewDialog).getByRole("button", {
      name: "Delete Archived conversation",
    });
    expect(previewDelete).toHaveClass("size-6");
    expect(within(previewDelete).queryByText("Delete")).toBeNull();
    expect(previewRestore.nextElementSibling).toBe(previewDelete);
    expect(screen.getByPlaceholderText("Search archived chats")).toBeInTheDocument();

    await fireEvent.click(
      within(previewDialog).getByRole("button", { name: "Close archived conversation" }),
    );
    expect(screen.queryByRole("dialog", { name: "Archived conversation" })).toBeNull();
    expect(screen.getByPlaceholderText("Search archived chats")).toBeInTheDocument();
  });

  it("restores an archived conversation from the preview header", async () => {
    const archivedSession = conversationSummary(
      "s-preview-restore",
      "/tmp/restored-project",
      "Preview restore conversation",
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/restored-project")],
      conversations: [],
      localHistory: [archivedSession],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/restored-project" }),
    });

    await openArchivedChats();
    await fireEvent.click(historyConversationButton("Preview restore conversation"));

    const previewDialog = await screen.findByRole("dialog", {
      name: "Preview restore conversation",
    });
    await fireEvent.click(within(previewDialog).getByRole("button", { name: "Restore" }));

    await waitFor(() =>
      expect(repositories.acpConversationRepo.restoreConversation).toHaveBeenCalledWith(
        "/tmp/restored-project",
        expect.objectContaining({ sessionId: "s-preview-restore" }),
      ),
    );
    expect(screen.queryByRole("dialog", { name: "Preview restore conversation" })).toBeNull();
    expect(screen.getByPlaceholderText("Search archived chats")).toBeInTheDocument();
  });

  it("confirms deletion from archived conversation rows in an app-global dialog", async () => {
    const archivedSession = conversationSummary(
      "s-delete-row",
      "/tmp/restored-project",
      "Delete from row",
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/restored-project")],
      conversations: [],
      localHistory: [archivedSession],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/restored-project" }),
    });

    await openArchivedChats();
    await fireEvent.click(screen.getByRole("button", { name: "Delete Delete from row" }));

    let dialog = screen.getByRole("dialog", { name: "Delete Conversation?" });
    // ConfirmationDialog portals its own overlay to <body> so it is app-global.
    expect(dialog.parentElement?.parentElement).toBe(document.body);
    await fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(repositories.acpConversationRepo.deleteSession).not.toHaveBeenCalled();
    expect(historyConversationButton("Delete from row")).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: "Delete Delete from row" }));
    dialog = screen.getByRole("dialog", { name: "Delete Conversation?" });
    await fireEvent.click(within(dialog).getByRole("button", { name: "Delete Conversation" }));

    await waitFor(() =>
      expect(repositories.acpConversationRepo.deleteSession).toHaveBeenCalledWith(
        "s-delete-row",
        "poolside",
      ),
    );
    expect(screen.queryByText("Delete from row")).toBeNull();
  });

  it("confirms deletion from the archived conversation preview header", async () => {
    const archivedSession = conversationSummary(
      "s-delete-preview",
      "/tmp/restored-project",
      "Delete from preview",
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/restored-project")],
      conversations: [],
      localHistory: [archivedSession],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/restored-project" }),
    });

    await openArchivedChats();
    await fireEvent.click(historyConversationButton("Delete from preview"));
    const previewDialog = await screen.findByRole("dialog", { name: "Delete from preview" });
    await fireEvent.click(
      within(previewDialog).getByRole("button", { name: "Delete Delete from preview" }),
    );

    let confirmation = screen.getByRole("dialog", { name: "Delete Conversation?" });
    // ConfirmationDialog portals its own overlay to <body> so it is app-global.
    expect(confirmation.parentElement?.parentElement).toBe(document.body);
    await fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Delete Conversation?" })).toBeNull();
    expect(screen.getByRole("dialog", { name: "Delete from preview" })).toBeInTheDocument();

    await fireEvent.click(
      within(previewDialog).getByRole("button", { name: "Delete Delete from preview" }),
    );
    confirmation = screen.getByRole("dialog", { name: "Delete Conversation?" });
    await fireEvent.click(
      within(confirmation).getByRole("button", { name: "Delete Conversation" }),
    );

    await waitFor(() =>
      expect(repositories.acpConversationRepo.deleteSession).toHaveBeenCalledWith(
        "s-delete-preview",
        "poolside",
      ),
    );
    expect(screen.queryByRole("dialog", { name: "Delete from preview" })).toBeNull();
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
    await openArchivedChats();
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
      { fallbackCwds: [], readOnlyInspection: true },
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const previewDialog = await screen.findByRole("dialog", { name: "Active conversation" });
    expect(within(previewDialog).queryByRole("button", { name: "Restore" })).toBeNull();
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
    await openArchivedChats();
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await openArchivedChats();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  it("moves from archived chats to general settings when settings opens from the host event", async () => {
    const archivedSession = conversationSummary(
      "s-archived",
      "/tmp/project-a",
      "Archived conversation",
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("s-current", "/tmp/project-a", "Current conversation")],
      localHistory: [archivedSession],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await openArchivedChats();
    expectSettingsHeader("Archived Chats");

    window.dispatchEvent(new CustomEvent("poolside:desktop-open-settings-panel"));

    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expectSettingsHeader("General");
    expect(screen.queryByPlaceholderText("Search archived chats")).toBeNull();

    await fireEvent.click(screen.getByRole("button", { name: "Back" }));

    // Back returns to the normal conversation sidebar.
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(screen.queryByPlaceholderText("Search archived chats")).toBeNull();
  });

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
  it("opens a root-project draft instead of the next conversation when archiving", async () => {
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    repositories.acpRepo.createSession.mockClear();
__POOL_SYNTHETIC_IMPORT_BASELINE__
    vi.useFakeTimers();
    try {
      await beginArchiveConversationViaContextMenu("Current conversation");

      expect(repositories.acpConversationRepo.archiveSession).not.toHaveBeenCalled();
      expect(repositories.acpRepo.createSession).toHaveBeenCalledWith(
        "/tmp/project-a",
        "poolside",
        null,
      );
      expect(repositories.acpRepo.loadSessionRecord).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(3000);
    } finally {
      vi.useRealTimers();
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
  it("opens a fresh draft instead of the next chat while the active chat waits to archive", async () => {
    const currentChat = conversationSummary(
      "chat-current",
      "/state/poolside/chats/current",
      "Current chat",
      { workspacePath: "CHAT" },
    );
    const nextChat = conversationSummary("chat-next", "/state/poolside/chats/next", "Next chat", {
      workspacePath: "CHAT",
    });
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [currentChat, nextChat],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByText("Current chat"));
    repositories.acpRepo.loadSessionRecord.mockClear();
    repositories.acpRepo.createSession.mockClear();

    vi.useFakeTimers();
    try {
      await beginArchiveConversationViaContextMenu("Current chat");

      expect(repositories.acpConversationRepo.archiveSession).not.toHaveBeenCalled();
      expect(repositories.acpRepo.createSession).toHaveBeenCalledWith(
        "/tmp/project-a",
        "poolside",
        null,
      );
      expect(repositories.acpRepo.loadSessionRecord).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(3000);
    } finally {
      vi.useRealTimers();
    }

    expect(repositories.acpConversationRepo.archiveSession).toHaveBeenCalledWith(
      "/state/poolside/chats/current",
      "chat-current",
      "poolside",
      "chat-current",
    );
  });

  it("returns to the archived conversation when its countdown is cancelled", async () => {
    const currentSession = conversationSummary(
      "s-current",
      "/tmp/project-a",
      "Conversation to restore",
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [currentSession],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByText("Conversation to restore"));
    repositories.acpRepo.createSession.mockClear();

    vi.useFakeTimers();
    try {
      await beginArchiveConversationViaContextMenu("Conversation to restore");
      expect(repositories.acpRepo.createSession).toHaveBeenCalledWith(
        "/tmp/project-a",
        "poolside",
        null,
      );

      await fireEvent.click(
        screen.getByRole("button", { name: "Cancel archiving conversation..." }),
      );
      await tick();
      await vi.advanceTimersByTimeAsync(3000);
    } finally {
      vi.useRealTimers();
    }

    const restoredConversationButton = screen.getByRole("button", {
      name: /^Conversation to restore - /,
    });
    expect(restoredConversationButton.closest(".desktop-sidebar-row-selected")).not.toBeNull();
    expect(repositories.acpConversationRepo.archiveSession).not.toHaveBeenCalled();
  });

  it("returns to the conversation when archiving it fails", async () => {
    const currentSession = conversationSummary(
      "s-current",
      "/tmp/project-a",
      "Conversation with archive error",
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [currentSession],
    });
    repositories.acpConversationRepo.archiveSession.mockRejectedValueOnce(
      new Error("archive failed"),
    );

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByText("Conversation with archive error"));

    await archiveConversationViaContextMenu("Conversation with archive error");

    await waitFor(() => {
      const restoredConversationButton = screen.getByRole("button", {
        name: /^Conversation with archive error - /,
      });
      expect(restoredConversationButton.closest(".desktop-sidebar-row-selected")).not.toBeNull();
    });
  });

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
  it("switches to a root draft while deleting a worktree with the active conversation", async () => {
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      expect(screen.getByText("Deleting worktree...")).toBeInTheDocument();
      expect(repositories.acpRepo.createSession).toHaveBeenCalledWith(
        "/tmp/project-a",
        "poolside",
        null,
      );
      expect(repositories.acpRepo.createSession).not.toHaveBeenCalledWith(
        "/tmp/project-a/worktree",
        "poolside",
        null,
      );
      expect(repositories.acpRepo.cancel).not.toHaveBeenCalled();
      expect(repositories.acpWorktreeRepo.removeWorktree).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(3000);
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
  it("returns to the worktree conversation when deletion is cancelled", async () => {
    const currentSession = conversationSummary(
      "s-current",
      "/tmp/project-a/worktree",
      "Worktree conversation to restore",
    );
    const repositories = new TestRepositories({
      projects: [
        project("/tmp/project-a"),
        project("/tmp/project-a/worktree", {
          isWorktree: true,
          parentPath: "/tmp/project-a",
        }),
      ],
      conversations: [currentSession],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByText("Worktree conversation to restore"));

    vi.useFakeTimers();
    try {
      await fireEvent.click(screen.getByRole("button", { name: "Delete worktree worktree" }));
      await fireEvent.click(screen.getByRole("button", { name: "Cancel deleting worktree..." }));
      await tick();
      await vi.advanceTimersByTimeAsync(3000);
    } finally {
      vi.useRealTimers();
    }

    const restoredConversationButton = screen.getByRole("button", {
      name: /^Worktree conversation to restore - /,
    });
    expect(restoredConversationButton.closest(".desktop-sidebar-row-selected")).not.toBeNull();
    expect(repositories.acpWorktreeRepo.removeWorktree).not.toHaveBeenCalled();
  });

  it("returns to the worktree conversation when deletion fails", async () => {
    const currentSession = conversationSummary(
      "s-current",
      "/tmp/project-a/worktree",
      "Worktree conversation with delete error",
    );
    const repositories = new TestRepositories({
      projects: [
        project("/tmp/project-a"),
        project("/tmp/project-a/worktree", {
          isWorktree: true,
          parentPath: "/tmp/project-a",
        }),
      ],
      conversations: [currentSession],
    });
    repositories.acpWorktreeRepo.removeWorktree.mockRejectedValueOnce(new Error("delete failed"));

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByText("Worktree conversation with delete error"));

    vi.useFakeTimers();
    try {
      await fireEvent.click(screen.getByRole("button", { name: "Delete worktree worktree" }));
      await vi.advanceTimersByTimeAsync(3000);
    } finally {
      vi.useRealTimers();
    }

    await waitFor(() => {
      const restoredConversationButton = screen.getByRole("button", {
        name: /^Worktree conversation with delete error - /,
      });
      expect(restoredConversationButton.closest(".desktop-sidebar-row-selected")).not.toBeNull();
    });
  });

  it("keeps a newly selected conversation active while worktree deletion finishes", async () => {
    const deletingSession = conversationSummary(
      "s-deleting",
      "/tmp/project-a/worktree",
      "Deleting conversation",
    );
    const keptSession = conversationSummary("s-kept", "/tmp/project-a", "Conversation to keep");
    const repositories = new TestRepositories({
      projects: [
        project("/tmp/project-a"),
        project("/tmp/project-a/worktree", {
          isWorktree: true,
          parentPath: "/tmp/project-a",
        }),
      ],
      conversations: [deletingSession, keptSession],
    });
    let finishRemoval!: () => void;
    repositories.acpWorktreeRepo.removeWorktree.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finishRemoval = resolve;
        }),
    );

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    const deletingConversationButton = await screen.findByRole("button", {
      name: /^Deleting conversation - /,
    });
    await fireEvent.click(deletingConversationButton);
    await waitFor(() =>
      expect(deletingConversationButton.closest(".desktop-sidebar-row-selected")).not.toBeNull(),
    );

    vi.useFakeTimers();
    try {
      await fireEvent.click(screen.getByRole("button", { name: "Delete worktree worktree" }));
      await vi.advanceTimersByTimeAsync(3000);
    } finally {
      vi.useRealTimers();
    }
    await waitFor(() =>
      expect(repositories.acpWorktreeRepo.removeWorktree).toHaveBeenCalledWith(
        "/tmp/project-a/worktree",
      ),
    );

    const keptConversationButton = screen.getByRole("button", {
      name: /^Conversation to keep - /,
    });
    await fireEvent.click(keptConversationButton);
    await waitFor(() =>
      expect(keptConversationButton.closest(".desktop-sidebar-row-selected")).not.toBeNull(),
    );

    const refreshCountBeforeFinish = repositories.acpProjectRepo.refresh.mock.calls.length;
    finishRemoval();
    await waitFor(() =>
      expect(repositories.acpProjectRepo.refresh).toHaveBeenCalledTimes(
        refreshCountBeforeFinish + 1,
      ),
    );
    await tick();

    expect(keptConversationButton.closest(".desktop-sidebar-row-selected")).not.toBeNull();
  });

  it("opens desktop settings inside the sidebar and switches settings sections", async () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
      projects: [project("/tmp/project-a"), project("/tmp/project-b")],
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
    expect(screen.queryByRole("button", { name: "Configure Agents" })).toBeNull();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(await screen.findByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide sidebar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hide sidebar" })).toHaveAttribute(
      "title",
      "Cannot hide sidebar while showing settings",
    );
    const settingsNav = screen.getByRole("navigation", { name: "Settings sections" });
    expect(settingsNav).toHaveAttribute("data-tauri-drag-region", "deep");
    const settingsLabels = within(settingsNav)
      .getAllByRole("button")
      .map((button) => button.textContent?.trim());
    const remoteAccessIndex = settingsLabels.findIndex((label) =>
      label?.startsWith("Remote Access"),
    );
    expect(settingsLabels.indexOf("Archived Chats")).toBe(remoteAccessIndex - 1);
    expectSettingsHeader("General");
    expect(
      screen.getByText(
        "How much detail to show while the agent works. Finished replies always collapse, chat mode is always compact",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Return to conversation" })).toBeNull();

    await fireEvent.click(screen.getByRole("button", { name: "Projects" }));
    expectSettingsHeader("Projects");
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expectSettingsHeader("Projects");
    const projectGuidelines = screen.getByRole("textbox", {
      name: "Project Guidelines for Agent",
    });
    expect(projectGuidelines).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    await waitFor(() => expect(projectGuidelines).toBeEnabled());
    const projectNameInput = screen.getByRole("textbox", { name: "Project name" });
    await fireEvent.input(projectNameInput, { target: { value: "Project Alpha" } });
    await waitFor(() =>
      expect(repositories.acpProjectRepo.renameProject).toHaveBeenCalledWith(
        "/tmp/project-a",
        "Project Alpha",
      ),
    );
    await fireEvent.input(projectGuidelines, { target: { value: "Use pnpm" } });
    await waitFor(() =>
      expect(repositories.acpProjectRepo.setProjectSettings).toHaveBeenCalledWith({
        path: "/tmp/project-a",
        setupScript: "",
        teardownScript: "",
        userPrompt: "Use pnpm",
      }),
    );
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expect(screen.getAllByRole("textbox", { name: "Project Guidelines for Agent" })).toHaveLength(
      2,
    );
__POOL_SYNTHETIC_IMPORT_BASELINE__
    expectSettingsHeader("Projects");
__POOL_SYNTHETIC_IMPORT_BASELINE__
      "aria-expanded",
      "false",
    );
__POOL_SYNTHETIC_IMPORT_BASELINE__
      "aria-expanded",
      "true",
    );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      "aria-expanded",
      "true",
    );
    expect(screen.getAllByRole("textbox", { name: "Project Guidelines for Agent" })).toHaveLength(
      2,
    );

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    await fireEvent.click(screen.getByRole("button", { name: "Agents" }));
    expectSettingsHeader("Agents");

    await fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(await screen.findByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Back" })).toBeNull();
    expect(screen.getByText("Current conversation")).toBeInTheDocument();
__POOL_SYNTHETIC_IMPORT_BASELINE__

  it("uses the settings sidebar back button for desktop project settings", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("s-current", "/tmp/project-a", "Current conversation")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await selectFromNativeClickMenu(
      await screen.findByRole("button", { name: "More actions for project-a" }),
      "Project Settings...",
      (items) => {
        expect(systemMenuAction(items, "New Conversation")?.accelerator).toBe("Cmd+N");
        expect(systemMenuAction(items, "New Worktree")?.accelerator).toBe("Cmd+Shift+W");
        expect(systemMenuAction(items, "Open Project")?.accelerator).toBe("Cmd+Shift+I");
      },
    );

    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expectSettingsHeader("Projects");
    expect(screen.getAllByRole("button", { name: "Back" })).toHaveLength(1);
    expect(
      screen.getByRole("textbox", { name: "Project Guidelines for Agent" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide sidebar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hide sidebar" })).toHaveAttribute(
      "title",
      "Cannot hide sidebar while showing settings",
    );
    expect(screen.queryByRole("button", { name: "Return to conversation" })).toBeNull();

    await fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(await screen.findByRole("button", { name: "Settings" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Settings" })).toBeNull();
  });

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
    await selectFromNativeClickMenu(
__POOL_SYNTHETIC_IMPORT_BASELINE__
      "Project Settings...",
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
    hostMessageSender.mockImplementation((method: string) => {
      if (method === "selectProjectFolder") {
        return Promise.resolve({ path: "/tmp/project-b", name: "project-b" });
      }
      return Promise.resolve(undefined);
    });
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("s-current", "/tmp/project-a", "Current conversation")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

__POOL_SYNTHETIC_IMPORT_BASELINE__

    await waitFor(() =>
      expect(repositories.acpProjectRepo.upsertProject).toHaveBeenCalledWith({
        path: "/tmp/project-b",
        name: "project-b",
      }),
    );
    expect(repositories.acpConversationRepo.refresh).toHaveBeenCalled();
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
  });

  it("deletes projects from desktop project settings after confirmation", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("s-current", "/tmp/project-a", "Current conversation")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Settings" }));
    await fireEvent.click(screen.getByRole("button", { name: "Projects" }));
__POOL_SYNTHETIC_IMPORT_BASELINE__

    await fireEvent.click(screen.getByRole("button", { name: "Delete Project" }));
    let dialog = within(screen.getByRole("dialog", { name: "Delete project?" }));
    await fireEvent.click(dialog.getByRole("button", { name: "Cancel" }));
    expect(repositories.acpProjectRepo.removeProject).not.toHaveBeenCalled();

    await fireEvent.click(screen.getByRole("button", { name: "Delete Project" }));
    dialog = within(screen.getByRole("dialog", { name: "Delete project?" }));
    await fireEvent.click(dialog.getByRole("button", { name: "Delete Project" }));

    await waitFor(() =>
      expect(repositories.acpProjectRepo.removeProject).toHaveBeenCalledWith("/tmp/project-a"),
    );
    expect(repositories.acpWorktreeRepo.closeProject).toHaveBeenCalledWith("/tmp/project-a");
    expect(repositories.acpConversationRepo.refresh).toHaveBeenCalled();
  });

  it("renames a project inline from the sidebar and confirms delete in a dialog", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("s-current", "/tmp/project-a", "Current conversation")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await openProjectContextMenu("project-a", "Rename Project");

    // The row swaps to a Finder-style inline input; no dialog or settings view.
    const renameInput = await screen.findByRole("textbox", { name: "Rename project-a" });
    expect(screen.queryByRole("heading", { name: "Settings" })).toBeNull();
    await fireEvent.input(renameInput, { target: { value: "Project Alpha" } });
    await fireEvent.keyDown(renameInput, { key: "Enter" });
    await waitFor(() =>
      expect(repositories.acpProjectRepo.renameProject).toHaveBeenCalledWith(
        "/tmp/project-a",
        "Project Alpha",
      ),
    );
    expect(screen.queryByRole("textbox", { name: /^Rename / })).toBeNull();

    await openProjectContextMenu("Project Alpha", "Delete Project...");

    const dialog = within(screen.getByRole("dialog", { name: "Delete project?" }));
    await fireEvent.click(dialog.getByRole("button", { name: "Delete Project" }));

    await waitFor(() =>
      expect(repositories.acpProjectRepo.removeProject).toHaveBeenCalledWith("/tmp/project-a"),
    );
  });

  it("expands the hidden sidebar when desktop settings are opened from the host event", async () => {
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("s-current", "/tmp/project-a", "Current conversation")],
    });

    await renderDesktopPanel({
      repositories,
      initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
    });

    await fireEvent.click(await screen.findByRole("button", { name: "Hide sidebar" }));
    expect(await screen.findByRole("button", { name: "Show sidebar" })).toBeInTheDocument();

    window.dispatchEvent(new CustomEvent("poolside:desktop-open-settings-panel"));

    expect(await screen.findByRole("button", { name: "Back" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide sidebar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hide sidebar" })).toHaveAttribute(
      "title",
      "Cannot hide sidebar while showing settings",
    );
    expectSettingsHeader("General");
__POOL_SYNTHETIC_IMPORT_BASELINE__

  it("navigates back and forward between chat and settings", async () => {
    const navigationAvailability = vi.fn();
    const handleNavigationAvailability = (event: Event) => {
      navigationAvailability(
        (event as CustomEvent<{ canGoBack: boolean; canGoForward: boolean }>).detail,
      );
    };
    window.addEventListener(
      "poolside:desktop-navigation-availability",
      handleNavigationAvailability,
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("s-current", "/tmp/project-a", "Current conversation")],
    });

    try {
      await renderDesktopPanel({
        repositories,
        initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
      });
      await waitFor(() =>
        expect(navigationAvailability).toHaveBeenLastCalledWith({
          canGoBack: false,
          canGoForward: false,
        }),
      );

      await fireEvent.click(await screen.findByRole("button", { name: "Settings" }));
      expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
      await waitFor(() =>
        expect(navigationAvailability).toHaveBeenLastCalledWith({
          canGoBack: true,
          canGoForward: false,
        }),
      );

      window.dispatchEvent(new CustomEvent("poolside:desktop-navigate-back"));
      expect(await screen.findByRole("button", { name: "Settings" })).toBeInTheDocument();
      expect(navigationAvailability).toHaveBeenLastCalledWith({
        canGoBack: false,
        canGoForward: true,
      });

      window.dispatchEvent(new CustomEvent("poolside:desktop-navigate-forward"));
      expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
      expect(navigationAvailability).toHaveBeenLastCalledWith({
        canGoBack: true,
        canGoForward: false,
      });
    } finally {
      window.removeEventListener(
        "poolside:desktop-navigation-availability",
        handleNavigationAvailability,
      );
    }
  });

  it("restores remembered split locations once when navigating back", async () => {
    const navigationAvailability = vi.fn();
    const handleNavigationAvailability = (event: Event) => {
      navigationAvailability(
        (event as CustomEvent<{ canGoBack: boolean; canGoForward: boolean }>).detail,
      );
    };
    window.addEventListener(
      "poolside:desktop-navigation-availability",
      handleNavigationAvailability,
    );
    const repositories = new TestRepositories({
      projects: [project("/tmp/project-a")],
      conversations: [conversationSummary("s-current", "/tmp/project-a", "Current conversation")],
    });

    try {
      await renderDesktopPanel({
        repositories,
        initialState: state({ assistantHost: "desktop", defaultCwd: "/tmp/project-a" }),
      });
      await waitFor(() => expect(navigationAvailability).toHaveBeenCalled());
      navigationAvailability.mockClear();

      window.dispatchEvent(
        new CustomEvent("poolside:desktop-new-tab", {
          cancelable: true,
          detail: { kind: "files" },
        }),
      );
      const filesTab = await screen.findByRole("tab", { name: "project-a" });
      await waitFor(() => expect(filesTab).toHaveAttribute("aria-selected", "true"));
      await waitFor(() => expect(navigationAvailability).toHaveBeenCalled());

      await fireEvent.click(screen.getByRole("button", { name: "Settings" }));
      expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
      await waitFor(() =>
        expect(navigationAvailability).toHaveBeenLastCalledWith({
          canGoBack: true,
          canGoForward: false,
        }),
      );

      window.dispatchEvent(new CustomEvent("poolside:desktop-navigate-back"));
      const restoredFilesTab = await screen.findByRole("tab", { name: "project-a" });
      expect(restoredFilesTab).toHaveAttribute("aria-selected", "true");

      navigationAvailability.mockClear();
      const chatTab = screen.getByRole("tab", { name: "Chatting with Poolside" });
      await fireEvent.click(chatTab);
      await waitFor(() => expect(chatTab).toHaveAttribute("aria-selected", "true"));
      await waitFor(() => expect(navigationAvailability).toHaveBeenCalled());

      window.dispatchEvent(new CustomEvent("poolside:desktop-navigate-back"));
      await waitFor(() =>
        expect(screen.getByRole("tab", { name: "project-a" })).toHaveAttribute(
          "aria-selected",
          "true",
        ),
      );
    } finally {
      window.removeEventListener(
        "poolside:desktop-navigation-availability",
        handleNavigationAvailability,
      );
    }
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/**
 * Simulate system-menu selection by intercepting its RPC and returning the
 * action id whose label matches `itemLabel`.
 *
 * The previous `hostMessageSender` implementation is restored afterward so
 * per-test customizations are not permanently clobbered.
 */
type SystemMenuAction = {
  kind: "action";
  id: string;
  label: string;
  enabled?: boolean;
  accelerator?: string;
};

type SystemMenuItem = SystemMenuAction | { kind: "separator" };

async function selectFromSystemMenu(
  openMenu: () => void | Promise<unknown>,
  itemLabel: string,
  inspectItems?: (items: SystemMenuItem[]) => void,
) {
  const previousImpl = hostMessageSender.getMockImplementation();

  // Wait for the RPC call itself rather than counting microtask ticks.
  // Selection errors are captured and rethrown after the wait — thrown inside
  // the mock they would be swallowed by the menu transport's failure fallback.
  let selectionError: Error | undefined;
  let intercepted!: () => void;
  const interceptedPromise = new Promise<void>((resolve) => {
    intercepted = resolve;
  });

  hostMessageSender.mockImplementation((method: string, args: unknown[]) => {
    if (method === "showDesktopSystemContextMenu") {
      const request = (args as [{ items: SystemMenuItem[] }])[0];
      let selectedId: string | null = null;
      try {
        inspectItems?.(request.items);
      } catch (error) {
        selectionError = error instanceof Error ? error : new Error(String(error));
      }
      const item = systemMenuAction(request.items, itemLabel);
      if (!item) {
        selectionError = new Error(
          `Native context menu: no action item with label "${itemLabel}" found. Available: ${request.items
            .filter((i) => i.kind === "action")
            .map((i) => `"${i.label}"`)
            .join(", ")}`,
        );
      } else if (item.enabled === false) {
        selectionError = new Error(`Native context menu: item "${itemLabel}" is disabled`);
      } else {
        selectedId = item.id;
      }
      intercepted();
      return Promise.resolve(selectedId);
    }
    return previousImpl ? previousImpl(method, args) : Promise.resolve(undefined);
  });

  try {
    await openMenu();
    await interceptedPromise;

    // Let the selection round-trip complete and invoke the action callback.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    if (selectionError) throw selectionError;
  } finally {
    hostMessageSender.mockImplementation(previousImpl ?? (() => Promise.resolve(undefined)));
  }
}

async function selectFromNativeContextMenu(
  target: HTMLElement,
  itemLabel: string,
  inspectItems?: (items: SystemMenuItem[]) => void,
) {
  await selectFromSystemMenu(() => fireEvent.contextMenu(target), itemLabel, inspectItems);
}

async function selectFromNativeClickMenu(
  target: HTMLElement,
  itemLabel: string,
  inspectItems?: (items: SystemMenuItem[]) => void,
) {
  await selectFromSystemMenu(() => fireEvent.click(target), itemLabel, inspectItems);
}

function systemMenuAction(items: SystemMenuItem[], label: string): SystemMenuAction | undefined {
  return items.find(
    (item): item is SystemMenuAction => item.kind === "action" && item.label === label,
  );
}

function expectNativeMenuSection(items: SystemMenuItem[], labels: string[]) {
  const indices = labels.map((label) =>
    items.findIndex((item) => item.kind === "action" && item.label === label),
  );
  expect(indices.every((index) => index >= 0)).toBe(true);
  expect(indices).toEqual(indices.map((_, offset) => indices[0]! + offset));
  expect(items[indices[0]! - 1]?.kind).toBe("separator");
  expect(items[indices.at(-1)! + 1]?.kind).toBe("separator");
}

async function openProjectContextMenu(projectName: string, itemLabel: string) {
  const projectGroup = await screen.findByRole("group", { name: projectName });
  const projectToggle = within(projectGroup).getByRole("button", {
    name: new RegExp(`(?:Collapse|Expand) ${escapeRegExp(projectName)}`),
  });
  await selectFromNativeContextMenu(projectToggle, itemLabel);
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
  // Fake timers must be installed before the Archive action fires so that the
  // countdown setInterval is created under fake-timer control.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    await beginArchiveConversationViaContextMenu(title);
    await vi.advanceTimersByTimeAsync(3000);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
async function beginArchiveConversationViaContextMenu(title: string) {
  const button = screen.getByRole("button", {
    name: new RegExp(`^${escapeRegExp(title)} - `),
  });
  await selectFromNativeContextMenu(button, "Archive Conversation");
  expect(screen.getByText("Archiving conversation...")).toBeInTheDocument();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function expectSettingsHeader(...crumbs: string[]) {
  const heading = screen.getByRole("heading", { name: "Settings" });
  expect(heading).toBeInTheDocument();
  const header = settingsHeader();
  for (const crumb of crumbs) {
    expect(header.getByText(crumb)).toBeInTheDocument();
  }
}

function settingsHeader() {
  return within(screen.getByRole("heading", { name: "Settings" }).parentElement as HTMLElement);
}

function mockVerticalRects(items: HTMLElement[]) {
  items.forEach((item, index) => {
    const top = index * 30;
    item.getBoundingClientRect = () =>
      ({
        top,
        bottom: top + 30,
        height: 30,
        left: 0,
        right: 200,
        width: 200,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;
  });
}

function reorderMotionContent(item: HTMLElement): HTMLElement {
  const content = Array.from(item.children).find((child) =>
    child.hasAttribute("data-reorderable-motion-content"),
  );
  if (!(content instanceof HTMLElement)) {
    throw new Error("Expected a direct reorder motion content wrapper");
  }
  return content;
}

function dispatchPointer(target: EventTarget, type: string, init: MouseEventInit) {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      ...init,
    }),
  );
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  onShellInteractive,
  onInitialScreenSettled,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  onShellInteractive?: () => void;
  onInitialScreenSettled?: () => void;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      onShellInteractive,
      onInitialScreenSettled,
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
  localInference!: ReturnType<typeof setLocalInferenceContext>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  setupScriptOutputs!: ReturnType<typeof setACPSetupScriptOutputContext>;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  readonly githubBranches: Record<string, string>;
  readonly githubNonRepos: string[];
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    githubBranches = {},
    githubNonRepos = [],
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    githubBranches?: Record<string, string>;
    githubNonRepos?: string[];
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.acpConversationRepo = makeConversationRepo(conversations, {
      restoreConversation,
      archivedConversations: localHistory,
    });
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.githubBranches = githubBranches;
    this.githubNonRepos = githubNonRepos;
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    this.setupScriptOutputs = setACPSetupScriptOutputContext();
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const github = setACPGithubContext();
    vi.spyOn(github, "branchFor").mockImplementation((path) => this.githubBranches[path] ?? "");
    vi.spyOn(github, "isRepoFor").mockImplementation((path) =>
      this.githubNonRepos.includes(path) ? false : undefined,
    );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // The sidebars read local-inference state for the download pill; the
    // helper is unavailable in tests, so the repository's refresh rejects
    // (callers swallow it) and the pill simply never renders.
    this.localInference = setLocalInferenceContext();
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
      configProbeSessionIdsByAgentServer: {},
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
      ensureConfigProbe: vi.fn().mockResolvedValue(undefined),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    claimVisibleConversation: vi.fn(() => vi.fn()),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      (
        cwd: string,
        agentServer = "poolside",
        pendingConversationId: string | null = null,
        options: { isChat?: boolean } = {},
      ) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          isChat: options.isChat,
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
  isChat = false,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  isChat?: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    isChat,
__POOL_SYNTHETIC_IMPORT_BASELINE__
    pendingConversationId: sessionId ? null : conversationId,
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
  repo.removeProject = vi.fn().mockImplementation(async (path: string) => {
    writer.replaceProjects(writer.projects.filter((project) => project.path !== path));
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const trimmed = name.trim();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
        project.path === path
          ? project.isWorktree
            ? { ...project, nickname: trimmed }
            : { ...project, name: trimmed, nickname: project.nickname ? trimmed : project.nickname }
          : project,
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
  repo.reorderWorktrees = vi
    .fn()
    .mockImplementation(async (parentPath: string, paths: string[]) => {
      const orderByPath = new Map(paths.map((path, index) => [path, index]));
      writer.replaceProjects(
        writer.projects.map((project) =>
          project.isWorktree && project.parentPath === parentPath && orderByPath.has(project.path)
            ? { ...project, displayOrder: orderByPath.get(project.path) ?? project.displayOrder }
            : project,
        ),
      );
    });
  repo.getProjectSettings = vi.fn().mockResolvedValue(undefined);
  repo.setProjectSettings = vi.fn().mockImplementation(async (settings) => settings);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  {
    restoreConversation,
    archivedConversations = [],
  }: {
    restoreConversation?: ReturnType<typeof vi.fn>;
    archivedConversations?: ACPConversationSummary[];
  } = {},
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
  repo.archivedConversations = vi.fn().mockResolvedValue(archivedConversations);
  repo.deleteSession = vi.fn().mockResolvedValue(undefined);
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
  homeDirectory,
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  homeDirectory?: string;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    homeDirectory: homeDirectory ?? base.homeDirectory,
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
// A saved default layout as "Save Layout as Default" captures it: a chat tab
// in main, a shape-only terminal in the right sidebar, sidebar visible.
function defaultLayoutWithSidebarTerminal(): PersistedDesktopLayout {
  const pane = (paneId: string, tabId: string, title: string) => ({
    type: "pane" as const,
    pane: {
      id: paneId,
      tabs: [{ id: tabId, title, icon: null, isDirty: false }],
      selectedTabId: tabId,
    },
  });
  return {
    version: 1,
    surfaces: {
      main: { version: 1, rootNode: pane("pane-main", "tab-chat", "Chatting with Poolside") },
      rightSidebar: { version: 1, rootNode: pane("pane-sidebar", "tab-terminal", "Terminal") },
      bottomPanel: {
        version: 1,
        rootNode: { type: "pane", pane: { id: "pane-bottom", tabs: [] } },
      },
    },
    descriptors: {
      "tab-chat": { kind: "chat" },
      "tab-terminal": { kind: "terminal", worktreePath: "" },
    },
    rightSidebarVisible: true,
    bottomPanelVisible: false,
    activeSurface: "main",
  };
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
async function openArchivedChats(): Promise<void> {
  await fireEvent.click(await screen.findByRole("button", { name: "Settings" }));
  await fireEvent.click(screen.getByRole("button", { name: "Archived Chats" }));
__POOL_SYNTHETIC_IMPORT_BASELINE__
