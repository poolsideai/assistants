import type { SessionUpdate } from "@agentclientprotocol/sdk";

type ToolCallUpdate = SessionUpdate & { sessionUpdate: "tool_call" };

type ParsedShellToolCall = Pick<ToolCallUpdate, "kind" | "locations" | "title">;

const SHELL_TOOL_TITLES = new Set(["exec_command", "shell", "container.exec", "shell_command"]);

export function applyShellToolOverride(update: ToolCallUpdate): ToolCallUpdate {
  if (!isShellToolCall(update)) return update;

  const parsed = parseShellToolCall(update.rawInput);
  if (!parsed) return update;

  return {
    ...update,
    ...parsed,
  };
}

function isShellToolCall(update: ToolCallUpdate): boolean {
  const title = update.title?.toLowerCase();
  if (title && SHELL_TOOL_TITLES.has(title)) return true;

  if (update.kind !== "execute" && update.kind !== "other") return false;

  const rawInput = asRecord(update.rawInput);
  if (!rawInput) return false;

  return rawInput.command != null || rawInput.cmd != null || rawInput.parsed_cmd != null;
}

function parseShellToolCall(rawInput: unknown): ParsedShellToolCall | undefined {
  const parsedCommand = parseSerializedParsedCommand(rawInput);
  if (parsedCommand) return parsedCommand;

  const command = getShellCommand(rawInput);
  if (!command) return;

  const commands = splitCommandList(command);
  const parsedCommands = commands
    .map(parseSimpleCommand)
    .filter((cmd): cmd is ParsedShellToolCall => !!cmd);
  if (parsedCommands.length === 0 || parsedCommands.length !== commands.length) return;

  return {
    kind: parsedCommands.some((cmd) => cmd.kind === "search") ? "search" : "read",
    title: parsedCommands.map((cmd) => cmd.title).join(", "),
    locations: parsedCommands.flatMap((cmd) => cmd.locations ?? []),
  };
}

function parseSerializedParsedCommand(rawInput: unknown): ParsedShellToolCall | undefined {
  const raw = asRecord(rawInput);
  const parsedCommands = raw?.parsed_cmd;
  if (!Array.isArray(parsedCommands)) return;

  const parsed = parsedCommands
    .map(parseSerializedParsedCommandItem)
    .filter((cmd): cmd is ParsedShellToolCall => !!cmd);
  if (parsed.length === 0 || parsed.length !== parsedCommands.length) return;

  return {
    kind: parsed.some((cmd) => cmd.kind === "search") ? "search" : "read",
    title: parsed.map((cmd) => cmd.title).join(", "),
    locations: parsed.flatMap((cmd) => cmd.locations ?? []),
  };
}

function parseSerializedParsedCommandItem(item: unknown): ParsedShellToolCall | undefined {
  const record = asRecord(item);
  if (!record) return;

  const read = asRecord(record.Read ?? record.read);
  if (read) {
    const name = asString(read.name) ?? asString(read.path) ?? asString(read.cmd);
    const path = asString(read.path);
    if (!name) return;
    return { kind: "read", title: `Read ${name}`, locations: path ? [{ path }] : undefined };
  }

  const listFiles = asRecord(record.ListFiles ?? record.list_files ?? record.listFiles);
  if (listFiles) {
    const path = asString(listFiles.path) ?? ".";
    return { kind: "search", title: `List ${path}`, locations: [{ path }] };
  }

  const search = asRecord(record.Search ?? record.search);
  if (search) {
    const cmd = asString(search.cmd);
    const query = asString(search.query);
    const path = asString(search.path);
    if (query && path) return { kind: "search", title: `Search ${query} in ${path}` };
    if (query) return { kind: "search", title: `Search ${query}` };
    if (cmd) return { kind: "search", title: `Search ${cmd}` };
  }
}

function getShellCommand(rawInput: unknown): string | undefined {
  if (typeof rawInput === "string" && rawInput.length > 0) return rawInput;

  const raw = asRecord(rawInput);
  const command = raw?.command ?? raw?.cmd;
  if (typeof command === "string" && command.length > 0) return command;

  if (Array.isArray(command) && command.every((part): part is string => typeof part === "string")) {
    const shellCommand = getCommandFromShellArgv(command);
    if (shellCommand) return shellCommand;
    return command.length > 0 ? shellJoin(command) : undefined;
  }
}

function getCommandFromShellArgv(argv: string[]): string | undefined {
  const shellFlagIndex = argv.findIndex((part) => part === "-c" || part === "-lc");
  if (shellFlagIndex >= 0) return argv[shellFlagIndex + 1];
}

function parseSimpleCommand(command: string): ParsedShellToolCall | undefined {
  const argv = shellSplit(command);
  if (argv.length === 0) return;

  const cmd = stripCommandPath(argv[0]);
  switch (cmd) {
    case "sed":
      return parseSedCommand(argv);
    case "rg":
    case "ripgrep":
      return parseRipgrepCommand(argv, cmd);
    case "find":
      return parseFindCommand(argv);
  }
}

function parseSedCommand(argv: string[]): ParsedShellToolCall | undefined {
  const paths = argv.slice(1).filter((arg) => !arg.startsWith("-") && !looksLikeSedProgram(arg));
  const path = paths.at(-1);
  if (!path) return;

  return {
    kind: "read",
    title: `Read ${pathBaseName(path)}`,
    locations: [{ path }],
  };
}

function parseRipgrepCommand(argv: string[], cmd: string): ParsedShellToolCall | undefined {
  let query: string | undefined;
  let path: string | undefined;
  let skipNext = false;

  for (const arg of argv.slice(1)) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (arg === "--") continue;
    if (arg.startsWith("--")) {
      if (!arg.includes("=") && optionUsuallyTakesValue(arg)) skipNext = true;
      continue;
    }
    if (arg.startsWith("-") && arg !== "-") continue;

    if (!query) {
      query = arg;
    } else if (!path) {
      path = arg;
    }
  }

  return {
    kind: "search",
    title: query ? `Search ${query}${path ? ` in ${path}` : ""}` : `Search ${cmd}`,
  };
}

function parseFindCommand(argv: string[]): ParsedShellToolCall | undefined {
  const path = argv.find(
    (arg, index) => index > 0 && !arg.startsWith("-") && !isFindExpression(arg),
  );
  return {
    kind: "search",
    title: `List ${path ?? "."}`,
    locations: [{ path: path ?? "." }],
  };
}

function splitCommandList(command: string): string[] {
  const parts: string[] = [];
  let current = "";
  let quote: "'" | '"' | undefined;
  let escaped = false;

  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    const next = command[i + 1];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\") {
      current += char;
      escaped = true;
      continue;
    }
    if ((char === "'" || char === '"') && !quote) {
      quote = char;
      current += char;
      continue;
    }
    if (char === quote) {
      quote = undefined;
      current += char;
      continue;
    }
    if (
      !quote &&
      ((char === "&" && next === "&") || (char === "|" && next === "|") || char === ";")
    ) {
      if (current.trim()) parts.push(current.trim());
      current = "";
      if (char !== ";") i++;
      continue;
    }
    current += char;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function shellSplit(command: string): string[] {
  const argv: string[] = [];
  let current = "";
  let quote: "'" | '"' | undefined;
  let escaped = false;

  for (const char of command) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }
    if (char === "\\" && quote !== "'") {
      escaped = true;
      continue;
    }
    if ((char === "'" || char === '"') && !quote) {
      quote = char;
      continue;
    }
    if (char === quote) {
      quote = undefined;
      continue;
    }
    if (!quote && /\s/.test(char)) {
      if (current) {
        argv.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }

  if (current) argv.push(current);
  return argv;
}

function shellJoin(argv: string[]): string {
  return argv
    .map((part) =>
      /^[A-Za-z0-9_./:=@%+-]+$/.test(part) ? part : `'${part.replaceAll("'", "'\\''")}'`,
    )
    .join(" ");
}

function stripCommandPath(command: string): string {
  return command.split("/").at(-1) ?? command;
}

function pathBaseName(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

function looksLikeSedProgram(arg: string): boolean {
  return /^\d*,?\d*p$/.test(arg) || /^s(.).*\1.*\1/.test(arg);
}

function optionUsuallyTakesValue(arg: string): boolean {
  return new Set([
    "--glob",
    "--iglob",
    "--type",
    "--type-not",
    "--context",
    "--after-context",
    "--before-context",
    "--max-count",
    "--max-depth",
    "--sort",
    "--sortr",
    "--threads",
  ]).has(arg);
}

function isFindExpression(arg: string): boolean {
  return arg.startsWith("(") || arg.endsWith(")") || arg === "!" || arg === "-o";
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
