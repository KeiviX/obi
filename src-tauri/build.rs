/// Orchard's own IPC commands. Declaring them here generates `allow-<command>`
/// permissions, which `capabilities/default.json` grants to music.apple.com.
/// Tauri blocks every custom command from a remote origin that isn't listed here.
const COMMANDS: &[&str] = &["log", "now_playing", "playback_state"];

fn main() {
    tauri_build::try_build(
        tauri_build::Attributes::new()
            .app_manifest(tauri_build::AppManifest::new().commands(COMMANDS)),
    )
    .expect("failed to run tauri-build");
}
