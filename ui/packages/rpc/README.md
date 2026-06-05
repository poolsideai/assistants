# `@poolsideai/rpc`

The contract between three worlds: the editor extension (host), the Svelte
assistant (webview), and `poolside-helper` (local daemon). Types live here
so all three agree on the wire.

```
host  ◀──────  webview RPC  ──────▶  webview (Svelte assistant)
  │
  │ JSON-RPC over stdio (LSP base protocol)
  ▼
poolside-helper
```

The helper API is generated from the helper's OpenAPI surface — to refresh
TypeScript bindings after changing or adding a helper method:

```sh
pnpm -F @poolsideai/helperapi codegen
```

Generated files live in [`@poolsideai/helperapi`](../helperapi/README.md);
don't edit them by hand.

The helper itself, including how to define new JSON-RPC methods, is
documented in [`pkg/poolside-helper`](../../../pkg/poolside-helper/README.md).
