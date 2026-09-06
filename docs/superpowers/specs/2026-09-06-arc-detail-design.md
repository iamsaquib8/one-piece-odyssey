# Arc detail as an illustrated, animated log — design

**Date:** 2026-09-06 · **Requested:** "on every arc click, brainstorm and make it very detailed, with animations, character, storyline, not just texts" and "manga chapter coverage should be till current, 1191" · **Scope:** all 33 arcs.

## Problem
Opening an arc shows a panorama followed by long text. Characters are initial-letter chips, story beats are paragraphs, battles are a caption player. Coverage stops at chapter 1126; the manga is at 1191.

## Goals
1. Every arc opens as a cinematic, illustrated log: title card, animated stats, cast with portraits, illustrated chapter-by-chapter voyage, versus battles, legacy, next stop.
2. Story content deepens: 5–8 beats per arc (major arcs more), 2–3 battles for major arcs, every beat staged with a place, a mood and the people present.
3. Coverage through chapter 1191: Elbaf arc narrated 1126–1191 (ongoing), new Elbaf locations, `coverage.coveredThrough = 1191`.
4. Motion is rich when the toggle is on and fully off under reduced motion or the toggle.

## Approaches considered
- **A. Enrich the existing overlay in place** (more sections in DetailOverlay.tsx). Cheapest, but the file is already dense and cast/scene data has nowhere to live.
- **B. Separate "staging" data + dedicated ArcDetail component tree** (chosen). Prose stays in `arcs-*.ts`; a parallel `staging-*.ts` layer records cast, per-beat location/mood/presence and battle sides. `DetailOverlay` remains the dialog shell; `ArcDetail` owns the arc experience. Testable data, isolated UI.
- **C. Full page route per arc.** Breaks the dialog-based deep-link and back-button model that tests and the UX contract depend on.

## Data model (`src/data/staging.ts`)
`ArcStaging { arcId, hook, cast: CastMember[], beats: Record<beatId, {location?, present, mood?}>, battles: Record<battleId, {a, b, verdict?}> }`. `CastMember { id, name, side: crew|ally|foe|wildcard, role, epithet?, color?, joins? }`. Straw Hats reuse character ids so portraits and profiles resolve; others use stable slugs, many of which already have portrait recipes in `CharacterPortrait`; unknown ids fall back to a generated portrait.

Derived, not authored: crew aboard at the time of an arc (from each Straw Hat's recruitment arc order), bounty changes inside an arc's chapter span (from `characters[].bounties[].after`), previous/next arc.

## UI (`src/components/arc/`)
- **ArcHero** — full-bleed panorama with parallax layers, saga-colour wash, slam-in italic title, hook line, chapter counter that counts up, ship glyph sailing across once. Stat chips animate their numbers.
- **CrewDeck** — portraits of the crew aboard; "joins here" badge on a recruit.
- **CastGallery** — grouped by side; cards flip on hover/focus to reveal the role text; portraits via `CharacterPortrait`.
- **VoyageTimeline** — vertical log with a dashed gold route drawn by scroll progress, ✕ markers that pop in, each beat card with a pixel scene of its location, mood treatment (flashback = sepia + grain, night = dark wash, storm = rain lines), present-cast chips, chapters, "Resume here".
- **BattleCard** — versus header (side A portraits vs side B portraits, clash burst), wraps the existing frame player; verdict ribbon.
- **Legacy** — existing text + bounty changes as animated wanted stamps + explored button.
- **NextStop** — previous/next arc footer with island scenes; keeps the reader in flow without closing the dialog.
Left nav keeps section anchors (`detail-overview`, `detail-characters`, `detail-story`, `detail-battles`, `detail-legacy`) plus beat ticks that light as you scroll. Styles live in `src/detail.css`, imported by `DetailOverlay` (lazy chunk).

## Data flow
`DetailOverlay` resolves the arc → `<ArcDetail arc staging …/>` → children receive plain props. Scroll progress via `motion`'s `useScroll` bound to the dialog scroller. All animation gated by `motion && !reduced` and by `html[data-motion='on']` in CSS.

## Validation and tests
`scripts/validate.ts` gains staging checks: every arc has staging with ≥3 cast; every beat/battle key exists; every `present`/`a`/`b` id is in the cast; every beat `location` exists; hooks under 80 chars; coverage end equals last arc end (1191). Vitest: `crew-roster.test.ts`. Playwright: arc dialog shows cast portraits, timeline beats, next-stop navigation changes the URL.

## Out of scope
Editing Codex's concurrent files (`ExplorerViews`, `WorldAtlas`, `CrewView`, `crews.ts`, `styles.css`). Character detail and location detail bodies keep their current layout.
