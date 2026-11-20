// Orchard core: injected into music.apple.com on every page load (main frame only).
// It hooks the page's own MusicKit instance and reports state to the Rust side.
(() => {
  if (window.__orchard) return;

  const ipc = () => window.__TAURI_INTERNALS__;
  const invoke = (cmd, args = {}) =>
    ipc() ? ipc().invoke(cmd, args) : Promise.reject(new Error("Tauri IPC unavailable"));
  const log = (level, msg) =>
    invoke("log", { level, msg: String(msg) }).catch(() => {});

  window.__orchard = { invoke, log };

  // --- Stylesheet -----------------------------------------------------------
  const addCss = () => {
    if (document.getElementById("orchard-css")) return;
    const style = document.createElement("style");
    style.id = "orchard-css";
    style.textContent = window.__ORCHARD_CSS__ || "";
    (document.head || document.documentElement).appendChild(style);
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addCss, { once: true });
  } else {
    addCss();
  }

  // --- DRM probe: full-length playback needs one of these key systems -------
  (async () => {
    const config = [{
      initDataTypes: ["cenc"],
      audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
    }];
    const systems = [
      "com.widevine.alpha",
      "com.microsoft.playready.recommendation",
      "com.microsoft.playready",
    ];
    const result = {};
    for (const ks of systems) {
      try {
        await navigator.requestMediaKeySystemAccess(ks, config);
        result[ks] = true;
      } catch {
        result[ks] = false;
      }
    }
    log("info", "DRM support: " + JSON.stringify(result));
  })();

  // --- MusicKit hook --------------------------------------------------------
  const toTrack = (item) => {
    if (!item) return null;
    const a = item.attributes || {};
    const art = item.artwork || a.artwork;
    return {
      id: item.id ? String(item.id) : null,
      title: item.title || a.name || "Unknown",
      artist: item.artistName || a.artistName || "Unknown",
      album: item.albumName || a.albumName || null,
      durationMs: a.durationInMillis ?? (item.playbackDuration || null),
      artworkUrl: art && art.url
        ? art.url.replace("{w}", "512").replace("{h}", "512")
        : null,
    };
  };

  const attach = (mk) => {
    const E = window.MusicKit.Events || {};
    const stateName = (s) =>
      (window.MusicKit.PlaybackStates && window.MusicKit.PlaybackStates[s]) || String(s);

    mk.addEventListener(E.nowPlayingItemDidChange || "nowPlayingItemDidChange", () => {
      invoke("now_playing", { track: toTrack(mk.nowPlayingItem) }).catch(() => {});
    });
    mk.addEventListener(E.playbackStateDidChange || "playbackStateDidChange", (e) => {
      const s = e && e.state !== undefined ? e.state : mk.playbackState;
      invoke("playback_state", { state: stateName(s) }).catch(() => {});
    });
    mk.addEventListener(E.authorizationStatusDidChange || "authorizationStatusDidChange", () => {
      log("info", "signed in: " + !!mk.isAuthorized);
    });

    window.__orchard.mk = mk;
    log("info", `MusicKit ${window.MusicKit.version || "?"} attached, signed in: ${!!mk.isAuthorized}`);
  };

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    let mk = null;
    try {
      mk = window.MusicKit && window.MusicKit.getInstance && window.MusicKit.getInstance();
    } catch {}
    if (mk) {
      clearInterval(timer);
      attach(mk);
    } else if (tries > 120) {
      clearInterval(timer);
      log("warn", "MusicKit instance not found after 60s");
    }
  }, 500);
})();
