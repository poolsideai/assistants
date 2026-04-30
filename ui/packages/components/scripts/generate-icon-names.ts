import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";

const iconDir = path.resolve("./src/lib/components/icon");
const svelteDir = path.resolve(iconDir, "glyphs");
const typeDefinitionPath = path.resolve(iconDir, "IconName.ts");

function createTypeDefinition(iconNames: string[]) {
  return `/**
   * Generated file.
   * Do not edit manually.
   */
export type IconName = ${iconNames.map((icon) => `'${icon}'`).join(" | ")};`;
}

const iconNames = fs
  .readdirSync(svelteDir)
  .filter((file) => path.extname(file) === ".svelte")
  .map((file) => path.basename(file, ".svelte"));

const content = createTypeDefinition(iconNames);
fs.writeFileSync(typeDefinitionPath, content);
await execa({ preferLocal: true })`prettier ${typeDefinitionPath} --write`;
