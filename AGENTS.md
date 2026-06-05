# AGENTS.md

Map, not encyclopedia. Small by design - follow the paths.
__POOL_SYNTHETIC_IMPORT_BASELINE__
This repository contains Poolside Assistant: desktop and IDE assistant clients,
shared assistant UI packages, ACP support, and `poolside-helper`.
__POOL_SYNTHETIC_IMPORT_BASELINE__
Scoped `AGENTS.md` files override this file for their subtree. Read the scoped
file before editing a domain you have not touched before. `CLAUDE.md` files are
symlinks to `AGENTS.md` — edit `AGENTS.md`, never add a separate `CLAUDE.md`.

New to the repo? Set up with [`INSTALL.md`](INSTALL.md#build-from-source)
(tool versions come from [`.tool-versions`](.tool-versions)), then read
[`CONTRIBUTING.md`](CONTRIBUTING.md) for how changes land.

## The protocol

Poolside Assistant is a client for agents speaking the
[Agent Client Protocol](https://agentclientprotocol.com/) (ACP). Upstream
protocol and schema documentation live there. Poolside's `_poolside/*`
extension methods are defined in `pkg/acp/README.md`.

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
| Area | Where |
| --- | --- |
| Helper entry point | `cmd/poolside-helper/readme.md` |
| Helper implementation and JSON-RPC handlers | `pkg/poolside-helper/README.md` |
| ACP types and extensions | `pkg/acp/README.md` |
| Helper ACP proxy | `pkg/poolside-helper/internal/handler/acpproxy/` |
| UI workspace | `ui/README.md`, `ui/AGENTS.md` |
| Desktop assistant | `ui/apps/desktop-assistant/README.md` |
| VS Code assistant | `ui/apps/vscode-assistant/readme.md` |
| Visual Studio assistant | `ui/apps/vs-assistant/README.md` |
| Shared assistant webview | `ui/packages/assistant/README.md` |
| Shared ACP UI/state | `ui/packages/features/src/acp/` |
| Mobile remote app | `ui/apps/mobile-remote/README.md` |
| Remote client transport | `ui/packages/remote-client/README.md` |
| Helper remote access server | `pkg/poolside-helper/internal/handler/remoteaccess/` |
| Host/webview RPC | `ui/packages/rpc/README.md` |
| Helper API bindings | `ui/packages/helperapi/README.md` |
| UI automation | `ui/packages/spoolside/README.md` |
| Working with coding agents (spoolside, worktrees) | `docs/coding-with-agents.md` |

__POOL_SYNTHETIC_IMPORT_BASELINE__

Use scoped README files for target-specific commands. Prefer focused tests for
the area touched.

Common entry points:

- Helper: `bazelisk test //pkg/poolside-helper/...`
- UI workspace: `pnpm test`, `pnpm build`
- VS Code assistant: `pnpm -F poolside-assistant test:unit`
- Desktop assistant: `pnpm -F @poolsideai/desktop-assistant check:types`

For UI changes, verify in the running app with spoolside and attach
before/after screenshots as PR evidence — see
[`docs/coding-with-agents.md`](docs/coding-with-agents.md).

## Ways of working

- PRs, issue flow, and where to discuss changes: [`CONTRIBUTING.md`](CONTRIBUTING.md).
- CI lives in `.github/workflows`. Dependency license checks:
  [`docs/license-checks.md`](docs/license-checks.md).
- Run `pnpm fix:format` before pushing UI changes; `gofmt` is enforced for Go.

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
in a scoped `AGENTS.md`, a package README, or an app README.
