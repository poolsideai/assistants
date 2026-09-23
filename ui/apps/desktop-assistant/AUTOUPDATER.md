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

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
  operation checks Stable and Nightly once each, then downloads the higher valid
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
- Staging a Stable update while Preview is selected preserves the Preview
__POOL_SYNTHETIC_IMPORT_BASELINE__
- After staging, the sidebar **Update** button installs the download and
  restarts into it. A failed install stays staged so the button can be retried.
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
