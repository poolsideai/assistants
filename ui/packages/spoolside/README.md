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
