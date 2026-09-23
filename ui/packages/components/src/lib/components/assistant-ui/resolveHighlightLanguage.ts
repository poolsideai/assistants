import type { BundledLanguage } from "shiki/types";
import { highlightLanguages } from "./highlightLanguages.js";

/** Resolve fence aliases and filenames without pulling grammar loaders into the UI. */
export function resolveHighlightLanguage(value: string | undefined): BundledLanguage | undefined {
  if (!value) return;
  const normalized = value.toLowerCase().replace(/^scope\./, "");
  if (["text", "txt", "plain", "plaintext"].includes(normalized)) return;

  const basename = normalized.split(/[\\/]/).at(-1) ?? normalized;
  const parts = basename.split(".");
  const candidates = [normalized, basename];
  for (let i = 1; i < parts.length; i++) candidates.push(parts.slice(i).join("."));
  return candidates.find((candidate) => highlightLanguages.has(candidate)) as
    | BundledLanguage
    | undefined;
}
