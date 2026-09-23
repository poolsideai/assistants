import type { MarkdownWorkspaceFolder } from "./host.js";

const NO_CONTEXT_PREFIX = "/path/to/";

declare const navigator: any;
declare const process: { platform?: string };

export function getPathSeparator() {
  if (isWindowsEnv()) {
    return "\\";
  }
  return "/";
}

function isWindowsEnv() {
  if (typeof process !== "undefined" && process.platform) {
    return process.platform === "win32";
  }

  if (typeof navigator !== "undefined") {
    return navigator.userAgent?.includes("Windows") || navigator.platform?.includes("Win");
  }
  return false;
}

export function formatDriveVolume(path: string, transformFn: (str: string) => string): string {
  if (/^[A-Za-z]:/.test(path)) {
    const drivePart = path.substring(0, 2);
    const restOfPath = path.substring(2);
    return transformFn(drivePart) + restOfPath;
  }
  return path;
}

export function toPosixPath(osPath: string): string {
  return formatDriveVolume(osPath, (drive) => drive.toLowerCase())
    .split(getPathSeparator())
    .join("/");
}

export function toAbsolutePosixPath(osPath: string, workspaces: MarkdownWorkspaceFolder[]): string {
  return toAbsolutePath(toPosixPath(osPath), workspaces);
}

function toAbsolutePath(givenPath: string, workspaces: MarkdownWorkspaceFolder[]) {
  if (isPathAbsolute(givenPath) || workspaces.length === 0) {
    return givenPath;
  }

  const workspacePath = toPosixPath(workspaces[0].path);

  if (givenPath.startsWith(NO_CONTEXT_PREFIX)) {
    givenPath = givenPath.replace(/^\/path\/to/, workspacePath);
  }

  if (givenPath.startsWith("/") || givenPath.substring(1, 3) === ":/") {
    return givenPath;
  }

  if (givenPath.startsWith("./")) {
    givenPath = givenPath.substring(2);
  } else if (givenPath === ".") {
    givenPath = "";
  }

  return workspacePath + "/" + givenPath;
}

function isPathAbsolute(givenPath: string): boolean {
  return (
    (givenPath.startsWith("/") && !givenPath.startsWith(NO_CONTEXT_PREFIX)) ||
    givenPath.substring(1, 3) === ":/" ||
    givenPath.substring(1, 3) === ":\\"
  );
}
