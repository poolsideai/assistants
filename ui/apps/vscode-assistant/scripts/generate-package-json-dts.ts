import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";

const packageJsonPath = path.resolve("./package.json");
const declarationPath = packageJsonPath.replace(/\.json$/, ".d.json.ts");

function createDeclaration(data: string) {
  return `/**
   * Generated file.
   * Do not edit manually.
   */
  declare const packageJson: ${data};

  export default packageJson;`;
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
const content = createDeclaration(JSON.stringify(packageJson, null, 2));
fs.writeFileSync(declarationPath, content);
await execa({ preferLocal: true })`prettier ${declarationPath} --write`;
