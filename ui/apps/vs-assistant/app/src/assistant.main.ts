import "./assistant.css";

__POOL_SYNTHETIC_IMPORT_BASELINE__
import { mount } from "svelte";
__POOL_SYNTHETIC_IMPORT_BASELINE__
import { rpcHostRequestHandler, rpcWebViewResponseHandler } from "./vs-handlers";
import { trackVSCodeContextElements } from "./vscode-data-context-shim";

__POOL_SYNTHETIC_IMPORT_BASELINE__

const targetElement = document.getElementById("app");
const target = targetElement!;

init().then(() => {
  trackVSCodeContextElements((elements) => {
    rpcHostRequestHandler("updateVSCodeContextElements", [elements]);
  });
__POOL_SYNTHETIC_IMPORT_BASELINE__
    target,
    props: {
      rpcHostRequestHandler,
      rpcWebViewResponseHandler,
    },
  });
});
