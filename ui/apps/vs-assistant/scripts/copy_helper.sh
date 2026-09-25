#!/usr/bin/env bash

# Get the highest product-produced helper release for Windows and place it in
# the extension's helper directory. POOLSIDE_HELPER_VERSION can pin an exact
# helper/v* release when needed.

set -euo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HELPER_DIR="$SCRIPT_DIR/../helper"
# The helper directory holds only downloaded binaries and is not committed, so
# create it on a fresh checkout before cd'ing into it.
mkdir -p "$HELPER_DIR"
cd "$HELPER_DIR"

REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
helper_repository="${POOLSIDE_HELPER_REPOSITORY:-poolsideai/assistants}"
helper_version="$(bash "$REPO_ROOT/scripts/resolve-helper-release.sh")"

gh release download "$helper_version" --repo "$helper_repository" --pattern '*windows*' --clobber

for f in *.tar.gz; do
  tar -xvf "$f"
done
rm -f -- ./*.tar.gz ./*.checksum

mv poolside-helper-windows-amd64.exe poolside-helper.exe
rm poolside-helper-windows-arm64.exe
