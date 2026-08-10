import type { DesktopContextMenuSpecItem } from "./desktopContextMenu";
import type {
  DesktopFileTreeContextMenuAction,
  DesktopFilesTreeEntry,
} from "./desktopFilesTreeActions";

const DEFAULT_OPENER_ID = "default";

export interface DesktopFileTreeContextMenuOpener {
  id: string;
  label: string;
}

export interface DesktopFileTreeContextMenuRequest {
  requestId: string;
  item: {
    kind: DesktopFilesTreeEntry["kind"];
    /** True when the item has uncommitted git changes (enables "Review Diff..."). */
    hasGitChanges?: boolean;
    /**
     * Present when the menu is opened from the changes list. Switches the
     * spec to the changes variant: Open File first, plus stage/unstage/
     * discard and Move to Trash, and no pasteboard items (cut/paste).
     */
    changesContext?: {
      staged: boolean;
      deleted: boolean;
      /**
       * True for files with no committed state to revert to (git status
       * "added"/"untracked") — disables "Discard Local Changes…".
       */
      added: boolean;
    };
  };
  position: {
    x: number;
    y: number;
  };
  currentOpenerId: string;
  fileOpeners: DesktopFileTreeContextMenuOpener[];
  desktopOpeners: DesktopFileTreeContextMenuOpener[];
}

export type DesktopFileTreeContextMenuSpecItem =
  | {
      kind: "action";
      action: DesktopFileTreeContextMenuAction;
      label: string;
      enabled: boolean;
      accelerator?: string;
      openerId?: string;
    }
  | {
      kind: "separator";
    }
  | {
      kind: "submenu";
      label: string;
      enabled: boolean;
      items: DesktopFileTreeContextMenuSpecItem[];
    };

export function buildDesktopFileTreeContextMenuSpec(
  request: DesktopFileTreeContextMenuRequest,
  pasteboardHasFiles: boolean,
): DesktopFileTreeContextMenuSpecItem[] {
  if (request.item.changesContext) {
    return buildChangesListContextMenuSpec(request, request.item.changesContext);
  }
  const openers = request.item.kind === "file" ? request.fileOpeners : request.desktopOpeners;

  const items: DesktopFileTreeContextMenuSpecItem[] = [
    buildOpenInContextMenuSpec(openers, request.currentOpenerId),
    {
      kind: "action",
      action: "revealInFinder",
      label: "Reveal in Finder",
      enabled: true,
      accelerator: "Cmd+Alt+R",
    },
    {
      kind: "action",
      action: "openInTerminal",
      label: "Open in Terminal",
      enabled: true,
    },
    { kind: "separator" },
    {
      kind: "action",
      action: "addFileToChat",
      label: "Add File to Chat",
      enabled: request.item.kind === "file",
    },
    {
      kind: "action",
      action: "viewDiff",
      label: "Review Diff...",
      enabled: request.item.kind === "file" && request.item.hasGitChanges === true,
    },
    { kind: "separator" },
    {
      kind: "action",
      action: "cut",
      label: "Cut",
      enabled: true,
      accelerator: "Cmd+X",
    },
    {
      kind: "action",
      action: "copy",
      label: "Copy",
      enabled: true,
      accelerator: "Cmd+C",
    },
  ];

  if (request.item.kind === "directory" && pasteboardHasFiles) {
    items.push({
      kind: "action",
      action: "paste",
      label: "Paste",
      enabled: true,
      accelerator: "Cmd+V",
    });
  }

  items.push(
    { kind: "separator" },
    {
      kind: "action",
      action: "copyPath",
      label: "Copy Path",
      enabled: true,
      accelerator: "Cmd+Alt+C",
    },
    {
      kind: "action",
      action: "copyRelativePath",
      label: "Copy Relative Path",
      enabled: true,
      accelerator: "Cmd+Shift+Alt+C",
    },
    { kind: "separator" },
    {
      kind: "action",
      action: "delete",
      label: "Delete",
      enabled: true,
      accelerator: "Cmd+Backspace",
    },
  );

  return items;
}

/**
 * Native-menu spec for a changed file in the changes list. Mirrors the file
 * tree's menu where it makes sense, with "Open File" prominently first and
 * the git actions (stage/unstage/discard) this view owns. There is no
 * "Review Diff..." item — clicking a row already opens the diff.
 */
function buildChangesListContextMenuSpec(
  request: DesktopFileTreeContextMenuRequest,
  changes: { staged: boolean; deleted: boolean; added: boolean },
): DesktopFileTreeContextMenuSpecItem[] {
  const openers = request.fileOpeners;

  return [
    {
      kind: "action",
      action: "open",
      label: "Open File",
      enabled: !changes.deleted,
    },
    buildOpenInContextMenuSpec(openers, request.currentOpenerId, !changes.deleted),
    { kind: "separator" },
    ...(changes.staged
      ? [
          {
            kind: "action",
            action: "gitUnstage",
            label: "Unstage",
            enabled: true,
          } satisfies DesktopFileTreeContextMenuSpecItem,
        ]
      : [
          {
            kind: "action",
            action: "gitStage",
            label: "Stage",
            enabled: true,
          } satisfies DesktopFileTreeContextMenuSpecItem,
        ]),
    {
      kind: "action",
      action: "gitDiscard",
      label: "Discard Local Changes…",
      // Added/untracked files have no committed state to revert to.
      enabled: !changes.added,
    },
    { kind: "separator" },
    {
      kind: "action",
      action: "addFileToChat",
      label: "Add File to Chat",
      enabled: !changes.deleted,
    },
    {
      kind: "action",
      action: "revealInFinder",
      label: "Reveal in Finder",
      enabled: !changes.deleted,
      accelerator: "Cmd+Alt+R",
    },
    {
      kind: "action",
      action: "openInTerminal",
      label: "Open in Terminal",
      enabled: true,
    },
    { kind: "separator" },
    {
      kind: "action",
      action: "copyPath",
      label: "Copy Path",
      enabled: true,
      accelerator: "Cmd+Alt+C",
    },
    {
      kind: "action",
      action: "copyRelativePath",
      label: "Copy Relative Path",
      enabled: true,
      accelerator: "Cmd+Shift+Alt+C",
    },
    { kind: "separator" },
    {
      kind: "action",
      action: "delete",
      label: "Move to Trash",
      // A deleted file has nothing on disk to trash.
      enabled: !changes.deleted,
    },
  ];
}

export function desktopFileTreeContextMenuNeedsPasteboard(
  request: DesktopFileTreeContextMenuRequest,
): boolean {
  return request.item.kind === "directory";
}

/** Builds the shared native "Open in…" submenu used by desktop file surfaces. */
export function buildOpenInContextMenuSpec(
  openers: DesktopFileTreeContextMenuOpener[],
  currentOpenerId: string,
  actionsEnabled = true,
): DesktopFileTreeContextMenuSpecItem {
  const resolvedCurrentOpenerId = currentOpener(openers, currentOpenerId)?.id ?? DEFAULT_OPENER_ID;
  const items = openers
    .filter((opener) => opener.id !== resolvedCurrentOpenerId)
    .map(
      (opener): DesktopFileTreeContextMenuSpecItem => ({
        kind: "action",
        action: "openWith",
        label: opener.label,
        enabled: actionsEnabled,
        openerId: opener.id,
      }),
    );

  return {
    kind: "submenu",
    label: "Open in…",
    enabled: actionsEnabled && items.length > 0,
    items,
  };
}

function currentOpener(
  openers: DesktopFileTreeContextMenuOpener[],
  currentOpenerId: string,
): DesktopFileTreeContextMenuOpener | undefined {
  return (
    openers.find((opener) => opener.id === currentOpenerId) ??
    openers.find((opener) => opener.id === DEFAULT_OPENER_ID) ??
    openers[0]
  );
}

/**
 * Encodes a file-tree action item's `action` and optional `openerId` into the
 * opaque `id` string used by the generic context-menu layer.
 *
 * Format: `action` or `action\0openerId` (NUL-separated). Both fields are
 * guaranteed not to contain NUL characters by the union type for
 * `DesktopFileTreeContextMenuAction`.
 */
export function encodeFileTreeActionId(
  action: DesktopFileTreeContextMenuAction,
  openerId?: string,
): string {
  return openerId ? `${action}\0${openerId}` : action;
}

/**
 * Decodes an id produced by `encodeFileTreeActionId` back into its parts.
 */
export function decodeFileTreeActionId(id: string): {
  action: DesktopFileTreeContextMenuAction;
  openerId?: string;
} {
  const sep = id.indexOf("\0");
  if (sep === -1) {
    return { action: id as DesktopFileTreeContextMenuAction };
  }
  return {
    action: id.slice(0, sep) as DesktopFileTreeContextMenuAction,
    openerId: id.slice(sep + 1),
  };
}

/**
 * Converts a file-tree context-menu spec to the shape expected by the generic
 * `showDesktopContextMenu` API. Each action item's `action`+`openerId` is
 * encoded into a single `id` string via `encodeFileTreeActionId`.
 */
export function fileTreeSpecToGenericSpec(
  spec: DesktopFileTreeContextMenuSpecItem[],
): DesktopContextMenuSpecItem[] {
  return spec.map((item): DesktopContextMenuSpecItem => {
    if (item.kind === "separator") return { kind: "separator" };
    if (item.kind === "submenu") {
      return {
        kind: "submenu",
        label: item.label,
        enabled: item.enabled,
        items: fileTreeSpecToGenericSpec(item.items),
      };
    }
    return {
      kind: "action",
      id: encodeFileTreeActionId(item.action, item.openerId),
      label: item.label,
      enabled: item.enabled,
      accelerator: item.accelerator,
    };
  });
}
