<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { ComponentProps } from "svelte";
  import DiffCodeView, { type DiffCodeViewItem } from "./DiffCodeView.svelte";

  function patchFor(path: string): string {
    return `diff --git a/${path} b/${path}
index 1111111..2222222 100644
--- a/${path}
+++ b/${path}
@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello " + name;
+  const trimmed = name.trim();
+  return \`Hello, \${trimmed}!\`;
 }
`;
  }

  const items: DiffCodeViewItem[] = ["greeting.ts", "farewell.ts"].map((path) => ({
    id: path,
    patch: patchFor(path),
    version: 1,
  }));

  function renderHeader(fileDiff: { name?: string }): Element {
    const element = document.createElement("div");
    element.textContent = fileDiff.name ?? "";
    element.style.cssText = "display:flex;align-items:center;width:100%;min-width:0";
    return element;
  }

  const { Story } = defineMeta({
    component: DiffCodeView,
    args: { items, layout: "unified", renderCustomHeader: renderHeader },
    render: template,
  });
</script>

{#snippet template(args: ComponentProps<typeof DiffCodeView>)}
  <div
    data-testid="surface"
    style="height: 420px; overflow: hidden; background: var(--psx-editor-background)"
  >
    <DiffCodeView {...args} />
  </div>
{/snippet}

<Story name="Unified" />

<Story name="Line fills on a translucent editor background" />
