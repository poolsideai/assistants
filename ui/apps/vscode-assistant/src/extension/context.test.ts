__POOL_SYNTHETIC_IMPORT_BASELINE__
import * as os from "os";
import * as path from "path";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { getWorkspaces, sendActiveFileContext } from "./context";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
let mockDefaultWorkingDirectory: string | undefined = undefined;
let getDefaultCwd: typeof import("./context").getDefaultCwd;
__POOL_SYNTHETIC_IMPORT_BASELINE__
const { mockMkdirSync } = vi.hoisted(() => ({ mockMkdirSync: vi.fn() }));

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>();
  return { ...actual, mkdirSync: mockMkdirSync };
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
      getConfiguration: () => ({
        get: (key: string) =>
          key === "defaultWorkingDirectory" ? mockDefaultWorkingDirectory : undefined,
      }),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  isOpenInTab: (document: vscode.TextDocument) =>
    vscode.window.tabGroups.all.some((tabGroup) =>
      tabGroup.tabs.some(
        (tab) =>
          tab.input instanceof MockTabInputText && tab.input.uri.fsPath === document.uri.fsPath,
      ),
    ),
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    acpChatPanels: {
      setContext: vi.fn(),
    },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// The no-project working directory getDefaultCwd falls back to. Deriving it from the
// same platform check the implementation makes would only prove the test agrees with
// the implementation, so the platform is pinned per case below and each branch names
// the directory it expects.
const scratchDir = path.join(os.homedir(), ".poolside", "scratch");
const windowsLocalAppData = path.join("C:", "Users", "dev", "AppData", "Local");

const hostPlatform = process.platform;

function setPlatform(platform: NodeJS.Platform) {
  Object.defineProperty(process, "platform", { value: platform, configurable: true });
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  beforeEach(async () => {
    vi.resetModules();
    ({ getDefaultCwd } = await import("./context"));
__POOL_SYNTHETIC_IMPORT_BASELINE__
    // clearAllMocks leaves implementations in place, so a test that makes the
    // scratch dir unwritable would otherwise leak into every test after it.
    mockMkdirSync.mockReset();
    // CI runs the unit tests on Linux only, so the Windows branch would never execute
    // unless a case asks for it. Pin the platform so each one picks its own branch.
    setPlatform("linux");
__POOL_SYNTHETIC_IMPORT_BASELINE__
    mockDefaultWorkingDirectory = undefined;
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  afterEach(() => {
    setPlatform(hostPlatform);
    vi.unstubAllEnvs();
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
  describe("getDefaultCwd", () => {
    it("uses a dedicated scratch directory when no setting is configured", () => {
      mockDefaultWorkingDirectory = undefined;

      const cwd = getDefaultCwd();

      expect(cwd).toBe(scratchDir);
      expect(cwd).not.toBe(os.homedir());
      expect(mockMkdirSync).toHaveBeenCalledWith(scratchDir, { recursive: true });
    });

    it("uses the scratch directory when the setting is empty", () => {
      mockDefaultWorkingDirectory = "   ";

      expect(getDefaultCwd()).toBe(scratchDir);
    });

    it("uses the local app data scratch directory on Windows", () => {
      setPlatform("win32");
      vi.stubEnv("LOCALAPPDATA", windowsLocalAppData);
      mockDefaultWorkingDirectory = undefined;

      const cwd = getDefaultCwd();

      expect(cwd).toBe(path.join(windowsLocalAppData, "poolside", "scratch"));
      expect(mockMkdirSync).toHaveBeenCalledWith(cwd, { recursive: true });
    });

    it("falls back to the home scratch directory when Windows has no LOCALAPPDATA", () => {
      setPlatform("win32");
      vi.stubEnv("LOCALAPPDATA", "");
      mockDefaultWorkingDirectory = undefined;

      expect(getDefaultCwd()).toBe(scratchDir);
    });

    it("returns the configured directory when set", () => {
      mockDefaultWorkingDirectory = "/custom/scratch";

      expect(getDefaultCwd()).toBe("/custom/scratch");
    });

    // The setting overrides the fallback, so it is not ours to create - and not ours to
    // replace with the temp directory either. Only the scratch fallback below is.
    it("leaves a configured directory alone when it does not exist", () => {
      mockDefaultWorkingDirectory = "/custom/scratch";
      mockMkdirSync.mockImplementation(() => {
        throw new Error("EACCES");
      });

      expect(getDefaultCwd()).toBe("/custom/scratch");
      expect(mockMkdirSync).not.toHaveBeenCalled();
    });

    // Rooting the agent at the profile is what we are getting away from, so an
    // unwritable scratch dir must not silently fall back to the home directory.
    it("stays out of the home directory when the scratch dir cannot be created", () => {
      mockDefaultWorkingDirectory = undefined;
      mockMkdirSync.mockImplementation(() => {
        throw new Error("EACCES");
      });

      const cwd = getDefaultCwd();

      expect(cwd).toBe(os.tmpdir());
      expect(cwd).not.toBe(os.homedir());
    });

    // A synchronous mkdir on every cursor move is what resolving it once avoids.
    it("creates the scratch directory once, not on every context refresh", () => {
      mockDefaultWorkingDirectory = undefined;

      expect(getDefaultCwd()).toBe(scratchDir);
      expect(getDefaultCwd()).toBe(scratchDir);
      expect(getDefaultCwd()).toBe(scratchDir);

      expect(mockMkdirSync).toHaveBeenCalledTimes(1);
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
      expect(system.acpChatPanels.setContext).not.toHaveBeenCalled();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    it("sends context with no active files when active tab is a webview tab", async () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      expect(system.assistant.rpc.setContext).toHaveBeenCalledWith({
        workspaces: [],
        homeDirectory: os.homedir(),
        defaultCwd: scratchDir,
        activeFiles: [],
      });
      expect(system.acpChatPanels.setContext).toHaveBeenCalledWith({
        workspaces: [],
        homeDirectory: os.homedir(),
        defaultCwd: scratchDir,
        activeFiles: [],
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
        homeDirectory: os.homedir(),
        defaultCwd: scratchDir,
        activeFiles: [],
__POOL_SYNTHETIC_IMPORT_BASELINE__
      expect(system.acpChatPanels.setContext).toHaveBeenCalledWith({
        workspaces: [{ path: "/workspace", name: "workspace", index: 0 }],
        homeDirectory: os.homedir(),
        defaultCwd: scratchDir,
        activeFiles: [],
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
      const mockSelection = new vscode.Selection(0, 0, 1, 0);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
          homeDirectory: os.homedir(),
          defaultCwd: scratchDir,
          recentFile: expect.objectContaining({
__POOL_SYNTHETIC_IMPORT_BASELINE__
            selectedCode: "const x = 1;\n",
            selection: [1, 2],
__POOL_SYNTHETIC_IMPORT_BASELINE__
          activeFiles: [
            expect.objectContaining({
              content: "const x = 1;\nconst y = 2;",
              selectedCode: "const x = 1;\n",
              selection: [1, 2],
            }),
          ],
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
      expect(system.acpChatPanels.setContext).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaces: [{ path: "/workspace", name: "workspace", index: 0 }],
          homeDirectory: os.homedir(),
          defaultCwd: scratchDir,
          recentFile: expect.objectContaining({
            content: "const x = 1;\nconst y = 2;",
            selectedCode: "const x = 1;\n",
            selection: [1, 2],
          }),
          activeFiles: [
            expect.objectContaining({
              content: "const x = 1;\nconst y = 2;",
              selectedCode: "const x = 1;\n",
              selection: [1, 2],
            }),
          ],
        }),
      );
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
