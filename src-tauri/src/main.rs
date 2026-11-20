// Hide the console window in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bridge;

use tauri::{WebviewUrl, WebviewWindowBuilder};

const APPLE_MUSIC_URL: &str = "https://music.apple.com/";
const CORE_JS: &str = include_str!("../../inject/core.js");
const THEME_CSS: &str = include_str!("../../inject/theme.css");

/// Builds the script injected into every page load of music.apple.com:
/// the stylesheet is handed over as a global, then core.js runs.
fn init_script() -> String {
    let css = serde_json::to_string(THEME_CSS).expect("css serializes");
    format!("window.__ORCHARD_CSS__ = {css};\n{CORE_JS}")
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .manage(bridge::PlayerState::default())
        .invoke_handler(tauri::generate_handler![
            bridge::log,
            bridge::now_playing,
            bridge::playback_state,
        ])
        .setup(|app| {
            WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::External(APPLE_MUSIC_URL.parse()?),
            )
            .title("Orchard")
            .inner_size(1280.0, 820.0)
            .min_inner_size(800.0, 560.0)
            .initialization_script(init_script())
            .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Orchard");
}
