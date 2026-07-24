#!/usr/bin/env bash

# Installs helper binaries into the extension from product-release Actions
# artifacts or the newest permanent helper release.

set -euo pipefail
set -x

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# dist is ../dist relative to the script
DIST_DIR="${SCRIPT_DIR}/../dist"
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

mkdir -p "$DIST_DIR"
cd "$DIST_DIR"

runtime_artifact_dir="${POOLSIDE_RUNTIME_ARTIFACT_DIR:-}"

if [[ -n "$runtime_artifact_dir" ]]; then
  [[ -d "$runtime_artifact_dir" ]] || {
    echo "Release runtime artifact directory does not exist: $runtime_artifact_dir" >&2
    exit 1
  }
  helper_version="${POOLSIDE_RUNTIME_VERSION:-source/unknown}"
else
  REPO_ROOT="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel)"
  helper_version="$(bash "$REPO_ROOT/scripts/resolve-helper-release.sh")"
fi

rm -f -- poolside-helper-* poolside-mlx-sidecar-* poolside-whisper-server-* \
  ./*.tar.gz ./*.checksum ./*.metallib

__POOL_SYNTHETIC_IMPORT_BASELINE__
supplemental_patterns=()
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    supplemental_patterns+=("poolside-whisper-server-darwin-arm64.tar.gz")
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
copy_runtime_asset() {
  local pattern="$1"
  local source="$runtime_artifact_dir/$pattern"
  [[ -f "$source" ]] || {
    echo "Required release runtime artifact not found: $source" >&2
    exit 1
  }
  cp "$source" .
}

if [[ -n "$runtime_artifact_dir" ]]; then
  if [[ -n "$helper_pattern" ]]; then
    copy_runtime_asset "$helper_pattern"
    for pattern in "${supplemental_patterns[@]}"; do
      copy_runtime_asset "$pattern"
    done
  else
    for pattern in \
      poolside-helper-darwin-amd64.tar.gz \
      poolside-helper-darwin-arm64.tar.gz \
      poolside-helper-linux-amd64.tar.gz \
      poolside-helper-linux-arm64.tar.gz \
      poolside-helper-windows-amd64.tar.gz \
      poolside-helper-windows-arm64.tar.gz \
      poolside-whisper-server-darwin-arm64.tar.gz; do
      copy_runtime_asset "$pattern"
    done
  fi
elif [[ -n "$helper_pattern" ]]; then
__POOL_SYNTHETIC_IMPORT_BASELINE__
  for pattern in "${supplemental_patterns[@]}"; do
    gh release download "$helper_version" --pattern "$pattern" --clobber || \
      echo "Optional helper asset not found: $pattern"
  done
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

shopt -s nullglob
for f in ./*.tar.gz; do
  tar -xvf "$f"
done
rm -f -- ./*.tar.gz ./*.checksum

# Local MLX inference is a Desktop-only capability. Universal helper releases
# also contain the sidecar, so make sure it cannot leak into a VSIX.
rm -f -- poolside-mlx-sidecar-* ./*.metallib

binaries=(poolside-helper-* poolside-whisper-server-*)
if ((${#binaries[@]})); then
  chmod +x "${binaries[@]}"
fi
