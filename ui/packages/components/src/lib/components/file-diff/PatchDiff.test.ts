import { render, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parsePatchFiles } from "./index.js";
import PatchDiff from "./PatchDiff.svelte";

const pierreMocks = vi.hoisted(() => ({
  fileOptions: vi.fn(),
  fileRender: vi.fn(),
}));

// jsdom cannot construct @pierre/diffs' Shadow DOM custom element, so stub the
// renderer; real rendering is exercised by the Storybook stories.
vi.mock("@pierre/diffs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pierre/diffs")>();
  return {
    ...actual,
    FileDiff: class {
      constructor(options: unknown) {
        pierreMocks.fileOptions(options);
      }
      render(props: unknown): void {
        pierreMocks.fileRender(props);
      }
      cleanUp(): void {}
    },
  };
});

const samplePatch = `diff --git a/greeting.ts b/greeting.ts
index 1111111..2222222 100644
--- a/greeting.ts
+++ b/greeting.ts
@@ -1,3 +1,3 @@
 export function greet(name: string): string {
-  return "Hello " + name;
+  return \`Hello, \${name}!\`;
 }
`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("parsePatchFiles re-export", () => {
  it("parses a unified diff into file metadata", () => {
    const patches = parsePatchFiles(samplePatch);
    expect(patches).toHaveLength(1);
    expect(patches[0].files).toHaveLength(1);
    expect(patches[0].files[0].name).toBe("greeting.ts");
  });
});

describe("PatchDiff", () => {
  it("renders a container per file in the patch", async () => {
    const { container } = render(PatchDiff, { props: { patch: samplePatch } });
    // Rendering is synchronous per @pierre/diffs docs; highlighting is async.
    const fileNodes = container.querySelectorAll("[data-patch-diff-file]");
    expect(fileNodes).toHaveLength(1);
    expect(fileNodes[0].getAttribute("data-patch-diff-file")).toBe("greeting.ts");
  });

  it("renders each file into its body element", async () => {
    const { container } = render(PatchDiff, { props: { patch: samplePatch } });

    await waitFor(() => expect(pierreMocks.fileRender).toHaveBeenCalledOnce());
    const renderProps = pierreMocks.fileRender.mock.calls[0]?.[0] as {
      containerWrapper: HTMLElement;
    };
    const body = container.querySelector(".psx-patch-diff-body");

    expect(renderProps.containerWrapper).toBe(body);
  });

  it("expands a targeted file through the public API", async () => {
    const { component, container, getByRole } = render(PatchDiff, {
      props: { patch: samplePatch },
    });
    const collapseButton = getByRole("button", { name: "Collapse greeting.ts diff" });
    const header = container.querySelector(".psx-patch-diff-header");

    component.setAllCollapsed(true);
    await waitFor(() => expect(collapseButton).toHaveAttribute("aria-expanded", "false"));
    expect(header).toHaveClass("is-collapsed");

    expect(component.expandFile("greeting.ts")).toBe(true);
    await waitFor(() => expect(collapseButton).toHaveAttribute("aria-expanded", "true"));
    expect(header).not.toHaveClass("is-collapsed");
  });

  it("renders nothing for an empty patch", () => {
    const { container } = render(PatchDiff, { props: { patch: "" } });
    expect(container.querySelectorAll("[data-patch-diff-file]")).toHaveLength(0);
  });

  it("computes a diff from before/after contents when no patch is given", () => {
    const { container } = render(PatchDiff, {
      props: {
        oldFile: { name: "greeting.ts", contents: "const a = 1;\n" },
        newFile: { name: "greeting.ts", contents: "const a = 2;\n" },
      },
    });
    const fileNodes = container.querySelectorAll("[data-patch-diff-file]");
    expect(fileNodes).toHaveLength(1);
    expect(fileNodes[0].getAttribute("data-patch-diff-file")).toBe("greeting.ts");
  });

  it("uses partial Pierre metadata for compact before/after diffs", () => {
    render(PatchDiff, {
      props: {
        compact: true,
        oldFile: {
          name: "greeting.ts",
          contents: "unchanged one\nunchanged two\nunchanged three\nunchanged four\nconst a = 1;\n",
        },
        newFile: {
          name: "greeting.ts",
          contents: "unchanged one\nunchanged two\nunchanged three\nunchanged four\nconst a = 2;\n",
        },
      },
    });

    const renderProps = pierreMocks.fileRender.mock.calls[0]?.[0] as {
      fileDiff: { isPartial: boolean };
    };
    const options = pierreMocks.fileOptions.mock.calls[0]?.[0] as {
      hunkSeparators: string;
      lineDiffType: string;
    };
    expect(renderProps.fileDiff.isPartial).toBe(true);
    expect(options.hunkSeparators).toBe("simple");
    expect(options.lineDiffType).toBe("none");
  });

  it("renders nothing when neither a patch nor contents are given", () => {
    const { container } = render(PatchDiff, { props: {} });
    expect(container.querySelectorAll("[data-patch-diff-file]")).toHaveLength(0);
  });

  it("shows an Empty file note for a hunk-less diff", () => {
    // e.g. `git diff --no-index /dev/null empty.txt` for an empty new file.
    const emptyFilePatch = `diff --git a/empty.txt b/empty.txt
new file mode 100644
index 0000000..e69de29
`;
    const { container } = render(PatchDiff, { props: { patch: emptyFilePatch } });
    const note = container.querySelector(".psx-patch-diff-empty");
    expect(note).not.toBeNull();
    expect(note?.textContent).toBe("Empty file");
    expect(container.querySelector(".psx-patch-diff-body")).toBeNull();
  });
});
