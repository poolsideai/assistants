const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".bmp"]);

export function isPreviewableImagePath(path: string): boolean {
  const cleanPath = path.split(/[?#]/, 1)[0]?.toLowerCase() ?? "";
  return Array.from(IMAGE_EXTENSIONS).some((extension) => cleanPath.endsWith(extension));
}

export function isPreviewableImageUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:" && url.protocol !== "data:") {
      return false;
    }
    if (url.protocol === "data:") return url.pathname.startsWith("image/");
    return isPreviewableImagePath(url.pathname);
  } catch {
    return false;
  }
}

export function imageFilePathFromUri(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol === "file:") {
      const path = fileUriToPath(url);
      return isPreviewableImagePath(path) ? path : undefined;
    }
    return undefined;
  } catch {
    return isPreviewableImagePath(value) ? value : undefined;
  }
}

function fileUriToPath(url: URL): string {
  const path = decodeURIComponent(url.pathname);
  if (/^\/[A-Za-z]:\//.test(path)) {
    return path.slice(1);
  }
  if (url.hostname && url.hostname !== "localhost") {
    return `//${url.hostname}${path}`;
  }
  return path;
}
