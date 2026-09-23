/** Prevents the browser context menu on sidebar controls (e.g. icon buttons,
 * settings pill) that show native/custom menus instead. Clears any stray text
 * selection so the right-click highlight does not linger. */
export function suppressContextMenu(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();
  window.getSelection()?.removeAllRanges();
}
