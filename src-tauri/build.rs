/// Obi's own IPC commands. Declaring them here generates `allow-<command>`
/// permissions, which the files in `capabilities/` grant per window.
/// Tauri blocks every custom command that isn't granted.
const COMMANDS: &[&str] = &[
    "log",
    "now_playing",
    "playback_state",
    "playback_time",
    "get_state",
    "player_control",
    "window_control",
    "window_drag",
    "toggle_mini",
    "update_status",
    "install_update",
];

fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(COMMANDS)),
    )
    .expect("failed to run tauri-build");
}
