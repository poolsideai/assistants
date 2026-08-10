interface WorktreeConversationFallbackOptions {
  createdPath?: string;
  firstConversationPath: string | null;
  isLoading: boolean;
}

export function shouldCreateConversationAfterWorktreeCreation({
  createdPath,
  firstConversationPath,
  isLoading,
}: WorktreeConversationFallbackOptions): boolean {
  return Boolean(createdPath && !isLoading && firstConversationPath !== createdPath);
}
