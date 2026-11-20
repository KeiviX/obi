# Orchard

A desktop client for Apple Music on Windows, built with Rust and [Tauri](https://tauri.app).

Orchard loads the official web player (music.apple.com) in a native window and adds what the official app lacks: a fast local library, saner queue and shuffle, media-key and tray integration, Discord presence, last.fm scrobbling, and better discovery.

## Signing in

You sign in with your own Apple ID on Apple's own sign-in page, inside the app window. Playback uses your own Apple Music subscription. Orchard does not need its own Apple developer key.

Orchard controls the window that the sign-in page runs in. Only use builds you trust, which is why the source is open: you can check that `inject/` never reads the sign-in form. The injected script only runs on `music.apple.com` (main frame), and the remote page is only allowed to call Orchard's own commands (see `src-tauri/capabilities/default.json`).

## Look

Orchard replaces the generic window with an **obi strip**, after the paper band on Japanese import LPs. A band down the left edge shows what's playing in vertical type, and every track re-prints it in that album's own colours. The rest of Apple's page is re-inked to a dark sleeve-black, set in Segoe UI (Apple's stack otherwise falls back to Arial on Windows), and stripped of upsells.

**Mini player:** click the icon at the foot of the obi or press `Ctrl+M`. It works like the Mac version: the full window hides and a small always-on-top player appears (artwork, obi and controls on hover). Press `Ctrl+M` or the expand icon to return. Inside the mini player, `Space` plays/pauses and `Ctrl+←/→` skips.

## Development

Requirements: Rust (stable), the WebView2 runtime (included with Windows 11), and the Tauri CLI (`cargo install tauri-cli --version "^2"`).

```sh
cargo tauri dev      # run
cargo tauri build    # installer in src-tauri/target/release/bundle/
```

Dev environment variables:

- `ORCHARD_DEBUG=1`: log Apple's page structure, headings and CSS variables (use this when Apple changes its markup and a restyle stops matching)
- `ORCHARD_DEMO=<n>`: play a 30-second preview of chart song *n* (1-based) without signing in
- `ORCHARD_OPEN_MINI=1`: start in the mini player

The display face is Dela Gothic One (SIL OFL, `ui/fonts/OFL.txt`).

## Layout

- `src-tauri/`: the Rust app (window, IPC commands, integrations)
- `inject/`: JS/CSS injected into music.apple.com (`core.js` hooks the page's MusicKit instance)
- `ui/`: local pages (settings, mini-player, library, Discover)

Orchard is an unofficial project and is not affiliated with Apple.
