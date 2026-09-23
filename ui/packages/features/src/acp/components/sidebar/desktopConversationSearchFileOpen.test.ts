import { describe, expect, it } from "vitest";
import {
  fileOpenerIdForSelection,
  IN_APP_FILE_OPENER_ID,
  isExternalFileOpenShortcut,
} from "./desktopConversationSearchFileOpen";

describe("desktop conversation search file opening", () => {
  it("always uses the in-app viewer for a normal selection", () => {
    expect(fileOpenerIdForSelection("editor", false)).toBe(IN_APP_FILE_OPENER_ID);
  });

  it("uses the configured opener for Command-Enter", () => {
    expect(
      isExternalFileOpenShortcut({
        key: "Enter",
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
      }),
    ).toBe(true);
    expect(fileOpenerIdForSelection("editor", true)).toBe("editor");
  });

  it("does not treat other modified Enter chords as the external-open shortcut", () => {
    for (const modifiers of [
      { ctrlKey: true, altKey: false, shiftKey: false },
      { ctrlKey: false, altKey: true, shiftKey: false },
      { ctrlKey: false, altKey: false, shiftKey: true },
    ]) {
      expect(
        isExternalFileOpenShortcut({
          key: "Enter",
          metaKey: true,
          ...modifiers,
        }),
      ).toBe(false);
    }
  });
});
