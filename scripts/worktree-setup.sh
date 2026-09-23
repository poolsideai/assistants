#!/usr/bin/env bash
# Set up a fresh worktree: seed caches from the main worktree, then install.
# Run from the root of the new worktree.
set -euo pipefail

worktree="$PWD"
# The first entry in `git worktree list` is always the main worktree.
main="$(git worktree list --porcelain | head -n1 | sed 's/^worktree //')"

if [[ "$main" != "$worktree" ]]; then
  # APFS copy-on-write clone: near-instant and uses no extra disk.
  # Falls back to a plain copy if the worktree is on another volume.
  seed() {
    local src="$main/$1" dst="$worktree/$1"
    [[ -d $src && ! -e $dst ]] || return 0
    mkdir -p "$(dirname "$dst")"
    cp -Rc "$src" "$dst" 2>/dev/null || cp -R "$src" "$dst"
    echo "seeded $1"
  }

  # node_modules for the root and every workspace package. This also
  # carries the turbo and vite caches living under node_modules/.cache.
  while IFS= read -r dir; do
    seed "${dir#"$main"/}"
  done < <(find "$main" \
      \( -name .claude -o -name 'bazel-*' -o -name .git \) -prune -o \
      -type d -name node_modules -print -prune)

  # Rust (Tauri) build cache
  seed ui/apps/desktop-assistant/src-tauri/target
fi

pnpm install
