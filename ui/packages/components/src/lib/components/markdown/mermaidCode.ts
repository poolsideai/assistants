/** Recognize unlabelled flowcharts without reinterpreting explicitly typed code. */
export function isMermaidCode(text: string, lang?: string): boolean {
  const language = lang?.trim().toLowerCase().split(/\s+/)[0];
  if (language === "mermaid") return true;
  if (language && language !== "auto" && language !== "flowchart") return false;

  const source = text.replace(/^\s*%%[^\n]*(?:\n|$)/gm, "").trimStart();
  return /^(?:flowchart|graph)\s+(?:TD|TB|BT|LR|RL)(?:\s|;|$)/.test(source);
}
