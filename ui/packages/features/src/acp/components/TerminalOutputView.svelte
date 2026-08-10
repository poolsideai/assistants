<script lang="ts">
  import { FitAddon } from "@xterm/addon-fit";
  import { Terminal, type ITheme, type ITerminalOptions } from "@xterm/xterm";
  import { onDestroy, onMount, tick } from "svelte";
  import { installTerminalLinks } from "./terminalLinks";
  import "@xterm/xterm/css/xterm.css";

  interface Props {
    buffer?: string;
    bufferStartOffset?: number;
    class?: string;
    placeholder?: string;
  }

  type TerminalCursorPreference = "block" | "bar" | "underline";
  type XtermCursorStyle = NonNullable<ITerminalOptions["cursorStyle"]>;
  type XtermCursorInactiveStyle = NonNullable<ITerminalOptions["cursorInactiveStyle"]>;

  let { buffer = "", bufferStartOffset = 0, class: className, placeholder = "" }: Props = $props();

  let container = $state<HTMLDivElement | null>(null);
  let term = $state<Terminal | null>(null);
  let fit = $state<FitAddon | null>(null);
  let renderedBufferEndOffset = $state(0);
  let styleRevision = $state(0);
  let resizeObserver: ResizeObserver | null = null;
  const bufferEndOffset = $derived(bufferStartOffset + buffer.length);

  $effect(() => {
    if (!container || term) return;
    void renderTerminal();
  });

  $effect(() => {
    if (!term) return;
    if (renderedBufferEndOffset < bufferStartOffset || renderedBufferEndOffset > bufferEndOffset) {
      term.reset();
      term.write(buffer);
    } else if (bufferEndOffset > renderedBufferEndOffset) {
      term.write(buffer.slice(renderedBufferEndOffset - bufferStartOffset));
    }
    renderedBufferEndOffset = bufferEndOffset;
    requestAnimationFrame(() => term?.scrollToBottom());
  });

  $effect(() => {
    const revision = styleRevision;
    const terminal = term;
    void revision;
    if (!terminal) return;
    void applyTerminalStyles();
  });

  onMount(() => {
    const observer = new MutationObserver(() => {
      styleRevision += 1;
    });
    for (const element of [document.documentElement, document.body]) {
      observer.observe(element, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });
    }
    return () => observer.disconnect();
  });

  async function renderTerminal() {
    disposeTerminal();
    await tick();
    if (!container) return;

    const { cursorInactiveStyle, cursorStyle, fontFamily, fontSize, lineHeight, theme } =
      terminalStyle();
    await ensureTerminalFont(fontFamily, fontSize);
    if (!container) return;

    container.replaceChildren();
    const nextTerm = new Terminal({
      allowTransparency: false,
      convertEol: true,
      cursorBlink: false,
      cursorInactiveStyle,
      cursorStyle,
      disableStdin: true,
      fontFamily,
      fontSize,
      lineHeight,
      scrollback: 10_000,
      theme,
    });
    const nextFit = new FitAddon();
    nextTerm.loadAddon(nextFit);
    installTerminalLinks(nextTerm);
    nextTerm.open(container);
    term = nextTerm;
    fit = nextFit;
    installResizeObserver();
    fitTerminal({ retries: 4 });
    nextTerm.write(buffer);
    renderedBufferEndOffset = bufferEndOffset;
  }

  async function applyTerminalStyles() {
    const terminal = term;
    if (!terminal) return;

    const { cursorInactiveStyle, cursorStyle, fontFamily, fontSize, lineHeight, theme } =
      terminalStyle();
    await ensureTerminalFont(fontFamily, fontSize);
    if (terminal !== term) return;

    terminal.options.cursorInactiveStyle = cursorInactiveStyle;
    terminal.options.cursorStyle = cursorStyle;
    terminal.options.fontFamily = fontFamily;
    terminal.options.fontSize = fontSize;
    terminal.options.lineHeight = lineHeight;
    terminal.options.theme = theme;
    fitTerminal({ retries: 2 });
  }

  function installResizeObserver() {
    resizeObserver?.disconnect();
    if (!container) return;
    resizeObserver = new ResizeObserver(() => fitTerminal());
    resizeObserver.observe(container);
  }

  function fitTerminal({ retries = 1 } = {}) {
    if (!fit || !term) return;
    requestAnimationFrame(() => {
      if (!fit || !term) return;
      if (!container || container.clientWidth < 40 || container.clientHeight < 40) {
        if (retries > 1) {
          window.setTimeout(() => fitTerminal({ retries: retries - 1 }), 50);
        }
        return;
      }
      fit.fit();
      term.scrollToBottom();
      if (retries > 1) {
        window.setTimeout(() => fitTerminal({ retries: retries - 1 }), 50);
      }
    });
  }

  function disposeTerminal() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    term?.dispose();
    term = null;
    fit = null;
    renderedBufferEndOffset = 0;
    container?.replaceChildren();
  }

  function readVariable(name: string) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  let fontReady: Promise<unknown> | null = null;
  let fontReadyKey = "";
  function ensureTerminalFont(fontFamily: string, fontSize: number): Promise<unknown> {
    if (typeof document === "undefined" || !("fonts" in document)) return Promise.resolve();
    const key = `${fontSize}:${fontFamily}`;
    if (!fontReady || fontReadyKey !== key) {
      fontReadyKey = key;
      fontReady = Promise.all([
        document.fonts.load(`${fontSize}px ${fontFamily}`),
        document.fonts.load(`bold ${fontSize}px ${fontFamily}`),
      ]).catch(() => undefined);
    }
    return fontReady;
  }

  function terminalStyle() {
    const fontFamily = readVariable("--psx-terminal-font") || "Menlo, Monaco, Consolas, monospace";
    const fontSize = readFontSize();
    return {
      ...terminalCursorOptions(),
      fontFamily,
      fontSize,
      lineHeight: readLineHeight(),
      theme: getTheme(),
    };
  }

  function terminalCursorOptions(): {
    cursorStyle: XtermCursorStyle;
    cursorInactiveStyle: XtermCursorInactiveStyle;
  } {
    const preference = readTerminalCursorPreference();
    if (preference === "bar") return { cursorStyle: "bar", cursorInactiveStyle: "bar" };
    if (preference === "underline") {
      return { cursorStyle: "underline", cursorInactiveStyle: "underline" };
    }
    return { cursorStyle: "block", cursorInactiveStyle: "block" };
  }

  function readTerminalCursorPreference(): TerminalCursorPreference {
    const value = readVariable("--psx-terminal-cursor-style");
    if (value === "bar" || value === "underline") return value;
    return "block";
  }

  function readNumVariableWithDefault(name: string, defaultVal: number) {
    const num = parseInt(readVariable(name), 10);
    return num === 0 || Number.isNaN(num) ? defaultVal : num;
  }

  function readFontSize() {
    return readNumVariableWithDefault("--psx-terminal-font-size", 13);
  }

  function readLineHeight() {
    const value = readVariable("--psx-terminal-line-height");
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed) || parsed <= 0) return 1.25;
    if (value.endsWith("px")) return Math.max(1, parsed / readFontSize());
    return Math.min(Math.max(parsed, 1), 2);
  }

  function getTheme(): ITheme {
    return {
      foreground: readVariable("--psx-terminal-foreground"),
      background:
        readVariable("--psx-terminal-background") || readVariable("--psx-editor-background"),
      cursor: readVariable("--psx-terminal-cursor"),
      cursorAccent: readVariable("--psx-terminal-cursor-accent"),
      selectionBackground: readVariable("--psx-terminal-selection-background"),
      selectionForeground: readVariable("--psx-terminal-selection-foreground"),
      selectionInactiveBackground: readVariable("--psx-terminal-selection-inactive-background"),
      black: readVariable("--psx-terminal-black"),
      red: readVariable("--psx-terminal-red"),
      green: readVariable("--psx-terminal-green"),
      yellow: readVariable("--psx-terminal-yellow"),
      blue: readVariable("--psx-terminal-blue"),
      magenta: readVariable("--psx-terminal-magenta"),
      cyan: readVariable("--psx-terminal-cyan"),
      white: readVariable("--psx-terminal-white"),
      brightBlack: readVariable("--psx-terminal-bright-black"),
      brightRed: readVariable("--psx-terminal-bright-red"),
      brightGreen: readVariable("--psx-terminal-bright-green"),
      brightYellow: readVariable("--psx-terminal-bright-yellow"),
      brightBlue: readVariable("--psx-terminal-bright-blue"),
      brightMagenta: readVariable("--psx-terminal-bright-magenta"),
      brightCyan: readVariable("--psx-terminal-bright-cyan"),
      brightWhite: readVariable("--psx-terminal-bright-white"),
    };
  }

  onDestroy(disposeTerminal);
</script>

<div class={["terminal-output", className]}>
  <div bind:this={container} class="terminal-output-xterm"></div>
  {#if !buffer && placeholder}
    <div class="terminal-output-placeholder">{placeholder}</div>
  {/if}
</div>

<style lang="postcss">
  .terminal-output {
    position: relative;
    min-width: 0;
    height: 260px;
    overflow: hidden;
    background: var(--psx-terminal-background);
  }

  .terminal-output-xterm {
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    overflow: hidden;
    text-align: left;
  }

  .terminal-output-xterm :global(.xterm) {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 8px 10px 14px;
  }

  .terminal-output-xterm :global(.xterm-screen) {
    position: relative;
  }

  .terminal-output-xterm :global(.xterm-selection div) {
    background-color: var(--psx-terminal-selection-background) !important;
  }

  .terminal-output-xterm :global(.xterm:not(.focus) .xterm-selection div) {
    background-color: var(--psx-terminal-selection-inactive-background) !important;
  }

  .terminal-output-xterm :global(.xterm-viewport) {
    overflow-y: auto;
    scrollbar-width: thin;
  }

  .terminal-output-xterm :global(.xterm-screen),
  .terminal-output-xterm :global(.xterm-rows) {
    width: 100% !important;
  }

  .terminal-output-placeholder {
    color: var(--psx-foreground-tertiary);
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding: 8px 10px;
    font-size: 12px;
    pointer-events: none;
  }
</style>
