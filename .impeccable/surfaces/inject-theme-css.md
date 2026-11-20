---
version: 1
slug: "inject-theme-css"
primary_target: "inject/theme.css"
related_targets: ["inject/core.js","ui/mini.html"]
---

# Surface: Orchard shell (main window restyle + mini player)

Scope: the frameless main window wrapping music.apple.com (inject/theme.css, inject/core.js) and the mini player (ui/mini.html). Mode: Operate. Glanced at beside dark work apps; frequent actions are what's playing, skip, queue, and toggling the mini player.

Constraints: Apple owns the page markup, so selectors stay few and resilient and degrade to Apple's own look. Artwork is never tinted or cropped misleadingly. No Apple branding as identity.

## Direction contract

THESIS: every track gets its own obi. A printed band wraps the window's left edge like the paper obi on a Japanese import LP, re-printed per record in that album's own colours. It refuses the category default of a grey sidebar plus a floating glass player.

OWN-WORLD: dark sleeve-black ground (#141213), warm off-white ink, warm grey secondary. The obi is a flat full-height band in the artwork's bgColor with textColor1 ink, and falls back to obi red (#D21A2E) when idle. Display type is Dela Gothic One (self-hosted), set vertically on the obi and on page titles. Lists stay in the system UI face. Flat print: no glass, no gradients.

STORY: at a glance from another app you read the band's colour and the vertical title and know what's playing; one click on the band opens the mini player.

FIRST VIEWPORT: a 56px obi on the far left, full height. At its top is the drag area, then the vertical title and artist set from the head of the band (as an obi reads top-down), then elapsed time in tabular figures, and at the foot the mini-player toggle. Window controls sit top right in a thin strip. Apple's sidebar and content sit to the right with the upsell removed, and page titles are set in Dela Gothic. The mini player is 356x300: a 300px square sleeve of full-bleed artwork with the 56px obi down its left side and controls printed on hover. The player bar docks flush to the bottom edge, with no floating pill.

FORM: Obi Strip, rank 1 on my ordered list (pick card, chosen by the user over the roll); seed key e37f150b.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
