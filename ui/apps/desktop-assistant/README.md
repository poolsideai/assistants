__POOL_SYNTHETIC_IMPORT_BASELINE__

Tauri v2 shell for the Poolside desktop assistant.

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
The app uses Tauri's isolation IPC pattern. The main webview is built from
`src/`, while the isolation application is intentionally tiny and built from
`isolation/` into `dist-isolation/`.

Native navigation callbacks only allow app documents and `about:blank`/`about:srcdoc`;
they never launch external applications, and new windows are denied. The main,
changelog, and licenses documents use `installExternalLinkHandler` to open clicked
HTTP(S) and mailto links through the explicit `open_external_url` command. Keep this
handler installed when adding another document window.

```sh
pnpm -F @poolsideai/desktop-assistant dev
pnpm -F @poolsideai/desktop-assistant build:web
pnpm -F @poolsideai/desktop-assistant check:types
pnpm -F @poolsideai/desktop-assistant test:unit
```

## Rust build cache

`tauri.conf.json` sets [mr boxington](https://mr-boxington.jdx.dev) (`mbx`) as
the cargo runner, so `tauri dev` and `tauri build` share compiled artifacts
across every checkout and worktree on the machine (`make setup` installs it;
see [INSTALL.md](../../../INSTALL.md#build-from-source)). On a checkout without
an existing `src-tauri/target/`, mbx also replaces `target/` with a symlink
into its managed store, so abandoned worktrees stop stranding gigabytes. A
checkout that already has a real `target/` keeps it; delete that directory once
to move the worktree onto the managed store.

To build without it, pass the runner explicitly:

```sh
pnpm -F @poolsideai/desktop-assistant tauri build --runner cargo
```

CI release builds do this on purpose — published artifacts must not come out
of a shared cache. Direct `cargo` commands against `src-tauri/Cargo.toml`
still work; they just skip the cache unless you prefix them with `mbx`.

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
The macOS app icon source is `src-tauri/icons/icon.icon`. After editing it in
Icon Composer, export its default 1024 px PNG to `src-tauri/icons/icon-source.png`,
then regenerate the legacy Tauri icons and the adaptive macOS asset:

```sh
pnpm -F @poolsideai/desktop-assistant tauri icon src-tauri/icons/icon-source.png
pnpm -F @poolsideai/desktop-assistant icons:macos
```

Keep Icon Composer sources under `src-tauri/icons`, outside `public`: Vite copies
every public file into the shipped webview. The remaining public files are the
HTML favicon, two interactive-logo models and the two complete terminal Nerd Font
faces. Terminal fonts are requested when the chosen terminal font is used; retain
their private-use glyphs. Shared Vite configuration keeps KaTeX's original WOFF2
faces and removes its redundant WOFF/TTF fallbacks for the supported modern hosts.

Bootstrap reads share one pre-mount snapshot in `src/desktopBootstrap.ts`.
Settings, version, home directory and accent reconciliation overlap. Theme and
font application must finish before mount; focus/fullscreen probes run together
after that phase so slow settings cannot age the initial window state. The
Node-based unit tests in `src/desktopBootstrap.test.ts` cover this ordering and
startup failure propagation. Keep the Node runner scoped to that suite; CI runs
the external-link DOM tests separately with Vitest.
