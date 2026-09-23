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
  unbound lineage; `plan-products --bootstrap-version M.m.p` applies both to
  every selected product;
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
New lineages require an exact version and `--create-lineage`. Desktop stores the tag annotation in its
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
## First release after a repository migration

A fresh-history repository has no product tags, even when its Marketplace and
CrabNebula destinations already contain releases. Do not copy old tags or reset
external version numbers. Choose a numeric version newer than **all** existing
versions in the selected destinations, including drafts and purged CrabNebula
versions. Its minor component must be odd for Preview or even for Stable.
Keep scheduled releases disabled until the first publication is verified.

The optional `bootstrap_version` input on **Release · Products** supplies that
exact version and explicitly permits the first annotated tag for each selected
product. Leave it blank for normal releases. The existing main-ref, ancestry,
release-enable, destination, and external-version checks still apply. Bootstrap
does not bypass signing or publication checks and is rejected for schedules.
Visual Studio can participate in Preview; its Stable release remains manual.

Rehearse before publishing:

1. Run **Validate · Desktop release** and **Validate · VS Code release** with
   the intended `release` channel and `bootstrap_version`. They build unsigned
   artifacts without creating tags or publishing releases. They also work on
   a branch; the repository's canonical-repo gates must already match.
2. From `main`, run **Validate · Signed Desktop release** with the same inputs
   to exercise signing, notarization, and updater artifacts. This still does
   not reserve tags or publish. Dry-runs do not query external inventories, so
   they do not establish that the chosen version is available.
3. Inspect the uploaded artifacts and confirm the destinations' current version
   maxima again. Enable the intended product/channel release variables, then
   dispatch **Release · Products** from the frozen `main` commit with the same
   version and products. The helper runtime bootstraps independently at
   `helper/v0.0.1`; it needs no historical tags.

For a partial publication, rerun with the same bootstrap version, products,
channel, and source commit. Existing annotated tags must match the destination
and source; a retry never moves them. Once all selected products are published,
clear `bootstrap_version` on subsequent dispatches and enable the schedule.

To inspect the first plan locally without writing tags or publishing:

```bash
# Set RELEASE_VERSION to the reviewed version, not a previously published one.
pnpm -s -F @poolsideai/release-helper find-version plan-products \
  --channel nightly --ref HEAD --main-ref origin/main \
  --bootstrap-version "$RELEASE_VERSION" --vscode --desktop --sync-versions \
  --vscode-destination poolside-ai.acp-assistant \
  --vscode-display-name "Poolside Assistant" \
  --desktop-destination poolside/desktop-assistant
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
pnpm -F @poolsideai/release-helper find-version render-changelog desktop \
  --version 1.2.0 --head "$SHA" --out -
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
Changelogs are user-facing and shared by the GitHub release notes, the
CrabNebula release notes, and the stamped product `CHANGELOG.md`: first-parent
commit subjects scoped to the owning paths in `projects.yml`, grouped into
Improvements and Fixes. Excluded conventional types (chore, ci, docs, …) and
commits whose owned changes are only docs or lockfiles are dropped. Commit
hashes, authors, and repository links are omitted because the repository is
private. `--slack` emits the internal bounded mrkdwn variant, which keeps
authors and pull-request links.

`render-changelog` regenerates a product's complete `CHANGELOG.md` from its
release tag lineage at build time; the committed files stay placeholders. The
top section covers the version being built — labeled Preview and diffed
against the newest stable for nightly builds — followed by one section per
earlier stable release. History starts at `1.0.0`, which is labeled
`Initial release`; pre-1.0 releases are omitted.

A release normally compares with the previous release in the same channel.
When a channel has never released, the planner falls back to the newest
earlier tag in the product lineage instead of dumping the monorepo history; a
lineage with no earlier tag is labeled `Initial release`.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
