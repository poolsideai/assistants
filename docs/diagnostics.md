# Diagnostics

Poolside Assistant does not send usage metrics or error reports to a reporting
service. Errors and diagnostic events stay on the machine, in a place the user
can inspect when troubleshooting:

- **Helper** (`poolside-helper`): structured `slog` records on stderr, which
  each host captures into its own log below.
- **Desktop app**: the helper session log under the app's log directory
  (`poolside-helper-<timestamp>.log`, opened by the "Show logs" action).
  Errors reported by the assistant webview and startup diagnostics are appended
  to the same file as `webview-diag:` lines, so webview and helper activity
  interleave chronologically.
- **VS Code extension**: the Poolside output channel, one JSON line per event.
- **Visual Studio extension**: the "Poolside Assistant Diagnostics" output
  window pane. The helper's own output is in the "Poolside Helper Logs" pane.
- **Mobile remote**: the browser console only.
