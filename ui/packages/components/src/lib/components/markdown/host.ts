import { readable, type Readable } from "svelte/store";
import type { IconName } from "../icon/index.js";

export interface MarkdownCapabilities {
  customUI?: boolean;
  hostClipboardWrite?: boolean;
  runTerminalCommands?: boolean;
}

export interface MarkdownWorkspaceFolder {
  path: string;
}

export interface MarkdownHostState {
  userSettings: {
    showMermaidDiagrams?: boolean;
    wrapLines?: boolean;
  };
  environment: {
    assistantHost?: string;
    capabilities?: MarkdownCapabilities;
  };
  workspaces: MarkdownWorkspaceFolder[];
  isAgenticMode?: boolean;
}

export type MarkdownAction = (
  node: HTMLElement,
  parameter?: any,
) => void | { update?: (parameter?: any) => void; destroy?: () => void };

export interface MarkdownHostAdapter {
  state: Readable<MarkdownHostState>;
  checkFileExists?: (path: string) => Promise<boolean>;
  openFile?: (
    path: string,
    line?: number,
    column?: number,
    options?: { preferredEditor?: boolean },
  ) => void | Promise<void>;
  showFileContextMenu?: (options: {
    path: string;
    line?: number;
    column?: number;
    position: { x: number; y: number };
  }) => void | Promise<void>;
  openImageFile?: (svgContent: string, filename?: string) => void | Promise<void>;
  getImageFileData?: (path: string) => Promise<ImageFileData | undefined>;
  /** Opt in only after verifying native bridge isolation and bounded local reads. */
  readVisualizationFile?: (path: string) => Promise<string | undefined>;
  openTerminal?: (command: string) => void | Promise<void>;
  writeToClipboard?: (text: string) => void | Promise<void>;
  onCopyError?: (error: Error) => void | Promise<void>;
  getSlashCommands?: () => { commands: readonly string[]; skills: readonly string[] };
  getSlashCommandIcon?: (commandName: string) => IconName | undefined;
  trackClick?: MarkdownAction;
  reportUserAction?: (target: string, data?: unknown) => void;
}

export interface ImageFileData {
  data: string;
  mimeType: string;
  path: string;
}

const noopAction: MarkdownAction = () => {};

export const defaultMarkdownHostState: MarkdownHostState = {
  userSettings: {
    showMermaidDiagrams: true,
    wrapLines: false,
  },
  environment: {
    assistantHost: "",
    capabilities: {},
  },
  workspaces: [],
};

export const defaultMarkdownHost: MarkdownHostAdapter = {
  state: readable(defaultMarkdownHostState),
  trackClick: noopAction,
};
