export interface GitGutterRange {
  start: number;
  end: number;
}

export interface GitGutterDecorations {
  added: GitGutterRange[];
  modified: GitGutterRange[];
  deletedAfter: number[];
}
