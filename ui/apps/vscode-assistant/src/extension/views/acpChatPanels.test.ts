import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
__POOL_SYNTHETIC_IMPORT_BASELINE__

interface MockPanel {
  active: boolean;
  title: string;
  iconPath: unknown;
  reveal: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  onDidDispose: ReturnType<typeof vi.fn>;
  onDidChangeViewState: ReturnType<typeof vi.fn>;
  webview: {
    options: Record<string, unknown>;
    html: string;
    postMessage: ReturnType<typeof vi.fn>;
    onDidReceiveMessage: ReturnType<typeof vi.fn>;
  };
}

const { createdPanels, createMockPanel, sendRequest, writtenFiles } = vi.hoisted(() => {
  const createdPanels: MockPanel[] = [];
  const sendRequest = vi.fn();
  const writtenFiles = new Map<string, string>();

  function createMockPanel(): MockPanel {
    const disposeListeners: Array<() => void> = [];
    const panel: MockPanel = {
      active: false,
      title: "",
      iconPath: undefined,
      reveal: vi.fn(),
      dispose: vi.fn(() => {
        for (const listener of disposeListeners) listener();
      }),
      onDidDispose: vi.fn((listener: () => void) => {
        disposeListeners.push(listener);
        return { dispose: vi.fn() };
      }),
      onDidChangeViewState: vi.fn(() => ({ dispose: vi.fn() })),
      webview: {
        options: {},
        html: "",
        postMessage: vi.fn(async () => true),
        onDidReceiveMessage: vi.fn(() => ({ dispose: vi.fn() })),
      },
    };
    return panel;
  }

  return { createdPanels, createMockPanel, sendRequest, writtenFiles };
});

vi.mock("vscode", () => ({
  ViewColumn: { Active: 1 },
  Uri: {
    parse(value: string) {
      return { fsPath: value, path: value, toString: () => value };
    },
    file(value: string) {
      return { fsPath: value, path: value, scheme: "file", toString: () => `file:${value}` };
    },
    joinPath(
      base: { fsPath?: string; path?: string; scheme?: string; toString: () => string },
      ...paths: string[]
    ) {
      const basePath = base.fsPath ?? base.path ?? base.toString();
      const joined = [basePath.replace(/\/$/, ""), ...paths].join("/");
      return {
        fsPath: joined,
        path: joined,
        scheme: base.scheme,
        toString: () => (base.scheme === "file" ? `file:${joined}` : joined),
      };
    },
  },
  workspace: {
    fs: {
      createDirectory: vi.fn(async () => {}),
      writeFile: vi.fn(async (uri: { fsPath?: string; path?: string }, bytes: Uint8Array) => {
        writtenFiles.set(uri.fsPath ?? uri.path ?? "", new TextDecoder().decode(bytes));
      }),
    },
  },
  window: {
    createWebviewPanel: vi.fn(() => {
      const panel = createMockPanel();
      createdPanels.push(panel);
      return panel;
    }),
  },
}));

vi.mock("./getWebviewHtml", () => ({
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}));

vi.mock("../helper", () => ({
  getHelperSingleton: vi.fn(async () => ({ sendRequest })),
}));

vi.mock("../rpc/server", () => ({
  HostRPCServer: vi.fn().mockImplementation(() => ({
    route: vi.fn(),
  })),
}));

function createPanels(): AcpChatPanels {
  return new AcpChatPanels({
    context: {
      asAbsolutePath: (path: string) => path,
      globalStorageUri: { fsPath: "/global-storage", path: "/global-storage" },
    },
    telemetry: { reportError: vi.fn() },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  } as any);
}

describe("AcpChatPanels", () => {
  beforeEach(() => {
    createdPanels.length = 0;
    writtenFiles.clear();
    sendRequest.mockReset();
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("focusInput opens a pending chat and focuses when ready", async () => {
    const panels = createPanels();

    await panels.focusInput();

    expect(createdPanels).toHaveLength(1);
    expect(createdPanels[0].webview.postMessage).not.toHaveBeenCalled();
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    expect(createdPanels[0].reveal).toHaveBeenCalledOnce();
    expect(createdPanels[0].webview.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "focusInput",
        payload: [],
      }),
    );
  });

  test("focusInput reveals and focuses the most recently viewed open chat", async () => {
    const panels = createPanels();

    vi.setSystemTime(new Date("2026-01-01T00:00:01Z"));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    vi.setSystemTime(new Date("2026-01-01T00:00:02Z"));
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    await panels.focusInput();

    expect(createdPanels[0].reveal).not.toHaveBeenCalled();
    expect(createdPanels[0].webview.postMessage).not.toHaveBeenCalledWith(
      expect.objectContaining({ command: "focusInput" }),
    );
    expect(createdPanels[1].reveal).toHaveBeenCalledOnce();
    expect(createdPanels[1].webview.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "focusInput",
        payload: [],
      }),
    );
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

  test("uses the agent icon URL for a non-poolside tab icon", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => svgResponse(`<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>`)),
    );
    const panels = createPanels();

    await panels.openSession({
      conversationId: "conversation:codex",
      agentServer: "codex-acp",
      sessionId: "session-codex",
      agentName: "Codex CLI",
      agentIconUrl: "https://example.com/codex.svg",
      sessionTitle: "Implement dynamic icons",
    });

    await vi.waitFor(() => expect(writtenFiles.size).toBe(8));

    expect(createdPanels[0].title).toBe("Implement dynamic icons");
    const iconPath = createdPanels[0].iconPath as { dark: { toString(): string } };
    expect(iconPath.dark.toString()).toContain("file:/global-storage/acp-tab-icons/");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(Array.from(writtenFiles.values()).join("\n")).toContain(`circle cx="12.5"`);
  });

  test("ignores plaintext HTTP agent icon URLs", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const panels = createPanels();

    await panels.openSession({
      conversationId: "conversation:http-icon",
      agentServer: "gemini",
      sessionId: "session-http-icon",
      agentIconUrl: "http://example.com/gemini.svg",
    });

    expect(globalThis.fetch).not.toHaveBeenCalled();
    expect(writtenFiles.size).toBe(0);
    expect(
      (createdPanels[0].iconPath as { dark: { toString(): string } }).dark.toString(),
    ).toContain("./dist/resources/icon-light.svg");
  });

  test("updates a pending panel icon when agent metadata changes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        svgResponse(`<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>`),
      ),
    );
    const panels = createPanels();

    await panels.openSession({ conversationId: "conversation:pending" });
    panels.updatePanelMetadata("conversation:pending", {
      agentServer: "gemini",
      agentName: "Gemini",
      agentIconUrl: "https://example.com/gemini.svg",
    });

    await vi.waitFor(() => expect(writtenFiles.size).toBe(8));

    expect(createdPanels[0].title).toBe("Poolside Chat");
    expect(
      (createdPanels[0].iconPath as { dark: { toString(): string } }).dark.toString(),
    ).toContain("file:/global-storage/acp-tab-icons/");
  });

  test("keeps a generated agent icon on repeated metadata updates", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        svgResponse(`<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>`),
      ),
    );
    const panels = createPanels();

    await panels.openSession({
      conversationId: "conversation:stable-icon",
      agentServer: "gemini",
      sessionId: "session-stable-icon",
      agentIconUrl: "https://example.com/gemini.svg",
    });
    await vi.waitFor(() => expect(writtenFiles.size).toBe(8));

    const generatedIconPath = createdPanels[0].iconPath;
    panels.updatePanelMetadata("conversation:stable-icon", {
      agentServer: "gemini",
      agentIconUrl: "https://example.com/gemini.svg",
    });

    expect(createdPanels[0].iconPath).toBe(generatedIconPath);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  test("keeps a generated agent icon when reopening without icon metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        svgResponse(`<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>`),
      ),
    );
    const panels = createPanels();

    await panels.openSession({
      conversationId: "conversation:reopen-icon",
      agentServer: "gemini",
      sessionId: "session-reopen-icon",
      agentIconUrl: "https://example.com/gemini.svg",
    });
    await vi.waitFor(() => expect(writtenFiles.size).toBe(8));

    const generatedIconPath = createdPanels[0].iconPath;
    await panels.openSession({
      conversationId: "conversation:reopen-icon",
      agentServer: "gemini",
      sessionId: "session-reopen-icon",
    });

    expect(createdPanels).toHaveLength(1);
    expect(createdPanels[0].reveal).toHaveBeenCalledOnce();
    expect(createdPanels[0].iconPath).toBe(generatedIconPath);
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  test("does not let a stale in-flight icon overwrite a cached agent icon", async () => {
    let resolveSlowIcon: (response: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input);
        if (url === "https://example.com/slow.svg") {
          return new Promise<Response>((resolve) => {
            resolveSlowIcon = resolve;
          });
        }
        return Promise.resolve(
          svgResponse(`<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="8"/></svg>`),
        );
      }),
    );
    const panels = createPanels();

    await panels.openSession({
      conversationId: "conversation:stale-icon",
      agentServer: "gemini",
      sessionId: "session-stale-icon",
      agentIconUrl: "https://example.com/cached.svg",
    });
    await vi.waitFor(() => expect(writtenFiles.size).toBe(8));

    const cachedIconPath = createdPanels[0].iconPath;
    panels.updatePanelMetadata("conversation:stale-icon", {
      agentServer: "gemini",
      agentIconUrl: "https://example.com/slow.svg",
    });
    await vi.waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2));

    panels.updatePanelMetadata("conversation:stale-icon", {
      agentServer: "gemini",
      agentIconUrl: "https://example.com/cached.svg",
    });
    expect(createdPanels[0].iconPath).toBe(cachedIconPath);

    resolveSlowIcon(svgResponse(`<svg viewBox="0 0 16 16"><path d="M0 0h16v16H0z"/></svg>`));
    await vi.waitFor(() => expect(writtenFiles.size).toBe(16));

    expect(createdPanels[0].iconPath).toBe(cachedIconPath);
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml",
    },
  });
}
