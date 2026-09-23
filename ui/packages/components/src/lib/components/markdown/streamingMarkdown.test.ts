import { describe, expect, it } from "vitest";
import {
  chunkSettledMarkdown,
  estimateSettledMarkdownHeight,
  MAX_MUTABLE_MARKDOWN_CHARS,
  repairStreamingMarkdown,
  segmentStreamingMarkdown,
} from "./streamingMarkdown.js";

describe("chunkSettledMarkdown", () => {
  it("groups complete blocks near the target while preserving the exact source", () => {
    const source = Array.from(
      { length: 8 },
      (_, index) => `## Section ${index}\n\n${String(index).repeat(30)}\n\n`,
    ).join("");
    const chunks = chunkSettledMarkdown(source, 90);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.map((chunk) => chunk.source).join("")).toBe(source);
    expect(chunks.map((chunk) => chunk.key)).toEqual(
      chunks.map((chunk) => `markdown-chunk-${chunk.start}-${chunk.end}`),
    );
  });

  it("never splits inside a fenced code block", () => {
    const fence = `\`\`\`ts\n${"const value = 1;\n".repeat(20)}\`\`\`\n\n`;
    const source = `Intro\n\n${fence}Following\n\nTail`;
    const chunks = chunkSettledMarkdown(source, 40);
    const fenceChunks = chunks.filter((chunk) => chunk.source.includes("const value"));

    expect(fenceChunks).toHaveLength(1);
    expect(fenceChunks[0]?.source).toContain(fence);
  });

  it("keeps reference-definition documents canonical", () => {
    const source = `${"Read [the guide][guide].\n\n".repeat(200)}[guide]: https://example.com`;

    expect(chunkSettledMarkdown(source, 100)).toEqual([
      {
        key: `markdown-chunk-0-${source.length}`,
        start: 0,
        end: source.length,
        source,
      },
    ]);
  });

  it("estimates taller chunks from wrapped and blank lines", () => {
    const [short] = chunkSettledMarkdown("short");
    const [long] = chunkSettledMarkdown(`${"x".repeat(300)}\n\nnext`);

    expect(estimateSettledMarkdownHeight(long!)).toBeGreaterThan(
      estimateSettledMarkdownHeight(short!),
    );
  });
});

describe("segmentStreamingMarkdown", () => {
  it("settles completed top-level blocks and keeps one live tail", () => {
    const segments = segmentStreamingMarkdown(
      "First paragraph.\n\nSecond **styled** paragraph.\n\nThird is streaming",
    );

    expect(segments.map(({ key, source, settled }) => ({ key, source, settled }))).toEqual([
      {
        key: "markdown-segment-0",
        source: "First paragraph.\n\n",
        settled: true,
      },
      {
        key: "markdown-segment-18",
        source: "Second **styled** paragraph.\n\n",
        settled: true,
      },
      {
        key: "markdown-segment-48",
        source: "Third is streaming",
        settled: false,
      },
    ]);
  });

  it("keeps list, quote, fence, and directive continuations in one segment", () => {
    const source = [
      "Intro",
      "",
      "- first",
      "",
      "  continued",
      "",
      "> quote",
      "",
      "```ts",
      "const value = 1;",
      "",
      "still code",
      "```",
      "",
      ":::note",
      "inside",
      "",
      "still inside",
      ":::",
      "",
      "Following paragraph",
    ].join("\n");

    const segments = segmentStreamingMarkdown(source);

    expect(segments).toHaveLength(4);
    expect(segments[0]?.source).toContain("  continued\n\n> quote\n\n");
    expect(segments[1]?.source).toContain("const value = 1;\n\nstill code\n```\n\n");
    expect(segments[2]?.source).toContain("inside\n\nstill inside\n:::\n\n");
    expect(segments[3]?.source).toBe("Following paragraph");
  });

  it("keeps segment keys stable while only the tail grows", () => {
    const first = segmentStreamingMarkdown("Settled.\n\nLive");
    const second = segmentStreamingMarkdown("Settled.\n\nLive tail grows");

    expect(second[0]).toEqual(first[0]);
    expect(second[1]?.key).toBe(first[1]?.key);
    expect(second[1]?.source).toBe("Live tail grows");
  });

  it("does not settle a segment inside a raw HTML container", () => {
    const details = [
      "Intro",
      "",
      "<details>",
      "<summary>More</summary>",
      "",
      "Hidden **Markdown**",
      "</details>",
      "",
      "Following paragraph",
    ].join("\n");

    const segments = segmentStreamingMarkdown(details);

    expect(segments.map(({ source, settled }) => ({ source, settled }))).toEqual([
      { source: "Intro\n\n", settled: true },
      {
        source: "<details>\n<summary>More</summary>\n\nHidden **Markdown**\n</details>\n\n",
        settled: true,
      },
      { source: "Following paragraph", settled: false },
    ]);
  });

  it("keeps multiline HTML comments and raw-text elements intact", () => {
    const source = [
      "<!-- comment",
      "",
      "still commented -->",
      "",
      "<pre>",
      "raw",
      "",
      "still raw",
      "</pre>",
      "",
      "Tail",
    ].join("\n");

    const segments = segmentStreamingMarkdown(source);

    expect(segments).toHaveLength(3);
    expect(segments[0]?.source).toBe("<!-- comment\n\nstill commented -->\n\n");
    expect(segments[1]?.source).toBe("<pre>\nraw\n\nstill raw\n</pre>\n\n");
    expect(segments[2]?.source).toBe("Tail");
  });

  it("uses an append-only renderer for an open fence", () => {
    const [segment] = segmentStreamingMarkdown("```typescript filename.ts\nconst value = 1;");

    expect(segment).toMatchObject({
      renderMode: "code",
      renderSource: "",
      streamingText: "const value = 1;",
      language: "typescript",
      settled: false,
    });
  });

  it("bounds an oversized unresolved Markdown tail with a plain renderer", () => {
    const source = `**unfinished ${"x".repeat(MAX_MUTABLE_MARKDOWN_CHARS)}`;
    const [segment] = segmentStreamingMarkdown(source);

    expect(segment).toMatchObject({
      renderMode: "plain",
      renderSource: "",
      streamingText: source,
      settled: false,
    });
  });

  it("returns a closed large fence to canonical settled Markdown", () => {
    const source = `\`\`\`ts\n${"x".repeat(MAX_MUTABLE_MARKDOWN_CHARS + 1)}\n\`\`\`\n\nTail`;
    const [code, tail] = segmentStreamingMarkdown(source);

    expect(code).toMatchObject({ renderMode: "markdown", settled: true });
    expect(tail).toMatchObject({ renderMode: "markdown", source: "Tail", settled: false });
  });
});

describe("repairStreamingMarkdown", () => {
  it("temporarily closes an open fenced code block", () => {
    expect(repairStreamingMarkdown("```ts\nconst answer = 42;")).toBe(
      "```ts\nconst answer = 42;\n```",
    );
  });

  it("temporarily closes incomplete emphasis and links", () => {
    expect(repairStreamingMarkdown("This is **important")).toBe("This is **important**");
    expect(repairStreamingMarkdown("Read [the docs](https://example.com/docs")).toBe(
      "Read [the docs](https://example.com/docs)",
    );
  });

  it("hides an incomplete image and does not alter open inline code", () => {
    expect(repairStreamingMarkdown("Before\n\n![loading alt")).toBe("Before\n\n");
    expect(repairStreamingMarkdown("Before\n\n![**loading alt")).toBe("Before\n\n");
    expect(repairStreamingMarkdown("Use `const value")).toBe("Use `const value");
  });
});
