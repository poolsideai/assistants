# `@poolsideai/spoolside`

Spoolside is Playwright-based UI automation for Poolside Assistant development.
It keeps a dedicated VS Code instance warm so tests and agents can inspect,
click, type, and screenshot extension UI flows quickly.

## Start

From the repository root:

```sh
pnpm -F @poolsideai/spoolside start
```

Then run:

```sh
spoolside --help
```

Use Spoolside for VS Code assistant UI QA, especially when reproducing and
verifying ACP interaction bugs.

Use `spoolside webErrors` to inspect recent browser console errors and uncaught
page errors from the active target. Add `--all` to include non-error console
entries, `--limit N` to cap output, and `--clear` to reset the buffer.

## Debug And Profile

Spoolside exposes language-focused diagnostics for the helper and desktop shell:

```sh
spoolside debug go [--port PORT]
spoolside profile go <cpu|heap|goroutine|trace> [--seconds N] [-o PATH]
spoolside --desktop debug rust
spoolside --desktop profile rust cpu [--seconds N] [-o PATH] [--format pprof|svg]
```

- Go commands target `poolside-helper`. `debug go` restarts the desktop helper
  under headless Delve and prints a `dlv connect` command. `profile go` reads
  the helper pprof address from helper logs and writes profiles under
  `/tmp/spoolside-profiles` by default.
- Rust commands target the desktop Tauri shell. `debug rust` prints the shell
  PID and LLDB attach commands. `profile rust cpu` is wired to the dev-only
  `spoolside-profiling` Cargo feature, but currently fails fast as unavailable
  while the Tauri profiling bridge is being stabilized.
