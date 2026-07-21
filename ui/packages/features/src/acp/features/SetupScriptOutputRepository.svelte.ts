import { createContext } from "svelte";

type NoSetters<T> = { readonly [K in keyof T]: T[K] };

export type AcpSetupScriptOutputStatus = "running" | "completed" | "failed" | "cancelled";
export type AcpSetupScriptOutputSurface = "inline" | "terminal";

export interface AcpSetupScriptOutput {
  path: string;
  command: string;
  output: string;
  outputStartOffset: number;
  status: AcpSetupScriptOutputStatus;
  surface: AcpSetupScriptOutputSurface;
  exitCode?: number;
  collapsed: boolean;
  startedAt: number;
  completedAt?: number;
}

export type AcpSetupScriptOutputRepository = NoSetters<AcpSetupScriptOutputRepositoryWriter>;

const MAX_OUTPUT_LENGTH = 200_000;
const MAX_OUTPUT_ENTRIES = 50;

export class AcpSetupScriptOutputRepositoryWriter {
  private outputsByPath = $state<Record<string, AcpSetupScriptOutput>>({});

  outputFor(path: string): AcpSetupScriptOutput | null {
    return this.outputsByPath[normalizePath(path)] ?? null;
  }

  start(path: string, command: string, options?: { surface?: AcpSetupScriptOutputSurface }): void {
    const normalizedPath = normalizePath(path);
    this.setOutput(normalizedPath, {
      path,
      command,
      output: "",
      outputStartOffset: 0,
      status: "running",
      surface: options?.surface ?? "inline",
      collapsed: false,
      startedAt: Date.now(),
    });
  }

  append(path: string, output: string): void {
    if (!output) return;
    const normalizedPath = normalizePath(path);
    const current = this.outputsByPath[normalizedPath] ?? this.fallbackOutput(path);
    const capped = appendCappedOutput(current.output, current.outputStartOffset, output);
    this.setOutput(normalizedPath, {
      ...current,
      output: capped.output,
      outputStartOffset: capped.outputStartOffset,
    });
  }

  complete(path: string, exitCode?: number): void {
    const normalizedPath = normalizePath(path);
    const current = this.outputsByPath[normalizedPath] ?? this.fallbackOutput(path);
    const capped = capOutput(current.output, current.outputStartOffset);
    this.setOutput(normalizedPath, {
      ...current,
      output: capped.output,
      outputStartOffset: capped.outputStartOffset,
      status: statusForExitCode(exitCode),
      ...(exitCode !== undefined ? { exitCode } : {}),
      completedAt: Date.now(),
    });
  }

  fail(path: string, error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    const normalizedPath = normalizePath(path);
    const current = this.outputsByPath[normalizedPath] ?? this.fallbackOutput(path);
    const capped = capOutput(
      appendLineIfMissing(current.output, message),
      current.outputStartOffset,
    );
    this.setOutput(normalizedPath, {
      ...current,
      output: capped.output,
      outputStartOffset: capped.outputStartOffset,
      status: "failed",
      completedAt: Date.now(),
    });
  }

  collapse(path: string): void {
    this.setCollapsed(path, true);
  }

  toggle(path: string): void {
    const current = this.outputFor(path);
    if (!current) return;
    this.setCollapsed(path, !current.collapsed);
  }

  clear(path: string): void {
    const { [normalizePath(path)]: _removed, ...rest } = this.outputsByPath;
    this.outputsByPath = rest;
  }

  private setCollapsed(path: string, collapsed: boolean): void {
    const normalizedPath = normalizePath(path);
    const current = this.outputsByPath[normalizedPath];
    if (!current || current.collapsed === collapsed) return;
    this.setOutput(normalizedPath, {
      ...current,
      collapsed,
    });
  }

  private setOutput(normalizedPath: string, output: AcpSetupScriptOutput): void {
    const { [normalizedPath]: _existing, ...rest } = this.outputsByPath;
    this.outputsByPath = trimOutputEntries({
      ...rest,
      [normalizedPath]: output,
    });
  }

  private fallbackOutput(path: string): AcpSetupScriptOutput {
    return {
      path,
      command: "",
      output: "",
      outputStartOffset: 0,
      status: "running",
      surface: "inline",
      collapsed: false,
      startedAt: Date.now(),
    };
  }
}

const [getACPSetupScriptOutputContext, setACPSetupScriptOutputRepositoryContext] =
  createContext<AcpSetupScriptOutputRepository>();

export { getACPSetupScriptOutputContext };

export function setACPSetupScriptOutputContext(): AcpSetupScriptOutputRepositoryWriter {
  const repo = new AcpSetupScriptOutputRepositoryWriter();
  setACPSetupScriptOutputRepositoryContext(repo);
  return repo;
}

export { setACPSetupScriptOutputRepositoryContext as _setACPSetupScriptOutputContextForTests };

export function getACPSetupScriptOutputRepo(): AcpSetupScriptOutputRepository {
  return getACPSetupScriptOutputContext();
}

function normalizePath(path: string): string {
  let normalized = path.trim().replace(/\\/g, "/").replace(/\/+/g, "/");
  if (normalized.length > 1) {
    normalized = normalized.replace(/\/+$/g, "");
  }
  if (/^[A-Z]:\//.test(normalized)) {
    normalized = normalized[0].toLowerCase() + normalized.slice(1);
  }
  return normalized;
}

function statusForExitCode(exitCode?: number): AcpSetupScriptOutputStatus {
  if (exitCode === undefined) return "cancelled";
  return exitCode === 0 ? "completed" : "failed";
}

function trimOutputEntries(
  outputsByPath: Record<string, AcpSetupScriptOutput>,
): Record<string, AcpSetupScriptOutput> {
  const entries = Object.entries(outputsByPath);
  if (entries.length <= MAX_OUTPUT_ENTRIES) return outputsByPath;
  return Object.fromEntries(entries.slice(entries.length - MAX_OUTPUT_ENTRIES));
}

function appendCappedOutput(
  output: string,
  outputStartOffset: number,
  appended: string,
): Pick<AcpSetupScriptOutput, "output" | "outputStartOffset"> {
  return capOutput(`${output}${appended}`, outputStartOffset);
}

function capOutput(
  output: string,
  outputStartOffset: number,
): Pick<AcpSetupScriptOutput, "output" | "outputStartOffset"> {
  const trimmedLength = Math.max(0, output.length - MAX_OUTPUT_LENGTH);
  return {
    output: output.slice(trimmedLength),
    outputStartOffset: outputStartOffset + trimmedLength,
  };
}

function appendLineIfMissing(output: string, line: string): string {
  const trimmed = output.trimEnd();
  if (trimmed.endsWith(line)) return output;
  return `${trimmed}${trimmed ? "\n" : ""}${line}\n`;
}
