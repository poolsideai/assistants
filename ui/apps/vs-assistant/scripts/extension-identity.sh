#!/usr/bin/env bash

# Print the Marketplace identity (Publisher.Id) declared by the VSIX source
# manifest. Release planning records this as the lineage destination, so it is
# derived from the manifest rather than duplicated in workflow configuration.

set -euo pipefail

manifest="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/source.extension.vsixmanifest"

id=$(sed -n '/<Identity /s/.*[[:space:]]Id="\([^"]*\)".*/\1/p' "${manifest}")
publisher=$(sed -n '/<Identity /s/.*[[:space:]]Publisher="\([^"]*\)".*/\1/p' "${manifest}")

[[ -n "${id}" && -n "${publisher}" ]] || {
  echo "Could not read the Identity Id and Publisher from ${manifest}" >&2
  exit 1
}

printf '%s.%s\n' "${publisher}" "${id}"
