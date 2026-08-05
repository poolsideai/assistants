#!/usr/bin/env bash

# Get the highest product-produced helper release for Windows and place it in
# the extension's helper directory. POOLSIDE_HELPER_VERSION can pin an exact
# helper/v* release when needed.

set -euo pipefail
set -x

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
helper_version="$(bash "$REPO_ROOT/scripts/resolve-helper-release.sh")"

__POOL_SYNTHETIC_IMPORT_BASELINE__

for f in *.tar.gz; do
  tar -xvf "$f"
done
rm -f -- ./*.tar.gz ./*.checksum

mv poolside-helper-windows-amd64.exe poolside-helper.exe
rm poolside-helper-windows-arm64.exe
