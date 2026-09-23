import { describe, expect, it } from "vitest";
import { isMermaidCode } from "./mermaidCode.js";

describe("isMermaidCode", () => {
  it.each([undefined, "", "auto", "flowchart", "mermaid", "MERMAID"])(
    "recognizes a flowchart with language %s",
    (lang) => expect(isMermaidCode("flowchart TD\nA --> B", lang)).toBe(true),
  );

  it("recognizes graph syntax and leading comments", () => {
    expect(isMermaidCode("\n%% comment\n graph LR; A --> B")).toBe(true);
  });

  it("leaves explicitly typed source and ordinary prose alone", () => {
    expect(isMermaidCode("flowchart TD\nA --> B", "text")).toBe(false);
    expect(isMermaidCode("flowchart TD\nA --> B", "python")).toBe(false);
    expect(isMermaidCode("flowchart examples")).toBe(false);
    expect(isMermaidCode("graph LRsomething")).toBe(false);
    expect(isMermaidCode("const flowchart = 'TD';")).toBe(false);
  });

  it("allows other diagram types in a mermaid fence", () => {
    expect(isMermaidCode("sequenceDiagram\nAlice->>Bob: Hello", "mermaid")).toBe(true);
  });
});
