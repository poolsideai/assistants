/** Install compiled-worker QA into an existing mobile dev server; --clean removes it. */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bundledLanguages } from "../../ui/packages/components/node_modules/shiki/dist/langs.mjs";

const publicRoot = "ui/apps/mobile-remote/public/__audit_b3";
const sources = {
  "ui/apps/mobile-remote/__audit_b3.html":
    '<!doctype html><html><head><meta charset="utf-8"></head><body><div id="app"></div><script type="module" src="/src/__audit_b3.ts"></script></body></html>',
  "ui/apps/mobile-remote/src/__audit_b3.ts": `
    import { mount } from 'svelte';
    const query = new URLSearchParams(location.search);
    const phase = query.get('phase') ?? 'before';
    const host = query.get('host') ?? 'mobile';
    const manifest = await fetch('/__audit_b3/manifest.json').then(r=>r.json());
    const RealWorker = window.Worker;
    const workers: Worker[] = [];
    const replies: unknown[] = [];
    window.Worker = class extends RealWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        const kind = String(url).includes('codeHighlight.worker') ? 'chat' : 'diff';
        super(manifest[phase][host][kind] + "?qa=ui", { ...options, type: 'module' });
        workers.push(this);
        this.addEventListener('message', event=>replies.push(event.data));
      }
    };
    const App = (await import('./__audit_b3.svelte')).default;
    const app = mount(App, {target: document.getElementById('app')!});
    Object.assign(window, {b3UI:{workers,replies,app}});
  `,
  "ui/apps/mobile-remote/src/__audit_b3.svelte": `
    <script lang="ts">
      import "../../../packages/components/src/lib/components/tailwind.css";
      import Code from "../../../packages/components/src/lib/components/markdown/HighlightedCode.svelte";
      import Shell from "../../../packages/components/src/lib/components/assistant-ui/HighlightedShellCommand.svelte";
      import File from "../../../packages/components/src/lib/components/file-diff/FileCodeView.svelte";
      import Diff from "../../../packages/components/src/lib/components/file-diff/DiffCodeView.svelte";
      let content = $state('const answer: number = 42;\\nconsole.log("<safe>&value");');
      let theme = $state<'light'|'dark'>('light');
      let layout = $state<'unified'|'split'>('unified');
      let shown = $state(true);
      const patch = 'diff --git a/example.ts b/example.ts\\n--- a/example.ts\\n+++ b/example.ts\\n@@ -1,2 +1,2 @@\\n-const answer = 41;\\n+const answer = 42;\\n console.log(answer);\\n';
      Object.assign(window,{b3Actions:{update:()=>content+='\\n// streamed latest line',theme:()=>theme=theme==='light'?'dark':'light',layout:()=>layout=layout==='split'?'unified':'split',hide:()=>shown=false}});
    </script>
    <main style="padding:20px;--psx-foreground-primary:#202020;--psx-editor-background:#fff;--psx-border:#ddd;--psx-font-mono:monospace;--color-prettylights-syntax-keyword:#cf222e;--color-prettylights-syntax-string:#0a3069;--color-prettylights-syntax-constant:#0550ae">
      <h1>Highlighting regression fixture</h1>
      <input aria-label="Draft" value="Keep this draft" />
      {#if shown}
        <Code text={content} lang="typescript" />
        <pre><code><Shell command={'echo "<safe>" && printf ready'} /></code></pre>
        <section style="height:180px"><File {content} filename="example.ts" {theme}/></section>
        <section style="height:220px"><Diff items={[{id:'example.ts',patch,version:1}]} {theme} {layout}/></section>
      {/if}
    </main>
  `,
};
if (process.argv.includes("--clean")) {
  rmSync(publicRoot, { recursive: true, force: true });
  for (const file of Object.keys(sources)) rmSync(file, { force: true });
  process.exit();
}
if (existsSync(publicRoot)) throw new Error("Clean the old B3 fixture first");
for (const file of Object.keys(sources))
  if (existsSync(file)) throw new Error(`Already exists: ${file}`);
mkdirSync(publicRoot, { recursive: true });
const manifest = {};
for (const phase of ["before", "after"]) {
  manifest[phase] = {};
  for (const host of ["desktop", "mobile", "vscode"]) {
    const source = `output/performance/b3-${phase}-${host}`;
    const destination = join(publicRoot, phase, host);
    cpSync(source, destination, { recursive: true, filter: (file) => !file.endsWith(".map") });
    const folder = host === "vscode" ? "webview" : "assets";
    const names = readdirSync(join(destination, folder));
    const choose = (pattern) => {
      const found = names.filter((name) => pattern.test(name));
      if (found.length !== 1) throw new Error(`Ambiguous worker: ${phase} ${host} ${found}`);
      return `/__audit_b3/${phase}/${host}/${folder}/${found[0]}`;
    };
    manifest[phase][host] = {
      chat: choose(
        phase === "before"
          ? /^codeHighlight\.worker[-.].*\.js$/
          : /^worker-codeHighlight\.worker(?:[-.].+)?\.js$/,
      ),
      diff: choose(phase === "before" ? /^worker-[\w-]+\.js$/ : /^worker-worker(?:[-.].+)?\.js$/),
    };
  }
}
writeFileSync(join(publicRoot, "manifest.json"), JSON.stringify(manifest));
writeFileSync(
  join(publicRoot, "languages.json"),
  JSON.stringify(Object.keys(bundledLanguages).sort()),
);
cpSync("docs/performance-audit/b3-browser-bench.js", join(publicRoot, "bench.js"));
writeFileSync(
  join(publicRoot, "bench.html"),
  '<html><body><h1>Compiled highlighting worker checks</h1><script src="./bench.js"></script></body></html>',
);
for (const [file, source] of Object.entries(sources)) writeFileSync(file, source);
console.log(
  "Open /__audit_b3/bench.html or /__audit_b3.html?phase=before|after on the existing dev server. Clean before any production build.",
);
