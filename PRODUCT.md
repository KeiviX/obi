# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primarily the author: an Apple Music subscriber on Windows 11 who is frustrated with the official app's bugs. Orchard runs in the background while they work in other apps. They glance at it, skip tracks, adjust the queue and go back to work. Other Apple Music users on Windows may adopt it later, but personal taste comes first.

## Product Purpose
A desktop Apple Music client that fixes what the official Windows app gets wrong: a slow and unreliable library, queue/shuffle bugs, lag, missing integrations and poor discovery. Success means the author uses it every day instead of the official app.

## Positioning
Orchard is the real Apple Music web player inside a native Rust/Tauri shell, plus a layer of fixes and features the owner controls. Users keep their own Apple ID sign-in and subscription, with full catalogue and DRM playback, while the shell adds a local library cache, saner queue logic and native integrations.

## Operating Context
- Windows 11 desktop, usually behind or beside work apps. The window is often small or partly covered, so the most frequent actions are glanceable: what's playing, skip, queue.
- Playback, catalogue and sign-in come from music.apple.com, rendered in WebView2. Its UI is restyled with injected CSS/JS (`inject/`).
- Native shell: Tauri v2 window, with a tray, media keys, a mini-player and local pages (`ui/`) planned.

## Capabilities and Constraints
- Apple controls the web player's markup and can change it at any time. Restyling must use few, resilient selectors and CSS variables, and degrade gracefully when they break.
- Audio, DRM and the catalogue are Apple's. Orchard cannot change audio playback internals.
- Album artwork is the main visual content and must not be tinted or cropped in ways that misrepresent it.
- Unofficial: must not present itself as an Apple product or use Apple's branding as its own identity.

## Brand Commitments
- Name: Orchard (working name, may change).
- The app icon is a green squircle with a music note and a leaf (`src-tauri/icons/icon.svg`). It's a placeholder, not a binding commitment.

## Evidence on Hand
None: no users, testimonials or metrics yet. Don't fabricate any.

## Product Principles
1. Glanceable first: now playing and the next action are readable in a second from a small window.
2. Stay out of the way: no upsells, nags or clutter between the user and their music.
3. Resilient over clever: a restyle that breaks when Apple changes its markup is worse than none.
4. Artwork leads: the music's own art carries the colour and mood.
