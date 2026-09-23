import { describe, expect, it, vi } from "vitest";
import { DESKTOP_FILE_PROMPT_CHIP_EVENT } from "./desktopFilePromptChip";
import {
  desktopFilePromptChipContent,
  handleDesktopFilePromptChipEvent,
  insertDesktopFilePromptChip,
  type DesktopFilePromptChipEditor,
  type DesktopFilePromptChipRegistry,
} from "./desktopFilePromptChipInserter";

describe("desktop file prompt chip inserter", () => {
  it("creates prompt chip content for a file path", () => {
    expect(desktopFilePromptChipContent("/workspace/src/app.ts")).toEqual({
      label: "app.ts",
      value: "/workspace/src/app.ts",
      clipboard: "`/workspace/src/app.ts`",
      icon: "file",
      fileIconPath: "/workspace/src/app.ts",
      tooltip: "/workspace/src/app.ts",
    });
  });

  it("inserts a file chip into the prompt editor", async () => {
    const { editor, state, transaction, dispatch } = createEditor();
    const chips = createChipRegistry();
    const onInsertFile = vi.fn().mockResolvedValue(undefined);
    const onRemoveFile = vi.fn();
    const path = "/workspace/src/app.ts";

    const inserted = insertDesktopFilePromptChip(path, {
      editor,
      chips,
      onInsertFile,
      onRemoveFile,
      idFactory: () => "chip-1" as never,
    });

    expect(inserted).toBe(true);
    expect(chips.register).toHaveBeenCalledWith(
      "chip-1",
      expect.objectContaining({
        content: {
          label: "app.ts",
          value: path,
          clipboard: "`/workspace/src/app.ts`",
          icon: "file",
          fileIconPath: path,
          tooltip: path,
        },
      }),
    );
    expect(state.schema.nodes.chip.create).toHaveBeenCalledWith({
      id: "chip-1",
      label: "app.ts",
      value: path,
      clipboard: "`/workspace/src/app.ts`",
      icon: "file",
      fileIconPath: path,
      tooltip: path,
    });
    expect(transaction.replaceRangeWith).toHaveBeenCalledWith(2, 5, {
      type: "chip",
      attrs: {
        id: "chip-1",
        label: "app.ts",
        value: path,
        clipboard: "`/workspace/src/app.ts`",
        icon: "file",
        fileIconPath: path,
        tooltip: path,
      },
    });
    expect(transaction.insertText).toHaveBeenCalledWith(" ");
    expect(dispatch).toHaveBeenCalledWith(transaction);
    expect(editor.focus).toHaveBeenCalled();

    const registration = vi.mocked(chips.register).mock.calls[0]?.[1];
    await registration?.onInsert?.(registration.content, { undo: vi.fn() });
    registration?.onRemove?.(path);

    expect(onInsertFile).toHaveBeenCalledWith(path);
    expect(onRemoveFile).toHaveBeenCalledWith(path);
  });

  it("does not insert without an editor", () => {
    const chips = createChipRegistry();

    const inserted = insertDesktopFilePromptChip("/workspace/src/app.ts", {
      editor: undefined,
      chips,
      onInsertFile: vi.fn(),
      onRemoveFile: vi.fn(),
    });

    expect(inserted).toBe(false);
    expect(chips.register).not.toHaveBeenCalled();
  });

  it("prevents the desktop file prompt chip event when inserted", () => {
    const { editor } = createEditor();
    const event = new CustomEvent(DESKTOP_FILE_PROMPT_CHIP_EVENT, {
      cancelable: true,
      detail: { path: "/workspace/src/app.ts" },
    });

    const handled = handleDesktopFilePromptChipEvent(event, {
      editor,
      chips: createChipRegistry(),
      onInsertFile: vi.fn(),
      onRemoveFile: vi.fn(),
      idFactory: () => "chip-1" as never,
    });

    expect(handled).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });

  it("leaves the desktop file prompt chip event unhandled when disabled", () => {
    const { editor } = createEditor();
    const event = new CustomEvent(DESKTOP_FILE_PROMPT_CHIP_EVENT, {
      cancelable: true,
      detail: { path: "/workspace/src/app.ts" },
    });

    const handled = handleDesktopFilePromptChipEvent(event, {
      enabled: false,
      editor,
      chips: createChipRegistry(),
      onInsertFile: vi.fn(),
      onRemoveFile: vi.fn(),
    });

    expect(handled).toBe(false);
    expect(event.defaultPrevented).toBe(false);
  });
});

function createChipRegistry(): DesktopFilePromptChipRegistry {
  return {
    register: vi.fn(),
  } as unknown as DesktopFilePromptChipRegistry;
}

function createEditor(): {
  editor: DesktopFilePromptChipEditor;
  state: {
    schema: {
      nodes: {
        chip: {
          create: ReturnType<typeof vi.fn>;
        };
      };
    };
    selection: {
      from: number;
      to: number;
    };
    tr: {
      replaceRangeWith: ReturnType<typeof vi.fn>;
      insertText: ReturnType<typeof vi.fn>;
    };
  };
  transaction: {
    replaceRangeWith: ReturnType<typeof vi.fn>;
    insertText: ReturnType<typeof vi.fn>;
  };
  dispatch: ReturnType<typeof vi.fn>;
} {
  const transaction = {
    replaceRangeWith: vi.fn(function (_from, _to, _node) {
      return transaction;
    }),
    insertText: vi.fn(function (_text) {
      return transaction;
    }),
  };
  const state = {
    schema: {
      nodes: {
        chip: {
          create: vi.fn((attrs) => ({
            type: "chip",
            attrs,
          })),
        },
      },
    },
    selection: {
      from: 2,
      to: 5,
    },
    tr: transaction,
  };
  const dispatch = vi.fn();
  const editor = {
    executeCommand: vi.fn((command) => {
      command(state as never, dispatch);
    }),
    focus: vi.fn(),
  };

  return { editor, state, transaction, dispatch };
}
