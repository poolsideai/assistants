use std::{sync::mpsc, thread, time::Duration};

use tauri::{Manager, Runtime, WebviewWindow, WindowEvent};
use tauri_plugin_window_state::{AppHandleExt, StateFlags};

const DEFAULT_WINDOW_STATE_FILENAME: &str = ".window-state.json";
const BOUNDS_SAVE_DEBOUNCE: Duration = Duration::from_millis(250);

pub fn plugin<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri_plugin_window_state::Builder::default()
        .with_filename(filename_from_env())
        .build()
}

pub fn save_on_bounds_changes<R: Runtime>(window: &WebviewWindow<R>) {
    let app_handle = window.app_handle().clone();
    let bounds_save_tx = start_bounds_save_worker(app_handle.clone());
    window.on_window_event(move |event| match event {
        WindowEvent::Moved(_) | WindowEvent::Resized(_) => {
            let _ = bounds_save_tx.send(());
        }
        WindowEvent::CloseRequested { .. } => {
            save_bounds(&app_handle);
        }
        _ => {}
    });
}

fn start_bounds_save_worker<R: Runtime>(app_handle: tauri::AppHandle<R>) -> mpsc::Sender<()> {
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
    let (tx, rx) = mpsc::channel();
    thread::spawn(move || {
        while rx.recv().is_ok() {
            loop {
__POOL_SYNTHETIC_IMPORT_BASELINE__
                    Ok(()) => continue,
                    Err(mpsc::RecvTimeoutError::Timeout) => {
__POOL_SYNTHETIC_IMPORT_BASELINE__
                        break;
                    }
                    Err(mpsc::RecvTimeoutError::Disconnected) => return,
                }
            }
        }
    });
    tx
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
fn save_bounds<R: Runtime>(app_handle: &tauri::AppHandle<R>) {
    if let Err(err) = app_handle.save_window_state(StateFlags::all()) {
        eprintln!("failed to save window state after bounds change: {err}");
    }
}

fn filename_from_env() -> String {
__POOL_SYNTHETIC_IMPORT_BASELINE__
}

fn filename_for_slot(slot: Option<&str>) -> String {
    let Some(slot) = slot.map(str::trim).filter(|slot| !slot.is_empty()) else {
        return DEFAULT_WINDOW_STATE_FILENAME.to_string();
    };

    format!(".window-state-spoolside-s{slot}.json")
}

#[cfg(test)]
mod tests {
    use super::*;
__POOL_SYNTHETIC_IMPORT_BASELINE__

    #[test]
    fn uses_default_filename_without_spoolside_slot() {
        assert_eq!(filename_for_slot(None), DEFAULT_WINDOW_STATE_FILENAME);
        assert_eq!(filename_for_slot(Some("")), DEFAULT_WINDOW_STATE_FILENAME);
        assert_eq!(
            filename_for_slot(Some("   ")),
            DEFAULT_WINDOW_STATE_FILENAME
        );
    }

    #[test]
    fn scopes_window_state_to_spoolside_slot() {
        assert_eq!(
            filename_for_slot(Some("0")),
            ".window-state-spoolside-s0.json"
        );
        assert_eq!(
            filename_for_slot(Some("3")),
            ".window-state-spoolside-s3.json"
        );
    }

    #[test]
    fn trims_slot_env_value() {
        assert_eq!(
            filename_for_slot(Some(" 2\n")),
            ".window-state-spoolside-s2.json"
        );
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
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
__POOL_SYNTHETIC_IMPORT_BASELINE__
}
