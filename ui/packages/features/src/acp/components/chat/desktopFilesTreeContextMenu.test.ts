import { describe, expect, it } from "vitest";
import type { DesktopFileTreeContextMenuAction } from "./desktopFilesTreeActions";
import {
  buildDesktopFileTreeContextMenuSpec,
  decodeFileTreeActionId,
  encodeFileTreeActionId,
  fileTreeSpecToGenericSpec,
  type DesktopFileTreeContextMenuRequest,
  type DesktopFileTreeContextMenuSpecItem,
} from "./desktopFilesTreeContextMenu";

describe("desktop file tree context menu", () => {
  it("builds the file menu without a direct current-opener item", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(request("file"), true);

    expect(labels(spec)).toEqual([
      "Open in…",
      "Reveal in Finder",
      "Open in Terminal",
      "---",
      "Add File to Chat",
      "Review Diff...",
      "---",
      "Cut",
      "Copy",
      "---",
      "Copy Path",
      "Copy Relative Path",
      "---",
      "Delete",
    ]);
    expect(spec).not.toContainEqual(
      expect.objectContaining({
        kind: "action",
        action: "open",
      }),
    );
  });

  it("uses the expected macOS accelerator strings", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(request("directory"), true);

    expect(accelerator(spec, "revealInFinder")).toBe("Cmd+Alt+R");
    expect(accelerator(spec, "cut")).toBe("Cmd+X");
    expect(accelerator(spec, "copy")).toBe("Cmd+C");
    expect(accelerator(spec, "paste")).toBe("Cmd+V");
    expect(accelerator(spec, "copyPath")).toBe("Cmd+Alt+C");
    expect(accelerator(spec, "copyRelativePath")).toBe("Cmd+Shift+Alt+C");
    expect(accelerator(spec, "delete")).toBe("Cmd+Backspace");
  });

  it("shows paste only for folder targets with file URLs on the pasteboard", () => {
    const fileSpec = buildDesktopFileTreeContextMenuSpec(request("file"), true);
    const folderWithoutPaste = buildDesktopFileTreeContextMenuSpec(request("directory"), false);
    const folderWithPaste = buildDesktopFileTreeContextMenuSpec(request("directory"), true);

    expect(labels(fileSpec)).not.toContain("Paste");
    expect(labels(folderWithoutPaste)).not.toContain("Paste");
    expect(labels(folderWithPaste)).toContain("Paste");
  });

  it("uses desktop openers for folders and disables add file to chat", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(request("directory"), false);
    const submenu = spec.find((item) => item.kind === "submenu");
    const addFileToChat = spec.find(
      (item) => item.kind === "action" && item.action === "addFileToChat",
    );

    expect(submenu).toEqual(
      expect.objectContaining({
        kind: "submenu",
        label: "Open in…",
        enabled: true,
        items: [
          expect.objectContaining({ label: "Finder", openerId: "default" }),
          expect.objectContaining({ label: "Warp", openerId: "terminal:warp" }),
        ],
      }),
    );
    expect(addFileToChat).toEqual(expect.objectContaining({ enabled: false }));
  });

  it("disables the opener submenu when there are no alternate openers", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(
      {
        ...request("file"),
        fileOpeners: [{ id: "app:code", label: "Code" }],
      },
      false,
    );

    expect(spec[0]).toEqual(
      expect.objectContaining({
        kind: "submenu",
        enabled: false,
        items: [],
      }),
    );
  });

  it("falls back to the default opener when excluding the current submenu item", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(
      {
        ...request("file"),
        currentOpenerId: "missing",
      },
      false,
    );

    expect(submenuLabels(spec)).toEqual(["In-app viewer", "Code"]);
  });

  it("builds the changes-list menu with discard and move to trash", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(
      changesRequest({ staged: false, deleted: false, added: false }),
      false,
    );

    expect(labels(spec)).toEqual([
      "Open File",
      "Open in…",
      "---",
      "Stage",
      "Discard Local Changes…",
      "---",
      "Add File to Chat",
      "Reveal in Finder",
      "Open in Terminal",
      "---",
      "Copy Path",
      "Copy Relative Path",
      "---",
      "Move to Trash",
    ]);
  });

  it("offers discard for staged files too", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(
      changesRequest({ staged: true, deleted: false, added: false }),
      false,
    );

    expect(labels(spec)).toContain("Unstage");
    expect(action(spec, "gitDiscard")).toEqual(
      expect.objectContaining({ label: "Discard Local Changes…", enabled: true }),
    );
  });

  it("disables discard for added and untracked files", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(
      changesRequest({ staged: false, deleted: false, added: true }),
      false,
    );

    expect(action(spec, "gitDiscard")).toEqual(expect.objectContaining({ enabled: false }));
    expect(action(spec, "delete")).toEqual(
      expect.objectContaining({ label: "Move to Trash", enabled: true }),
    );
  });

  it("disables move to trash for deleted files", () => {
    const spec = buildDesktopFileTreeContextMenuSpec(
      changesRequest({ staged: false, deleted: true, added: false }),
      false,
    );

    expect(action(spec, "delete")).toEqual(expect.objectContaining({ enabled: false }));
  });

  it("enables view diff only for files with git changes", () => {
    const changedFile = buildDesktopFileTreeContextMenuSpec(
      { ...request("file"), item: { kind: "file", hasGitChanges: true } },
      false,
    );
    const cleanFile = buildDesktopFileTreeContextMenuSpec(request("file"), false);
    const changedDirectory = buildDesktopFileTreeContextMenuSpec(
      { ...request("directory"), item: { kind: "directory", hasGitChanges: true } },
      false,
    );

    expect(viewDiff(changedFile)).toEqual(expect.objectContaining({ enabled: true }));
    expect(viewDiff(cleanFile)).toEqual(expect.objectContaining({ enabled: false }));
    expect(viewDiff(changedDirectory)).toEqual(expect.objectContaining({ enabled: false }));
  });

  function request(kind: "directory" | "file"): DesktopFileTreeContextMenuRequest {
    return {
      requestId: "request-1",
      item: { kind },
      position: { x: 1, y: 2 },
      currentOpenerId: "app:code",
      fileOpeners: [
        { id: "poolside", label: "In-app viewer" },
        { id: "default", label: "Default macOS app" },
        { id: "app:code", label: "Code" },
      ],
      desktopOpeners: [
        { id: "default", label: "Finder" },
        { id: "app:code", label: "Code" },
        { id: "terminal:warp", label: "Warp" },
      ],
    };
  }

  function changesRequest(changesContext: {
    staged: boolean;
    deleted: boolean;
    added: boolean;
  }): DesktopFileTreeContextMenuRequest {
    const base = request("file");
    return {
      ...base,
      item: { kind: "file", hasGitChanges: true, changesContext },
    };
  }

  function action(
    spec: DesktopFileTreeContextMenuSpecItem[],
    action: DesktopFileTreeContextMenuAction,
  ): DesktopFileTreeContextMenuSpecItem | undefined {
    return spec.find((item) => item.kind === "action" && item.action === action);
  }

  function viewDiff(
    spec: DesktopFileTreeContextMenuSpecItem[],
  ): DesktopFileTreeContextMenuSpecItem | undefined {
    return spec.find((item) => item.kind === "action" && item.action === "viewDiff");
  }

  function labels(spec: DesktopFileTreeContextMenuSpecItem[]): string[] {
    return spec.map((item) => {
      if (item.kind === "separator") return "---";
      return item.label;
    });
  }

  function submenuLabels(spec: DesktopFileTreeContextMenuSpecItem[]): string[] {
    const submenu = spec.find((item) => item.kind === "submenu");
    if (!submenu || submenu.kind !== "submenu") return [];
    return labels(submenu.items);
  }

  function accelerator(
    spec: DesktopFileTreeContextMenuSpecItem[],
    action: DesktopFileTreeContextMenuAction,
  ): string | undefined {
    for (const item of spec) {
      if (item.kind === "action" && item.action === action) return item.accelerator;
      if (item.kind === "submenu") {
        const nested = accelerator(item.items, action);
        if (nested) return nested;
      }
    }
    return undefined;
  }
});

describe("encodeFileTreeActionId / decodeFileTreeActionId", () => {
  it("round-trips a plain action with no openerId", () => {
    const encoded = encodeFileTreeActionId("copy");
    const decoded = decodeFileTreeActionId(encoded);
    expect(decoded).toEqual({ action: "copy" });
  });

  it("round-trips an action with an openerId", () => {
    const encoded = encodeFileTreeActionId("openWith", "app:vscode");
    const decoded = decodeFileTreeActionId(encoded);
    expect(decoded).toEqual({ action: "openWith", openerId: "app:vscode" });
  });

  it("handles openerId values that contain colons and dots", () => {
    const openerId = "terminal:warp.app";
    const encoded = encodeFileTreeActionId("openWith", openerId);
    const decoded = decodeFileTreeActionId(encoded);
    expect(decoded.openerId).toBe(openerId);
  });

  it("separates action from openerId using NUL so neither value leaks into the other", () => {
    const encoded = encodeFileTreeActionId("openWith", "default");
    // The NUL byte is the separator — the action part must not include it
    const [actionPart] = encoded.split("\0");
    expect(actionPart).toBe("openWith");
  });
});

describe("fileTreeSpecToGenericSpec", () => {
  it("converts separator items", () => {
    const spec: DesktopFileTreeContextMenuSpecItem[] = [{ kind: "separator" }];
    const generic = fileTreeSpecToGenericSpec(spec);
    expect(generic).toEqual([{ kind: "separator" }]);
  });

  it("converts action items with encoded id", () => {
    const spec: DesktopFileTreeContextMenuSpecItem[] = [
      { kind: "action", action: "copy", label: "Copy", enabled: true, accelerator: "Cmd+C" },
    ];
    const generic = fileTreeSpecToGenericSpec(spec);
    expect(generic[0]).toMatchObject({
      kind: "action",
      id: "copy",
      label: "Copy",
      enabled: true,
      accelerator: "Cmd+C",
    });
  });

  it("encodes openerId into the action id for openWith items", () => {
    const spec: DesktopFileTreeContextMenuSpecItem[] = [
      {
        kind: "action",
        action: "openWith",
        label: "Open with VS Code",
        enabled: true,
        openerId: "app:code",
      },
    ];
    const generic = fileTreeSpecToGenericSpec(spec);
    expect(generic[0]).toMatchObject({ kind: "action", id: "openWith\0app:code" });
    if (generic[0].kind === "action") {
      expect(decodeFileTreeActionId(generic[0].id)).toEqual({
        action: "openWith",
        openerId: "app:code",
      });
    }
  });

  it("converts submenu items recursively", () => {
    const spec: DesktopFileTreeContextMenuSpecItem[] = [
      {
        kind: "submenu",
        label: "Open in…",
        enabled: true,
        items: [
          {
            kind: "action",
            action: "openWith",
            label: "Warp",
            enabled: true,
            openerId: "terminal:warp",
          },
        ],
      },
    ];
    const generic = fileTreeSpecToGenericSpec(spec);
    expect(generic[0].kind).toBe("submenu");
    if (generic[0].kind === "submenu") {
      expect(generic[0].label).toBe("Open in…");
      expect(generic[0].items[0]).toMatchObject({ kind: "action", id: "openWith\0terminal:warp" });
    }
  });

  it("produces a generic spec that round-trips back to the original action+openerId", () => {
    const fullSpec = buildDesktopFileTreeContextMenuSpec(
      {
        requestId: "test-1",
        item: { kind: "file" },
        position: { x: 0, y: 0 },
        currentOpenerId: "poolside",
        fileOpeners: [
          { id: "poolside", label: "In-app viewer" },
          { id: "app:code", label: "Code" },
        ],
        desktopOpeners: [],
      },
      false,
    );

    const generic = fileTreeSpecToGenericSpec(fullSpec);

    // Collect all action ids from the generic spec recursively
    function collectIds(items: typeof generic): { id: string; label: string }[] {
      return items.flatMap((item) => {
        if (item.kind === "action") return [{ id: item.id, label: item.label }];
        if (item.kind === "submenu") return collectIds(item.items);
        return [];
      });
    }

    const actionIds = collectIds(generic);

    // Every id must decode cleanly without throwing
    for (const { id } of actionIds) {
      const decoded = decodeFileTreeActionId(id);
      expect(typeof decoded.action).toBe("string");
    }

    // The "Open in…" submenu item for Code should round-trip with openerId
    const codeEntry = actionIds.find((a) => a.label === "Code");
    expect(codeEntry).toBeDefined();
    if (codeEntry) {
      const decoded = decodeFileTreeActionId(codeEntry.id);
      expect(decoded.action).toBe("openWith");
      expect(decoded.openerId).toBe("app:code");
    }
  });
});
