# UI workspace

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

## The apps

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

## The shared packages

| Package                  | What it owns                                            |
| ------------------------ | ------------------------------------------------------- |
| `@poolsideai/assistant`  | The chat shell every host renders                       |
__POOL_SYNTHETIC_IMPORT_BASELINE__
| `@poolsideai/components` | Pure UI components, no state                            |
| `@poolsideai/helperapi`  | Generated bindings for the local helper                 |
__POOL_SYNTHETIC_IMPORT_BASELINE__
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

__POOL_SYNTHETIC_IMPORT_BASELINE__

```sh
pnpm -F poolside-assistant test:unit
pnpm -F @poolsideai/assistant test:unit
pnpm -F @poolsideai/desktop-assistant dev
pnpm -F @poolsideai/spoolside start
```

## Generated code

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

## Going deeper

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
