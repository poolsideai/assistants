#!/usr/bin/env bash
# Install spoolside skill for Claude Code and Codex, plus the `spoolside` CLI command
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../" && pwd)"
SKILL_SRC="$REPO_ROOT/.poolside/skills/spoolside"
CLI_BIN="$SCRIPT_DIR/spoolside.sh"

if [ ! -f "$SKILL_SRC/SKILL.md" ]; then
  echo "Error: SKILL.md not found at $SKILL_SRC"
  exit 1
fi

installed=()

# CLI command → ~/.local/bin/spoolside
mkdir -p "$HOME/.local/bin"
ln -sfn "$CLI_BIN" "$HOME/.local/bin/spoolside"
installed+=("cli → ~/.local/bin/spoolside")

# Claude Code
if [ -d "$HOME/.claude" ]; then
  mkdir -p "$HOME/.claude/skills"
  ln -sfn "$SKILL_SRC" "$HOME/.claude/skills/spoolside"
  installed+=("claude → ~/.claude/skills/spoolside")
fi

# Codex
if [ -d "$HOME/.codex" ]; then
  mkdir -p "$HOME/.codex/skills"
  ln -sfn "$SKILL_SRC" "$HOME/.codex/skills/spoolside"
  installed+=("codex → ~/.codex/skills/spoolside")
fi

for entry in "${installed[@]}"; do
  echo "Installed: $entry"
done

# Remind user to add ~/.local/bin to PATH if not already there
if ! echo "$PATH" | tr ':' '\n' | grep -qx "$HOME/.local/bin"; then
  echo ""
  echo "Add ~/.local/bin to your PATH (if not already):"
  echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
fi
