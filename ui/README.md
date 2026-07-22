# UI workspace

A pnpm, Svelte, and TypeScript monorepo containing apps, shared packages, and a
shared chat shell.

## The apps

| App           | Package                         | What it is                             |
| ------------- | ------------------------------- | -------------------------------------- |
| Desktop       | `@poolsideai/desktop-assistant` | Tauri v2 standalone client             |
| Mobile remote | `@poolsideai/mobile-remote`     | Remote-control PWA for the desktop app |
| VS Code       | `poolside-assistant`            | VS Code extension                      |
| Visual Studio | `@poolsideai/vs-assistant`      | Webview embedded by the VS extension   |

## The shared packages

| Package                  | What it owns                                            |
| ------------------------ | ------------------------------------------------------- |
| `@poolsideai/assistant`  | The chat shell every host renders                       |
| `@poolsideai/features`   | Cross-cutting features, including ACP UI/state and auth |
| `@poolsideai/components` | Pure UI components, no state                            |
| `@poolsideai/helperapi`  | Generated bindings for the local helper                 |
| `@poolsideai/rpc`        | Host ↔ webview RPC contracts                           |
| `@poolsideai/spoolside`  | Playwright-driven UI automation                         |

## Setup

Tool versions live in the root [`.tool-versions`](../.tool-versions).
From the repo root:

```sh
pnpm install
```

## Day-to-day

```sh
pnpm build
pnpm test
pnpm check:types
pnpm check:lint
```

While iterating, scope commands to one package:

```sh
pnpm -F poolside-assistant test:unit
pnpm -F @poolsideai/assistant test:unit
pnpm -F @poolsideai/desktop-assistant dev
pnpm -F @poolsideai/spoolside start
```

## Generated code

Anything under a `src/gen/` directory is generated. Do not hand-edit these
files; rerun the generator:

- Helper API bindings: `pnpm -F @poolsideai/helperapi codegen`

## Going deeper

- Desktop app: [`apps/desktop-assistant/README.md`](apps/desktop-assistant/README.md)
- VS Code extension: [`apps/vscode-assistant/readme.md`](apps/vscode-assistant/readme.md)
- Visual Studio extension: [`apps/vs-assistant/README.md`](apps/vs-assistant/README.md)
- Shared assistant shell: [`packages/assistant/README.md`](packages/assistant/README.md)
- RPC contracts: [`packages/rpc/README.md`](packages/rpc/README.md)
- Coding agents: [`AGENTS.md`](AGENTS.md)
