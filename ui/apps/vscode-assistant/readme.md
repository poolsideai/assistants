<img src="https://www.poolside.ai/assets/vscode-readme.png" alt="Screenshot of Poolside Assistant" width="100%">

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
see [Getting started with Poolside Assistant](https://docs.poolside.ai/tools/poolside-assistant).

## Feedback

To report bugs or request features, join our [Discord](https://discord.com/invite/poolsideai). You
__POOL_SYNTHETIC_IMPORT_BASELINE__

## Release build diagnostics

`pnpm -F poolside-assistant build` minifies the webview and extension host.
`dev` keeps watched output readable. Run `check:release-build` after building
to verify bundle budgets and that every runtime resource survives packaging.
Hidden source maps stay outside the VSIX; the release workflow retains them
with `release-provenance.json` in a separate artifact for 90 days. Download the
artifact for the matching release when resolving a minified stack trace.
