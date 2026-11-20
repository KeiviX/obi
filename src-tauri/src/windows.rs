//! Window creation: the frameless main window around music.apple.com and the mini player.

use base64::Engine;
use tauri::window::Color;
use tauri::{AppHandle, Manager, Theme, WebviewUrl, WebviewWindowBuilder};

pub const MAIN: &str = "main";
pub const MINI: &str = "mini";

const APPLE_MUSIC_URL: &str = "https://music.apple.com/";
const CORE_JS: &str = include_str!("../../inject/core.js");
const THEME_CSS: &str = include_str!("../../inject/theme.css");
const DISPLAY_FONT: &[u8] = include_bytes!("../../ui/fonts/DelaGothicOne-latin.woff2");

/// Sleeve-black ground, painted before the page loads so there is no white flash.
const GROUND: Color = Color(20, 18, 19, 255);

/// The script injected into every page load of music.apple.com: the stylesheet
/// (with the display face embedded, since Apple's CSP allows data: fonts), then core.js.
fn init_script() -> String {
    let font = base64::engine::general_purpose::STANDARD.encode(DISPLAY_FONT);
    let css = format!(
        "@font-face{{font-family:'Orchard Display';src:url(data:font/woff2;base64,{font}) format('woff2');font-display:block}}\n{THEME_CSS}"
    );
    let css = serde_json::to_string(&css).expect("css serializes");
    // Dev hooks: ORCHARD_DEBUG dumps page structure, ORCHARD_DEMO=<n> plays a chart preview.
    let debug = std::env::var_os("ORCHARD_DEBUG").is_some();
    // ORCHARD_OPEN_MINI goes through the same page -> IPC path as clicking the obi button.
    let open_mini = std::env::var_os("ORCHARD_OPEN_MINI").is_some();
    let demo = std::env::var("ORCHARD_DEMO")
        .ok()
        .and_then(|v| v.parse::<u32>().ok())
        .map_or("false".to_string(), |n| n.to_string());
    format!(
        "window.__ORCHARD_CSS__ = {css};\nwindow.__ORCHARD_DEBUG__ = {debug};\nwindow.__ORCHARD_DEMO__ = {demo};\nwindow.__ORCHARD_OPEN_MINI__ = {open_mini};\n{CORE_JS}"
    )
}

/// Paint the 1px Windows 11 window border in the ground colour instead of the
/// system accent blue.
fn tint_border(win: &tauri::WebviewWindow) {
    #[cfg(windows)]
    {
        use windows_sys::Win32::Graphics::Dwm::{DwmSetWindowAttribute, DWMWA_BORDER_COLOR};
        if let Ok(hwnd) = win.hwnd() {
            // COLORREF is 0x00BBGGRR.
            let c = GROUND;
            let colorref: u32 = (c.2 as u32) << 16 | (c.1 as u32) << 8 | c.0 as u32;
            unsafe {
                DwmSetWindowAttribute(
                    hwnd.0 as _,
                    DWMWA_BORDER_COLOR as u32,
                    &colorref as *const u32 as _,
                    std::mem::size_of::<u32>() as u32,
                );
            }
        }
    }
    #[cfg(not(windows))]
    let _ = win;
}

pub fn create_main(app: &AppHandle) -> tauri::Result<()> {
    let url = APPLE_MUSIC_URL.parse().expect("valid url");
    let win = WebviewWindowBuilder::new(app, MAIN, WebviewUrl::External(url))
        .title("Orchard")
        .inner_size(1280.0, 820.0)
        .min_inner_size(820.0, 560.0)
        .decorations(false)
        .shadow(true)
        .theme(Some(Theme::Dark))
        .background_color(GROUND)
        .initialization_script(init_script())
        .build()?;
    tint_border(&win);
    Ok(())
}

/// Mac-style switch: opening the mini player hides the main window, closing it brings
/// the main window back. Playback keeps running in the hidden main webview.
pub fn toggle_mini(app: &AppHandle) -> tauri::Result<()> {
    let main = app.get_webview_window(MAIN);
    if let Some(mini) = app.get_webview_window(MINI) {
        mini.close()?;
        return Ok(());
    }
    let mini = WebviewWindowBuilder::new(app, MINI, WebviewUrl::App("mini.html".into()))
        .title("Orchard")
        .inner_size(356.0, 300.0)
        .resizable(false)
        .maximizable(false)
        .decorations(false)
        .shadow(true)
        .always_on_top(true)
        .theme(Some(Theme::Dark))
        .background_color(GROUND)
        .build()?;
    tint_border(&mini);
    if let Some(main) = main {
        main.hide()?;
    }
    Ok(())
}

pub fn show_main(app: &AppHandle) {
    if let Some(main) = app.get_webview_window(MAIN) {
        let _ = main.show();
        let _ = main.unminimize();
        let _ = main.set_focus();
    }
}
