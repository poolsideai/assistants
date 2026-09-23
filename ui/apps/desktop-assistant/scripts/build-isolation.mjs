import { cp, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = resolve(appDir, "isolation");
const outputDir = resolve(appDir, "dist-isolation");

await rm(outputDir, { force: true, recursive: true });
await cp(sourceDir, outputDir, { recursive: true });
