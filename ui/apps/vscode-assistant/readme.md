<img src="https://www.poolside.ai/assets/vscode-readme.png" alt="Screenshot of Poolside Assistant" width="100%">

# Poolside Assistant for Visual Studio Code

Poolside Assistant for Visual Studio Code is an ACP client for coding agents in
your editor.

## Get started

Once Poolside Assistant is installed, run **Poolside: Show Sidebar** from the
Command Palette. If the Poolside icon appears in the Activity Bar, you can open
it from there too.

For setting up agents, adding connectors, and starting your first conversation,
see [Getting started with Poolside Assistant](https://docs.poolside.ai/tools/poolside-assistant).

## Feedback

To report bugs or request features, join our [Discord](https://discord.com/invite/poolsideai). You
can also email feedback to [feedback@poolside.ai](mailto:feedback@poolside.ai).

## Release build diagnostics

`pnpm -F poolside-assistant build` minifies the webview and extension host.
`dev` keeps watched output readable. Run `check:release-build` after building
to verify bundle budgets and that every runtime resource survives packaging.
Hidden source maps stay outside the VSIX; the release workflow retains them
with `release-provenance.json` in a separate artifact for 90 days. Download the
artifact for the matching release when resolving a minified stack trace.
