use std::path::{Path, PathBuf};
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
use base64::Engine;
use minisign_verify::{PublicKey, Signature};
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
use tauri::{async_runtime, AppHandle, Emitter, Manager, State, Url};
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/// A downloaded update waiting for the user to restart.
///
/// The archive lives at a fixed path under the app data directory so it
/// survives quitting without ever installing over the running bundle. That
/// location is user-writable and `Update::install` does not verify what it is
/// given, so the archive is treated as an untrusted cache: its minisign
/// signature is re-checked against the embedded public key both when a later
/// session adopts it and again immediately before install.
struct StagedUpdate {
    update: Update,
    archive_path: PathBuf,
}

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    staged: async_runtime::Mutex<Option<StagedUpdate>>,
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
    async fn stage(&self, update: Update, archive_path: PathBuf) {
        *self.staged.lock().await = Some(StagedUpdate {
            update,
            archive_path,
        });
        self.mark_update_pending();
    }

__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__

    /// Lets checks resume after a staged update was lost without being
    /// installed, so the updater recovers instead of staying blocked until the
    /// app quits.
    fn clear_pending_update(&self) {
        self.pending_update.store(false, Ordering::Release);
    }
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    /// Release notes from the update feed (the CrabNebula release notes).
    notes: Option<String>,
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
    /// Downloaded and waiting for the restart that installs it.
    Staged,
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
/// Check the feeds eligible for the selected channel and download the highest
/// signed update. The selected `Update` cannot change between check and
/// download.
///
/// This deliberately stops at the downloaded bytes. Installing replaces the
/// running `.app` in place, which leaves the process running from an unlinked
/// bundle: macOS can no longer resolve its executable, so the out-of-process
/// AppKit services (`NSOpenPanel`, `NSSavePanel`) refuse to launch and take the
/// app down with them. `install_staged_desktop_update` does the swap immediately
/// before relaunching instead.
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
        // Nothing newer than the running version, so any cached archive is
        // stale — including the one this version was just installed from.
        discard_pending_archive(&app_handle);
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    let notes = update.body.clone();
    stage_update_on_disk(&app_handle, &state, update).await?;
    Ok(Some(DesktopUpdateInfo { version, notes }))
}

/// Downloads and verifies the update archive without touching the installed
/// bundle.
#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopUpdateProgress {
    downloaded: usize,
    content_length: Option<u64>,
}

async fn download_update(app: &AppHandle, update: &Update) -> Result<Vec<u8>, String> {
    let app = app.clone();
    let mut downloaded = 0usize;
__POOL_SYNTHETIC_IMPORT_BASELINE__
        .download(
            move |chunk, content_length| {
                downloaded += chunk;
                let _ = app.emit(
                    "poolside:desktop-update-progress",
                    DesktopUpdateProgress {
                        downloaded,
                        content_length,
                    },
                );
            },
            || {},
        )
__POOL_SYNTHETIC_IMPORT_BASELINE__
        .map_err(|err| err.to_string())
}

const PENDING_ARCHIVE_FILE: &str = "pending.tar.gz";
const PENDING_PARTIAL_FILE: &str = "pending.tar.gz.part";

fn pending_update_dir(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_data_dir()
        .map_err(|err| err.to_string())?
        .join("pending-update"))
}

/// The minisign public key the updater plugin verifies downloads against,
/// from `plugins.updater.pubkey` in the bundled `tauri.conf.json`.
fn updater_pubkey(app: &AppHandle) -> Result<String, String> {
    app.config()
        .plugins
        .0
        .get("updater")
        .and_then(|config| config.get("pubkey"))
        .and_then(|pubkey| pubkey.as_str())
        .map(str::to_string)
        .ok_or_else(|| "No updater public key is configured".to_string())
}

/// Verifies an archive against a feed signature, mirroring the updater
/// plugin's own check (both values are base64-wrapped minisign strings).
///
/// This is what makes the on-disk cache safe: whatever is at the pending path
/// only ever reaches `Update::install` after passing this with the public key
/// baked into the app.
fn verify_archive(bytes: &[u8], signature: &str, pubkey: &str) -> Result<(), String> {
    fn base64_to_string(value: &str) -> Result<String, String> {
        let decoded = base64::engine::general_purpose::STANDARD
            .decode(value)
            .map_err(|err| err.to_string())?;
        String::from_utf8(decoded).map_err(|err| err.to_string())
    }
    let public_key =
        PublicKey::decode(&base64_to_string(pubkey)?).map_err(|err| err.to_string())?;
    let signature =
        Signature::decode(&base64_to_string(signature)?).map_err(|err| err.to_string())?;
    public_key
        .verify(bytes, &signature, true)
        .map_err(|err| err.to_string())
}

fn write_pending_archive(dir: &Path, path: &Path, bytes: &[u8]) -> Result<(), String> {
    std::fs::create_dir_all(dir).map_err(|err| err.to_string())?;
    // Write-then-rename so a crash mid-write can never leave a torn file at
    // the path a later session will try to adopt.
    let partial = dir.join(PENDING_PARTIAL_FILE);
    std::fs::write(&partial, bytes).map_err(|err| err.to_string())?;
    std::fs::rename(&partial, path).map_err(|err| err.to_string())
}

/// Drops the cached archive. Called when the feed says there is nothing newer
/// than the running version — which is also how the archive from a completed
/// update gets cleaned up on the first check after restarting into it.
fn discard_pending_archive(app: &AppHandle) {
    if let Ok(dir) = pending_update_dir(app) {
        let _ = std::fs::remove_file(dir.join(PENDING_ARCHIVE_FILE));
        let _ = std::fs::remove_file(dir.join(PENDING_PARTIAL_FILE));
    }
}

/// Ensure the selected update's archive is on disk, reusing the cached copy
/// from an earlier session when it is byte-for-byte the release the feed is
/// announcing now (its signature verifies), and mark it staged.
async fn stage_update_on_disk(
    app: &AppHandle,
    state: &DesktopUpdaterState,
    update: Update,
) -> Result<(), String> {
    let pubkey = updater_pubkey(app)?;
    let dir = pending_update_dir(app)?;
    let path = dir.join(PENDING_ARCHIVE_FILE);

    let cached_matches = {
        let path = path.clone();
        let signature = update.signature.clone();
        let pubkey = pubkey.clone();
        async_runtime::spawn_blocking(move || {
            std::fs::read(&path)
                .is_ok_and(|bytes| verify_archive(&bytes, &signature, &pubkey).is_ok())
        })
        .await
        .map_err(|err| err.to_string())?
    };

    if !cached_matches {
        let bytes = download_update(app, &update).await?;
        let dir = dir.clone();
        let path = path.clone();
        async_runtime::spawn_blocking(move || write_pending_archive(&dir, &path, &bytes))
            .await
            .map_err(|err| err.to_string())??;
    }

    state.stage(update, path).await;
    Ok(())
}

/// Swap in the staged update and relaunch into it.
///
/// Installing unlinks the running bundle, so the restart has to follow
/// immediately — nothing may open a native file panel in between. On failure the
/// staged update is put back so the user can retry from the same button.
#[tauri::command]
pub async fn install_staged_desktop_update(
    app_handle: AppHandle,
    state: State<'_, DesktopUpdaterState>,
) -> Result<(), String> {
    let pubkey = updater_pubkey(&app_handle)?;
    let _operation = state.operation.lock().await;
    let mut slot = state.staged.lock().await;
    let Some(staged) = slot.take() else {
        return Err("No update is ready to install.".to_string());
    };

    // Load and re-verify the cached archive: it has sat in a user-writable
    // location since staging. A failed check self-heals by re-downloading the
    // exact selected `Update` (the plugin verifies as it downloads).
    let loaded = {
        let path = staged.archive_path.clone();
        let signature = staged.update.signature.clone();
        let pubkey = pubkey.clone();
        async_runtime::spawn_blocking(move || {
            let bytes = std::fs::read(&path).map_err(|err| err.to_string())?;
            verify_archive(&bytes, &signature, &pubkey)?;
            Ok::<_, String>(bytes)
        })
        .await
    };
    let loaded = match loaded {
        Ok(loaded) => loaded,
        Err(err) => {
            // The read task panicked. `staged` never left this scope, so put
            // it back rather than stranding it.
            *slot = Some(staged);
            return Err(format!("Update install did not complete: {err}"));
        }
    };
    let bytes = match loaded {
        Ok(bytes) => bytes,
        Err(_) => match download_update(&app_handle, &staged.update).await {
            Ok(bytes) => bytes,
            Err(err) => {
                *slot = Some(staged);
                return Err(format!(
                    "The staged update could not be read and downloading it again failed: {err}"
                ));
            }
        },
    };

    // Unpacking the archive over /Applications is blocking filesystem work.
    let installed = async_runtime::spawn_blocking(move || {
        let result = staged.update.install(&bytes).map_err(|err| err.to_string());
        (result, staged)
    })
    .await;

    let (result, staged) = match installed {
        Ok(installed) => installed,
        Err(err) => {
            // The install task panicked and took the staged update with it.
            // Release the pending flag so checks resume and the next one
            // re-stages from the archive still on disk; otherwise the Update
            // button and the release-channel controls stay wedged until quit.
            state.clear_pending_update();
            return Err(format!("Update install did not complete: {err}"));
        }
    };

    if let Err(err) = result {
        *slot = Some(staged);
        return Err(err);
    }

    discard_pending_archive(&app_handle);
    drop(slot);
    app_handle.restart();
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
/// Explicitly leave Preview for Stable, including a lower Stable version.
/// Background checks never use the downgrade comparator. Like the background
/// path this only stages the download; the restart installs it.
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
    stage_update_on_disk(&app_handle, &state, update).await?;
__POOL_SYNTHETIC_IMPORT_BASELINE__
        status: DesktopStableSwitchStatus::Staged,
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
    #[test]
    fn the_production_public_key_decodes_for_archive_verification() {
        // The pubkey shipped in tauri.conf.json must decode through the same
        // helpers verify_archive uses, or cached archives would never verify
        // and every install would silently fall back to a re-download.
        let config: serde_json::Value =
            serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        let pubkey = config["plugins"]["updater"]["pubkey"].as_str().unwrap();
        let decoded = base64::engine::general_purpose::STANDARD
            .decode(pubkey)
            .unwrap();
        PublicKey::decode(std::str::from_utf8(&decoded).unwrap()).unwrap();
    }

    /// A well-formed minisign signature (74-byte packet: algorithm, key id,
    /// signature) carrying a bogus Ed25519 signature. `Signature::decode`
    /// accepts it, so verification reaches the actual signature check rather
    /// than bailing out on a length or encoding error.
    fn well_formed_signature_with_bogus_ed25519(key_id: [u8; 8]) -> String {
        let mut packet = Vec::with_capacity(74);
        packet.extend_from_slice(b"ED"); // prehashed Ed25519
        packet.extend_from_slice(&key_id);
        packet.extend_from_slice(&[0u8; 64]);
        let encode = |bytes: &[u8]| base64::engine::general_purpose::STANDARD.encode(bytes);
        let sig_file = format!(
            "untrusted comment: test\n{}\ntrusted comment: test\n{}\n",
            encode(&packet),
            encode(&[0u8; 64])
        );
        encode(sig_file.as_bytes())
    }

    #[test]
    fn tampered_archives_fail_verification() {
        let config: serde_json::Value =
            serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        let pubkey = config["plugins"]["updater"]["pubkey"].as_str().unwrap();
        // The key id of the shipped public key, so verification gets past the
        // key-id check and actually evaluates the signature.
        let our_key_id = [0x69, 0x91, 0x51, 0xf9, 0x4d, 0x98, 0xed, 0xba];

        // The case that matters: a decodable signature for our own key that
        // does not match the archive bytes.
        assert!(verify_archive(
            b"archive bytes",
            &well_formed_signature_with_bogus_ed25519(our_key_id),
            pubkey
        )
        .is_err());
        // Signed by some other key.
        assert!(verify_archive(
            b"archive bytes",
            &well_formed_signature_with_bogus_ed25519([0u8; 8]),
            pubkey
        )
        .is_err());
        // Malformed inputs.
        assert!(verify_archive(b"archive bytes", "not base64!", pubkey).is_err());
        assert!(verify_archive(b"archive bytes", "", pubkey).is_err());
    }

    #[test]
    fn the_bogus_signature_fixture_survives_decoding() {
        // Guards the test above: if the fixture stopped decoding, those
        // assertions would pass for the wrong reason and no longer prove that
        // a bad signature is rejected on cryptographic grounds.
        let our_key_id = [0x69, 0x91, 0x51, 0xf9, 0x4d, 0x98, 0xed, 0xba];
        let encoded = well_formed_signature_with_bogus_ed25519(our_key_id);
        let decoded = base64::engine::general_purpose::STANDARD
            .decode(&encoded)
            .unwrap();
        let signature = Signature::decode(std::str::from_utf8(&decoded).unwrap()).unwrap();

        let config: serde_json::Value =
            serde_json::from_str(include_str!("../tauri.conf.json")).unwrap();
        let pubkey_decoded = base64::engine::general_purpose::STANDARD
            .decode(config["plugins"]["updater"]["pubkey"].as_str().unwrap())
            .unwrap();
        let public_key = PublicKey::decode(std::str::from_utf8(&pubkey_decoded).unwrap()).unwrap();

        // Reaches the signature check and fails there, not on key id.
        assert!(matches!(
            public_key.verify(b"archive bytes", &signature, true),
            Err(minisign_verify::Error::InvalidSignature)
        ));
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

        // Recovery path for a staged update lost without being installed:
        // checks must resume rather than staying blocked until the app quits.
        state.clear_pending_update();
        assert!(state.ensure_no_pending_update().is_ok());
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
