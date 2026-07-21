import type { ContentBlock } from "@agentclientprotocol/sdk";

// LEGACY: prompts used to be wrapped in invisible characters so the user
// message could be recovered from agents that flatten history on session/load.
// New prompts are sent unwrapped; the injected context is stripped instead
// (see hostContext.ts). Unwrapping stays so histories recorded under the old
// scheme still render correctly.
// U+2063 INVISIBLE SEPARATOR and U+2064 INVISIBLE PLUS are intentionally rare
// and discreet in normal user text. Use AB to open and BA to close.
const USER_MESSAGE_BOUNDARY_A = "\u2063";
const USER_MESSAGE_BOUNDARY_B = "\u2064";
export const USER_MESSAGE_START_BOUNDARY = `${USER_MESSAGE_BOUNDARY_A}${USER_MESSAGE_BOUNDARY_B}`;
export const USER_MESSAGE_END_BOUNDARY = `${USER_MESSAGE_BOUNDARY_B}${USER_MESSAGE_BOUNDARY_A}`;

export function unwrapUserMessageText(text: string): string {
  const start = text.indexOf(USER_MESSAGE_START_BOUNDARY);
  if (start === -1) return text;

  const contentStart = start + USER_MESSAGE_START_BOUNDARY.length;
  const end = text.lastIndexOf(USER_MESSAGE_END_BOUNDARY);
  if (end < contentStart) return text;

  return text.slice(contentStart, end);
}

export function unwrapUserMessageBlock(block: ContentBlock): ContentBlock {
  return block.type === "text" ? { ...block, text: unwrapUserMessageText(block.text) } : block;
}
