#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "usage: $0 PATCHED_SBOM GRANT_JSON OUTPUT_MARKDOWN" >&2
  exit 2
fi

PATCHED_SBOM="$1"
GRANT_JSON="$2"
OUTPUT_MARKDOWN="$3"

for input in "$PATCHED_SBOM" "$GRANT_JSON"; do
  if [[ ! -f "$input" ]]; then
    echo "license report input not found: ${input}" >&2
    exit 1
  fi
done

jq -r --slurpfile sbom "$PATCHED_SBOM" '
  def cell:
    tostring
    | gsub("[\r\n]+"; " ")
    | gsub("\\|"; "&#124;");

  def license_value:
    .spdxExpression // .value // empty;

  .run.targets[0].evaluation as $evaluation
  | ($sbom[0].artifacts
      | sort_by([.type // "unknown", .name // "", .version // ""])
      | unique_by([.type // "unknown", .name // "", .version // ""])
    ) as $packages
  | [
      "## Package-managed dependencies",
      "",
      "Generated from the patched Syft SBOM and evaluated by Grant against `grant.yaml`.",
      "",
      "- Grant result: `" + $evaluation.status + "`",
      "- SBOM package records: `" + ($packages | length | tostring) + "`",
      "- Grant packages evaluated: `" + ($evaluation.summary.packages.total | tostring) + "`",
      "- Allowed: `" + ($evaluation.summary.packages.allowed | tostring) + "`",
      "- Denied: `" + ($evaluation.summary.packages.denied | tostring) + "`",
      "- Ignored: `" + ($evaluation.summary.packages.ignored | tostring) + "`",
      "- Unlicensed: `" + ($evaluation.summary.packages.unlicensed | tostring) + "`",
      "",
      "The table preserves every unique ecosystem, package, and version record from the SBOM.",
      "",
      "| Ecosystem | Package | Version | License |",
      "| --- | --- | --- | --- |",
      (
        $packages[]
        | (.name // "") as $name
        | (.version // "") as $version
        | (
            [.licenses[]? | license_value]
            | map(select(length > 0))
            | unique
            | if length == 0 then ["Unknown"] else . end
            | join(", ")
          ) as $licenses
        | "| "
          + ((.type // "unknown") | cell)
          + " | "
          + ($name | cell)
          + " | "
          + ($version | cell)
          + " | "
          + ($licenses | cell)
          + " |"
      )
    ]
  | .[]
' "$GRANT_JSON" >"$OUTPUT_MARKDOWN"
