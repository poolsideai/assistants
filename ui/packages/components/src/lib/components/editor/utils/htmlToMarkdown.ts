const blockTags = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DIV",
  "DL",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "TABLE",
  "UL",
]);

const ignoredTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "META", "LINK"]);
const hardBreakSentinel = "\uE000";

export function htmlToMarkdown(html: string): string {
  const doc = new window.DOMParser().parseFromString(html, "text/html");
  const blocks = childBlocks(doc.body);
  return normalizeMarkdown(blocks.join("\n\n"));
}

function childBlocks(parent: Node): string[] {
  const blocks: string[] = [];
  let inlineRun = "";

  const flushInline = () => {
    const trimmed = normalizeInlineWhitespace(inlineRun).trim();
    if (trimmed) blocks.push(trimmed);
    inlineRun = "";
  };

  for (const child of parent.childNodes) {
    if (child instanceof HTMLElement && blockTags.has(child.tagName)) {
      flushInline();
      const block = blockMarkdown(child);
      if (block) blocks.push(block);
    } else {
      inlineRun += inlineMarkdown(child);
    }
  }

  flushInline();
  return blocks;
}

function blockMarkdown(element: HTMLElement): string {
  if (ignoredTags.has(element.tagName)) return "";

  switch (element.tagName) {
    case "H1":
    case "H2":
    case "H3":
    case "H4":
    case "H5":
    case "H6": {
      const level = Number(element.tagName.slice(1));
      return `${"#".repeat(level)} ${inlineChildren(element)}`.trim();
    }
    case "P":
      return inlineChildren(element);
    case "DIV":
    case "SECTION":
    case "ARTICLE":
    case "MAIN":
    case "HEADER":
    case "FOOTER":
    case "ASIDE":
    case "NAV":
    case "FIGURE":
    case "FIGCAPTION":
    case "FORM":
    case "FIELDSET":
    case "ADDRESS": {
      const nested = childBlocks(element);
      return nested.length > 0 ? nested.join("\n\n") : inlineChildren(element);
    }
    case "BLOCKQUOTE":
      return prefixLines(childBlocks(element).join("\n\n") || inlineChildren(element), "> ");
    case "PRE":
      return codeBlockMarkdown(element);
    case "UL":
      return listMarkdown(element, false, 0);
    case "OL":
      return listMarkdown(element, true, 0);
    case "LI":
      return listItemMarkdown(element, false, 1, 0);
    case "TABLE":
      return tableMarkdown(element);
    case "HR":
      return "---";
    default:
      return inlineChildren(element);
  }
}

function inlineMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeMarkdownText(node.textContent ?? "");
  }
  if (!(node instanceof HTMLElement) || ignoredTags.has(node.tagName)) return "";

  switch (node.tagName) {
    case "BR":
      return hardBreakSentinel;
    case "STRONG":
    case "B":
      return wrapInline("**", inlineChildren(node));
    case "EM":
    case "I":
      return wrapInline("*", inlineChildren(node));
    case "S":
    case "STRIKE":
    case "DEL":
      return wrapInline("~~", inlineChildren(node));
    case "CODE":
      return inlineCode(node.textContent ?? "");
    case "A": {
      const label = inlineChildren(node) || escapeMarkdownText(node.getAttribute("href") ?? "");
      const href = safeUrl(node.getAttribute("href"));
      return href ? `[${label}](${href})` : label;
    }
    case "IMG": {
      const alt = escapeMarkdownText(node.getAttribute("alt") ?? "");
      const src = safeUrl(node.getAttribute("src"));
      return src ? `![${alt}](${src})` : alt;
    }
    default:
      if (blockTags.has(node.tagName)) return blockMarkdown(node);
      return inlineChildren(node, { trim: false });
  }
}

function inlineChildren(parent: Node, { trim = true }: { trim?: boolean } = {}): string {
  let markdown = "";
  for (const child of parent.childNodes) {
    markdown += inlineMarkdown(child);
  }
  const normalized = normalizeInlineWhitespace(markdown);
  return trim ? normalized.trim() : normalized;
}

function listMarkdown(list: HTMLElement, ordered: boolean, depth: number): string {
  const items = [...list.children].filter((child): child is HTMLElement => child.tagName === "LI");
  return items
    .map((item, index) => listItemMarkdown(item, ordered, index + 1, depth))
    .filter(Boolean)
    .join("\n");
}

function listItemMarkdown(
  item: HTMLElement,
  ordered: boolean,
  index: number,
  depth: number,
): string {
  const marker = ordered ? `${index}. ` : "- ";
  const indent = "  ".repeat(depth);
  const blocks: string[] = [];
  let inlineRun = "";

  for (const child of item.childNodes) {
    if (
      child instanceof HTMLElement &&
      (child.tagName === "UL" || child.tagName === "OL" || blockTags.has(child.tagName))
    ) {
      const inline = normalizeInlineWhitespace(inlineRun).trim();
      if (inline) blocks.push(inline);
      inlineRun = "";

      if (child.tagName === "UL" || child.tagName === "OL") {
        blocks.push(listMarkdown(child, child.tagName === "OL", depth + 1));
      } else {
        const block = blockMarkdown(child);
        if (block) blocks.push(block);
      }
    } else {
      inlineRun += inlineMarkdown(child);
    }
  }

  const inline = normalizeInlineWhitespace(inlineRun).trim();
  if (inline) blocks.push(inline);
  if (blocks.length === 0) return "";

  const [first, ...rest] = blocks;
  const continuationIndent = " ".repeat(indent.length + marker.length);
  const continuation = rest.map((block) => prefixLines(block, continuationIndent)).join("\n");
  return `${indent}${marker}${first}${continuation ? `\n${continuation}` : ""}`;
}

function codeBlockMarkdown(element: HTMLElement): string {
  const code = element.querySelector("code");
  const language =
    code?.className
      .split(/\s+/)
      .find((name) => name.startsWith("language-"))
      ?.replace(/^language-/, "") ?? "";
  const text = (code ?? element).textContent?.replace(/^\n+|\n+$/g, "") ?? "";
  return `\`\`\`${language}\n${text}\n\`\`\``;
}

function tableMarkdown(table: HTMLElement): string {
  const rows = [...table.querySelectorAll("tr")]
    .map((row) =>
      [...row.children]
        .filter((cell) => cell.tagName === "TH" || cell.tagName === "TD")
        .map((cell) => tableCellMarkdown(cell)),
    )
    .filter((cells) => cells.length > 0);

  if (rows.length === 0) return "";

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizedRows = rows.map((row) => [
    ...row,
    ...Array.from({ length: columnCount - row.length }, () => ""),
  ]);
  const [header, ...body] = normalizedRows;
  const separator = Array.from({ length: columnCount }, () => "---");
  return [header, separator, ...body].map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function tableCellMarkdown(cell: Element): string {
  return inlineChildren(cell).replace(/\|/g, "\\|").replace(/\n+/g, " ");
}

function inlineCode(text: string): string {
  const ticks = text.match(/`+/g)?.reduce((max, run) => Math.max(max, run.length), 0) ?? 0;
  const fence = "`".repeat(ticks + 1);
  const padding = text.startsWith(" ") || text.endsWith(" ") ? " " : "";
  return `${fence}${padding}${text}${padding}${fence}`;
}

function wrapInline(marker: string, content: string): string {
  return content ? `${marker}${content}${marker}` : "";
}

function prefixLines(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function escapeMarkdownText(text: string): string {
  return text.replace(/([\\`*_\[\]])/g, "\\$1");
}

function normalizeInlineWhitespace(text: string): string {
  return normalizeOutsideCodeSpans(text, normalizeInlineText);
}

function normalizeMarkdown(markdown: string): string {
  const blocks: string[] = [];
  const lines = markdown.split("\n");
  let proseRun: string[] = [];

  const flushProse = () => {
    if (proseRun.length === 0) return;
    blocks.push(normalizeMarkdownText(proseRun.join("\n")));
    proseRun = [];
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.startsWith("```")) {
      proseRun.push(line);
      continue;
    }

    flushProse();
    const codeLines = [line];
    while (++index < lines.length) {
      codeLines.push(lines[index]);
      if (lines[index].startsWith("```")) break;
    }
    blocks.push(codeLines.join("\n"));
  }

  flushProse();
  return blocks.join("\n").trim();
}

function normalizeMarkdownText(markdown: string): string {
  return markdown.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n");
}

function normalizeInlineText(text: string): string {
  return text
    .replace(/[ \t\r\n\u00a0]+/g, " ")
    .replace(new RegExp(` ?${hardBreakSentinel} ?`, "g"), "\n");
}

function normalizeOutsideCodeSpans(text: string, normalize: (value: string) => string): string {
  let normalized = "";
  let lastIndex = 0;
  const codeSpanPattern = /(`+)([\s\S]*?)\1/g;
  for (const match of text.matchAll(codeSpanPattern)) {
    normalized += normalize(text.slice(lastIndex, match.index));
    normalized += match[0];
    lastIndex = match.index + match[0].length;
  }
  normalized += normalize(text.slice(lastIndex));
  return normalized;
}

function safeUrl(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || /^data:/i.test(trimmed) || /^javascript:/i.test(trimmed)) return null;
  return trimmed.replace(/\s/g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
}
