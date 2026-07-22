# Working on Poolside Assistant with coding agents

Poolside Assistant is largely built _with_ coding agents such as Claude, Codex,
and pool. This guide walks through the tooling we rely on so your agents can
use the same workflow.

The headline tool is **spoolside**: a Playwright-driven CLI that lets an
agent drive a real Poolside webview, click buttons, fill inputs, send
chat messages, snapshot the accessibility tree, take screenshots, and
verify behavior end-to-end. Combined with git worktrees, it lets you run
**multiple agents in parallel** against multiple instances of the
assistant on the same machine.

## Why spoolside

Coding agents have limited visibility into UI work unless they can run the app
and inspect the result. Spoolside gives agents that feedback loop:

- A snapshot of the accessibility tree, with stable `@e1`, `@e2`
  identifiers an agent can click on.
- A real screenshot in `/tmp/foo.png` an agent can inspect.
- One-shot Poolside-specific commands like `sendMessage`,
  `waitForMessageCount`, `getLastResponse`, `approveAction`, so an
  agent can drive a full conversation.
- A process manager that lets the agent restart a crashed dev server
  without bothering you.

If your agent is working on a UI bug, **make screenshots mandatory evidence**:
a "before" screenshot before the fix and an "after" screenshot after the fix.
This catches plausible-looking fixes that code review alone can miss.

## Install spoolside

From your local clone:

```sh
ui/packages/spoolside/install.sh
```

That script:

- Symlinks the `spoolside` CLI into `~/.local/bin/`.
- Installs the spoolside skill into `~/.claude/skills/spoolside` (if
  you use Claude Code) and `~/.codex/skills/spoolside` (if you use
  Codex).

Make sure `~/.local/bin` is on your `PATH`; the installer reminds you if it is
not:

```sh
export PATH="$HOME/.local/bin:$PATH"
```

Verify it worked:

```sh
spoolside --help
```

## Start a target

Spoolside drives either a **VS Code** window or the **desktop app**.
Pick one, or both. See [parallel worktrees](#parallel-worktrees-and-the-desktop-app)
below.

```sh
# VS Code with the extension loaded
spoolside vscode up

# Desktop app
spoolside desktop up
```

Each `up` starts a long-running process. Generic spoolside commands
auto-select whichever target is running; pass `--vscode` or `--desktop`
if both are up.

Check what's alive:

```sh
spoolside status
spoolside manage list
```

When you're done, stop each target you started:

```sh
# VS Code
spoolside vscode down

# Desktop app
spoolside desktop down
```

## Snapshots and screenshots

When a target is running:

```sh
# Accessibility tree of the webview, with @e1, @e2, ... refs
spoolside snapshot

# Visible UI subtree of the chat shell
spoolside snapshot --compact --depth 4

# Screenshot
spoolside screenshot -o /tmp/before.png

# Webview region
spoolside screenshot --webview -o /tmp/webview.png

# Screenshot a single element
spoolside screenshotElement @e3 -p 8 -o /tmp/button.png

# Diff a new snapshot against the previous one
spoolside snapshot --diff
```

The pattern an agent should follow when fixing a UI bug:

```sh
# 1. Reproduce.
spoolside sendMessage "trigger the bug" -- waitForMessageCount 1 30000
spoolside screenshot --webview -o /tmp/before.png

# 2. Fix it in the code, hot-reload picks it up.

# 3. Verify.
spoolside newConversation
spoolside sendMessage "trigger the bug" -- waitForMessageCount 1 30000
spoolside screenshot --webview -o /tmp/after.png
```

Both PNGs become evidence in the PR description.

## Driving the chat

Most things you can do in the UI by hand have a spoolside command:

```sh
spoolside sendMessage "Hello world" -- waitForMessageCount 1 30000 -- getLastResponse
spoolside listConversations
spoolside selectConversation --index 2
spoolside newConversation
spoolside stopGeneration
spoolside approveAction once          # respond to a tool-approval dialog
spoolside waitForApproval 30          # wait for one to appear
spoolside restartHelper               # reload VS Code window
spoolside helperLogs 500              # last 500 lines of helper logs
```

Generic webview commands work on any visible panel:

```sh
spoolside click @e3
spoolside fill @e2 "type something"
spoolside hover @e4
spoolside type "raw keyboard input"
spoolside press "Enter"
spoolside text @e7                    # extract text content
spoolside js "document.title"         # evaluate JS in the webview
spoolside component @e3               # find the Svelte component owning an element
```

Use `--` to chain commands so an agent can execute a small script in one shot:

```sh
spoolside sendMessage "/help" -- waitForMessageCount 1 30000 -- getLastResponse
```

## Parallel worktrees and the desktop app

Create worktrees from inside the desktop app, and Poolside Assistant spawns a
dedicated instance of itself for each one. Each instance claims a slot, gets a
distinct title-bar color, and gets its own dev port and spoolside port. You do
not pick colors by hand, manage slots, or keep a terminal open for each
worktree.

That means you can run **N coding agents on N branches in N worktrees
against N desktop apps**. They all run on one machine, can all be driven from
one spoolside CLI, and remain visually distinguishable on your screen.

To make this work end-to-end, configure the worktree setup and teardown
scripts in the app to:

```sh
# Setup: runs when a worktree is created
pnpm install && spoolside desktop up
```

```sh
# Teardown: runs when a worktree is removed
spoolside desktop down
```

That's it. The app handles the rest: each new worktree comes up with its
own colored Poolside Assistant window, ready for an agent to drive with
commands such as `spoolside snapshot` and `spoolside sendMessage`. When the
worktree is torn down, its desktop instance and spoolside server are cleaned up.

Use the same target namespace to show the current slot/ports:

```sh
spoolside desktop status
spoolside desktop env
```

If you run the VS Code target instead, use `spoolside vscode status` and
`spoolside vscode env`.

## Managing background services

Long-running development services, such as Storybook, can run under spoolside's
process manager so an agent can restart them when they crash:

```sh
spoolside manage run pnpm storybook
spoolside manage list
spoolside manage logs storybook --tail 200
spoolside manage restart storybook
spoolside manage stop storybook
```

## When something goes wrong

If a spoolside command fails, the **first** thing to do is run:

```sh
spoolside status
```

Its output is precise about what's wrong and how to fix it. If the
extension UI is rendering garbled log output instead of chat, restart the
managed process:

```sh
spoolside manage list
spoolside manage restart spoolside-s<slot>
```

## Pointers

- Spoolside skill spec: [`.poolside/skills/spoolside/SKILL.md`](../.poolside/skills/spoolside/SKILL.md)
- Spoolside package: [`ui/packages/spoolside/`](../ui/packages/spoolside/)
- The bigger picture for coding agents: [`AGENTS.md`](../AGENTS.md)
