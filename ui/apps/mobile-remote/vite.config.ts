import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

__POOL_SYNTHETIC_IMPORT_BASELINE__
import { defineConfig, type Plugin } from "vite";
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
const appDir = path.dirname(fileURLToPath(import.meta.url));

// Inline the apple-touch-icon as a data URI so iOS never has to fetch it over
// the network when adding to the home screen. iOS refuses to use an
// apple-touch-icon served over a self-signed / privately-signed HTTPS cert
// (falling back to a screenshot); embedding the bytes in the already-loaded
// HTML sidesteps that fetch entirely. The /apple-touch-icon.png file is still
// emitted as a fallback for clients that fetch it normally.
function inlineAppleTouchIcon(): Plugin {
  return {
    name: "inline-apple-touch-icon",
    transformIndexHtml(html) {
      const iconBytes = readFileSync(path.join(appDir, "public/apple-touch-icon.png"));
      const dataUri = `data:image/png;base64,${iconBytes.toString("base64")}`;
      return html.replace(/(<link rel="apple-touch-icon"[^>]*href=")[^"]*(")/, `$1${dataUri}$2`);
    },
  };
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    plugins: [inlineAppleTouchIcon()],
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
