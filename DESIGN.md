---
name: Orchard
description: An Apple Music client for Windows whose window wears a printed obi, re-inked for every record.
colors:
  obi-red: "#d21a2e"
  obi-cream: "#fff4e8"
  sleeve-black: "#141213"
  sidebar-black: "#1a1718"
  raised-black: "#221e1f"
  warm-ink: "#f1ece4"
  warm-ink-2: "rgba(241, 236, 228, 0.68)"
  warm-ink-3: "rgba(241, 236, 228, 0.46)"
  hairline: "rgba(241, 236, 228, 0.09)"
  hover-wash: "rgba(241, 236, 228, 0.06)"
  sleeve-scrim: "rgba(12, 10, 11, 0.58)"
  windows-close-red: "#c42b1c"
typography:
  display:
    fontFamily: "Orchard Display (Dela Gothic One), Segoe UI Black, sans-serif"
    fontSize: "52px"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "0"
  headline:
    fontFamily: "Orchard Display (Dela Gothic One), Segoe UI Black, sans-serif"
    fontWeight: 400
    letterSpacing: "0.01em"
  title:
    fontFamily: "Orchard Display (Dela Gothic One), Segoe UI Black, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: "26px"
    letterSpacing: "0.02em"
  body:
    fontFamily: "Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "18px"
    letterSpacing: "0.04em"
  numeric:
    fontFamily: "Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.02em"
    fontFeature: "tnum"
rounded:
  none: "0px"
  sm: "5px"
  md: "8px"
  full: "50%"
spacing:
  hair: "2px"
  sm: "8px"
  rule-inset: "10px"
  md: "14px"
  lg: "18px"
  control: "32px"
  obi: "56px"
components:
  obi-band:
    backgroundColor: "{colors.obi-red}"
    textColor: "{colors.obi-cream}"
    rounded: "{rounded.none}"
    width: "{spacing.obi}"
  window-control:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink-2}"
    rounded: "{rounded.none}"
    width: "46px"
    height: "{spacing.control}"
  window-control-hover:
    backgroundColor: "{colors.hairline}"
    textColor: "{colors.warm-ink}"
  window-control-close-hover:
    backgroundColor: "{colors.windows-close-red}"
    textColor: "#ffffff"
  obi-mini-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.obi-cream}"
    rounded: "{rounded.md}"
    size: "40px"
  player-bar:
    backgroundColor: "{colors.raised-black}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.none}"
  transport-play:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.sleeve-black}"
    rounded: "{rounded.full}"
    size: "64px"
  transport-skip:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.full}"
    size: "48px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.md}"
    size: "{spacing.control}"
  button-solid:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.sleeve-black}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
---

# Design System: Orchard

## Overview

**Creative North Star: "The Import Obi"**

Every track gets its own obi. A flat printed band wraps the window's left edge like the paper strip on a Japanese import LP, and it is re-printed for each record in that album's own colours: the artwork's `bgColor` becomes the band, its `textColor1` and `textColor2` become the ink. When nothing plays, the band falls back to Obi Red with cream ink. Everything else sits on a warm sleeve-black ground in warm off-white ink, so the band is the only saturated thing Orchard itself prints.

Orchard restyles a page Apple owns. Its only hooks are Apple's `data-testid` attributes and Apple's own CSS variables (`--pageBG`, `--systemPrimary`, `--navSidebarBG`, `--playerBackground` and siblings), re-pointed at Orchard tokens under `:root.orchard`. Hashed class names are avoided. Anything Orchard cannot reach falls back to Apple's look rather than breaking, and that fallback is intended behaviour, not drift. Apple's editorial content (cards, shelf artwork, their labels and badges) is out of scope: Orchard neither restyles nor imitates it.

The system is flat print. No glass, no blur, no gradients, no floating pills: the player bar docks flush to the bottom edge with a hairline on top, and depth comes from three tonal steps of warm black. Display type is Dela Gothic One, set vertically on the band and horizontally on page titles; lists and controls stay in the Windows system face.

**Key Characteristics:**
- A 56px full-height obi on the far left, re-inked per track, with a top-to-bottom print wipe on change.
- Warm sleeve-black ground, three tonal steps, warm off-white ink at three opacities.
- Dela Gothic One for titles only; Segoe UI for everything read in lists.
- Flat print: hairlines and tone instead of shadow, blur or gradient.
- Restyle through Apple's test ids and CSS variables only; unreached parts degrade to Apple's own look.

## Colors

A near-monochrome warm-black world with one printed band whose colour belongs to the record, not to Orchard.

### Primary
- **Obi Red** (`obi-red`): the band's idle colour, shown when nothing is playing, and the text-selection highlight. While a track plays the band takes the artwork's `bgColor` instead; Obi Red is the fallback, not a permanent accent.
- **Obi Cream** (`obi-cream`): ink on the idle band and on selected text. Also one of the two contrast-fallback inks for per-track bands.

### Neutral
- **Sleeve Black** (`sleeve-black`): page ground (`--pageBG`), the mini player ground, the dark contrast-fallback ink on light bands, and the glyph colour inside solid ink buttons.
- **Sidebar Black** (`sidebar-black`): Apple's navigation sidebar, one step up from the ground.
- **Raised Black** (`raised-black`): the docked player bar, Apple's fallback material, and the empty sleeve in the mini player.
- **Warm Ink** (`warm-ink`): primary text (`--systemPrimary`), selected nav label and icon, focus rings, solid buttons, progress fill.
- **Warm Ink 2** (`warm-ink-2`): secondary text (`--systemSecondary`), resting window controls, hovered nav icons, mini-player times and empty-state copy.
- **Warm Ink 3** (`warm-ink-3`): tertiary text (`--systemTertiary`) and resting nav icons, which replace Apple's blue.
- **Hairline** (`hairline`): sidebar edge, player-bar top rule, context-menu borders, selected nav row, window-control hover.
- **Hover Wash** (`hover-wash`): Apple's lockup hover (`--lockupHoverBGColor`).
- **Sleeve Scrim** (`sleeve-scrim`): the darkening layer that appears over mini-player artwork only while controls are shown on hover or focus.
- **Windows Close Red** (`windows-close-red`): the close button's hover, matching the Windows 11 caption convention. Used nowhere else.

### Named Rules
**The Record Owns the Colour Rule.** The band's colour is the playing album's `bgColor`; Orchard does not pick, tint or harmonise it. Obi Red exists only for the idle state.

**The 4.5:1 Ink Rule.** Per-track inks come from the artwork's `textColor1` / `textColor2`, but any ink below 4.5:1 against its band is replaced by whichever of Sleeve Black or Obi Cream contrasts more. Legibility beats fidelity.

**The Warm Alpha Rule.** Every translucent neutral is Warm Ink (`241, 236, 228`) at an alpha: 0.03 even rows, 0.06 hover wash, 0.09 hairline and selection, 0.12 to 0.14 control hover, 0.16 to 0.28 scrollbar thumb, 0.18 progress track, 0.22 control press. Never neutral grey, never Apple's blue.

## Typography

**Display Font:** Dela Gothic One, registered as "Orchard Display" (with Segoe UI Black, then sans-serif)
**Body Font:** Segoe UI, the Windows system face (with sans-serif). Apple's "SF Pro" is aliased to Segoe UI weight for weight via `@font-face local()`, so Apple's own text renders in Segoe UI instead of falling back to Arial.

**Character:** a heavy, compressed-feeling Japanese-poster gothic for names, against a plain system face that keeps lists quiet and native.

### Hierarchy
- **Display** (400, 52px, 1.02, balanced wrap): Apple page titles (the page header `h1`, e.g. "Home").
- **Headline** (400, Apple's size, 0.01em): Apple shelf titles ("Top Picks for You", "Recently Played"); Orchard changes only the face and tracking.
- **Title** (400, 19px / 26px, 0.02em, vertical-rl): the track title on the obi, read top-down; 18px / 25px in the mini player.
- **Body** (400, 13px, 1.3): mini-player base text; Apple's own body text in the main window via the SF Pro alias.
- **Label** (600, 12px / 18px, 0.04em, vertical-rl): the artist line on the obi, set in the band's secondary ink.
- **Numeric** (600, 11px, tabular figures): elapsed time on the obi and the mini-player times.

### Named Rules
**The Names Only Rule.** Dela Gothic One sets names: track titles, page titles, shelf titles. Never lists, labels, buttons or numerals.

**The Obi Reads Down Rule.** Text on the band is `vertical-rl`, starting from the head of the band, title to the right of artist, truncated with an ellipsis rather than shrunk.

## Layout

The main window is a frameless shell: the obi occupies a fixed 56px column on the left, full height, and Apple's `.body-container` is shifted right by exactly that width. Window controls are three 46 x 32px buttons fixed top right; a 14px drag strip runs along the top between the obi and the controls. The obi itself is draggable except its button.

On the band, a printed hairline rule sits 10px in from each side near the head and near the foot (56px from the top and 96px from the bottom in the main window; 18px from each end in the mini player). Title and artist sit between the rules with a 2px gap; elapsed time sits above the foot; the mini-player toggle (40px) sits at the foot.

The mini player is 356 x 300: the 56px obi down the left, then a 300px square sleeve of full-bleed artwork. Controls print over the sleeve on hover or focus: a corner group 8px from the top right, centred transport with an 18px gap, times inset 14px and 18px from the foot, and a 4px progress track flush to the bottom edge that thickens to 6px on hover.

The player bar docks flush to the bottom and fills Apple's grid column (it does not use Apple's `100vw` width, which would overflow under the obi).

## Elevation & Depth

Flat. Orchard uses no shadows, no backdrop blur and no gradients; it actively strips Apple's (`box-shadow: none`, `backdrop-filter: none` on the player and its descendants, and on the navigation). Depth is three tonal steps of warm black (ground, sidebar, raised) plus Hairline rules. The only layering is the obi itself (fixed above the page) and the mini-player scrim, which appears only on interaction.

### Named Rules
**The Flat Print Rule.** No glass, no blur, no gradient, no drop shadow. Separate surfaces with a tone step or a 1px Hairline.

## Shapes

Square by default. The obi, the docked player bar, window controls, the sleeve and the progress track have no radius. Small interactive targets inside those surfaces take a gentle 8px radius (mini-player toggle, corner icon buttons, the empty-state button). Transport buttons are circles. Scrollbar thumbs use 5px. Authored icons are 1.1 to 1.4px strokes with 1 to 1.5px corner radii on their rectangles, drawn on 16, 20 or 24px grids; transport glyphs are filled.

## Components

### Obi Band (signature)
A flat, full-height printed band, re-printed per track.
- **Colour:** the track's artwork `bgColor`, ink per the 4.5:1 Ink Rule; idle is Obi Red with Obi Cream and the text "Orchard / Nothing playing".
- **Rules:** two 1px rules in `currentColor` at 35% opacity, inset 10px.
- **Motion:** on track change a new sheet is laid over the old one and revealed top to bottom with `clip-path: inset(0 0 100% 0)` to `inset(0)` over 720ms on `cubic-bezier(0.16, 1, 0.3, 1)`; the band colour cross-fades over 600ms. With reduced motion the sheet swaps instantly.
- **Hover title:** the sheet carries a native tooltip "Title · Artist" for truncated names.

### Buttons
- **Window controls:** transparent, Warm Ink 2 glyphs; hover fills with Hairline and lifts the glyph to Warm Ink; press at 0.14 alpha; close turns Windows Close Red with white glyph. 120ms linear. Focus is an inset 2px Warm Ink outline.
- **Obi mini toggle:** 40px, 8px radius, transparent, inherits the band's ink; hover and press are `currentColor` mixed at 16% and 26%, so it works on any band colour. 160ms. Focus is an inset 2px `currentColor` outline.
- **Transport (mini player):** play/pause is a 64px Warm Ink disc with a Sleeve Black glyph; skip buttons are 48px transparent circles with a 0.12 Warm Ink hover. Hover scales to 1.06, press to 0.96, 160ms.
- **Icon button (mini player):** 32px, 8px radius, 16px stroked icon; hover 0.14, press 0.22.
- **Solid button:** Warm Ink fill, Sleeve Black 600-weight text, 8px radius, 8px 14px padding (the mini player's "Open full window").

### Navigation
Apple's sidebar on Sidebar Black with a Hairline right edge; Apple's translucent nav layer is made transparent. Icons are forced to `currentColor` in Warm Ink 3, Warm Ink 2 on hover, Warm Ink with the label when selected; the selected row uses Hairline.

### Player Bar
Apple's player docked flush to the bottom, full column width, Raised Black, square corners, a 1px Hairline top rule, no glass and no shadow. Apple's own controls and LCD content are untouched beyond the inherited ink tokens.

### Mini Player Sleeve
Full-bleed artwork, never tinted at rest; it fades in over 400ms on load. Controls and the Sleeve Scrim appear only on hover or focus-within. With no track, the sleeve shows a centred empty state in Warm Ink 2 and a single solid button.

## Do's and Don'ts

### Do:
- **Do** restyle Apple's page only through `data-testid` hooks and Apple's CSS variables under `:root.orchard`, and let anything unmatched fall back to Apple's look.
- **Do** take the band's colour from the playing artwork's `bgColor` and enforce 4.5:1 on its ink, falling back to Sleeve Black or Obi Cream.
- **Do** separate surfaces with the three warm-black tone steps and 1px Hairline rules.
- **Do** set track, page and shelf titles in Dela Gothic One at weight 400, and everything else in Segoe UI.
- **Do** use `cubic-bezier(0.16, 1, 0.3, 1)` for Orchard's own motion and drop transitions under `prefers-reduced-motion`.
- **Do** draw icons as authored inline SVG with `currentColor` strokes.

### Don't:
- **Don't** add glass, backdrop blur, gradients or drop shadows to any surface.
- **Don't** float the player bar as a pill; it docks flush and square.
- **Don't** tint, crop or overlay album artwork at rest; the scrim is interaction-only.
- **Don't** restyle or imitate Apple's editorial cards and their labels, or present Apple branding as Orchard's identity.
- **Don't** hook hashed Apple class names when a `data-testid` or Apple variable exists.
- **Don't** use Apple's blue or a neutral grey for icons or translucent fills; use Warm Ink at an alpha.
