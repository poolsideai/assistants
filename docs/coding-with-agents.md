# Working on Poolside Assistant with coding agents

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

The headline tool is **spoolside**: a Playwright-driven CLI that lets an
__POOL_SYNTHETIC_IMPORT_BASELINE__
chat messages, snapshot the accessibility tree, take screenshots, and
__POOL_SYNTHETIC_IMPORT_BASELINE__
**multiple agents in parallel** against multiple instances of the
assistant on the same machine.

## Why spoolside

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

- A snapshot of the accessibility tree, with stable `@e1`, `@e2`
  identifiers an agent can click on.
- A real screenshot in `/tmp/foo.png` an agent can inspect.
- One-shot Poolside-specific commands like `sendMessage`,
  `waitForMessageCount`, `getLastResponse`, `approveAction`, so an
  agent can drive a full conversation.
- A process manager that lets the agent restart a crashed dev server
  without bothering you.

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

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

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

```sh
export PATH="$HOME/.local/bin:$PATH"
```

Verify it worked:

```sh
spoolside --help
```

## Start a target

Spoolside drives either a **VS Code** window or the **desktop app**.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

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
## Snapshots and screenshots

__POOL_SYNTHETIC_IMPORT_BASELINE__

```sh
__POOL_SYNTHETIC_IMPORT_BASELINE__
spoolside snapshot

__POOL_SYNTHETIC_IMPORT_BASELINE__
spoolside snapshot --compact --depth 4

__POOL_SYNTHETIC_IMPORT_BASELINE__
spoolside screenshot -o /tmp/before.png

__POOL_SYNTHETIC_IMPORT_BASELINE__
spoolside screenshot --webview -o /tmp/webview.png

__POOL_SYNTHETIC_IMPORT_BASELINE__
spoolside screenshotElement @e3 -p 8 -o /tmp/button.png

__POOL_SYNTHETIC_IMPORT_BASELINE__
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

__POOL_SYNTHETIC_IMPORT_BASELINE__

```sh
spoolside sendMessage "/help" -- waitForMessageCount 1 30000 -- getLastResponse
```

## Parallel worktrees and the desktop app

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
worktree.

That means you can run **N coding agents on N branches in N worktrees
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

To make this work end-to-end, configure the worktree setup and teardown
scripts in the app to:

```sh
__POOL_SYNTHETIC_IMPORT_BASELINE__
pnpm install && spoolside desktop up
```

```sh
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
```

That's it. The app handles the rest: each new worktree comes up with its
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

```sh
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
```

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
## Managing background services

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

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
