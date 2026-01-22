#!/bin/bash
#
# Setup script to install required asdf plugins and tools
# Automatically detects required plugins from .tool-versions
#

set -euo pipefail

# ANSI color codes
BOLD='\033[1m'
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
CYAN='\033[36m'
RESET='\033[0m'

echo -e "${BOLD}${CYAN}=== asdf Setup ===${RESET}"

RUST_MANIFEST="${PWD}/ui/apps/desktop-assistant/src-tauri/Cargo.toml"

# mr boxington (mbx) wraps cargo with a machine-wide build cache so every
# worktree shares compiled artifacts: https://mr-boxington.jdx.dev
# It is the desktop assistant's cargo runner (tauri.conf.json > build.runner).
MBX_VERSION="1.11.1"

setup_rust() {
    echo ""
    echo -e "${BOLD}${CYAN}=== Rust Setup ===${RESET}"

    local has_rustup=false
    if command -v rustup >/dev/null 2>&1; then
        has_rustup=true
    fi

    if ! command -v rustc >/dev/null 2>&1 || ! command -v cargo >/dev/null 2>&1; then
        if [ "$has_rustup" = true ]; then
            echo -e "${CYAN}Installing stable Rust toolchain with rustup...${RESET}"
            rustup toolchain install stable --profile minimal
            rustup default stable
            export PATH="${HOME}/.cargo/bin:${PATH}"
        else
            echo -e "${RED}Error: rustc and cargo are required for the desktop assistant${RESET}"
            echo "Install Rust with rustup, then rerun make setup:"
            echo -e "  ${CYAN}curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh${RESET}"
            exit 1
        fi
    fi

    if ! command -v rustc >/dev/null 2>&1; then
        echo -e "${RED}Error: rustc is still unavailable after Rust setup${RESET}"
        exit 1
    fi

    if ! command -v cargo >/dev/null 2>&1; then
        echo -e "${RED}Error: cargo is still unavailable after Rust setup${RESET}"
        exit 1
    fi

    echo -e "  ${GREEN}✓${RESET} $(rustc --version)"
    echo -e "  ${GREEN}✓${RESET} $(cargo --version)"

    if [ -f "$RUST_MANIFEST" ]; then
        echo -e "${CYAN}Fetching Rust dependencies for desktop assistant...${RESET}"
        cargo fetch --locked --manifest-path "$RUST_MANIFEST"
    fi
}

setup_mbx() {
    echo ""
    echo -e "${BOLD}${CYAN}=== mr boxington Setup (shared Rust build cache) ===${RESET}"

    if command -v mbx >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${RESET} $(mbx --version)"
        return
    fi

    local triple=""
    case "$(uname -s)-$(uname -m)" in
        Darwin-arm64) triple="aarch64-apple-darwin" ;;
        Linux-x86_64) triple="x86_64-unknown-linux-gnu" ;;
        Linux-aarch64 | Linux-arm64) triple="aarch64-unknown-linux-gnu" ;;
    esac

    if [ -z "$triple" ]; then
        echo -e "${CYAN}No mbx release archive for this platform; building with cargo...${RESET}"
        cargo install mbx --locked
        echo -e "  ${GREEN}✓${RESET} $(mbx --version)"
        return
    fi

    echo -e "${CYAN}Installing mbx ${MBX_VERSION} to ~/.local/bin...${RESET}"
    local archive="mbx-${triple}.tar.gz"
    local release="https://github.com/jdx/mr-boxington/releases/download/v${MBX_VERSION}"
    local tmpdir
    tmpdir=$(mktemp -d)
    curl -fsSLo "${tmpdir}/${archive}" "${release}/${archive}"
    curl -fsSLo "${tmpdir}/SHA256SUMS" "${release}/SHA256SUMS"
    if command -v sha256sum >/dev/null 2>&1; then
        (cd "$tmpdir" && grep "  ${archive}\$" SHA256SUMS | sha256sum --check --strict -)
    else
        (cd "$tmpdir" && grep "  ${archive}\$" SHA256SUMS | shasum -a 256 --check --strict -)
    fi
    mkdir -p "${HOME}/.local/bin"
    tar -xzf "${tmpdir}/${archive}" -C "${HOME}/.local/bin"
    rm -rf "$tmpdir"

    echo -e "  ${GREEN}✓${RESET} $("${HOME}/.local/bin/mbx" --version)"
    case ":${PATH}:" in
        *":${HOME}/.local/bin:"*) ;;
        *)
            echo -e "  ${YELLOW}⚠${RESET} ~/.local/bin is not on your PATH; desktop builds need to find mbx there"
            ;;
    esac
}

# Check if asdf is installed
if ! command -v asdf >/dev/null 2>&1; then
    echo -e "${RED}Error: asdf is not installed${RESET}"
    echo "Please install asdf first: https://asdf-vm.com/guide/getting-started.html"
    exit 1
fi

# Check if .tool-versions exists
if [ ! -f .tool-versions ]; then
    echo -e "${RED}Error: .tool-versions file not found${RESET}"
    echo "Please run this script from the repository root"
    exit 1
fi

PLUGINS_CHANGED=false
MISSING_TOOLS=false
FAILED_PLUGINS=()

# Read .tool-versions and check plugins and versions
echo -e "${CYAN}Checking plugins and tools from .tool-versions...${RESET}"
while IFS= read -r line; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^# ]] && continue

    # Extract tool name and version
    read -r tool version _ <<< "$line"

    # Validate tool and version are non-empty
    if [ -z "$tool" ] || [ -z "$version" ]; then
        echo -e "  ${YELLOW}⚠${RESET} Skipping malformed line: $line"
        continue
    fi

    # Check if plugin is already installed
    if ! asdf plugin list | grep -Fxq "$tool"; then
        echo -e "  Installing ${BOLD}${tool}${RESET} plugin..."
        # Try to add plugin by short name (uses asdf plugin repository)
        if asdf plugin add "$tool" 2>/dev/null; then
            echo -e "    ${GREEN}✓${RESET} ${tool} plugin installed"
            PLUGINS_CHANGED=true
        else
            echo -e "    ${YELLOW}⚠${RESET} Failed to install ${tool} plugin automatically"
            echo "    You may need to install it manually with:"
            echo -e "    ${CYAN}asdf plugin add ${tool} <plugin-url>${RESET}"
            FAILED_PLUGINS+=("$tool")
            continue
        fi
    fi

    # Check if this version is installed
    if asdf list "$tool" 2>/dev/null | grep -q "^[* ]*${version}$"; then
        echo -e "  ${GREEN}✓${RESET} ${tool} ${version}"
    else
        echo -e "  ${YELLOW}→${RESET} ${tool} ${version} (needs install)"
        MISSING_TOOLS=true
    fi
done < .tool-versions

# Install tools if needed (only if no plugins failed)
if [ ${#FAILED_PLUGINS[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}Failed to install plugins: ${FAILED_PLUGINS[*]}${RESET}"
    echo -e "${YELLOW}Please install the missing plugins manually before running 'asdf install'${RESET}"
    exit 1
elif [ "$MISSING_TOOLS" = true ]; then
    echo ""
    echo -e "${CYAN}Installing missing tools...${RESET}"
    asdf install
fi

# Regenerate shims if anything changed
if [ "$PLUGINS_CHANGED" = true ] || [ "$MISSING_TOOLS" = true ]; then
    echo ""
    echo -e "${CYAN}Regenerating shims...${RESET}"
    asdf reshim

    echo ""
    echo -e "${GREEN}✓ Done! Changes have been applied${RESET}"
    echo ""
    echo -e "${YELLOW}To use the newly installed tools in your current shell, run:${RESET}"

    # Detect user's shell from $SHELL environment variable
    USER_SHELL=$(basename "${SHELL:-bash}")
    case "$USER_SHELL" in
        zsh)
            echo -e "  ${BOLD}${GREEN}rehash${RESET}"
            ;;
        fish)
            echo -e "  ${BOLD}${GREEN}(Restart your shell)${RESET}"
            ;;
        bash|sh|dash|ksh)
            echo -e "  ${BOLD}${GREEN}hash -r${RESET}"
            ;;
        *)
            echo -e "  ${BOLD}${GREEN}hash -r${RESET}    (for bash/sh)"
            echo -e "  ${BOLD}${GREEN}rehash${RESET}     (for zsh)"
            ;;
    esac

    echo ""
    echo -e "${CYAN}Or simply restart your terminal/shell session.${RESET}"
else
    echo ""
    echo -e "${GREEN}✓ Everything is already up to date!${RESET}"
fi

setup_rust
setup_mbx
