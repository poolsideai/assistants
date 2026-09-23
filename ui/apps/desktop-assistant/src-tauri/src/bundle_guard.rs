//! Detects the running `.app` bundle being replaced underneath the process.
//!
//! Our own updater stages downloads and only swaps the bundle immediately
//! before relaunching (see updater.rs), but anything else on the machine can
//! still replace it while we run: a DMG install over the top, a CI copy, a
//! second instance's updater.
//!
//! Once the bundle we launched from is unlinked, macOS can no longer resolve
//! this process's executable path. Out-of-process AppKit services validate the
//! caller against that path, so the next `NSOpenPanel`/`NSSavePanel` exits
//! immediately (`openAndSavePanelService` exit 69) and takes the app down with
//! it — no crash report, just a vanishing window. Callers check this first and
//! offer a restart instead of opening the panel.

use std::sync::OnceLock;

/// Identity of this process's executable, sampled at startup.
static LAUNCH_IDENTITY: OnceLock<Option<ExecutableIdentity>> = OnceLock::new();

/// `(device, inode)` — a replacement always lands on a new inode, whether it
/// arrived by rename, delete-and-copy, or archive extraction.
type ExecutableIdentity = (u64, u64);

/// Samples the executable this process launched from. Call once during setup,
/// before anything has a chance to replace the bundle.
pub fn record_launch_identity() {
    let _ = LAUNCH_IDENTITY.set(executable_identity());
}

/// True once the bundle this process is running from has been replaced or
/// removed on disk.
///
/// Conservative in both directions: if the identity could not be sampled at
/// startup, or cannot be sampled on this platform, it reports "not replaced"
/// rather than blocking file panels that would have worked.
pub fn bundle_replaced() -> bool {
    let Some(Some(launched)) = LAUNCH_IDENTITY.get() else {
        return false;
    };
    executable_identity() != Some(*launched)
}

#[tauri::command]
pub fn desktop_bundle_replaced() -> bool {
    bundle_replaced()
}

#[cfg(unix)]
fn executable_identity() -> Option<ExecutableIdentity> {
    use std::os::unix::fs::MetadataExt;

    // current_exe() canonicalizes, so it fails outright once the original file
    // is unlinked and resolves to the new file when one took its place. Either
    // way the result differs from what we recorded.
    let exe = std::env::current_exe().ok()?;
    let metadata = std::fs::metadata(exe).ok()?;
    Some((metadata.dev(), metadata.ino()))
}

#[cfg(not(unix))]
fn executable_identity() -> Option<ExecutableIdentity> {
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_unsampled_launch_identity_never_reports_a_replacement() {
        // LAUNCH_IDENTITY is process-global and unset under `cargo test`, which
        // is the same state as a failed startup sample.
        assert!(!bundle_replaced());
    }

    #[cfg(unix)]
    #[test]
    fn the_running_executable_keeps_a_stable_identity() {
        let identity = executable_identity();
        assert!(identity.is_some());
        assert_eq!(identity, executable_identity());
    }
}
