import { describe, expect, it } from "vitest";
import { extractACPSessionMetadata, normalizeACPSessionMetadata } from "./SessionMetadata";

describe("extractACPSessionMetadata", () => {
  it("displays edited paths inside the project as relative paths", () => {
    const metadata = extractACPSessionMetadata(
      toolEvents([
        {
          eventKind: "tool_call",
          kind: "edit",
          toolCallId: "edit-1",
          title: "Edit",
          rawInput: { path: "/repo/src/app.ts" },
        },
      ]),
      { projectPath: "/repo" },
    );

    expect(metadata.edited).toEqual([{ fileName: "app.ts", filePath: "./src/app.ts" }]);
  });

  it("keeps edited paths outside the project absolute", () => {
    const metadata = extractACPSessionMetadata(
      toolEvents([
        {
          eventKind: "tool_call",
          kind: "edit",
          toolCallId: "edit-1",
          title: "Edit",
          rawInput: { path: "/other/src/app.ts" },
        },
      ]),
      { projectPath: "/repo" },
    );

    expect(metadata.edited).toEqual([{ fileName: "app.ts", filePath: "/other/src/app.ts" }]);
  });
});

function toolEvents(events: Array<{ eventKind: string } & Record<string, unknown>>) {
  return events;
}

describe("normalizeACPSessionMetadata", () => {
  it("keeps a valid sessionConfig", () => {
    const result = normalizeACPSessionMetadata({
      processes: [],
      explored: [],
      edited: [],
      sessionConfig: { selections: { model: "model-b" }, modeId: "plan" },
    });
    expect(result?.sessionConfig).toEqual({ selections: { model: "model-b" }, modeId: "plan" });
  });

  it("drops malformed sessionConfig: non-object results in no sessionConfig key", () => {
    const result = normalizeACPSessionMetadata({
      processes: [],
      explored: [],
      edited: [],
      sessionConfig: "bad",
    });
    expect(result).toBeDefined();
    expect("sessionConfig" in result!).toBe(false);
  });

  it("drops non-string selection values in sessionConfig", () => {
    const result = normalizeACPSessionMetadata({
      processes: [],
      explored: [],
      edited: [],
      sessionConfig: { selections: { model: "model-a", bad: 42 }, modeId: "plan" },
    });
    expect(result?.sessionConfig).toEqual({ selections: { model: "model-a" }, modeId: "plan" });
  });

  it("normalizes bad modeId to null in sessionConfig", () => {
    const result = normalizeACPSessionMetadata({
      processes: [],
      explored: [],
      edited: [],
      sessionConfig: { selections: { model: "model-a" }, modeId: 123 },
    });
    expect(result?.sessionConfig).toEqual({ selections: { model: "model-a" }, modeId: null });
  });
});
