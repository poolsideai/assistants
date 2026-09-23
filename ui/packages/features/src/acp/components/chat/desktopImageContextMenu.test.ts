import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildDesktopImageContextMenuItems,
  performDesktopImageContextMenuAction,
  type DesktopImageContextMenuRPC,
} from "./desktopImageContextMenu";

describe("desktop image context menu", () => {
  let rpc: DesktopImageContextMenuRPC;
  let attachImage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    rpc = {
      getImageFileData: vi.fn().mockResolvedValue({
        path: "/workspace/assets/photo.png",
        data: "aW1hZ2U=",
        mimeType: "image/png",
      }),
      openPathWithOpener: vi.fn().mockResolvedValue(undefined),
      revealPathInFinder: vi.fn().mockResolvedValue(undefined),
      writeImageToPasteboard: vi.fn().mockResolvedValue(undefined),
      writeImageDataToPasteboard: vi.fn().mockResolvedValue(undefined),
      writeToClipboard: vi.fn(),
    };
    attachImage = vi.fn().mockReturnValue(true);
  });

  it("builds the requested menu with the shared opener submenu", () => {
    const items = menuItems();

    expect(labels(items)).toEqual([
      "Open in…",
      "Reveal In Finder",
      "Add Image to Chat",
      "---",
      "Copy Image",
      "---",
      "Copy Path",
      "Copy Relative Path",
    ]);
    expect(items[0]).toEqual(
      expect.objectContaining({
        kind: "submenu",
        enabled: true,
        items: [
          expect.objectContaining({ label: "Default macOS app" }),
          expect.objectContaining({ label: "Code" }),
        ],
      }),
    );
  });

  it("shows each associated macOS keyboard shortcut", () => {
    const items = menuItems();

    expect(accelerator(items, "revealInFinder")).toBe("Cmd+Alt+R");
    expect(accelerator(items, "copyImage")).toBe("Cmd+C");
    expect(accelerator(items, "copyPath")).toBe("Cmd+Alt+C");
    expect(accelerator(items, "copyRelativePath")).toBe("Cmd+Shift+Alt+C");
  });

  it("omits file-only actions for an embedded image", () => {
    const items = buildDesktopImageContextMenuItems({
      currentOpenerId: "poolside",
      fileOpeners: [],
      hasPath: false,
    });

    expect(labels(items)).toEqual(["Add Image to Chat", "---", "Copy Image"]);
    expect(accelerator(items, "copyImage")).toBe("Cmd+C");
  });

  it("opens with an opener selected from the shared submenu", async () => {
    await perform("openWith\0app:code");

    expect(rpc.openPathWithOpener).toHaveBeenCalledWith("/workspace/assets/photo.png", "app:code");
  });

  it("reveals and copies the image through native host actions", async () => {
    await perform("revealInFinder");
    await perform("copyImage");

    expect(rpc.revealPathInFinder).toHaveBeenCalledWith("/workspace/assets/photo.png");
    expect(rpc.writeImageToPasteboard).toHaveBeenCalledWith("/workspace/assets/photo.png");
  });

  it("adds the image to the active chat prompt", async () => {
    await perform("addImageToChat");

    expect(rpc.getImageFileData).toHaveBeenCalledWith("/workspace/assets/photo.png");
    expect(attachImage).toHaveBeenCalledWith({
      name: "photo.png",
      data: "aW1hZ2U=",
      mimeType: "image/png",
    });
  });

  it("reports when no active prompt accepts the image", async () => {
    attachImage.mockReturnValue(false);

    await expect(perform("addImageToChat")).rejects.toThrow(
      "Unable to add image: no active prompt",
    );
  });

  it("copies absolute and relative paths", async () => {
    await perform("copyPath");
    await perform("copyRelativePath");

    expect(rpc.writeToClipboard).toHaveBeenNthCalledWith(1, "/workspace/assets/photo.png");
    expect(rpc.writeToClipboard).toHaveBeenNthCalledWith(2, "assets/photo.png");
  });

  it("adds and copies an embedded image from its rendered data", async () => {
    const loadImageData = vi.fn().mockResolvedValue({
      data: "ZW1iZWRkZWQ=",
      mimeType: "image/webp",
    });

    await performDesktopImageContextMenuAction({
      actionId: "addImageToChat",
      name: "result.webp",
      loadImageData,
      rpc,
      attachImage,
    });
    await performDesktopImageContextMenuAction({
      actionId: "copyImage",
      name: "result.webp",
      loadImageData,
      rpc,
      attachImage,
    });

    expect(attachImage).toHaveBeenCalledWith({
      name: "result.webp",
      data: "ZW1iZWRkZWQ=",
      mimeType: "image/webp",
    });
    expect(rpc.writeImageDataToPasteboard).toHaveBeenCalledWith("ZW1iZWRkZWQ=");
    expect(rpc.writeImageToPasteboard).not.toHaveBeenCalled();
  });

  it("falls back to rendered data when a local backing file is unavailable", async () => {
    vi.mocked(rpc.getImageFileData).mockResolvedValue(undefined);
    vi.mocked(rpc.writeImageToPasteboard).mockRejectedValue(new Error("missing file"));
    const loadImageData = vi.fn().mockResolvedValue({
      data: "cmVuZGVyZWQ=",
      mimeType: "image/png",
    });

    await performDesktopImageContextMenuAction({
      actionId: "addImageToChat",
      path: "/workspace/assets/photo.png",
      name: "photo.png",
      loadImageData,
      rpc,
      attachImage,
    });
    await performDesktopImageContextMenuAction({
      actionId: "copyImage",
      path: "/workspace/assets/photo.png",
      name: "photo.png",
      loadImageData,
      rpc,
      attachImage,
    });

    expect(attachImage).toHaveBeenCalledWith({
      name: "photo.png",
      data: "cmVuZGVyZWQ=",
      mimeType: "image/png",
    });
    expect(rpc.writeImageDataToPasteboard).toHaveBeenCalledWith("cmVuZGVyZWQ=");
  });

  function menuItems() {
    return buildDesktopImageContextMenuItems({
      currentOpenerId: "poolside",
      fileOpeners: [
        { id: "poolside", label: "In-app viewer" },
        { id: "default", label: "Default macOS app" },
        { id: "app:code", label: "Code" },
      ],
    });
  }

  async function perform(actionId: string) {
    await performDesktopImageContextMenuAction({
      actionId,
      path: "/workspace/assets/photo.png",
      relativePath: "assets/photo.png",
      rpc,
      attachImage,
    });
  }

  function labels(items: ReturnType<typeof menuItems>): string[] {
    return items.map((item) => (item.kind === "separator" ? "---" : item.label));
  }

  function accelerator(items: ReturnType<typeof menuItems>, id: string): string | undefined {
    const item = items.find((candidate) => candidate.kind === "action" && candidate.id === id);
    return item?.kind === "action" ? item.accelerator : undefined;
  }
});
