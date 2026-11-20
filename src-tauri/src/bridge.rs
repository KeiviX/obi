//! Commands called over Tauri IPC by the injected page script (main window)
//! and by the local mini player page.

use std::sync::Mutex;

use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State, WebviewWindow};

use crate::windows;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Track {
    pub id: Option<String>,
    pub title: String,
    pub artist: String,
    pub album: Option<String>,
    pub duration_ms: Option<u64>,
    pub artwork_url: Option<String>,
    /// Artwork background colour supplied by Apple, used to print the obi.
    pub bg_color: Option<String>,
    /// Apple's legible ink colour for `bg_color`.
    pub text_color: Option<String>,
    /// Apple's secondary ink for `bg_color` (artist line).
    pub text_color2: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    pub track: Option<Track>,
    pub state: String,
    pub current_time: f64,
    pub duration: f64,
}

#[derive(Default)]
pub struct PlayerState(pub Mutex<Snapshot>);

#[tauri::command]
pub fn log(level: String, msg: String) {
    println!("[page:{level}] {msg}");
}

#[tauri::command]
pub fn now_playing(app: AppHandle, player: State<PlayerState>, track: Option<Track>) {
    if let Some(win) = app.get_webview_window(windows::MAIN) {
        let title = match &track {
            Some(t) => format!("{} · {} · Orchard", t.title, t.artist),
            None => "Orchard".to_string(),
        };
        let _ = win.set_title(&title);
    }
    let _ = app.emit("now-playing", &track);
    player.0.lock().unwrap().track = track;
}

#[tauri::command]
pub fn playback_state(app: AppHandle, player: State<PlayerState>, state: String) {
    println!("[orchard] playback state: {state}");
    let _ = app.emit("playback-state", &state);
    player.0.lock().unwrap().state = state;
}

#[tauri::command]
pub fn playback_time(app: AppHandle, player: State<PlayerState>, current: f64, duration: f64) {
    let _ = app.emit("playback-time", (current, duration));
    let mut s = player.0.lock().unwrap();
    s.current_time = current;
    s.duration = duration;
}

#[tauri::command]
pub fn get_state(player: State<PlayerState>) -> Snapshot {
    player.0.lock().unwrap().clone()
}

/// Transport controls from the mini player, forwarded to MusicKit in the main page.
#[tauri::command]
pub fn player_control(app: AppHandle, action: String, value: Option<f64>) -> Result<(), String> {
    const ALLOWED: &[&str] = &["toggle", "next", "prev", "seek"];
    if !ALLOWED.contains(&action.as_str()) {
        return Err(format!("unknown action {action}"));
    }
    let main = app
        .get_webview_window(windows::MAIN)
        .ok_or("main window missing")?;
    let value = value.map_or("null".to_string(), |v| v.to_string());
    main.eval(&format!(
        "window.__orchard && window.__orchard.control({:?}, {value})",
        action
    ))
    .map_err(|e| e.to_string())
}

/// Window chrome for frameless windows. Returns whether the window is maximized.
#[tauri::command]
pub fn window_control(window: WebviewWindow, action: String) -> Result<bool, String> {
    let r = match action.as_str() {
        "minimize" => window.minimize(),
        "maximize" => {
            if window.is_maximized().unwrap_or(false) {
                window.unmaximize()
            } else {
                window.maximize()
            }
        }
        "close" => window.close(),
        "query" => Ok(()),
        other => return Err(format!("unknown action {other}")),
    };
    r.map_err(|e| e.to_string())?;
    Ok(window.is_maximized().unwrap_or(false))
}

#[tauri::command]
pub fn window_drag(window: WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|e| e.to_string())
}

/// Must be async: creating a window from a synchronous command deadlocks WebView2 on
/// Windows (the new webview waits on the thread the command is blocking).
#[tauri::command]
pub async fn toggle_mini(app: AppHandle) -> Result<(), String> {
    windows::toggle_mini(&app).map_err(|e| e.to_string())
}
