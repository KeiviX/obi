# Orchard

A desktop client for Apple Music on Windows, built with Rust and [Tauri](https://tauri.app).

Orchard loads the official web player (music.apple.com) in a native window and adds what the official app lacks: a fast local library, saner queue and shuffle, media-key and tray integration, Discord presence, last.fm scrobbling, and better discovery.

## Signing in

You sign in with your own Apple ID on Apple's own sign-in page, inside the app window. Playback uses your own Apple Music subscription. Orchard does not need its own Apple developer key.

Orchard controls the window that the sign-in page runs in. Only use builds you trust, which is why the source is open: you can check that `inject/` never reads the sign-in form. The injected script only runs on `music.apple.com` (main frame), and the remote page is only allowed to call Orchard's own commands (see `src-tauri/capabilities/default.json`).

## Development

Requirements: Rust (stable), the WebView2 runtime (included with Windows 11), and the Tauri CLI (`cargo install tauri-cli --version "^2"`).

```sh
cargo tauri dev      # run
cargo tauri build    # installer in src-tauri/target/release/bundle/
```

## Layout

- `src-tauri/`: the Rust app (window, IPC commands, integrations)
- `inject/`: JS/CSS injected into music.apple.com (`core.js` hooks the page's MusicKit instance)
- `ui/`: local pages (settings, mini-player, library, Discover)

Orchard is an unofficial project and is not affiliated with Apple.
