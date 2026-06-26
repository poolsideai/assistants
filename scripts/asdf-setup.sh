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
__POOL_SYNTHETIC_IMPORT_BASELINE__

setup_rust
setup_mbx
