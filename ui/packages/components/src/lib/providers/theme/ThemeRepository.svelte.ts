export type ColorTheme = object;

export interface FileIconTheme {
  fonts?: Record<string, string>; // fontId -> embedded font CSS
  iconDefinitions?: Record<string, string>; // iconName -> SVG/img string
  fileExtensions?: Record<string, string>;
  fileNames?: Record<string, string>;
  folderNames?: Record<string, string>;
  languageIds?: Record<string, string>;
  file?: string;
  folder?: string;
}

export type ThemeRepositoryProps = {
  colorTheme?: ColorTheme;
  fileIconTheme?: FileIconTheme;
  getFileIconDefinition?: (iconName: string) => Promise<string | undefined>;
  onColorThemeChange?: (value: ColorTheme | undefined) => void;
  onFileIconThemeChange?: (value: FileIconTheme | undefined) => void;
};

export class ThemeRepository {
  #colorTheme: ColorTheme | undefined;
  #fileIconTheme: FileIconTheme | undefined;
  #fileIconDefinitions = new Map<string, string | undefined>();

  constructor(private readonly props?: ThemeRepositoryProps) {
    this.#colorTheme = $state(props?.colorTheme);
    this.#fileIconTheme = $state(props?.fileIconTheme);
  }

  get colorTheme() {
    return this.#colorTheme;
  }

  set colorTheme(value) {
    this.#colorTheme = value;
    this.props?.onColorThemeChange?.(value);
  }

  get fileIconTheme() {
    return this.#fileIconTheme;
  }

  set fileIconTheme(value) {
    this.#fileIconTheme = value;
    this.#fileIconDefinitions.clear();
    this.props?.onFileIconThemeChange?.(value);
  }

  async getFileIconDefinition(iconName: string) {
    const inlineDefinition = this.#fileIconTheme?.iconDefinitions?.[iconName];
    if (inlineDefinition) return inlineDefinition;

    if (this.#fileIconDefinitions.has(iconName)) {
      return this.#fileIconDefinitions.get(iconName);
    }

    const definition = await this.props?.getFileIconDefinition?.(iconName);
    this.#fileIconDefinitions.set(iconName, definition);
    return definition;
  }
}
