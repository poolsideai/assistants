#!/usr/bin/env tsx

import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

/**
 * Stamp the release identity into package.json in-place, ahead of the build /
 * `vsce package`.
 *
 * The tag-driven release flow is the source of truth for the version, so the
 * committed manifest carries a `0.0.0` placeholder. CI injects the real version
 * here (and, when publishing under a new marketplace name, an optional
 * `name` / `displayName`) into an ephemeral working copy that is never
 * committed. The runtime keys off `context.extension.id`, so a `name` swap needs
 * no change to the static `contributes` namespaces (see extensionIdentity.ts).
 */

const { values } = parseArgs({
  options: {
    version: { type: "string" },
    name: { type: "string" },
    "display-name": { type: "string" },
    manifest: { type: "string" },
  },
});

if (!values.version) {
  throw new Error("--version <x.y.z> is required");
}
if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u.test(values.version)) {
  throw new Error("--version must be numeric major.minor.patch without prerelease metadata");
}
if (values.name && !/^[a-z0-9][a-z0-9-]*$/u.test(values.name)) {
  throw new Error("--name must contain only lowercase letters, digits, and hyphens");
}
if (values.name?.endsWith("-dev")) {
  // extensionIdentity.ts treats any extension id ending in -dev as the dev-mode
  // identity, which would break a published build's command/view namespaces.
  throw new Error("--name must not end in -dev; that suffix selects the dev-mode identity");
}
if (values["display-name"] !== undefined && values["display-name"].trim() === "") {
  throw new Error("--display-name must not be empty");
}

const manifestPath = path.resolve(values.manifest ?? "package.json");
const pkg = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

pkg.version = values.version;
if (values.name) {
  pkg.name = values.name;
}
if (values["display-name"]) {
  pkg.displayName = values["display-name"];
}

fs.writeFileSync(manifestPath, `${JSON.stringify(pkg, null, 2)}\n`);

console.log(
  `Stamped ${path.relative(process.cwd(), manifestPath)}: name=${pkg.name} displayName=${pkg.displayName} version=${pkg.version}`,
);
