# @poolsideai/mobile-remote

Mobile remote-control PWA for the Poolside desktop assistant, served by
poolside-helper over Tailscale (see
`pkg/poolside-helper/internal/handler/remoteaccess/`).

The app is deliberately thin. It renders no chat UI of its own:

- **Shared UI** comes from `@poolsideai/assistant` (`MobilePanel` →
  `MobileShell`) and `@poolsideai/features` (dedicated `Mobile*` components).
- **Transport** comes from `@poolsideai/remote-client` (WebSocket JSON-RPC,
  sequenced session-event gating, device-token auth recovery, the webview
  host adapter). Read that package's README for the architecture and the
  future desktop-over-WebSocket story.
- **This app** owns only the entry gating (pair screen vs app), the pairing
  flow, phone-local theming, the connection pill, and hash routing.

## Storage

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

- the **device token** (`deviceSession.ts` in remote-client) — the credential
  that mints session cookies; it cannot live behind the auth wall it unlocks;
- the **theme preference** (`settings.ts`) — per-device by design (phone can
  run light while the desktop runs dark), and needed before the socket is up
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
`localStorage` keys.

## Running

- `pnpm dev:helper` — builds and spawns poolside-helper with remote access
  enabled against this app's dev server, prints a pairing URL.
- `pnpm dev` — the Vite dev server alone (the helper proxies to it when
  `POOLSIDE_REMOTE_DEV_SERVER` is set).
- `pnpm embed` — builds the bundle and copies it into the helper's
  `//go:embed` dir so the UI ships inside the helper binary.
- `pnpm test:unit`, `pnpm check:types` — the usual checks.
