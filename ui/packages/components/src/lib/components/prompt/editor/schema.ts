import {
  defaultMarkdownParser,
  defaultMarkdownSerializer,
  MarkdownParser,
  MarkdownSerializer,
} from "prosemirror-markdown";
import type { Node, SchemaSpec } from "prosemirror-model";
import { Schema } from "prosemirror-model";
import { chipNode } from "./chip/chipNode.js";

// Zero-width space used to mark empty paragraphs so blank lines authored by
// the user survive markdown round-tripping (default prosemirror-markdown and
// marked both collapse runs of blank lines).
const BLANK_PARAGRAPH_MARKER = "​";

const spec = {
  nodes: {
    doc: {
      content: "block+",
    },
    paragraph: {
      group: "block",
      content: "inline*",
      parseDOM: [{ tag: "p" }],
      toDOM: () => ["p", 0],
    },
    code_block: {
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
      toDOM: () => ["pre", { class: "whitespace-pre" }, ["code", 0]],
    },
    text: {
      group: "inline",
    },
    chip: chipNode,
  },
  marks: {
    code: {
      code: true,
      parseDOM: [{ tag: "code" }],
      toDOM: () => ["code", 0],
    },
  },
} satisfies SchemaSpec;

export const schema = new Schema(spec);

const baseMarkdownParser = new MarkdownParser(schema, defaultMarkdownParser.tokenizer, {
  paragraph: { block: "paragraph" },
  code_block: { block: "code_block", noCloseToken: true },
  fence: {
    block: "code_block",
    getAttrs: (tok) => ({ params: tok.info || "" }),
    noCloseToken: true,
  },
  code_inline: { mark: "code", noCloseToken: true },
});

const baseMarkdownSerializer = new MarkdownSerializer(
  {
    ...defaultMarkdownSerializer.nodes,
    paragraph: (state, node) => {
      if (node.content.size === 0) {
        state.write(BLANK_PARAGRAPH_MARKER);
      } else {
        state.renderInline(node);
      }
      state.closeBlock(node);
    },
    chip: (state, node) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
    text: (state, node) => {
      state.text(node.textContent, false);
    },
  },
  defaultMarkdownSerializer.marks,
);

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
