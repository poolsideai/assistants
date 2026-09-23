import type { Plugin } from "vite";

// Include the complete static import closure, rather than just the tiny HTML
// entry. A shared chunk can otherwise silently pull the whole app into boot.
export function startupBudget(): Plugin {
  return {
    name: "desktop-startup-budget",
    apply: "build",
    generateBundle(_options, bundle) {
      const chunks = Object.values(bundle).filter((item) => item.type === "chunk");
      const entry = chunks.find(
        (chunk) =>
          chunk.isEntry && Object.keys(chunk.modules).some((id) => id.endsWith("/src/startup.ts")),
      );
      if (!entry) this.error("Desktop startup entry is missing");
      const visited = new Set<string>();
      const visit = (name: string): number => {
        if (visited.has(name)) return 0;
        visited.add(name);
        const chunk = bundle[name];
        if (!chunk || chunk.type !== "chunk") return 0;
        return (
          Buffer.byteLength(chunk.code) +
          chunk.imports.reduce((bytes, name) => bytes + visit(name), 0)
        );
      };
      const bytes = visit(entry.fileName);
      if (bytes > 100_000)
        this.error(
          `Desktop startup static JS is ${bytes} bytes (budget: 100000). Check shared imports.`,
        );
      for (const chunk of chunks) {
        for (const id of Object.keys(chunk.modules)) {
          if (
            id.endsWith("/@iconify-json/logos/icons.json") ||
            /\/storybook\/dist\/theming\//.test(id)
          ) {
            this.error(`Unexpected production dependency: ${id}`);
          }
        }
      }
      this.info(`Desktop startup static JS: ${bytes} bytes`);
    },
  };
}
