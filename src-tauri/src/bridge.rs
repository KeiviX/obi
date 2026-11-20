//! Commands the injected page script calls through Tauri IPC.

use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Track {
    pub id: Option<String>,
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub duration_ms: Option<u64>,
    pub artwork_url: Option<String>,
}

#[derive(Default)]
pub struct PlayerState {
    pub track: Mutex<Option<Track>>,
    pub state: Mutex<String>,
}

#[tauri::command]
pub fn log(level: String, msg: String) {
    println!("[page:{level}] {msg}");
}

#[tauri::command]
pub fn now_playing(app: AppHandle, player: State<PlayerState>, track: Option<Track>) {
    match &track {
        Some(t) => println!("[orchard] now playing: {} by {}", t.title, t.artist),
        None => println!("[orchard] nothing playing"),
    }

    if let Some(win) = app.get_webview_window("main") {
        let title = match &track {
            Some(t) => format!("{} · {} · Orchard", t.title, t.artist),
            None => "Orchard".to_string(),
        };
        let _ = win.set_title(&title);
    }

    let _ = app.emit("now-playing", &track);
    *player.track.lock().unwrap() = track;
}

#[tauri::command]
pub fn playback_state(app: AppHandle, player: State<PlayerState>, state: String) {
    let _ = app.emit("playback-state", &state);
    *player.state.lock().unwrap() = state;
}
