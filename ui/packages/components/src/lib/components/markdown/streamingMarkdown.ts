export interface StreamingMarkdownSegment {
  /** Stable for the lifetime of an append-only stream. */
  key: string;
  /** The exact source belonging to this segment. */
  source: string;
  /** Source prepared for a live Markdown renderer. Settled segments are unchanged. */
  renderSource: string;
  /** Once true, later append-only updates will not change this segment. */
  settled: boolean;
  /** Selects the cheapest safe renderer for the one mutable segment. */
  renderMode: "markdown" | "code" | "plain";
  /** Append-only text for code/plain modes. Empty for ordinary Markdown. */
  streamingText?: string;
  /** Fence info string, when renderMode is code. */
  language?: string;
}

export interface SettledMarkdownChunk {
  /** Stable for a given immutable source. */
  key: string;
  /** UTF-16 offsets into the complete source. */
  start: number;
  end: number;
  /** Exact source for this independently renderable chunk. */
  source: string;
}

type FenceMarker = {
  character: "`" | "~";
  length: number;
};

type OpenFence = FenceMarker & {
  start: number;
  contentStart: number;
  info: string;
};

type MarkdownScan = {
  boundaries: number[];
  openFence: OpenFence | null;
};

type HtmlContainer = {
  tags: string[];
  terminator?: string;
};

const FENCE_LINE = /^ {0,3}(`{3,}|~{3,})(.*)$/;
const DIRECTIVE_OPEN = /^:::[A-Za-z][A-Za-z0-9_-]*(?:\s.*)?$/;
const DIRECTIVE_CLOSE = /^:::\s*$/;
const INCOMPLETE_IMAGE = /(^|\n)[^\S\n]*!\[[^\]\n]*(?:\](?:\([^\)\n]*)?)?\s*$/;
const INCOMPLETE_LINK = /\[[^\]\n]+\]\([^\)\n]+$/;
const HTML_CONTAINER_START = /^ {0,3}<([A-Za-z][A-Za-z0-9-]*)(?=[\s/>])/;
const HTML_TAG = /<\/?([A-Za-z][A-Za-z0-9-]*)(?:\s+(?:"[^"]*"|'[^']*'|[^'">])*)?\s*\/?>/g;
const HTML_VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const HTML_RAW_TEXT_TAGS = new Set(["pre", "script", "style", "textarea"]);

/** Beyond this point unresolved Markdown streams as append-only plain text. */
export const MAX_MUTABLE_MARKDOWN_CHARS = 32 * 1024;
export const MIN_STREAM_RENDER_INTERVAL_MS = 16;
export const MAX_STREAM_RENDER_INTERVAL_MS = 64;
export const MIN_VIRTUALIZED_MARKDOWN_CHARS = 32 * 1024;
export const TARGET_SETTLED_MARKDOWN_CHARS = 4 * 1024;

// Reference definitions can affect links in any other block. Rendering those
// blocks in separate Marked instances would lose that document-wide context,
// so keep such documents canonical rather than changing their meaning.
const REFERENCE_DEFINITION = /^ {0,3}\[[^\]\n]+\]:\s*\S+/m;

/**
 * Split a complete Markdown document into independently renderable chunks.
 * Boundaries come from the same conservative scanner used for streaming, so a
 * chunk never starts inside a fence, directive, raw HTML container, list,
 * quote, or other continuation block.
 */
export function chunkSettledMarkdown(
  source: string,
  targetChars = TARGET_SETTLED_MARKDOWN_CHARS,
): SettledMarkdownChunk[] {
  if (source.length === 0) return [];
  if (REFERENCE_DEFINITION.test(source)) return [settledChunk(source, 0, source.length)];

  const boundaries = [0, ...scanMarkdown(source).boundaries, source.length];
  const chunks: SettledMarkdownChunk[] = [];
  const target = Math.max(1, targetChars);
  let chunkStart = boundaries[0];

  for (let index = 1; index < boundaries.length; index += 1) {
    const blockEnd = boundaries[index];
    const nextBlockEnd = boundaries[index + 1];
    const chunkHasContent = blockEnd > chunkStart;
    const nextBlockWouldExceedTarget =
      nextBlockEnd !== undefined && nextBlockEnd - chunkStart > target;

    if (chunkHasContent && (nextBlockWouldExceedTarget || nextBlockEnd === undefined)) {
      chunks.push(settledChunk(source, chunkStart, blockEnd));
      chunkStart = blockEnd;
    }
  }

  return chunks;
}

/** Stable initial height for an unmounted Markdown chunk. */
export function estimateSettledMarkdownHeight(chunk: SettledMarkdownChunk): number {
  const lines = chunk.source.split("\n");
  let visualLines = 0;
  let blockSpacing = 0;

  for (const line of lines) {
    visualLines += Math.max(1, Math.ceil(line.length / 96));
    if (line.trim().length === 0) blockSpacing += 8;
  }

  return Math.max(80, visualLines * 18 + blockSpacing);
}

function settledChunk(source: string, start: number, end: number): SettledMarkdownChunk {
  return {
    key: `markdown-chunk-${start}-${end}`,
    start,
    end,
    source: source.slice(start, end),
  };
}

/**
 * Split an append-only Markdown stream into immutable block prefixes and one
 * live tail. The boundary scanner is deliberately independent of a Markdown
 * library so consumers can pair it with any renderer.
 */
export function segmentStreamingMarkdown(source: string): StreamingMarkdownSegment[] {
  if (source.length === 0) return [];

  const scan = scanMarkdown(source);
  const { boundaries } = scan;
  const starts = [0, ...boundaries];

  return starts.map((start, index) => {
    const end = starts[index + 1] ?? source.length;
    const segmentSource = source.slice(start, end);
    const settled = end < source.length;
    const openFence = !settled && scan.openFence?.start === start ? scan.openFence : undefined;

    if (openFence) {
      return {
        key: `markdown-segment-${start}`,
        source: segmentSource,
        renderSource: "",
        settled,
        renderMode: "code" as const,
        streamingText: source.slice(openFence.contentStart),
        language: openFence.info.split(/\s+/, 1)[0] || undefined,
      };
    }

    if (!settled && segmentSource.length > MAX_MUTABLE_MARKDOWN_CHARS) {
      return {
        key: `markdown-segment-${start}`,
        source: segmentSource,
        renderSource: "",
        settled,
        renderMode: "plain" as const,
        streamingText: segmentSource,
      };
    }

    return {
      key: `markdown-segment-${start}`,
      source: segmentSource,
      renderSource: settled ? segmentSource : repairStreamingMarkdown(segmentSource),
      settled,
      renderMode: "markdown" as const,
    };
  });
}

/**
 * Make common incomplete streaming constructs render as their styled form.
 * The returned string is display-only; callers retain the original source and
 * should perform a canonical full render when streaming completes.
 */
export function repairStreamingMarkdown(source: string): string {
  const { openFence } = scanMarkdown(source);
  if (openFence) {
    const closingFence = openFence.character.repeat(openFence.length);
    return source.endsWith("\n") ? `${source}${closingFence}` : `${source}\n${closingFence}`;
  }

  const outsideCode = maskCode(source);
  // Do not guess while an inline code span is open. Appending other Markdown
  // delimiters there would change the code the user sees and copies.
  if (outsideCode.unmatchedInlineCode) return source;

  let repaired = source;
  const incompleteImage = INCOMPLETE_IMAGE.exec(outsideCode.text);
  if (incompleteImage?.index !== undefined) {
    repaired = source.slice(0, incompleteImage.index) + (incompleteImage[1] ?? "");
  } else if (INCOMPLETE_LINK.test(outsideCode.text)) {
    repaired += ")";
  }

  const repairedOutsideCode = maskCode(repaired).text;
  repaired = closeUnmatchedDelimiter(repaired, repairedOutsideCode, "**");
  repaired = closeUnmatchedDelimiter(repaired, repairedOutsideCode, "*");
  return repaired;
}

function scanMarkdown(source: string): MarkdownScan {
  const boundaries: number[] = [];
  let openFence: OpenFence | null = null;
  let directiveDepth = 0;
  let htmlContainer: HtmlContainer | null = null;
  let pendingBoundary: number | null = null;
  let lineStart = 0;

  while (lineStart <= source.length) {
    const newline = source.indexOf("\n", lineStart);
    const lineEnd = newline === -1 ? source.length : newline;
    const nextLineStart = newline === -1 ? source.length : newline + 1;
    const line = source.slice(lineStart, lineEnd).replace(/\r$/, "");
    const trimmed = line.trimStart();

    if (pendingBoundary !== null && trimmed.length > 0) {
      if (startsIndependentBlock(line)) boundaries.push(pendingBoundary);
      pendingBoundary = null;
    }

    const fenceMatch = FENCE_LINE.exec(line);
    const wasInFence = openFence !== null;
    if (openFence) {
      if (fenceMatch) {
        const marker = fenceMatch[1];
        const suffix = fenceMatch[2] ?? "";
        if (
          marker[0] === openFence.character &&
          marker.length >= openFence.length &&
          suffix.trim().length === 0
        ) {
          openFence = null;
        }
      }
    } else if (fenceMatch) {
      const marker = fenceMatch[1];
      openFence = {
        character: marker[0] as FenceMarker["character"],
        length: marker.length,
        start: lineStart,
        contentStart: nextLineStart,
        info: (fenceMatch[2] ?? "").trim(),
      };
    } else if (htmlContainer === null && DIRECTIVE_CLOSE.test(trimmed)) {
      directiveDepth = Math.max(0, directiveDepth - 1);
    } else if (htmlContainer === null && DIRECTIVE_OPEN.test(trimmed)) {
      directiveDepth += 1;
    }

    if (!wasInFence && !fenceMatch && directiveDepth === 0) {
      htmlContainer = advanceHtmlContainer(line, htmlContainer);
    }

    if (
      openFence === null &&
      directiveDepth === 0 &&
      htmlContainer === null &&
      trimmed.length === 0 &&
      newline !== -1
    ) {
      // Keep the last blank line in a run with the settled prefix. A boundary
      // is only confirmed once a following independent block actually begins.
      pendingBoundary = nextLineStart;
    }

    if (newline === -1) break;
    lineStart = nextLineStart;
  }

  return { boundaries, openFence };
}

function startsIndependentBlock(line: string): boolean {
  return (
    !/^[\t ]/.test(line) &&
    !/^[-+*][\t ]+/.test(line) &&
    !/^\d+[.)][\t ]+/.test(line) &&
    !line.startsWith(">")
  );
}

/**
 * Track raw HTML that still owns following Markdown source in the browser DOM.
 * CommonMark may end an HTML block at a blank line, but an unmatched container
 * such as `<details>` or `<div>` still spans that line once parsed as HTML. A
 * streaming segment cannot be settled until those tags close because each
 * segment is rendered in a separate DOM tree.
 */
function advanceHtmlContainer(line: string, current: HtmlContainer | null): HtmlContainer | null {
  if (current?.terminator) {
    return line.includes(current.terminator) ? null : current;
  }

  if (!current) {
    const declarationTerminator = htmlDeclarationTerminator(line);
    if (declarationTerminator) {
      return line.includes(declarationTerminator.closeAfter, declarationTerminator.searchFrom)
        ? null
        : { tags: [], terminator: declarationTerminator.closeAfter };
    }
    if (!HTML_CONTAINER_START.test(line)) return null;
  }

  const container: HtmlContainer = current ?? { tags: [] };
  const rawTextTag = container.tags.at(-1);
  if (rawTextTag && HTML_RAW_TEXT_TAGS.has(rawTextTag)) {
    const close = new RegExp(`</${rawTextTag}\\s*>`, "i").exec(line);
    if (!close) return container;
    container.tags.pop();
    applyHtmlTags(line.slice(close.index + close[0].length), container.tags);
  } else {
    applyHtmlTags(line, container.tags);
  }

  return container.tags.length > 0 ? container : null;
}

function applyHtmlTags(line: string, stack: string[]): void {
  for (const match of line.matchAll(HTML_TAG)) {
    const source = match[0];
    const tag = match[1]?.toLowerCase();
    if (!tag) continue;

    if (source.startsWith("</")) {
      const matchingIndex = stack.lastIndexOf(tag);
      if (matchingIndex !== -1) stack.splice(matchingIndex);
      continue;
    }

    if (!source.endsWith("/>") && !HTML_VOID_TAGS.has(tag)) {
      stack.push(tag);
    }
  }
}

function htmlDeclarationTerminator(
  line: string,
): { closeAfter: string; searchFrom: number } | undefined {
  const trimmed = line.replace(/^ {0,3}/, "");
  const declarations: Array<[prefix: string, terminator: string]> = [
    ["<!--", "-->"],
    ["<![CDATA[", "]]>"],
    ["<?", "?>"],
  ];
  for (const [prefix, closeAfter] of declarations) {
    if (trimmed.startsWith(prefix)) {
      return { closeAfter, searchFrom: line.indexOf(prefix) + prefix.length };
    }
  }
  if (/^<![A-Z]/.test(trimmed)) {
    return { closeAfter: ">", searchFrom: line.indexOf("<!") + 2 };
  }
  return undefined;
}

function maskCode(source: string): { text: string; unmatchedInlineCode: boolean } {
  // split("") keeps UTF-16 indices aligned with String#slice and regex match
  // indices; an iterator would collapse surrogate pairs into one entry.
  const masked = source.split("");
  let openFence: FenceMarker | null = null;
  let lineStart = 0;

  while (lineStart <= source.length) {
    const newline = source.indexOf("\n", lineStart);
    const lineEnd = newline === -1 ? source.length : newline;
    const line = source.slice(lineStart, lineEnd).replace(/\r$/, "");
    const fenceMatch = FENCE_LINE.exec(line);
    const wasInFence = openFence !== null;

    if (openFence && fenceMatch) {
      const marker = fenceMatch[1];
      const suffix = fenceMatch[2] ?? "";
      if (
        marker[0] === openFence.character &&
        marker.length >= openFence.length &&
        suffix.trim().length === 0
      ) {
        openFence = null;
      }
    } else if (!openFence && fenceMatch) {
      const marker = fenceMatch[1];
      openFence = {
        character: marker[0] as FenceMarker["character"],
        length: marker.length,
      };
    }

    if (wasInFence || fenceMatch) {
      for (let index = lineStart; index < lineEnd; index += 1) masked[index] = " ";
    }

    if (newline === -1) break;
    lineStart = newline + 1;
  }

  let inlineStart = -1;
  let inlineLength = 0;
  for (let index = 0; index < masked.length; index += 1) {
    if (masked[index] !== "`" || isEscaped(source, index)) continue;
    let end = index + 1;
    while (end < masked.length && masked[end] === "`") end += 1;
    const length = end - index;

    if (inlineStart === -1) {
      inlineStart = index;
      inlineLength = length;
    } else if (length === inlineLength) {
      for (let maskIndex = inlineStart; maskIndex < end; maskIndex += 1) {
        if (masked[maskIndex] !== "\n") masked[maskIndex] = " ";
      }
      inlineStart = -1;
      inlineLength = 0;
    }
    index = end - 1;
  }

  return { text: masked.join(""), unmatchedInlineCode: inlineStart !== -1 };
}

function closeUnmatchedDelimiter(source: string, searchable: string, delimiter: "**" | "*") {
  const positions: number[] = [];
  for (let index = 0; index <= searchable.length - delimiter.length; index += 1) {
    if (!searchable.startsWith(delimiter, index) || isEscaped(searchable, index)) continue;
    if (delimiter === "*" && (searchable[index - 1] === "*" || searchable[index + 1] === "*")) {
      continue;
    }
    positions.push(index);
    index += delimiter.length - 1;
  }

  if (positions.length % 2 === 0) return source;
  const last = positions.at(-1);
  if (last === undefined) return source;
  const suffix = searchable.slice(last + delimiter.length);
  if (suffix.length === 0 || /^\s/.test(suffix) || suffix.includes("\n")) return source;
  return `${source}${delimiter}`;
}

function isEscaped(source: string, index: number): boolean {
  let backslashes = 0;
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === "\\"; cursor -= 1) {
    backslashes += 1;
  }
  return backslashes % 2 === 1;
}
