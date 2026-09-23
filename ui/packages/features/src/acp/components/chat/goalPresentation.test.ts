import { describe, expect, it } from "vitest";
import { GOAL_ICON, slashCommandIcon } from "./goalPresentation";

describe("goal presentation", () => {
  it("uses the goal icon for goal commands and the generic icon otherwise", () => {
    expect(slashCommandIcon("goal")).toBe(GOAL_ICON);
    expect(slashCommandIcon("GOAL")).toBe(GOAL_ICON);
    expect(slashCommandIcon("plan")).toBe("command");
  });
});
