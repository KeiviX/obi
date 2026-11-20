// Orchard core: injected into music.apple.com on every page load (main frame only).
// Builds the obi band and window chrome, hooks the page's own MusicKit instance,
// and reports playback to the Rust side.
(() => {
  if (window.__orchard) return;

  const ipc = () => window.__TAURI_INTERNALS__;
  const invoke = (cmd, args = {}) =>
    ipc() ? ipc().invoke(cmd, args) : Promise.reject(new Error("Tauri IPC unavailable"));
  const log = (level, msg) =>
    invoke("log", { level, msg: String(msg) }).catch(() => {});

  const orchard = (window.__orchard = { invoke, log, mk: null });

  const OBI_IDLE = { bg: "#D21A2E", ink: "#FFF4E8" };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  const ICONS = {
    minimize: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5h10"/></svg>',
    maximize: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="3.5" width="9" height="9" rx="1"/></svg>',
    restore: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.5" y="5.5" width="7" height="7" rx="1"/><path d="M5.5 5.5V4.5a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1"/></svg>',
    close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
    mini: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="11" rx="1.5"/><rect class="fill" x="10" y="9.5" width="5.5" height="4" rx=".75"/></svg>',
  };

  const fmtTime = (s) => {
    if (!isFinite(s) || s < 0) return "";
    s = Math.floor(s);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  // Inks: use Apple's artwork colours, but never below 4.5:1 against the band.
  const lum = (hex) => {
    const n = parseInt(hex.replace("#", ""), 16);
    const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const contrast = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  const inkFor = (bg) => (contrast(bg, "#141213") > contrast(bg, "#FFF4E8") ? "#141213" : "#FFF4E8");
  const legible = (ink, bg) => (ink && contrast(ink, bg) >= 4.5 ? ink : inkFor(bg));

  // --- Stylesheet -----------------------------------------------------------
  const addCss = () => {
    if (document.getElementById("orchard-css")) return;
    const style = document.createElement("style");
    style.id = "orchard-css";
    style.textContent = window.__ORCHARD_CSS__ || "";
    (document.head || document.documentElement).appendChild(style);
  };

  // --- Chrome: obi band, drag strip, window controls -------------------------
  let obi, obiTime, maxBtn, lastTrackKey = null;

  const buildChrome = () => {
    if (document.getElementById("orchard-chrome")) return;
    const root = document.createElement("div");
    root.id = "orchard-chrome";
    root.innerHTML = `
      <aside class="o-obi" aria-label="Now playing" data-o-drag>
        <div class="o-obi__sheets" data-o-drag></div>
        <span class="o-obi__time" data-o-drag></span>
        <button class="o-obi__mini" type="button" aria-label="Switch to mini player" title="Mini player (Ctrl+M)">${ICONS.mini}</button>
      </aside>
      <div class="o-dragstrip" data-o-drag></div>
      <div class="o-winctl" role="group" aria-label="Window">
        <button type="button" data-o-win="minimize" aria-label="Minimize">${ICONS.minimize}</button>
        <button type="button" data-o-win="maximize" aria-label="Maximize">${ICONS.maximize}</button>
        <button type="button" data-o-win="close" class="o-winctl__close" aria-label="Close">${ICONS.close}</button>
      </div>`;
    document.body.appendChild(root);
    document.documentElement.classList.add("orchard");

    obi = root.querySelector(".o-obi");
    obiTime = root.querySelector(".o-obi__time");
    maxBtn = root.querySelector('[data-o-win="maximize"]');

    root.querySelector(".o-obi__mini").addEventListener("click", () => invoke("toggle_mini").catch(log.bind(null, "error")));
    root.querySelectorAll("[data-o-win]").forEach((b) =>
      b.addEventListener("click", () =>
        invoke("window_control", { action: b.dataset.oWin }).then(setMaximized).catch(() => {})
      )
    );
    root.addEventListener("mousedown", (e) => {
      if (e.button !== 0 || !e.target.closest("[data-o-drag]") || e.target.closest("button")) return;
      if (e.detail === 2) {
        invoke("window_control", { action: "maximize" }).then(setMaximized).catch(() => {});
      } else {
        invoke("window_drag").catch(() => {});
      }
    });
    invoke("window_control", { action: "query" }).then(setMaximized).catch(() => {});
    addEventListener("resize", () => invoke("window_control", { action: "query" }).then(setMaximized).catch(() => {}));

    printObi(null);
  };

  const setMaximized = (isMax) => {
    if (!maxBtn) return;
    maxBtn.innerHTML = isMax ? ICONS.restore : ICONS.maximize;
    maxBtn.setAttribute("aria-label", isMax ? "Restore" : "Maximize");
    document.documentElement.classList.toggle("orchard--maximized", !!isMax);
  };

  // Each track gets its own obi: a new band is printed over the old one, top to bottom.
  const printObi = (track) => {
    if (!obi) return;
    const key = track ? track.id || track.title + track.artist : "idle";
    if (key === lastTrackKey) return;
    lastTrackKey = key;

    const bg = (track && track.bgColor) || OBI_IDLE.bg;
    const ink = track && track.bgColor ? legible(track.textColor, bg) : OBI_IDLE.ink;
    const ink2 = track && track.bgColor ? legible(track.textColor2, bg) : OBI_IDLE.ink;
    document.documentElement.style.setProperty("--obi-bg", bg);
    document.documentElement.style.setProperty("--obi-ink", ink);

    const sheets = obi.querySelector(".o-obi__sheets");
    const sheet = document.createElement("div");
    sheet.className = "o-obi__sheet";
    sheet.dataset.oDrag = "";
    sheet.style.setProperty("--sheet-bg", bg);
    sheet.style.setProperty("--sheet-ink", ink);
    sheet.style.setProperty("--sheet-ink-2", ink2);
    const title = document.createElement("span");
    title.className = "o-obi__title";
    title.dataset.oDrag = "";
    title.textContent = track ? track.title : "Orchard";
    const artist = document.createElement("span");
    artist.className = "o-obi__artist";
    artist.dataset.oDrag = "";
    artist.textContent = track ? track.artist : "Nothing playing";
    sheet.append(title, artist);
    sheet.title = track ? `${track.title} · ${track.artist}` : "";
    sheets.appendChild(sheet);

    const old = [...sheets.children].slice(0, -1);
    if (reducedMotion.matches || !old.length) {
      old.forEach((o) => o.remove());
    } else {
      sheet.classList.add("o-obi__sheet--printing");
      sheet.addEventListener("animationend", () => {
        sheet.classList.remove("o-obi__sheet--printing");
        old.forEach((o) => o.remove());
      }, { once: true });
    }
    if (!track && obiTime) obiTime.textContent = "";
  };

  const ready = () => {
    addCss();
    buildChrome();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready, { once: true });
  } else {
    ready();
  }

  // Ctrl+M toggles the mini player.
  addEventListener("keydown", (e) => {
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "m") {
      e.preventDefault();
      invoke("toggle_mini").catch(() => {});
    }
  }, true);

  // --- DRM probe: full-length playback needs one of these key systems -------
  (async () => {
    const config = [{
      initDataTypes: ["cenc"],
      audioCapabilities: [{ contentType: 'audio/mp4; codecs="mp4a.40.2"' }],
    }];
    const result = {};
    for (const ks of ["com.widevine.alpha", "com.microsoft.playready.recommendation"]) {
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
  const hex = (v) => (v ? "#" + String(v).replace(/^#/, "") : null);
  const toTrack = (item) => {
    if (!item) return null;
    const a = item.attributes || {};
    const art = item.artwork || a.artwork || {};
    return {
      id: item.id ? String(item.id) : null,
      title: item.title || a.name || "Unknown",
      artist: item.artistName || a.artistName || "Unknown",
      album: item.albumName || a.albumName || null,
      durationMs: a.durationInMillis ?? (item.playbackDuration || null),
      artworkUrl: art.url ? art.url.replace("{w}", "600").replace("{h}", "600").replace("{f}", "jpg") : null,
      bgColor: hex(art.bgColor),
      textColor: hex(art.textColor1),
      textColor2: hex(art.textColor2),
    };
  };

  orchard.control = (action, value) => {
    const mk = orchard.mk;
    if (!mk) return;
    switch (action) {
      case "toggle": return mk.isPlaying ? mk.pause() : mk.play();
      case "next": return mk.skipToNextItem();
      case "prev": return mk.skipToPreviousItem();
      case "seek": return value != null && mk.seekToTime(value);
    }
  };

  const attach = (mk) => {
    const E = window.MusicKit.Events || {};
    const stateName = (s) =>
      (window.MusicKit.PlaybackStates && window.MusicKit.PlaybackStates[s]) || String(s);

    const sendTrack = () => {
      const track = toTrack(mk.nowPlayingItem);
      printObi(track);
      invoke("now_playing", { track }).catch(() => {});
    };
    let lastSent = 0;
    const sendTime = () => {
      const cur = mk.currentPlaybackTime || 0;
      const dur = mk.currentPlaybackDuration || 0;
      if (obiTime) obiTime.textContent = dur ? fmtTime(cur) : "";
      const now = Date.now();
      if (now - lastSent >= 1000) {
        lastSent = now;
        invoke("playback_time", { current: cur, duration: dur }).catch(() => {});
      }
    };

    mk.addEventListener(E.nowPlayingItemDidChange || "nowPlayingItemDidChange", sendTrack);
    mk.addEventListener(E.playbackTimeDidChange || "playbackTimeDidChange", sendTime);
    mk.addEventListener(E.playbackStateDidChange || "playbackStateDidChange", (e) => {
      const s = e && e.state !== undefined ? e.state : mk.playbackState;
      const name = stateName(s);
      document.documentElement.classList.toggle("orchard--playing", name === "playing");
      invoke("playback_state", { state: name }).catch(() => {});
    });
    mk.addEventListener(E.authorizationStatusDidChange || "authorizationStatusDidChange", () => {
      log("info", "signed in: " + !!mk.isAuthorized);
    });

    orchard.mk = mk;
    if (mk.nowPlayingItem) sendTrack();

    // Dev: open the mini player through the same IPC path as the obi button.
    if (window.__ORCHARD_OPEN_MINI__) {
      setTimeout(() => {
        const btn = document.querySelector(".o-obi__mini");
        if (btn) btn.click();
      }, 6000);
    }

    // Dev: play a chart song preview (ORCHARD_DEMO=1) to exercise the obi without signing in.
    if (window.__ORCHARD_DEMO__) {
      setTimeout(async () => {
        try {
          const sf = mk.storefrontId || "us";
          const res = await mk.api.music(`/v1/catalog/${sf}/charts`, { types: "songs", limit: 3 });
          const songs = res.data.results.songs[0].data;
          const song = songs[Number(window.__ORCHARD_DEMO__) % songs.length] || songs[0];
          await mk.setQueue({ song: song.id, startPlaying: true });
          log("info", "demo playing " + song.attributes.name);
        } catch (e) {
          log("warn", "demo failed: " + e);
        }
      }, 2500);
    }
    log("info", `MusicKit ${window.MusicKit.version || "?"} attached, signed in: ${!!mk.isAuthorized}`);
  };

  // --- Dev: dump page structure (run with ORCHARD_DEBUG=1) -------------------
  if (window.__ORCHARD_DEBUG__) {
    window.addEventListener("load", () => setTimeout(() => {
      const lines = [];
      const walk = (el, depth) => {
        if (depth > 7) return;
        const r = el.getBoundingClientRect();
        if (r.width < 120 && r.height < 30) return;
        const attrs = ["id", "data-testid", "aria-label", "role"]
          .map((a) => el.getAttribute(a) ? `${a}=${el.getAttribute(a)}` : "")
          .filter(Boolean).join(" ");
        const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 4).join(".") : "";
        const pos = getComputedStyle(el).position;
        lines.push(`${"  ".repeat(depth)}${el.tagName.toLowerCase()}${cls ? "." + cls : ""} ${attrs} [${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} ${pos}]`);
        for (const c of el.children) walk(c, depth + 1);
      };
      walk(document.body, 0);
      log("dom", "\n" + lines.join("\n"));
      const heads = [...document.querySelectorAll("h1, h2, h3")].slice(0, 12).map((h) => {
        const chain = [];
        for (let e = h; e && chain.length < 4; e = e.parentElement) {
          chain.push(e.tagName.toLowerCase() + (e.dataset.testid ? `[${e.dataset.testid}]` : "") + "." + String(e.className).split(" ")[0]);
        }
        return `${h.textContent.trim().slice(0, 30)} <- ${chain.join(" < ")}`;
      });
      log("heads", "\n" + heads.join("\n"));
      for (const sel of [".chrome-player__lcd", "[data-testid=navigation]"]) {
        const el = document.querySelector(sel);
        if (el) {
          const cs = getComputedStyle(el);
          log("html", `${sel} bg=${cs.backgroundColor}\n` + el.outerHTML.replace(/<path[^>]*>/g, "").replace(/innerhtml="[^"]*"/g, "").slice(0, 2500));
        }
      }
      for (const sel of ["[data-testid=player-bar]", "[data-testid=header]", ".app-container"]) {
        const el = document.querySelector(sel);
        if (!el) continue;
        const cs = getComputedStyle(el), r = el.getBoundingClientRect();
        log("box", `${sel} rect=${Math.round(r.left)}..${Math.round(r.right)} pos=${cs.position} left=${cs.left} ml=${cs.marginLeft} w=${cs.width} display=${cs.display} grid=${cs.gridTemplateColumns} area=${cs.gridArea} col=${cs.gridColumn}`);
      }
      // Which elements paint the sidebar area?
      const painted = document.elementsFromPoint(150, 400).map((e) =>
        `${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]} bg=${getComputedStyle(e).backgroundColor}`);
      log("paint", painted.join(" | "));
      const vars = [];
      const cs = getComputedStyle(document.documentElement);
      for (const p of cs) if (p.startsWith("--")) vars.push(`${p}: ${cs.getPropertyValue(p).trim()}`);
      log("vars", "\n" + vars.join("\n"));
    }, 4000));
  }

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
