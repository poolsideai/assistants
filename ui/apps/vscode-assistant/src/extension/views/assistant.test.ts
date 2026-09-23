import { beforeEach, describe, expect, test, vi } from "vitest";
import { Assistant, AssistantState } from "./assistant";

interface MockWebviewView {
  visible: boolean;
__POOL_SYNTHETIC_IMPORT_BASELINE__
  show: ReturnType<typeof vi.fn>;
  onDidDispose: ReturnType<typeof vi.fn>;
  onDidChangeVisibility: ReturnType<typeof vi.fn>;
  webview: {
    options: Record<string, unknown>;
    html: string;
    onDidReceiveMessage: ReturnType<typeof vi.fn>;
  };
  dispose: () => void;
}

const { executeCommand } = vi.hoisted(() => ({
  executeCommand: vi.fn(),
}));

vi.mock("vscode", () => ({
  commands: {
    executeCommand,
  },
}));

vi.mock("../rpc/client", () => ({
  createRpcClient: vi.fn(() => ({
    setConfiguration: vi.fn(),
  })),
}));

vi.mock("../rpc/server", () => ({
  HostRPCServer: vi.fn().mockImplementation(() => ({
    route: vi.fn(),
  })),
}));

vi.mock("../configuration", () => ({
  getPoolsideConfig: vi.fn(() => ({ uri: "" })),
}));

vi.mock("../context", () => ({
  sendActiveFileContext: vi.fn(),
}));

vi.mock("./getWebviewHtml", () => ({
  getWebviewHtml: vi.fn(async () => "<html></html>"),
}));

function createAssistant(): Assistant {
  const assistant = new Assistant({
    telemetry: {
      log: vi.fn(),
    },
    decorationProvider: {
      deleteAllInserts: vi.fn(),
    },
    acpChatPanels: {
      setConfiguration: vi.fn(),
    },
    context: {
      globalStorageUri: {
        fsPath: "/user/globalStorage/poolside-ai.poolside-assistant",
      },
    },
  } as any);
  assistant.mark(AssistantState.READY);
  return assistant;
}

function createWebviewView(visible: boolean): MockWebviewView {
  const disposeListeners: Array<() => void> = [];

  return {
    visible,
    show: vi.fn(),
    onDidDispose: vi.fn((listener: () => void) => {
      disposeListeners.push(listener);
      return { dispose: vi.fn() };
    }),
    onDidChangeVisibility: vi.fn(() => ({ dispose: vi.fn() })),
    webview: {
      options: {},
      html: "",
      onDidReceiveMessage: vi.fn(() => ({ dispose: vi.fn() })),
    },
    dispose: () => {
      for (const listener of disposeListeners) listener();
    },
  };
}

describe("Assistant", () => {
  beforeEach(() => {
    executeCommand.mockReset();
    executeCommand.mockResolvedValue(undefined);
  });

  test("showSidebar focuses the Poolside view", async () => {
    const assistant = createAssistant();

    await assistant.showSidebar();

    expect(executeCommand).toHaveBeenCalledExactlyOnceWith("poolside-webview.focus");
  });

  test("resolveWebviewView clears extension state when disposed", async () => {
    const assistant = createAssistant();
    const webviewView = createWebviewView(true);

    await assistant.resolveWebviewView(webviewView as any);

    webviewView.dispose();

    expect(assistant.webviewView).toBeUndefined();
    expect(executeCommand).not.toHaveBeenCalled();
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
