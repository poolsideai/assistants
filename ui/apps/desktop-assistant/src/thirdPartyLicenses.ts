import { mount } from "svelte";
import "./app.css";
import { installExternalLinkHandler } from "./externalLinks";
import ThirdPartyLicenses from "./ThirdPartyLicenses.svelte";

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";
const systemTheme = window.matchMedia(DARK_SCHEME_QUERY);

function applyTheme(): void {
  const theme = systemTheme.matches ? "dark" : "light";
  document.documentElement.classList.toggle("vscode-light", theme === "light");
  document.documentElement.classList.toggle("vscode-dark", theme === "dark");
  document.body.classList.toggle("vscode-light", theme === "light");
  document.body.classList.toggle("vscode-dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  document.body.style.colorScheme = theme;
}

installExternalLinkHandler();
applyTheme();
systemTheme.addEventListener("change", applyTheme);

const target = document.getElementById("app");
if (!target) {
  throw new Error("Third Party Licenses mount target not found");
}

mount(ThirdPartyLicenses, { target });
