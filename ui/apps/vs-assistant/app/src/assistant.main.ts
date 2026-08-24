import "./assistant.css";

import { SidebarOnlyPanel, init } from "@poolsideai/assistant";
import { mount } from "svelte";
import { installNotificationShim } from "./notificationShim";
import { rpcHostRequestHandler, rpcWebViewResponseHandler } from "./vs-handlers";
import { trackVSCodeContextElements } from "./vscode-data-context-shim";

installNotificationShim();

const targetElement = document.getElementById("app");
const target = targetElement!;

init().then(() => {
  trackVSCodeContextElements((elements) => {
    rpcHostRequestHandler("updateVSCodeContextElements", [elements]);
  });
  mount(SidebarOnlyPanel, {
    target,
    props: {
      rpcHostRequestHandler,
      rpcWebViewResponseHandler,
    },
  });
});
