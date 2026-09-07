---
version: alpha
colors:
  ocean: "#19C6D2"
  coral: "#F45156"
  gold: "#FFD34E"
  violet: "#7955CC"
  ink: "#10243A"
  paper: "#FFF8E7"
  sea: "#087F91"
typography:
  body:
    fontFamily: "Nunito Sans, sans-serif"
    fontSize: "16px"
    lineHeight: "1.7"
  utility:
    fontFamily: "Press Start 2P, monospace"
    fontSize: "9px"
    lineHeight: "1.8"
rounded:
  control: "4px"
spacing:
  unit: "8px"
components:
  button:
    borderRadius: "4px"
---

# One Piece Odyssey

## Overview
An English-language illustrated field guide for One Piece readers. The signature is a continuous ocean voyage in manga presentation order, punctuated by distinctive pixel-art islands. It should feel like an adventurous printed atlas brought to life. Product register: exploratory content application, no account or commerce.

The supplied plan is the accepted design direction. Concept art in docs/concepts establishes the header, ship-led opening panorama, and ocean route rhythm. An expressive heavy italic headline complements sparse Press Start 2P route labels; reading text uses self-hosted Nunito Sans. Reading overlays use paper surfaces and generous measure.

## Colors
The frontmatter palette mirrors canonical `src/styles.css` variables with the same names. Paper on deep ocean, ink on paper. Coral buttons use ink text for contrast. Gold denotes voyage direction and landmarks. Violet distinguishes the New World. A darker ocean supports light text. Location palettes extend these through each art brief.

## Typography
Nunito Sans 400/600/700/800/900, self-hosted via Fontsource. Headline uses its black italic face, tight leading and tracking. Press Start 2P only for short labels; never body prose. Body 16–18px / 1.7, maximum reading measure 70ch.

## Layout
Header 80px, desktop saga rail 104px, maximum reading dialog 1180px. Hero is a generous two-column composition with the ship on the right and headline on left. Each saga is a panorama: a sticky saga column (title, arc index) beside islands laid two abreast, each with a paper signboard, threaded by a measured dashed gold route whose ship sails to the hovered arc. Punk Hazard, Egghead and Elbaf sit on the rail as their own stops, as in the concept. At 760px and below, the rail becomes a compact saga selector, and main navigation moves to safe-area-aware bottom tabs. Scenes keep entire silhouettes with mobile-specific composition. Native document scrolling remains unrestricted.

## Elevation & Depth
Small offset ink shadows on primary actions and paper labels. Artwork supplies depth through layered pixel clusters. Avoid nested cards, excessive borders, glass effects, or arbitrary decorative badges.

## Shapes
Mostly square controls with 4px corners. Circular route markers. Dashed routes explicitly encode story order, never exact geographic coordinates. One modal system with a contents rail and one text scroller.

## Components
`src/styles.css` owns tokens and global scrollbars. Shared `.button`, `.icon-button`, `.text-link` define all interactive states. `DetailOverlay` owns all record details and focus restoration. `Scene` provides reserved dimensions, responsive art and failure fallback. `PixelScene` owns code-native location artwork. Lucide icons use consistent 1.8px strokes. Motion is generous when the global toggle is on (hero load sequence, drifting clouds and lapping water inside every scene, marching route dashes, scroll reveals, spring dialogs, pixel bursts on save/explore) and fully off with the toggle or `prefers-reduced-motion`; ambient loops pause off-screen and while the tab is hidden.

## Do's and Don'ts
Keep important labels outside decorative art. Show spoilers and publication/editorial cutoff honestly. Use bespoke landmarks, never generic recolored islands. Never draw the unknown appearance or exact coordinates of Laugh Tale as canon. Keep content readable when imagery or storage fails.

## Arc reader (illustrated log)
Opening an arc is a title card, not a document: the island panorama with a saga-colour wash, the arc name slammed in, a hook line, chapter counters, and a ship crossing once. Below it the reader is staged like a manga volume — who is aboard, who stands where (crew gold, allies teal, wild cards violet, foes coral), then the voyage as a gold route the reader draws by scrolling. Each beat is a diorama: the staged location under a beat-specific camera, mood (dawn, day, dusk, night, storm, flashback = sepia, grain and film sprockets), and the people present standing on the shore. Battles open with a versus card and a verdict stamp. Everything stays code-native pixel art; no manga panels are reproduced.

## Map density and mobile controls
The globe is the main visual surface. Keep zoom, reset, rotation and layers outside its canvas, with the layers panel in document flow. At world scale, label only the selected destination. Reveal additional names as the reader zooms: a maximum of three on small canvases and seven on wide canvases. `map-labels.ts` places measured labels within the viewport without intersecting other labels.

Phones use a native sea selector, 44px touch controls, and a compact selected-location action below the globe. “Find an island” focuses the searchable inspector; panning is never required to find a location. At tablet widths the inspector moves below the map to preserve the globe's size. Keep the header, footer and crew cards within 320px layouts.
