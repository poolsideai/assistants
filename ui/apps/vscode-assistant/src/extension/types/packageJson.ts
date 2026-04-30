import type { Except } from "type-fest";

export interface VSCodePackageManifest {
  contributes?: {
    languages?: VSCodeLanguageContribution[];
    themes?: VSCodeThemeContribution[];
    iconThemes?: VSCodeIconThemeContribution[];
  };
}

export interface VSCodeLanguageContribution {
  id: string;
  extensions?: string[];
  aliases?: string[];
  filenames?: string[];
  filenamePatterns?: string[];
}

export type VSCodeThemeContribution = {
  id: string;
  label: string;
  path: string;
};

export type VSCodeIconThemeContribution = {
  id: string;
  label: string;
  path: string;
};

export interface VSCodeThemeManifest {
  name: string;
  tokenColors?: {
    scope: string | string[];
    settings: {
      foreground?: string;
      background?: string;
      fontStyle?: string;
    };
  }[];
}

export interface VSCodeFont {
  id: string;
  src: { path: string; format: string }[];
  weight?: string;
  style?: string;
  size?: string;
}

export type VSCodeIconDefinition =
  | { iconPath: string }
  | { fontCharacter: string; fontId?: string; fontColor?: string; fontSize?: string };

export interface VSCodeIconTheme {
  fonts?: VSCodeFont[];
  iconDefinitions: Record<string, VSCodeIconDefinition>;
  fileExtensions?: Record<string, string>;
  fileNames?: Record<string, string>;
  folderNames?: Record<string, string>;
  folderNamesExpanded?: Record<string, string>;
  languageIds?: Record<string, string>;
  file?: string;
  folder?: string;
  folderExpanded?: string;
}

export interface VSCodeIconThemeManifest extends VSCodeIconTheme {
  light?: Except<VSCodeIconTheme, "iconDefinitions">;
  highContrast?: Except<VSCodeIconTheme, "iconDefinitions">;
}
