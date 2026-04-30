import codemark from "prosemirror-codemark";
import { InputRule, inputRules } from "prosemirror-inputrules";
import { Fragment, DOMParser as PMDOMParser, Slice, type Schema } from "prosemirror-model";
import { EditorState, Plugin, TextSelection, type Transaction } from "prosemirror-state";
import { tick } from "svelte";
import { detectCodeInText } from "../utils/detectCodeInText.js";
import { htmlToMarkdown } from "../utils/htmlToMarkdown.js";
import { mergeTabularCodeBlocksInHtml } from "../utils/mergeTabularCodeBlocksInHtml.js";
import { preserveInlineCode } from "./preserveInlineCode.js";

/**
 * Check if the given position is inside a code block
 */
function isInsideCodeBlock(state: EditorState, pos: number) {
  const $pos = state.doc.resolve(pos);
  return $pos.parent.type === state.schema.nodes.code_block;
}

/**
 * Check if the given position is inside inline code
 */
function isInsideCodeMark(state: EditorState, pos: number) {
  const $pos = state.doc.resolve(pos);
  const marks = $pos.marks();
  return marks.some((mark) => mark.type === state.schema.marks.code);
}

/**
 * Check if the given position is inside any kind of code (block or inline)
 */
function isInsideCode(state: EditorState, pos: number) {
  return isInsideCodeBlock(state, pos) || isInsideCodeMark(state, pos);
}

/**
 * Handle triple backticks at start of line to create a code block
 */
const codeBlockInputRule = new InputRule(/^\s*```$/, (state, match, start, end) => {
  if (isInsideCode(state, start)) return null;

  const { tr, schema } = state;
  const $start = state.doc.resolve(start);
  const paragraphNodeStart = $start.before($start.depth);
  const paragraphNodeEnd = $start.after($start.depth);
  const textAfterMatch = state.doc.textBetween(end, $start.end($start.depth));

  const codeBlock = schema.nodes.code_block.create(
    null,
    textAfterMatch ? schema.text(textAfterMatch) : null,
  );

  return tr.replaceWith(paragraphNodeStart, paragraphNodeEnd, codeBlock);
});

/**
 * Typing the closing ``` fence inside a code block exits it: the fence line is
 * removed and the cursor moves to a paragraph after the block, mirroring how
 * the opening fence created it. Returns null when the input is not a closing
 * fence.
 */
export function closeCodeBlockFence(
  state: EditorState,
  from: number,
  text: string,
): Transaction | null {
  if (text !== "`") return null;

  const { $from } = state.selection;
  const { schema } = state;
  if ($from.parent.type !== schema.nodes.code_block) return null;

  const blockStart = $from.start();
  const blockEnd = $from.end();
  const blockTextBefore = state.doc.textBetween(blockStart, from);
  const lastNewline = blockTextBefore.lastIndexOf("\n");
  const lineTextBefore = blockTextBefore.slice(lastNewline + 1);
  // Leading whitespace is allowed, matching the opening rule (/^\s*```$/)
  if (!/^\s*``$/.test(lineTextBefore)) return null;

  const fenceLineStart = blockStart + lastNewline + 1;
  const keptText = state.doc.textBetween(
    blockStart,
    lastNewline === -1 ? blockStart : fenceLineStart - 1,
  );
  let afterText = state.doc.textBetween(from, blockEnd);
  // A closing fence must be alone on its line
  if (afterText && !afterText.startsWith("\n")) return null;
  afterText = afterText.slice(1);

  const paragraphs = afterText
    .split("\n")
    .map((line) => schema.nodes.paragraph.create(null, line ? schema.text(line) : null));

  // Closing an otherwise empty block removes it instead of leaving an empty <pre>.
  const nodes = keptText
    ? [schema.nodes.code_block.create(null, schema.text(keptText)), ...paragraphs]
    : paragraphs;

  const tr = state.tr.replaceWith($from.before(), $from.after(), nodes);
  const cursorPos = keptText ? $from.before() + nodes[0].nodeSize + 1 : $from.before() + 1;
  tr.setSelection(TextSelection.near(tr.doc.resolve(cursorPos))).scrollIntoView();
  return tr;
}

interface PasteSegment {
  text: string;
  isCode: boolean;
}

function hasMarkdownConvertibleHtml(html: string): boolean {
  return /<(?:h[1-6]|strong|b|em|i|s|strike|del|a|ul|ol|li|blockquote|pre|code|table|th|td|img|hr|br)\b/i.test(
    html,
  );
}

export function hasPromptChipHtml(html: string): boolean {
  return [...html.matchAll(/\bclass\s*=\s*(["'])(.*?)\1/gi)].some((match) =>
    match[2].split(/\s+/).includes("chip-node"),
  );
}

export function markdownTextToSlice(state: EditorState, markdown: string): Slice {
  const nodes = [];
  const lines = markdown.split("\n");

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const fence = line.match(/^```(.*)$/);

    if (fence) {
      const codeLines = [];
      while (++index < lines.length && !lines[index].startsWith("```")) {
        codeLines.push(lines[index]);
      }
      const text = codeLines.join("\n");
      nodes.push(state.schema.nodes.code_block.create(null, text ? state.schema.text(text) : null));
      continue;
    }

    if (isTableStart(lines, index)) {
      const tableLines = [line];
      while (index + 1 < lines.length && isTableRow(lines[index + 1])) {
        tableLines.push(lines[++index]);
      }
      nodes.push(
        state.schema.nodes.paragraph.create(null, state.schema.text(tableLines.join("\n"))),
      );
      continue;
    }

    if (!line) continue;

    nodes.push(state.schema.nodes.paragraph.create(null, state.schema.text(line)));
  }

  if (nodes[nodes.length - 1]?.type.name === "code_block") {
    nodes.push(state.schema.nodes.paragraph.create());
  }

  return new Slice(Fragment.from(nodes), 0, 0);
}

function isTableStart(lines: string[], index: number): boolean {
  return isTableRow(lines[index]) && isTableDelimiterRow(lines[index + 1]);
}

function isTableRow(line: string | undefined): line is string {
  if (!line) return false;
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 2;
}

function isTableDelimiterRow(line: string | undefined): boolean {
  if (!isTableRow(line)) return false;
  const cells = line
    .trim()
    .slice(1, -1)
    .split("|")
    .map((cell) => cell.trim());
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

/**
 * Split pasted text into blank-line-separated chunks, classify each as code or
 * prose, and merge consecutive same-kind chunks back together. This lets a
 * paste that mixes explanatory prose with code only wrap the code portions in
__POOL_SYNTHETIC_IMPORT_BASELINE__
 */
export function classifyPasteSegments(text: string): PasteSegment[] {
  const chunks = text.split(/\n\s*\n+/);
  const segments: PasteSegment[] = [];
  for (const raw of chunks) {
    const chunk = raw.replace(/^\n+|\n+$/g, "");
    if (!chunk) continue;
    const isCode = detectCodeInText(chunk).isCode;
    const last = segments[segments.length - 1];
    if (last && last.isCode === isCode) {
      last.text += "\n\n" + chunk;
    } else {
      segments.push({ text: chunk, isCode });
    }
  }
  return segments;
}

/**
 * Plugin to handle code block creation and paste behavior
 */
const codePlugin = new Plugin({
  props: {
    handleTextInput: (view, from, to, text) => {
      const { state, dispatch } = view;
      const { tr, selection, schema } = state;
      const { $from } = selection;
      const { nodeBefore, nodeAfter } = $from;

      if (selection.empty) {
        const closeTr = closeCodeBlockFence(state, from, text);
        if (closeTr) {
          dispatch(closeTr);
          return true;
        }
      }

      if (isInsideCode(state, from) || !selection.empty) return false;

      if (nodeBefore?.type.name === "text" && nodeAfter?.type.name === "text") {
        if (nodeBefore.textContent.endsWith("`") && nodeAfter.textContent.startsWith("`")) {
          const beforeBacktickPos = from - 1;

          tr.delete(beforeBacktickPos, from)
            .insertText(text, beforeBacktickPos)
            .delete(beforeBacktickPos + text.length, beforeBacktickPos + text.length + 1)
            .addMark(
              beforeBacktickPos,
              beforeBacktickPos + text.length,
              state.schema.marks.code.create(),
            );

          dispatch(tr);
          return true;
        }
      }

      if (text === "`") {
        const textBefore = state.doc.textBetween($from.start($from.depth), from);

        if (textBefore.endsWith("``")) {
          const lineStart = $from.start($from.depth);
          const lineEnd = $from.end($from.depth);
          const textBeforeBackticks = state.doc.textBetween(lineStart, from - 2);

          // Only handle if not at start of line
          if (textBeforeBackticks.trim() !== "") {
            const textAfterCursor = state.doc.textBetween(from, lineEnd);
            const insertPos = from - 2;
            const codeBlock = schema.nodes.code_block.create(
              null,
              textAfterCursor ? schema.text(textAfterCursor) : null,
            );

            tr.delete(insertPos, lineEnd)
              .insert(insertPos, codeBlock)
              .setSelection(TextSelection.near(tr.doc.resolve(insertPos + 1)));
            dispatch(tr);
            return true;
          }
        }
      }

      return false;
    },

    handlePaste: (view, event) => {
      const html = event.clipboardData?.getData("text/html");
      const text = event.clipboardData?.getData("text/plain");
      const insideCodeBlock = view.state.selection.$from.parent.type.name === "code_block";

      // Some code viewers (notably our HighlightedCode) render each code line as its own
      // <pre><code> inside a <table>. The default paste would turn each <pre> into a separate
      // code_block. Merge those per-line <pre> tags into a single <pre> per table so a pasted
      // code block stays as one code_block.
      if (html && !insideCodeBlock) {
        if (hasPromptChipHtml(html)) return false;

        const merged = mergeTabularCodeBlocksInHtml(html);
        if (merged) {
          const parsedDoc = new window.DOMParser().parseFromString(merged, "text/html");
          const slice = PMDOMParser.fromSchema(view.state.schema).parseSlice(parsedDoc.body);
          view.dispatch(view.state.tr.replaceSelection(slice));
          return true;
        }

        const markdownConvertible = hasMarkdownConvertibleHtml(html);
        if (markdownConvertible) {
          const markdown = htmlToMarkdown(html);
          if (!markdown) return false;
          view.dispatch(view.state.tr.replaceSelection(markdownTextToSlice(view.state, markdown)));
          return true;
        }
      }

      if (!text) return false;

      const { state, dispatch } = view;
      const { selection, schema } = state;
      const { $from, from } = selection;

      // If we're already in a code block, let the default paste behavior handle it
      if ($from.parent.type.name === "code_block") return false;

      // Split into blank-line-separated paragraphs and classify each so a paste
      // that mixes prose and code only wraps the code portions.
      const segments = classifyPasteSegments(text);
      if (!segments.some((s) => s.isCode)) return false;

      const nodes = segments.flatMap((seg) => {
        if (seg.isCode) {
          return [schema.nodes.code_block.create(null, schema.text(seg.text))];
        }
        return seg.text.split("\n").map((line) => {
          return line
            ? schema.nodes.paragraph.create(null, schema.text(line))
            : schema.nodes.paragraph.create();
        });
      });

      // Trailing paragraph so the cursor lands outside any code block
      const trailing = schema.nodes.paragraph.create();
      nodes.push(trailing);

      const fragment = Fragment.from(nodes);
      const slice = new Slice(fragment, 0, 0);
      const tr = state.tr.replaceSelection(slice);

      // Position cursor inside the trailing paragraph
      tr.setSelection(
        TextSelection.near(tr.doc.resolve(from + fragment.size - trailing.nodeSize + 1)),
      );
      dispatch(tr);

      // Scroll to cursor position after paste
      tick().then(() => {
        view.dom.scrollTo({
          top: view.dom.scrollHeight,
          behavior: "smooth",
        });
      });

      return true;
    },
  },
});

export function code(schema: Schema) {
  return [
    // @ts-ignore
    ...codemark({ markType: schema.marks.code }),
    inputRules({ rules: [codeBlockInputRule] }),
    codePlugin,
    preserveInlineCode,
  ];
}
