<script lang="ts">
  import { copyText } from "svelte-copy";
  import Tooltip from "./Tooltip.svelte";
  import { writeRichToClipboard } from "./codeClipboard.js";
  import CopyStatusIcon from "./CopyStatusIcon.svelte";

  type Action = (node: HTMLElement, parameter?: any) => void | { destroy?: () => void };

  interface Capabilities {
    customUI?: boolean;
    hostClipboardWrite?: boolean;
  }

  interface Props {
    text: string;
    /** Optional HTML representation for rich-clipboard copy (text/html MIME type).
     *  When provided (code-block path), the component attempts to write both
     *  text/plain and text/html via ClipboardItem before falling back to plain.
     *  Accepts either a string or a zero-argument getter function. The getter
     *  form is preferred for expensive computations (e.g. code-block escaping)
     *  because the value is only materialised when the user actually clicks copy. */
    html?: string | (() => string);
    forCode?: boolean;
    disabled?: boolean;
    disabledTooltip?: string;
    capabilities?: Capabilities;
    writeToClipboard?: (text: string) => void | Promise<void>;
    onCopyError?: (error: Error) => void | Promise<void>;
    trackClick?: Action;
    copyTrackOptions?: unknown;
    copyCodeTrackOptions?: unknown;
  }

  const noopAction: Action = () => {};

  let {
    text,
    html,
    forCode = false,
    disabled = false,
    disabledTooltip = "Nothing to copy",
    capabilities = {},
    writeToClipboard,
    onCopyError,
    trackClick = noopAction,
    copyTrackOptions = { target: "clipboard_copy" },
    copyCodeTrackOptions = { target: "clipboard_copy_code" },
  }: Props = $props();

  async function copyToClipboard() {
    try {
      // Attempt rich write (HTML + plain) first when an html representation is
      // available. This works in the Tauri desktop webview and standard browsers.
      // Falls back to the host/plain-text path when ClipboardItem is unavailable
      // or the write is rejected (e.g. VS Code / Visual Studio webviews).
      if (html) {
        // Resolve the html value lazily if a getter function was provided, so
        // expensive work (e.g. HTML-escaping large code blocks) only runs on
        // click rather than on every reactive re-render during streaming.
        const resolvedHtml = typeof html === "function" ? html() : html;
        const didRichWrite = await writeRichToClipboard(text, resolvedHtml);
        if (didRichWrite) {
          momentarilyShowSuccess();
          return;
        }
      }

      // Restricted webviews cannot call navigator.clipboard directly. Route
      // through the host before attempting the browser API when that capability
      // is advertised.
      if (capabilities.hostClipboardWrite && writeToClipboard) {
        await writeToClipboard(text);
      } else {
        await copyText(text);
      }
      momentarilyShowSuccess();
    } catch (error) {
      handleCopyError(error);
    }
  }

  function handleCopyError(error: unknown) {
    const copyError = error instanceof Error ? error : new Error(String(error));
    void onCopyError?.(copyError);
  }

  let showSuccess = $state(false);

  function momentarilyShowSuccess() {
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
    }, 2000);
  }
</script>

<Tooltip text={disabled ? disabledTooltip : "Copy to clipboard"} customUI={capabilities.customUI}>
  <button
    type="button"
    aria-label={disabled ? disabledTooltip : showSuccess ? "copied" : "copy to clipboard"}
    {disabled}
    data-copy-button
    class="copy-button pointer-events-auto relative flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-psx-border bg-psx-panel text-psx-foreground-secondary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-psx-focus"
    class:copy-button-web={capabilities.customUI}
    class:copy-button-success={showSuccess && !disabled}
    class:cursor-not-allowed={disabled}
    class:opacity-50={disabled}
    use:trackClick={forCode ? copyCodeTrackOptions : copyTrackOptions}
    onclick={copyToClipboard}
  >
    <CopyStatusIcon copied={showSuccess} />
  </button>
</Tooltip>

<style lang="postcss">
  @reference "#tailwind.css";

  .copy-button {
    @media (pointer: coarse) {
      @apply h-8 w-8;
    }
  }

  /* The host hover/active tokens are commonly translucent. Composite them
     over the button's panel surface so every visual state remains opaque. */
  .copy-button:not(.copy-button-web):not(:disabled):hover,
  .copy-button:not(.copy-button-web).copy-button-success {
    background: linear-gradient(var(--psx-chrome-hover), var(--psx-chrome-hover)), var(--psx-panel);
  }

  .copy-button:not(.copy-button-web):not(:disabled):active {
    background:
      linear-gradient(var(--psx-chrome-active), var(--psx-chrome-active)), var(--psx-panel);
  }

  :global(body.web-app) .copy-button-web {
    @apply border-(--color-mono-300) bg-(--color-mono-000) text-(--color-mono-700) hover:bg-(--color-mono-200) hover:text-(--color-mono-900) focus-visible:outline-(--color-pri-800) active:bg-(--color-mono-300) dark:bg-(--color-mono-200) dark:hover:bg-(--color-mono-100);
  }

  :global(body.web-app) .copy-button-web.copy-button-success {
    @apply bg-(--color-mono-200) dark:bg-(--color-mono-100);
  }
</style>
