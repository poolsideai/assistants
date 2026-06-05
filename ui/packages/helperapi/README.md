# `@poolsideai/helperapi`

Generated TypeScript bindings for the `poolside-helper` JSON-RPC API.

The helper is not an HTTP API, but it exposes OpenAPI-shaped method and schema
metadata so clients can generate typed bindings.

## Regenerate

From the repository root:

```sh
pnpm -F @poolsideai/helperapi codegen
```

Generated files live under `src/gen`. Do not edit generated files directly.

## Related

- Helper implementation: `../../../pkg/poolside-helper/README.md`
- RPC contracts: `../rpc/README.md`
