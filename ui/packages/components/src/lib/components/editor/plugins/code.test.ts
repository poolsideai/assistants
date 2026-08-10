__POOL_SYNTHETIC_IMPORT_BASELINE__
import { markdownSerializer, schema } from "../../prompt/editor/schema.js";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

function docFromMarkdownSlice(markdown: string) {
  const state = EditorState.create({ schema });
  const slice = markdownTextToSlice(state, markdown);
  return schema.nodes.doc.create(null, slice.content);
}

describe("classifyPasteSegments", () => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    const segments = classifyPasteSegments(
      `Here is some background context for the task:

const result = await fetchData(url);
console.log(result.status);

The function returns a promise. Use it like this:

if (result.status === 200) {
  processData(result.data);
}

Make sure to handle errors properly.`,
    );

    expect(segments).toEqual([
      { text: "Here is some background context for the task:", isCode: false },
      {
        text: "const result = await fetchData(url);\nconsole.log(result.status);",
        isCode: true,
      },
      { text: "The function returns a promise. Use it like this:", isCode: false },
      { text: "if (result.status === 200) {\n  processData(result.data);\n}", isCode: true },
      { text: "Make sure to handle errors properly.", isCode: false },
    ]);
  });

  it("merges consecutive code chunks back into one segment", () => {
    const segments = classifyPasteSegments(
      `function processData(input) {
  return input.split(",");
}

const result = processData("a, b, c");
console.log(result);`,
    );

    expect(segments).toHaveLength(1);
    expect(segments[0].isCode).toBe(true);
    expect(segments[0].text).toContain("function processData");
    expect(segments[0].text).toContain("console.log(result);");
  });

  it("returns no code segments for pure prose so the default paste runs", () => {
    const segments = classifyPasteSegments(
      `This is a regular paragraph of text.

This is a second paragraph with no code at all.`,
    );

    expect(segments.some((s) => s.isCode)).toBe(false);
  });
});

describe("hasPromptChipHtml", () => {
  it("matches actual Poolside chip HTML by class", () => {
    expect(hasPromptChipHtml('<span class="chip-node" data-clipboard="`file.ts`"></span>')).toBe(
      true,
    );
    expect(hasPromptChipHtml('<span class="foo chip-node bar"></span>')).toBe(true);
  });

  it("does not match ordinary GitHub copied code text mentioning chip-node", () => {
    expect(
      hasPromptChipHtml(
        '<p>Adds a <code class="notranslate">chip-node</code> guard so copied chips fall back.</p>',
      ),
    ).toBe(false);
  });
});

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
describe("markdownTextToSlice", () => {
  it("keeps GFM table rows contiguous when serialized", () => {
    const markdown = [
      "Before",
      "",
      "| Name | Status |",
      "| --- | --- |",
      "| Paste | Supported |",
      "| Tables | Preserved |",
      "",
      "After",
    ].join("\n");

    expect(markdownSerializer.serialize(docFromMarkdownSlice(markdown))).toBe(markdown);
  });

  it("keeps single-column GFM table rows contiguous when serialized", () => {
    const markdown = ["| Name |", "| --- |", "| Paste |"].join("\n");

    expect(markdownSerializer.serialize(docFromMarkdownSlice(markdown))).toBe(markdown);
  });

  it("adds a trailing paragraph after a final fenced code block", () => {
    const doc = docFromMarkdownSlice(["```ts", "const value = 1;", "```"].join("\n"));
    const lastChild = doc.child(doc.childCount - 1);

    expect(lastChild.type.name).toBe("paragraph");
    expect(lastChild.content.size).toBe(0);
    expect(markdownSerializer.serialize(doc)).toBe(["```", "const value = 1;", "```"].join("\n"));
  });
});
