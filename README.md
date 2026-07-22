# Poolside Assistant
__POOL_SYNTHETIC_IMPORT_BASELINE__
**An AI coding assistant for your editor and desktop.**

Poolside Assistant is an open-source client for coding agents. Use it from the
desktop app, VS Code, or Visual Studio.

Connect agents that support the
[Agent Client Protocol](https://agentclientprotocol.com/), including
[pool](https://github.com/poolsideai/pool), Codex, Claude, and other compatible
agents.

Chat with your agent in one consistent UI across the surfaces you use.

## Features

- **Universal ACP client.** Use compatible agents such as Claude, Codex, and
  Cursor, install community agents from the
  [Agent Client Protocol](https://agentclientprotocol.com/) registry, or bring
  your own agent.
- **Bundled Poolside agent.** Use Poolside's own ACP agent,
  [pool](https://github.com/poolsideai/pool), built around Poolside models
  trained specifically for software engineering and integrated into the
  assistant UI.
- **Multiple surfaces.** Run Poolside Assistant as a desktop app or as an
  extension inside VS Code or Visual Studio, with a consistent assistant
  experience across each surface.
- **Desktop workflows for larger changes.** Use worktrees, GitHub awareness,
  built-in terminals, and change review tools from the desktop app.
- **Optional on-device models.** In the desktop app on Apple Silicon,
  download and run supported models locally.
- **Remote access.** Drive your desktop assistant from your phone over
  Tailscale.
- **Voice input.** Dictate prompts instead of typing them.
- **Open source.** Apache-2.0 licensed, free to use, modify, and ship in
  your own developer environment. Contributions welcome.

## Install

Prebuilt releases are available for the desktop app, VS Code extension, and
Visual Studio extension.

| Surface                             | Status    | Download                                                                                                      |
| ----------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------- |
| **Desktop** — macOS (Apple Silicon) | Available | [Newest `desktop/v*` release](https://github.com/poolsideai/assistant/releases?q=desktop%2Fv)                  |
| **VS Code** extension               | Available | [Newest `vscode-assistant/v*` release](https://github.com/poolsideai/assistant/releases?q=vscode-assistant%2Fv) |
| **Visual Studio** extension         | Available | [Newest `vs-assistant/v*` release](https://github.com/poolsideai/assistant/releases?q=vs-assistant%2Fv)        |

For install instructions, see
[Install a prebuilt release](./INSTALL.md#install-a-prebuilt-release). After
installing, see
[Getting started with Poolside Assistant](./docs/getting-started.md) to choose
an agent and start a conversation.

Need a build for another platform?
[Start a discussion](https://github.com/poolsideai/assistant/discussions) or
[build Poolside Assistant from source](./INSTALL.md#build-from-source).

## Issues and discussions

Bugs, feature requests, agent compatibility reports, rough edges, and questions —
we'd like to hear all of it. Please start in
[GitHub Discussions](https://github.com/poolsideai/assistant/discussions)
rather than opening an issue directly.

We keep the issue tracker for accepted, well-understood work that's ready to pick
up, so every open issue is actionable. Maintainers convert discussions into
issues when the work is clear.

This model is based on
[Ghostty's contribution process](https://github.com/ghostty-org/ghostty/blob/main/CONTRIBUTING.md),
which keeps discussions and actionable work separate.

## Contributing

For development docs, app README links, and contribution guidelines, see
[Contributing](./CONTRIBUTING.md). If you use a coding agent to work on this
repository, see
[Working on Poolside Assistant with coding agents](./docs/coding-with-agents.md).
Dependency license policy docs live in
[License checks](./docs/license-checks.md).

## License

Poolside Assistant is licensed under the Apache License 2.0.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](./LICENSE)

## Trademarks

For usage of Poolside's brand, please see our [Trademark Guidelines](https://poolside.ai/legal/trademark-guidelines).

---

Built by [Poolside](https://poolside.ai).
