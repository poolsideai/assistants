/** Copy each host's dist to output/performance/b3-{before,after}-{host}, then run. */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";
import { parseAst } from "../../ui/config/vite/node_modules/vite/dist/node/index.js";

const results = {};
for (const host of ["desktop", "mobile", "vscode"]) {
  results[host] = {};
  for (const phase of ["before", "after"]) {
    const root = `output/performance/b3-${phase}-${host}`;
    const files = [];
    const visit = (directory) => {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) visit(file);
        else if (!file.endsWith(".map")) files.push(file);
      }
    };
    visit(root);
    const stats = { files: files.length, bytes: 0, gzipBytes: 0, jsBytes: 0, workers: [] };
    for (const file of files) {
      const data = readFileSync(file);
      stats.bytes += data.length;
      stats.gzipBytes += gzipSync(data).length;
      if (file.endsWith(".js")) stats.jsBytes += data.length;
    }
    for (const file of files.filter(
      (f) => /(?:\/codeHighlight\.worker[-.]|\/worker-)/.test(f) && f.endsWith(".js"),
    )) {
      const seen = new Set();
      const traverse = (file) => {
        if (seen.has(file)) return;
        seen.add(file);
        for (const node of parseAst(readFileSync(file, "utf8")).body) {
          if (node.type === "ImportDeclaration" && node.source.value.startsWith("."))
            traverse(resolve(dirname(file), node.source.value));
        }
      };
      traverse(resolve(file));
      stats.workers.push({
        file: file.slice(root.length + 1),
        staticJsBytes: [...seen].reduce((n, p) => n + statSync(p).size, 0),
        staticChunks: seen.size,
      });
    }
    results[host][phase] = stats;
  }
}
console.log(JSON.stringify(results, null, 2));
