__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
import type { Node, SchemaSpec } from "prosemirror-model";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
// Zero-width space used to mark empty paragraphs so blank lines authored by
// the user survive markdown round-tripping (default prosemirror-markdown and
// marked both collapse runs of blank lines).
const BLANK_PARAGRAPH_MARKER = "​";

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
const baseMarkdownParser = new MarkdownParser(schema, defaultMarkdownParser.tokenizer, {
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
const baseMarkdownSerializer = new MarkdownSerializer(
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    paragraph: (state, node) => {
      if (node.content.size === 0) {
        state.write(BLANK_PARAGRAPH_MARKER);
      } else {
        state.renderInline(node);
      }
      state.closeBlock(node);
    },
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

const isBlankParagraph = (node: Node) => node.type.name === "paragraph" && node.content.size === 0;

function trimLeadingAndTrailingBlankParagraphs(doc: Node): Node {
  const children: Node[] = [];
  doc.forEach((child) => children.push(child));
  while (children.length > 0 && isBlankParagraph(children[0])) children.shift();
  while (children.length > 0 && isBlankParagraph(children[children.length - 1])) children.pop();
  return doc.type.create(doc.attrs, children, doc.marks);
}

function stripBlankParagraphMarkers(doc: Node): Node {
  const children: Node[] = [];
  doc.forEach((child) => {
    if (child.type.name !== "paragraph") {
      children.push(child);
      return;
    }
    const inline: Node[] = [];
    child.forEach((grandchild) => {
      if (grandchild.isText) {
        const stripped = grandchild.text!.replaceAll(BLANK_PARAGRAPH_MARKER, "");
        if (stripped.length > 0) {
          inline.push(schema.text(stripped, grandchild.marks));
        }
      } else {
        inline.push(grandchild);
      }
    });
    children.push(child.type.create(child.attrs, inline, child.marks));
  });
  return doc.type.create(doc.attrs, children, doc.marks);
}

export const markdownParser = {
  parse: (text: string) => stripBlankParagraphMarkers(baseMarkdownParser.parse(text)),
};

export const markdownSerializer = {
  serialize: (doc: Node) =>
    baseMarkdownSerializer.serialize(trimLeadingAndTrailingBlankParagraphs(doc)),
};
