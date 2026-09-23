import { listFiles, PackageManager } from "@vscode/vsce";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
const packaged = new Set(await listFiles({ cwd: root, packageManager: PackageManager.None }));
const manifest = JSON.parse(await readFile(path.join(dist, ".vite/manifest.json"), "utf8"));
const required = new Set(["dist/.vite/manifest.json", "dist/extension/main.cjs"]);
for (const entry of ["assistant", "acp-chat"]) {
  assert(manifest[`src/webview/${entry}.main.ts`]?.isEntry, `Missing ${entry} entry`);
}
for (const chunk of Object.values(manifest)) {
  for (const key of [...(chunk.imports ?? []), ...(chunk.dynamicImports ?? [])]) {
    assert(manifest[key], `Missing imported chunk ${key}`);
  }
  for (const file of [chunk.file, ...(chunk.css ?? []), ...(chunk.assets ?? [])]) {
    required.add(`dist/${file}`);
  }
}
// Worker resources and extension icons need to survive packaging even if they
// are not referenced by the Vite manifest. The distribution is an allowlist.
for (const file of await readdir(dist, { recursive: true })) {
  if ((await stat(path.join(dist, file))).isFile() && !file.endsWith(".map")) {
    required.add(`dist/${file.split(path.sep).join("/")}`);
  }
}
for (const file of required) assert(packaged.has(file), `Runtime file excluded: ${file}`);
assert(![...packaged].some((file) => file.endsWith(".map")), "Source maps leaked into VSIX");
for (const [file, budget] of [
  ["webview/assistant.js", 5_000_000],
  ["extension/main.cjs", 1_200_000],
]) {
  const buffer = await readFile(path.join(dist, file));
  assert(buffer.length <= budget, `${file}: ${buffer.length} exceeds ${budget} byte budget`);
  assert(!/\/\/# sourceMappingURL=/.test(buffer.toString()), `${file} exposes a map URL`);
  const map = JSON.parse(await readFile(path.join(dist, `${file}.map`), "utf8"));
  assert(map.version === 3 && map.mappings.length > 0, `${file}: invalid source map`);
  assert(map.sources.length && map.sourcesContent?.some(Boolean), `${file}: missing sources`);
}
console.log(`Verified ${required.size} packaged runtime files, release budgets and separate maps.`);
