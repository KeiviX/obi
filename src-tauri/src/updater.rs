//! Self-update from GitHub Releases. On launch Obi checks `latest.json`, downloads a
//! newer signed installer in the background, then tells the page so it can offer
//! "Restart to update". Installers are verified against the public key in tauri.conf.json.

use std::sync::Mutex;

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_updater::{Update, UpdaterExt};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadyUpdate {
    pub version: String,
    pub notes: Option<String>,
}

/// A downloaded update waiting for the user to restart.
#[derive(Default)]
pub struct PendingUpdate(Mutex<Option<(Update, Vec<u8>, ReadyUpdate)>>);

pub async fn check_and_download(app: AppHandle) {
    let update = match app.updater() {
        Ok(updater) => match updater.check().await {
            Ok(Some(update)) => update,
            Ok(None) => {
                println!("[obi] up to date");
                return;
            }
            Err(e) => {
                println!("[obi] update check failed: {e}");
                return;
            }
        },
        Err(e) => {
            println!("[obi] updater unavailable: {e}");
            return;
        }
    };

    println!("[obi] downloading update {}", update.version);
    let bytes = match update.download(|_, _| {}, || {}).await {
        Ok(b) => b,
        Err(e) => {
            println!("[obi] update download failed: {e}");
            return;
        }
    };

    let ready = ReadyUpdate {
        version: update.version.clone(),
        notes: update.body.clone(),
    };
    *app.state::<PendingUpdate>().0.lock().unwrap() = Some((update, bytes, ready.clone()));
    let _ = app.emit("update-ready", &ready);
}

/// The page asks on load, in case the download finished before it was listening.
#[tauri::command]
pub fn update_status(pending: State<PendingUpdate>) -> Option<ReadyUpdate> {
    pending.0.lock().unwrap().as_ref().map(|(_, _, r)| r.clone())
}

/// Runs the downloaded installer (passive mode) and restarts into the new version.
#[tauri::command]
pub fn install_update(app: AppHandle, pending: State<PendingUpdate>) -> Result<(), String> {
    let (update, bytes, _) = pending
        .0
        .lock()
        .unwrap()
        .take()
        .ok_or("no update ready")?;
    update.install(bytes).map_err(|e| e.to_string())?;
    app.restart();
}
