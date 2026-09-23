import { serialize } from "./keybinding";

describe("keybinding", () => {
  describe(".serialize", () => {
    it("maps special characters per-platform", () => {
      expect(serialize("mac", "cmd+shift+a")).toEqual("⌘ ⇧ A");
      expect(serialize("linux", "ctrl+shift+a")).toEqual("Ctrl Shift A");
      expect(serialize("win", "ctrl+shift+a")).toEqual("Ctrl Shift A");
    });

    it("handles chords", () => {
      expect(serialize("mac", "cmd+shift+a b")).toEqual("⌘ ⇧ A, B");
    });
  });
});
