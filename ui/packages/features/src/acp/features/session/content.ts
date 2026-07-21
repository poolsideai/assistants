import type { ContentBlock } from "@agentclientprotocol/sdk";

export function textPromptContent(text: string): ContentBlock[] {
  return [{ type: "text", text }];
}

export function titleFromPrompt(prompt: string): string {
  const title = prompt.replace(/\s+/g, " ").trim();
  if (!title) {
    return "Untitled Conversation";
  }
  return title.length > 80 ? `${title.slice(0, 77)}...` : title;
}
