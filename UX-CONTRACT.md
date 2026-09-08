# Explorer behavior

Visual contract: [DESIGN.md](DESIGN.md). The user plan owns scope.

| Capability | Owner | Behavior |
|---|---|---|
| Route/navigation | state.ts + App | URL query parameters for views and arc/location/character/beat. Back/Forward restores detail navigation. Invalid IDs show recovery. |
| Detail | DetailOverlay | One Radix dialog; fixed header and contents navigation, one reader scroller. Opening captures focus and journey scroll. Switching record replaces content; closing restores origin without dialog stacking. The scroller is bound through a state-backed ref because Radix mounts the portal after the first effect pass. |
| Arc reader | components/arc/* | Sections in fixed order: overview (title card + stats), cast (crew deck, side groups, flip cards), voyage (scroll-drawn route, one diorama per beat with location, mood and present cast), battles (versus card + frame player), legacy (bounty stamps, explored, sources, previous/next stop). Every beat has `id="beat-<id>"` for deep links; nav beat ticks follow the reader. All motion gated by the toggle and reduced-motion. |
| Reading progress | state.ts + reading-horizon + reader-catalog | Persistent completed-arc cutoff, default full coverage. URL navigation never raises it. Filter all discovery surfaces and guard direct detail links. Preserve hidden saves; suppress unbounded profiles, current portraits and undated affiliations. Explicit reveal overrides cover retrospective prose. |
| Character journeys | character-journeys + DiscoveryViews | Searchable directory and chronological character-detail timeline. Moment and battle links use the existing single dialog/history with exact anchors; bounties map to their recorded chapter. |
| Mysteries | mysteries + DiscoveryViews | Four authored question trails with source beat links. Show only unlocked clues and derive status from those clues. Native keyboard-operable disclosures and all/open/resolved filters. |
| Select/Listbox | Native HTML select | Shared choice for reading progress, saga, crew filters and atlas region controls, recorded in premium-ui.json. Preserve platform keyboard and touch behavior. |
| Journey arc entry | App / ArcStop | Island artwork, signboard and Explore arc open that stop's arc directly. Artwork labels and hover previews describe the arc destination. Island field notes remain accessible through Places in this arc and the world atlas. |
| Save / explored | state.ts | Separate saved and explicitly explored identifiers. Reversible toggles. Versioned localStorage. Corrupt/unavailable storage keeps an in-memory session functional. |
| Resume | App | Throttled journey scroll persistence and selected story beat. Resume is explicit; opening a shared link wins. |
| Search | ExplorerViews | Local normalized search across arcs (incl. crew and place names), locations, sagas, crew. `/` opens search. Clear query and empty recovery. URL keeps committed `?q=` (debounced). |
| Route | VoyageRoute | Decorative SVG measured from island cards (`data-route-stop`), runs in the row gap, docks behind the next island; ship follows hovered arc, else first unexplored. Never carries meaning on its own. |
| Motion | App + BattlePlayer | Global persistent toggle, reduced-motion preference. No audio, flash, or autoplay battle. One active battle; pauses out of view/background. Static story remains present. |
| Battle playback | BattlePlayer + battle-timeline.ts | One seekable clock drives all scene layers. Stage button plays/pauses; arrows step to readable key poses, Home/End seek to boundaries. Native labeled range provides scrubbing; shared paper buttons select 0.5×/1×/1.5× speed. Pausing preserves time, replay resets, changing battle resets, and reduced motion disables playback while preserving scrubbing/stepping and all story text. Authored Laboon directions coexist with interpretive shared staging for other battles. |
| Scrollbars | styles.css | Global thumb, track, hover, forced-colors defaults; visible and operable. |
| Feedback | App live region | Save/explore announcements, no native alert/confirm. State reflected on button. |
| Legal | ExplorerViews | Disclaimer, editorial position, terms, privacy and sources at `?view=legal`. Reachable from the footer only, never the main or bottom navigation. Footer entries jump to their section; the anchor retries while the lazy chunk mounts. |
| Footer | App | Four columns (identity, explore, edition, legal) over a copyright bar; single stack of paired columns at 760px. States publication cutoff, spoiler scope and schematic-map caveat on every view. |
| World | WorldView | Labeled schematic topology (x stretched piecewise, Red Line at 70%), zoom 1–3× tweened, drag to pan when zoomed, searchable location list; minor labels appear from 1.5×. |

English only. Touch targets at least 44px. Keyboard focus visible. Bottom navigation hidden in detail screens. Scroll-reveal state lives in `data-seen` / `data-inview` attributes (never `className`, which React rewrites). Main page has natural scroll; detail has one reader scroller. Media dimensions reserved. All record navigation and story text survive missing images.
