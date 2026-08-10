<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import PatchDiff from "./PatchDiff.svelte";

  const samplePatch = `diff --git a/greeting.ts b/greeting.ts
index 1111111..2222222 100644
--- a/greeting.ts
+++ b/greeting.ts
@@ -1,5 +1,6 @@
 export function greet(name: string): string {
-  return "Hello " + name;
+  const trimmed = name.trim();
+  return \`Hello, \${trimmed}!\`;
 }

 export const DEFAULT_NAME = "world";
`;

  // A change in the middle of a longer file: full contents make the
  // collapsed context above/below expandable, so the story exercises the
  // card header and the gutter expand controls.
  const bookLine = (id: number, title: string) => `    {"id": ${id}, "title": "${title}"},`;
  const titles = [
    "Hyperion",
    "The Fifth Season",
    "The Priory of the Orange Tree",
    "Klara and the Sun",
    "Circe",
    "The Song of Achilles",
    "Mexican Gothic",
    "Project Hail Mary",
    "The Midnight Library",
    "Atomic Habits",
  ];
  const contextBooks = (offset: number) =>
    Array.from({ length: 14 }, (_, i) => bookLine(offset + i, `Book ${offset + i}`));
  const oldBookLines = [
    "books_db = [",
    ...contextBooks(1),
    ...titles.slice(0, 2).map((t, i) => bookLine(15 + i, t)),
    ...contextBooks(17),
    "]",
  ];
  const newBookLines = [
    "books_db = [",
    ...contextBooks(1),
    ...titles.map((t, i) => bookLine(15 + i, t)),
    ...contextBooks(25),
    "]",
  ];
  const booksOldContents = oldBookLines.join("\n") + "\n";
  const booksNewContents = newBookLines.join("\n") + "\n";

  const { Story } = defineMeta({
    component: PatchDiff,
    args: {
      patch: samplePatch,
      theme: "dark",
    },
  });
</script>

<Story name="Unified" />
<Story name="Split" args={{ layout: "split" }} />
<Story name="Light" args={{ theme: "light" }} />
<Story name="Empty" args={{ patch: "" }} />
<Story
  name="From contents (no patch)"
  args={{
    patch: undefined,
    oldFile: { name: "greeting.ts", contents: 'export const NAME = "world";\n' },
    newFile: { name: "greeting.ts", contents: 'export const NAME = "poolside";\n' },
  }}
/>
<Story
  name="Card with expandable context"
  args={{
    patch: undefined,
    theme: "light",
    oldFile: { name: "src/resources/book.py", contents: booksOldContents },
    newFile: { name: "src/resources/book.py", contents: booksNewContents },
  }}
/>
