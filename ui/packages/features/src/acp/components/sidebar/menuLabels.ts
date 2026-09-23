export function sidebarOpensViewLabel(label: string): string {
  return `${label}...`;
}

export function sidebarRenameLabel(target: "Conversation" | "Project" | "Worktree"): string {
  return sidebarOpensViewLabel(`Rename ${target}`);
}

// Inline renames edit the sidebar row in place, so unlike dialog-based
// renames they carry no ellipsis.
export function sidebarInlineRenameLabel(target: "Conversation" | "Project" | "Worktree"): string {
  return `Rename ${target}`;
}
