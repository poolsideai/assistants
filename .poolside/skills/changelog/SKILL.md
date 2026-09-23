---
name: changelog
description: Generate release changelogs for the Desktop and VS Code assistants from PRs merged since their last release. Use when asked to write, draft, or generate a changelog or release notes for Desktop, VS Code, or both surfaces.
---

# Assistant Changelog Generation

Generate per-surface changelogs (Desktop and/or VS Code) from the PRs merged
since each surface's last release. Output is grouped into **Headlines** and
**Other**.

## Release model (read this first)

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

## Steps

__POOL_SYNTHETIC_IMPORT_BASELINE__
   ```bash
   git fetch --tags
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   ```bash
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
   ```

__POOL_SYNTHETIC_IMPORT_BASELINE__
   ```bash
__POOL_SYNTHETIC_IMPORT_BASELINE__
   ```
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__
   ```bash
   for pr in NNN NNN ...; do
     gh pr view $pr --json number,title,author,url,body \
       --jq '{n:.number,t:.title,a:.author.login,u:.url}'
     gh pr view $pr --json files --jq '.files[].path'
   done
   ```

__POOL_SYNTHETIC_IMPORT_BASELINE__

__POOL_SYNTHETIC_IMPORT_BASELINE__

## Surface classification

Decide by the files a PR touches:

| Files touched | Surface |
| --- | --- |
| `ui/packages/features/**`, `ui/packages/components/**`, `ui/packages/assistant/**`, `ui/config/**` | **Shared** → both surfaces (the ACP conversation UI) |
| `ui/apps/desktop-assistant/**` (esp. `src-tauri/`) | Desktop |
| `ui/apps/vscode-assistant/**` | VS Code |
| `pkg/`, `cmd/` (helper only), `docs/`, `*.md`, `scripts/`, `.vscode/launch.json` | **Not user-facing** → exclude from both |

**Critical nuance:** some features live in the *shared* `features/src/acp`
package but are **Desktop-only** because the VS Code extension delegates those to
the editor itself. Desktop-only IDE features:

- App **sidebar** (project/chat/branch tree)
- **cmd-K** conversation picker / command palette
- Integrated **terminal** and multi-**pane** layout
- Git **diff panel**
- Native OS **notifications**

When a PR in `features/src/acp` is about one of these (title/body mention
"sidebar", "cmd-k", "terminal", "pane", "diff panel", "desktop notification"),
classify it **Desktop-only** even though the code is shared. Verify with:
```bash
# If these return no hits, the feature is Desktop-only (VS Code doesn't render it):
__POOL_SYNTHETIC_IMPORT_BASELINE__
```
The genuinely shared chat UI — prompt editor, session/turn rendering, plan/todo,
model picker, interrupted-turn layout — ships to **both**.

Many PRs touch a shared package *and* `vscode-assistant/**` or
`desktop-assistant/**` (e.g. an app icon, or a feature wired into both hosts) —
those are **both**.

## Output format

Two sections (Desktop, VS Code). Each has **Headlines** (big user-facing features
/ redesigns) and **Other** (smaller features, fixes, polish). Skip a subsection
if empty.

```
Headlines:

* SUMMARY - [#NNN](URL) @user

Other:

* SUMMARY - [#NNN](URL) @user
```

- URL form: `https://github.com/poolsideai/assistant/pull/NNN`.
- `@user` is the PR author's GitHub login (`.author.login`).
- **Group** related PRs into one entry when they form a coherent story; place each
  PR link next to its author:
  `* SUMMARY - [#1](URL) @userA, [#2](URL) @userB`
- **Split** one PR into multiple entries when it ships multiple changelog-worthy
  features — reuse the same `[#NNN](URL) @user` on each entry.
- SUMMARY is user-facing: describe the outcome, not the implementation.

## Guidance

- Headlines: net-new features, redesigns, brand changes (e.g. new app icon).
  Everything else — fixes, polish, small UX tweaks — goes to Other.
- The Desktop list is a superset: shared PRs + Desktop-only PRs. The VS Code list
  is shared PRs only (unless a PR touches `vscode-assistant/**` specifically).
- Close by flagging any borderline Desktop-only-vs-shared calls so the user can
  correct the split.
