// Hide the console window in release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod bridge;
mod windows;

use tauri::{Manager, WindowEvent};
use tauri_plugin_window_state::StateFlags;

fn main() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_window_state::Builder::default()
                // Never restore a hidden main window (it's hidden while the mini player is open).
                .with_state_flags(StateFlags::all() & !StateFlags::VISIBLE)
                .build(),
        )
        .manage(bridge::PlayerState::default())
        .invoke_handler(tauri::generate_handler![
            bridge::log,
            bridge::now_playing,
            bridge::playback_state,
            bridge::playback_time,
            bridge::get_state,
            bridge::player_control,
            bridge::window_control,
            bridge::window_drag,
            bridge::toggle_mini,
        ])
        .setup(|app| {
            windows::create_main(app.handle())?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::Destroyed = event {
                match window.label() {
                    // Closing the mini player returns to the full window.
                    windows::MINI => windows::show_main(window.app_handle()),
                    // Closing the main window quits, even if the mini player is open.
                    windows::MAIN => window.app_handle().exit(0),
                    _ => {}
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running Orchard");
}
