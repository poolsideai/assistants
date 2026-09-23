let wasmProbe: boolean | undefined;

/**
 * Whether shiki's oniguruma wasm engine can run in this environment. It
 * tokenizes real files 5-15x faster than the JavaScript regex engine and has
 * no pathological grammars — the JS engine never finished a 6.7k-line
 * generated Go file that wasm handles in 240ms. Compiling this 8-byte empty
 * module throws under a CSP without 'wasm-unsafe-eval', keeping such hosts
 * on the JS engine instead of failing highlighter init later.
 */
export function canUseShikiWasmEngine(): boolean {
  wasmProbe ??= (() => {
    try {
      new WebAssembly.Module(new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]));
      return true;
    } catch {
      return false;
    }
  })();
  return wasmProbe;
}

/** The probe result in the form pierre's highlighter options expect. */
export function preferredShikiHighlighter(): "shiki-wasm" | "shiki-js" {
  return canUseShikiWasmEngine() ? "shiki-wasm" : "shiki-js";
}
