import { describe, expect, test } from "vitest";
import { outputLogChannelName } from "./vscode.js";

describe("outputLogChannelName", () => {
  test("extracts output channel names from VS Code log files", () => {
    expect(outputLogChannelName("2-poolside Helper.log")).toBe("poolside Helper");
  });

  test("ignores non-log files", () => {
    expect(outputLogChannelName("poolside Helper.txt")).toBeNull();
  });
});
