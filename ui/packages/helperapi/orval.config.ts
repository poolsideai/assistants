import { glob } from "glob";
import fs from "node:fs";
import path, { basename } from "node:path";
import { defineConfig, type GeneratorClients } from "orval";
import { jsonrpcClientBuilder } from "./src/orval/jsonrpcGenerator";

// These methods are invoked by an IDE/native host or the remote transport,
// not by the shared webview helper client. Their schemas remain in OpenAPI for
// those hosts, but emitting TypeScript call wrappers for them leaves functions
// that no application code can call.
const hostOwnedPaths = new Set([
  "/poolside/abort",
  "/poolside/acp/_poolside/mcp/delete_secrets",
  "/poolside/acp/_poolside/mcp/set_input_variable",
  "/poolside/acp/_poolside/mcp/set_server_disabled",
  "/poolside/acp/_poolside/mcp/settings",
  "/poolside/acpNav/getFileOpener",
  "/poolside/acpNav/getKeybindings",
  "/poolside/acpNav/setFileOpener",
  "/poolside/acpNav/setKeybindings",
  "/poolside/deleteMcpSecrets",
  "/poolside/hello",
  "/poolside/mcpOAuthCallback",
  "/poolside/mcpOAuthInitiate",
  "/poolside/mcpServers/setPoolServerDisabled",
  "/poolside/remote/resume",
  "/poolside/remoteTerminal/attach",
  "/poolside/remoteTerminal/clear",
  "/poolside/remoteTerminal/closeForPath",
  "/poolside/remoteTerminal/create",
  "/poolside/remoteTerminal/delete",
  "/poolside/remoteTerminal/list",
  "/poolside/remoteTerminal/resize",
  "/poolside/remoteTerminal/write",
  "/poolside/runtimeFiles",
  "/textDocument/didChange",
  "/textDocument/didClose",
  "/textDocument/didOpen",
  "/workspace/didChangeWatchedFiles",
  "/workspace/didChangeWorkspaceFolders",
  "/workspace/didCreateFiles",
  "/workspace/didDeleteFiles",
  "/workspace/didRenameFiles",
  "/workspace/willDeleteFiles",
]);

export default defineConfig({
  poolsideHelper: {
    input: {
      target: process.env.LOCAL_SCHEMA ?? "http://localhost:8080/openapi.yaml",
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
            // These OpenAPI operations exist only to publish helper→client
            // payload schemas. Generating callable client wrappers for them
            // creates APIs that can only call the protocol in the wrong
            // direction.
            for (const [path, item] of Object.entries(spec.paths)) {
              const summary = item?.post?.summary;
              if (
                hostOwnedPaths.has(path) ||
                (typeof summary === "string" && summary.endsWith("(client side)"))
              ) {
                delete spec.paths[path];
              }
            }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    },
    output: {
      target: "./src/gen/api.ts",
      schemas: "./src/gen/schemas",
      prettier: true,
      client: (clients: GeneratorClients) => jsonrpcClientBuilder,
      clean: true,
    },
    hooks: {
      afterAllFilesWrite: () => {
        const updateFile = (
          path: string,
          replacements: { from: string | RegExp; to: string }[],
        ) => {
          let content = fs.readFileSync(path, "utf8");
          let modified = false;

          for (const { from, to } of replacements) {
            const newContent =
              typeof from === "string" ? content.replaceAll(from, to) : content.replace(from, to);

            if (newContent !== content) {
              content = newContent;
              modified = true;
            }
          }

          if (modified) {
            fs.writeFileSync(path, content);
            console.log(`Updated imports in: ${basename(path)}`);
          }
        };

        const overridenSchemas = glob
          .sync("./src/schemas/*.ts", {
            ignore: ["**/*.test.ts", "**/index.ts"],
          })
          .map((filePath) => path.basename(filePath, ".ts"));

        if (overridenSchemas.length === 0) return;

        const generatedSchemas = glob.sync("./src/gen/schemas/*.ts", {
          ignore: ["**/index.ts"],
        });

        generatedSchemas.forEach((path) => {
          const replacements = overridenSchemas.map((override) => ({
            from: `'./${override}'`,
            to: `'../../schemas/${override}'`,
          }));

          updateFile(path, replacements);
        });

        const indexPath = "./src/gen/schemas/index.ts";
        if (fs.existsSync(indexPath)) {
          const replacements = overridenSchemas.map((override) => ({
            from: new RegExp(`export \\* from '\\.\/${override}'`, "g"),
            to: `export * from '../../schemas/${override}'`,
          }));

          updateFile(indexPath, replacements);
        }

        pruneUnusedGeneratedSchemas();
      },
    },
  },
});

function pruneUnusedGeneratedSchemas() {
  const schemaFiles = glob.sync("./src/gen/schemas/*.ts", {
    ignore: ["**/index.ts"],
  });
  const neededNames = new Set<string>();
  collectNamedImports(fs.readFileSync("./src/gen/api.ts", "utf8"), "./schemas", neededNames);
  for (const file of glob.sync("../../**/*.{ts,svelte}", {
    ignore: [
      "**/dist/**",
      "**/node_modules/**",
      "**/src/gen/**",
      "**/*.spec.*",
      "**/*.stories.*",
      "**/*.test.*",
      "**/__tests__/**",
    ],
  })) {
    collectNamedImports(
      fs.readFileSync(file, "utf8"),
      "@poolsideai/helperapi/schemas",
      neededNames,
    );
  }
  for (const file of glob.sync("./src/schemas/*.ts", { ignore: ["**/*.test.ts"] })) {
    collectNamedImports(fs.readFileSync(file, "utf8"), "../gen/schemas", neededNames);
  }

  const filesByStem = new Map(schemaFiles.map((file) => [path.basename(file, ".ts"), file]));
  const live = new Set<string>();
  for (const file of schemaFiles) {
    const source = fs.readFileSync(file, "utf8");
    const exportedNames = [
      ...source.matchAll(/\bexport\s+(?:class|const|enum|interface|type)\s+([A-Za-z_$][\w$]*)/g),
    ].map((match) => match[1]);
    if (exportedNames.some((name) => neededNames.has(name))) {
      live.add(file);
    }
  }

  const pending = [...live];
  while (pending.length) {
    const file = pending.pop()!;
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)) {
      const dependency = filesByStem.get(match[1]);
      if (dependency && !live.has(dependency)) {
        live.add(dependency);
        pending.push(dependency);
      }
    }
  }

  for (const file of schemaFiles) {
    if (!live.has(file)) fs.rmSync(file);
  }

  const indexPath = "./src/gen/schemas/index.ts";
  const index = fs.readFileSync(indexPath, "utf8");
  const filtered = index
    .split("\n")
    .filter((line) => {
      const match = line.match(/from ['"]\.\/([^'"]+)['"]/);
      return !match || (filesByStem.has(match[1]) && live.has(filesByStem.get(match[1])!));
    })
    .join("\n");
  fs.writeFileSync(indexPath, filtered);
}

function collectNamedImports(source: string, specifier: string, names: Set<string>) {
  const escapedSpecifier = specifier.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(
    `import\\s+(?:type\\s+)?\\{([^}]*)\\}\\s+from\\s+["']${escapedSpecifier}(?:/index(?:\\.js)?)?["']`,
    "g",
  );
  for (const match of source.matchAll(expression)) {
    for (const imported of match[1].split(",")) {
      const name = imported
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)[0];
      if (/^[A-Za-z_$][\w$]*$/.test(name)) names.add(name);
    }
  }
}
