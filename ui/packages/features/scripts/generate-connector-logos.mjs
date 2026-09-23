// Generate only the upstream brand marks used by ConnectorServiceIcon.
// Keep @iconify-json/logos' licensing/attribution in the dependency manifest.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { connectorLogoNames } from "../src/acp/components/mcp/connectorLogoNames.ts";

const require = createRequire(import.meta.url);
const upstream = JSON.parse(
  readFileSync(require.resolve("@iconify-json/logos/icons.json"), "utf8"),
);
const icons = Object.fromEntries(
  [...new Set(Object.values(connectorLogoNames))].map((name) => {
    assert(upstream.icons[name], `${name} must be a standalone upstream logo`);
    return [name, upstream.icons[name]];
  }),
);
const subset = { width: upstream.width, height: upstream.height, icons };
const target = new URL("../src/acp/components/mcp/assets/connector-logos.json", import.meta.url);
if (process.argv.includes("--check")) {
  assert.deepEqual(JSON.parse(readFileSync(target, "utf8")), subset);
  console.log(`All ${Object.keys(icons).length} connector logos exactly match upstream.`);
} else {
  writeFileSync(target, `${JSON.stringify(subset, null, 2)}\n`);
  console.log(`Generated ${Object.keys(icons).length} connector logos.`);
}
