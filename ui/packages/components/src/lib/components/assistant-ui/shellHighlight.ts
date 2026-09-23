import { memoizedHighlight, resolveHighlightLanguage } from "./codeHighlight.js";

export interface ShellSegment {
  kind: "shell" | "heredoc";
  text: string;
  lang?: string;
}

const HEREDOC_OPENER = /^<<(-?)\s*(?:'([^']*)'|"([^"]*)"|([A-Za-z_][A-Za-z0-9_]*))/;
const REDIRECT_TARGET = /^>{1,2}(?!&)\s*(?:'([^']+)'|"([^"]+)"|([^\s'"<>|;&]+))/;

interface HeredocOpener {
  tag: string;
  strip: boolean;
  // The most recent `>` / `>>` redirect target seen earlier on the same
  // line, used as a language hint when the heredoc tag itself is generic.
  // Each opener gets its own — multiple heredocs on one line do not share.
  precedingRedirect?: string;
}

// Walk the line outside of single/double quotes, scanning for heredoc openers
// and `>` redirects in source order. We don't try to be a full shell
// tokenizer — just enough to avoid mistaking text inside a quoted string (e.g.
// `echo "<<EOF"` or `echo "> file"`) for a real heredoc/redirect.
function scanLine(line: string): HeredocOpener[] {
  const openers: HeredocOpener[] = [];
  let mostRecentRedirect: string | undefined;
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  while (i < line.length) {
    const c = line[i];
    if (inSingle) {
      if (c === "'") inSingle = false;
      i++;
      continue;
    }
    if (inDouble) {
      if (c === "\\" && i + 1 < line.length) {
        i += 2;
        continue;
      }
      if (c === '"') inDouble = false;
      i++;
      continue;
    }
    if (c === "'") {
      inSingle = true;
      i++;
      continue;
    }
    if (c === '"') {
      inDouble = true;
      i++;
      continue;
    }
    // `#` introduces a comment when it sits at the start of a word (start of
    // line or after whitespace). Anything past it is not part of any command.
    if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
      break;
    }
    // Command separators end the current command — a heredoc declared after
    // them must not inherit a redirect target from the previous command.
    if (c === ";" || c === "|" || c === "&") {
      mostRecentRedirect = undefined;
      i++;
      continue;
    }
    if (c === ">") {
      const m = REDIRECT_TARGET.exec(line.slice(i));
      if (m) {
        mostRecentRedirect = m[1] ?? m[2] ?? m[3];
        i += m[0].length;
        continue;
      }
    }
    if (c === "<" && line[i + 1] === "<") {
      const m = HEREDOC_OPENER.exec(line.slice(i));
      if (m) {
        const tag = m[2] ?? m[3] ?? m[4];
        if (tag) {
          openers.push({ tag, strip: m[1] === "-", precedingRedirect: mostRecentRedirect });
          i += m[0].length;
          continue;
        }
      }
    }
    i++;
  }
  return openers;
}

function inferHeredocLanguage(opener: HeredocOpener): string | undefined {
  const tagLanguage = resolveHighlightLanguage(opener.tag);
  if (tagLanguage) return tagLanguage;

  if (opener.precedingRedirect) {
    const lang = detectLanguage(opener.precedingRedirect);
    if (lang) return lang;
  }

  return undefined;
}

function detectLanguage(path: string): string | undefined {
  return resolveHighlightLanguage(path);
}

export function parseShellCommand(cmd: string): ShellSegment[] {
  const lines = cmd.split("\n");
  const segments: ShellSegment[] = [];
  let i = 0;

  const flushShell = (text: string) => {
    if (text === "") return;
    const last = segments[segments.length - 1];
    if (last && last.kind === "shell") {
      last.text += text;
    } else {
      segments.push({ kind: "shell", text });
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trailingNl = i < lines.length - 1 ? "\n" : "";
    const openers = scanLine(line);

    if (openers.length === 0) {
      flushShell(line + trailingNl);
      i++;
      continue;
    }

    flushShell(line + trailingNl);
    i++;

    for (const opener of openers) {
      const bodyLines: string[] = [];
      let closed = false;
      while (i < lines.length) {
        const bodyLine = lines[i];
        const candidate = opener.strip ? bodyLine.replace(/^\t+/, "") : bodyLine;
        if (candidate === opener.tag) {
          closed = true;
          break;
        }
        bodyLines.push(bodyLine);
        i++;
      }

      const bodyText = bodyLines.length > 0 ? bodyLines.join("\n") + "\n" : "";
      const lang = inferHeredocLanguage(opener);
      segments.push({ kind: "heredoc", text: bodyText, lang });

      if (closed && i < lines.length) {
        const closeLine = lines[i] + (i < lines.length - 1 ? "\n" : "");
        flushShell(closeLine);
        i++;
      }
    }
  }

  return segments;
}

export async function highlightShellCommand(cmd: string): Promise<string> {
  return (
    await Promise.all(
      parseShellCommand(cmd).map((segment) =>
        memoizedHighlight(segment.text, segment.kind === "shell" ? "bash" : segment.lang),
      ),
    )
  ).join("");
}
