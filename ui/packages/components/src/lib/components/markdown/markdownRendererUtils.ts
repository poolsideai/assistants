import type { MarkedExtension } from "marked";
import { closingQuoteFor } from "./filePaths.js";
import type { MarkdownWorkspaceFolder } from "./host.js";
import { toAbsolutePosixPath } from "./paths.js";

export const CHIP_HOST_ATTRS = ["data-file-path", "data-skill", "data-command"] as const;

/** Matches any chip host element (file/skill/command). */
export const CHIP_HOST_SELECTOR = CHIP_HOST_ATTRS.map((attr) => `[${attr}]`).join(", ");

export const SKIP_SELECTOR = `code, pre, .highlightedCode, [data-visualization], ${CHIP_HOST_SELECTOR}`;

export function collectEligibleTextNodes(root: Element): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest(SKIP_SELECTOR)
        ? NodeFilter.FILTER_REJECT
        : NodeFilter.FILTER_ACCEPT,
  });
  const out: Text[] = [];
  let current: Node | null;
  while ((current = walker.nextNode())) {
    out.push(current as Text);
  }
  return out;
}

export function getPossibleFilePaths(
  path: string,
  workspaces: MarkdownWorkspaceFolder[],
): string[] {
  if (workspaces.length === 0) return [path];

  const workspacePath = workspaces[0].path;

  if (path.startsWith("/")) {
    return [path, `${workspacePath}${path}`];
  }

  return [toAbsolutePosixPath(path, workspaces)];
}

export function getMinimalDisplayPath(
  fullPath: string,
  allPaths: string[],
  absolutePath: string,
  workspaces: MarkdownWorkspaceFolder[],
): string {
  const workspacePath = workspaces[0]?.path ?? "";
  const hasWorkspace = workspaces.length > 0;

  let normalizedFullPath = fullPath;
  if (hasWorkspace && absolutePath.startsWith(workspacePath)) {
    normalizedFullPath = absolutePath.substring(workspacePath.length);
    if (normalizedFullPath.startsWith("/")) {
      normalizedFullPath = normalizedFullPath.substring(1);
    }
  }

  const normalizedAllPaths = allPaths.map((path): string => {
    if (hasWorkspace && path.startsWith(workspacePath)) {
      const relative = path.substring(workspacePath.length);
      return relative.startsWith("/") ? relative.substring(1) : relative;
    }
    return path.startsWith("/") ? path.substring(1) : path;
  });
  const parts = normalizedFullPath.split("/").filter((part) => part);

  for (let depth = 1; depth <= parts.length; depth++) {
    const candidatePath = parts.slice(-depth).join("/");

    const matches = normalizedAllPaths.filter((path) => {
      const pathParts = path.split("/").filter((part) => part);
      return pathParts.slice(-depth).join("/") === candidatePath;
    });

    if (matches.length === 1) {
      return candidatePath;
    }
  }

  return normalizedFullPath;
}

export interface FileExistsCache {
  resolve(path: string, workspaces: MarkdownWorkspaceFolder[]): Promise<string | null>;
  clear(): void;
}

export function createFileExistsCache(
  checkFileExists?: (path: string) => Promise<boolean>,
): FileExistsCache {
  const cache = new Map<string, boolean>();

  return {
    async resolve(path, workspaces) {
      if (!checkFileExists) return null;

      const possible = getPossibleFilePaths(path, workspaces);
      for (const candidate of possible) {
        if (cache.has(candidate)) {
          if (cache.get(candidate)) return candidate;
          continue;
        }
        const exists = await checkFileExists(candidate);
        cache.set(candidate, exists);
        if (exists) return candidate;
      }
      return null;
    },
    clear() {
      cache.clear();
    },
  };
}

export const tildeStrikethroughTokenizer: MarkedExtension = {
  tokenizer: {
    del(src) {
      const doubleTildeOnly = /^~~(?=[^\s~])((?:\\.|[^\\])*?(?:\\.|[^\s~\\]))~~(?=[^~]|$)/;
      const cap = doubleTildeOnly.exec(src);
      if (cap) {
        return {
          type: "del",
          raw: cap[0],
          text: cap[1],
          tokens: this.lexer.inlineTokens(cap[1]),
        };
      }
      // Consume a leading single tilde as literal text so the default GFM
      // del tokenizer does not match ~text~ as strikethrough.
      if (src.startsWith("~") && !src.startsWith("~~")) {
        return { type: "text", raw: "~", text: "~" } as unknown as false;
      }
      return false;
    },
  },
};

export function buildSlashTokenRegex(known: ReadonlySet<string>): RegExp {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

export type FilePathMatch = {
  path: string;
  line?: number;
  column?: number;
  pathStartIndex: number;
  matchedTextLength: number;
};

export function parseFilePathMatches(text: string, regex: RegExp): FilePathMatch[] {
  const fresh = new RegExp(regex.source, regex.flags);
  let previousMatchEnd = 0;
  return [...text.matchAll(fresh)].map((match) => {
    const fullMatch = match[0];
    const path = match[1];
    const lineStr = match[2];
    const columnStr = match[3];
    const leadingChar = fullMatch[0] !== path[0] ? fullMatch[0] : "";
    let pathStartIndex = match.index! + leadingChar.length;
    const suffixLength =
      (lineStr !== undefined ? 1 + lineStr.length : 0) +
      (columnStr !== undefined ? 1 + columnStr.length : 0);
    let matchedTextLength = path.length + suffixLength;
    // A path wrapped in a matching quote pair swallows both quotes, so the chip
    // replaces `"path"` wholesale — mirroring how backtick delimiters disappear
    // when a whole code element becomes a chip. The previousMatchEnd guard keeps
    // spans disjoint when adjacent matches would claim the same quote character.
    const closingQuote = closingQuoteFor(leadingChar);
    if (
      closingQuote !== undefined &&
      text[pathStartIndex + matchedTextLength] === closingQuote &&
      pathStartIndex - 1 >= previousMatchEnd
    ) {
      pathStartIndex -= 1;
      matchedTextLength += 2;
    }
    previousMatchEnd = pathStartIndex + matchedTextLength;
    return {
      path,
      line: lineStr !== undefined ? Number(lineStr) : undefined,
      column: columnStr !== undefined ? Number(columnStr) : undefined,
      pathStartIndex,
      matchedTextLength,
    };
  });
}
