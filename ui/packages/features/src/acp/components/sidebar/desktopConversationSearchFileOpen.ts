export const IN_APP_FILE_OPENER_ID = "poolside";

type FileOpenKeyboardEvent = Pick<
  KeyboardEvent,
  "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey"
>;

export function isExternalFileOpenShortcut(event: FileOpenKeyboardEvent): boolean {
  return (
    event.key === "Enter" && event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey
  );
}

export function fileOpenerIdForSelection(
  configuredOpenerId: string,
  externalShortcut: boolean,
): string {
  return externalShortcut ? configuredOpenerId : IN_APP_FILE_OPENER_ID;
}
