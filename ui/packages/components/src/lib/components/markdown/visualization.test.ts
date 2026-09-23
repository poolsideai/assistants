import { Marked } from "marked";
import { describe, expect, it } from "vitest";
import { parseVisualizationReference, visualizationExtension } from "./visualization.js";

describe("visualization references", () => {
  it("accepts the documented shape and the reported unquoted filename", () => {
    expect(
      parseVisualizationReference('{"path":"/tmp/a b.html","title":"Chart","mode":"wide"}'),
    ).toEqual({ path: "/tmp/a b.html", title: "Chart", mode: "wide" });
    expect(parseVisualizationReference('{"path":geneb-multiple-comparisons.html }')).toEqual({
      path: "geneb-multiple-comparisons.html",
    });
    expect(parseVisualizationReference('{"path":"C:\\\\work\\\\chart.html"}')).toEqual({
      path: "C:\\work\\chart.html",
    });
  });

  it.each([
    '{"path":"https://example.com/chart.html"}',
    '{"path":"//example.com/chart.html"}',
    '{"path":"javascript:chart.html"}',
    '{"path":"file:///tmp/chart.html"}',
    '{"path":"/tmp/secret.txt"}',
    '{"path":"/tmp/chart.html\\u0000"}',
    '{"path":42}',
    '{"path":chart.html,"title":foo}',
    "null",
    '{"path":',
  ])("rejects unsupported or malformed input: %s", (payload) => {
    expect(parseVisualizationReference(payload)).toBeUndefined();
  });

  it.each([
    "//server/share/chart.html",
    String.raw`\\server\share\chart.html`,
    String.raw`/\server\share\chart.html`,
    String.raw`\/server/share/chart.html`,
    String.raw`\\?\C:\chart.html`,
    String.raw`\\.\C:\chart.html`,
  ])("rejects network and device paths regardless of separator combination: %s", (path) => {
    expect(parseVisualizationReference(JSON.stringify({ path }))).toBeUndefined();
  });

  it("recognizes standalone references without interpreting code examples", () => {
    const md = new Marked(visualizationExtension(() => "registered-token"));
    const marker = 'visualize{"path":"chart.html"}';
    expect(md.parse(`Before\n${marker}\nAfter`)).toContain("data-visualization=");
    for (const source of [
      `\`${marker}\``,
      `\`\`\`text\n${marker}\n\`\`\``,
      `Example: ${marker}`,
      `    ${marker}`,
    ]) {
      expect(md.parse(source)).not.toContain("data-visualization=");
    }
  });
});
