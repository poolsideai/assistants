# Desktop auto-updater

The packaged app uses Tauri's updater with signed artifacts served by
CrabNebula Cloud. Apple signing/notarization protects installation; the updater
minisign key independently verifies downloaded updates.

## Channels and versions

| UI               | Eligible versions        | CrabNebula endpoints        |
| ---------------- | ------------------------ | --------------------------- |
| Stable (default) | numeric, even minor      | default channel             |
| Preview          | latest even or odd minor | default + `nightly` channel |

CrabNebula keeps Stable and Nightly as separate feeds; version parity is the
ordering and validation convention. `tauri.conf.json` contains the Stable
endpoint. `src-tauri/src/updater.rs` derives Nightly from that endpoint at
runtime by adding `?channel=nightly`; there is no second hard-coded slug. The
release preflight requires `CN_APP_SLUG` to match CrabNebula's **Configure
Tauri Updates** URL.

The release workflow injects the exact numeric version into `tauri.conf.json`
before building. Committed app/package versions remain `0.0.0` placeholders.

## Never install in the background

Background checks download but **must not install**. Tauri's macOS installer
unpacks the new `.app` over the running one, which unlinks the bundle the
process launched from. macOS can then no longer resolve this process's
executable path, and the out-of-process AppKit panel services validate their
caller against exactly that path: the next `NSOpenPanel`/`NSSavePanel` — Add
Project, Save As — exits with code 69 and takes the app down with it. It is a
hard crash with no crash report, arbitrarily long after the update landed, and
it looks to the user like the button they clicked was at fault.

So `check_and_stage_desktop_update` stops at `Update::download` and writes the
archive to `<app data dir>/pending-update/pending.tar.gz` (write-then-rename,
so a crash cannot leave a torn file); `install_staged_desktop_update` performs
the swap immediately before `AppHandle::restart()`.

The pending path is user-writable and `Update::install` does not verify what it
is given, so the file is treated as an untrusted download cache. Its minisign
signature is re-checked against the public key embedded in `tauri.conf.json`
at every trust boundary: when a later session adopts the cached file instead of
re-downloading, and again immediately before install. A failed check at install
time self-heals by re-downloading that exact `Update`. Never hand the cached
bytes to `install` without `verify_archive` passing.

`bundle_guard.rs` covers the same state arriving from outside the updater — a
DMG dragged over the top, a CI copy, a second instance — by comparing the
executable's `(device, inode)` against the value sampled at startup. The file
panels in `rpc/host.ts` check it first and offer a restart (`NSAlert` is
in-process, so the prompt itself is safe), and the update loop surfaces the same
sidebar **Update** pill, which then only relaunches.

## Runtime behavior

- Stable builds default to Stable and Preview builds default to Preview, using
  the same even/odd minor rule as the release workflow. This also migrates
  existing odd-minor installs whose settings predate the channel preference;
  an explicitly persisted choice is always preserved.
- The Rust updater reads the preference once for each operation.
- A Stable background/manual operation checks the Stable feed once. A Preview
  operation checks Stable and Nightly once each, then downloads the higher valid
  version. It never re-checks after selecting that exact signed `Update`.
- Rust serializes updater operations; the frontend also joins concurrent calls.
- Normal checks keep Tauri's `remote > current` comparator and never downgrade.
- Staging a Stable update while Preview is selected preserves the Preview
  preference, so a later, higher Nightly build is still eligible.
- After staging, the sidebar **Update** button installs the download and
  restarts into it. A failed install stays staged so the button can be retried.
- The channel selector is disabled while an updater operation is in flight. A
  staged update cannot be replaced or cancelled, so the selector stays disabled
  until the app restarts and the backend rejects further updater operations or
  channel changes. Channel writes are serialized with updater operations so the
  persisted preference cannot disagree with the build waiting to launch.
- Quitting with an upgrade staged keeps the downloaded archive on disk. The next
  launch's first check re-verifies it against the feed's signature and stages it
  without re-downloading; the archive is deleted once the feed stops offering
  anything newer than the running version (i.e. after the update is installed,
  or the release is pulled). Nothing is ever installed except under the Update
  button.
- A staged Preview-to-Stable **downgrade** does not survive a quit. It is lower
  than the running version, so the next background check finds nothing newer and
  discards it; the user has to choose Stable again. Only the explicit downgrade
  is affected — it is deliberately a confirmed, in-session action, and keeping it
  would mean persisting the intent to install something the feed no longer
  offers as an upgrade.

When a Preview user selects Stable, the app queries only the Stable endpoint
with a one-shot `remote != current` comparator. It rejects suffix versions and
odd-minor responses. If Stable is lower, a native dialog shows the exact
`Preview -> Stable` versions before installing the same signed `Update` value.
This comparator is never used by background checks. Cancelling the switch, not
finding a Stable build, or encountering an updater error restores Preview as
the selected channel so the user can retry the explicit transition later.

Older Stable builds may not understand data written by Preview. Before enabling
public Preview distribution, exercise settings, task/session databases, local
state, and the bundled helper across a real Preview-to-Stable transition. If a
future migration is not backward compatible, disable in-app downgrade for that
line and direct users to the Stable installer with explicit data guidance.

## Distribution setup

Repository configuration is listed in the root [release guide](../../../RELEASING.md).
In CrabNebula:

1. create or select the application and record its exact slug;
2. create the `nightly` channel;
3. verify default and nightly updater URLs;
4. verify the updater public key matches the CI private key;
5. decide whether existing internal installations should follow this app/feed.

Desktop publication currently builds only macOS arm64. Intel, Windows, and
Linux require additional signed artifacts and updater platform entries.

## Validation

Run **Validate · Signed Desktop release** from `main` and inspect the packaged
`CFBundleShortVersionString`; it must equal the planned numeric version. Then
test:

1. Stable to newer Preview;
2. Preview to newer Stable while preserving the Preview preference;
3. Preview chooses Nightly when it is newer than Stable;
4. Preview background check against lower Stable (no downgrade);
5. explicit Preview to lower Stable (exact-version confirmation and install);
6. tampered signature (must fail);
7. settings, tasks/sessions, and helper behavior after the downgrade;
8. **Add Project after a staged download** — the folder picker must still open
   while an update is waiting, proving nothing was installed behind it;
9. **Add Project after an external swap** — replace the installed `.app` from a
   second copy while the app runs, then use Add Project: expect the "Restart to
   finish updating" prompt, not a silent quit;
10. **quit with an update staged, relaunch** — the Update pill must return
    without a second download (watch `pending-update/` mtime), and clicking it
    must install; corrupt the cached archive first and the install must still
    succeed via re-download.

For local feed testing, temporarily point a test build at a local signed Tauri
manifest. Never commit a local/insecure endpoint or a real private signing key.
