# One Piece Odyssey implementation ledger

Source of intent: user-provided cinematic manga explorer plan and concept art (`docs/concepts/journey.png`), 6 September 2026.

1. Inventory and typed content — **done**. 33 arcs (Romance Dawn → Elbaf, ch. 1–1191), 234 story beats, 93 battle logs, 70 locations with art briefs, 10 crew profiles, 42 route connections, 483 staged cast entries. `npm run validate` checks referential integrity, chapter continuity and staging (every beat/battle staged, cast ids resolve, hooks ≤ 80 chars).
2. Visual system and scene prototypes — **done**. `src/styles.css` owns tokens; `PixelScene` covers every location with code-native pixel art and CSS animation hooks (`.px-water`, `.px-clouds`, `.px-sun`).
3. Detailed arc reader and battle playback — **done, rebuilt 6 Sept evening** as an illustrated log (`src/components/arc/`): parallax title card with saga wash, count-up stats and a ship crossing once; crew deck (derived from recruitment arcs) with “joins” badges; cast grouped by side with flip cards and animated portraits; voyage timeline whose gold route is drawn by scroll progress, each beat a diorama (`BeatScene`: staged location, per-beat camera, mood effects — stars, rain and lightning, sun rays, film grain — and the people present standing in the shot); versus battle cards with verdict stamps above the keyboard-steppable frame player; bounty stamps derived from bounty history; previous/next stop cards. Nav shows beat ticks that light as you read. Styles in `src/detail.css` (lazy chunk).
4. Journey, schematic world, history, responsive navigation — **done**. Concept-matched panorama (islands two abreast, paper signboards, measured dashed route with a ship that sails to the hovered arc), World chart with tweened zoom and pan, bottom tabs on mobile.
5. Individual art and content coverage — **done for this edition**; all arc text is `editorialStatus: 'draft'` (original fan summaries, not source-verified line by line).
6. Search, crew, saves and resume — **done**. Search keeps `?q=` in the URL; crew as wanted posters; versioned localStorage logbook with resume.
7. Build, tests, browser, accessibility, performance audits — **done**: `npm run build` (typecheck + Vite, main chunk ≈ 88 kB gzip), `npm test` (Vitest), `npm run test:e2e` (Playwright desktop + Pixel 7, axe), manual Chrome pass at 1536×1024.

## Structure
- `src/data/arcs.ts` concatenates `arcs-east-blue.ts`, `arcs-alabasta.ts`, `arcs-paradise.ts`, `arcs-summit-war.ts`, `arcs-new-world.ts`, `arcs-elbaf.ts`; sagas live in `sagas.ts`. Stage directions (cast, per-beat location/mood/presence, battle sides) live beside them in `staging-*.ts`, merged by `staging.ts`; `crew-roster.ts` derives who is aboard and which bounties were posted in an arc. Punk Hazard, Egghead and Elbaf are remapped to their own rail sagas at concatenation time to match the concept rail.
- `src/data/locations.ts` concatenates Paradise (inline) and `locations-new-world.ts`; `connections.ts` holds the voyage graph.
- `scripts/build-index.ts` generates `src/data/index.generated.ts` (light arc/location summaries) before dev/build/test so long-form text stays in the lazy `DetailOverlay` chunk. The generated file is git-ignored.
- Rulings: never claim complete editorial review for unverified material; publication availability (`coverage.latestOfficialChapter`) and narrative coverage (`coverage.coveredThrough`) are recorded separately.

## Known follow-ups
- Editorial source pass on the Summit War and New World summaries (chapter boundaries flagged by the writers: Grove 42 vs 46, Egghead 1119–1122 satellite roster, Zou beat overlap 818–820).
- Elbaf is narrated through chapter 1191 (13 beats, 5 battles) from a chapter-by-chapter research outline; still `ongoing` and `draft`. `god-valley` has no dedicated scene kind and falls back to the night “mystery” scene.
- Cast sizes on the big arcs (Wano, Egghead, Elbaf, Marineford: 17–26) exceed the 6–12 guideline; trim if the gallery feels long.
- Codex’s `ExplorerViews.tsx` shipped without its `LegalView`; a minimal one was restored from `data/legal.ts` and the existing `.legal-*` styles so `tsc -b` passes and `tests/legal.spec.ts` is green.
- Scenes are shared per scene kind; several settlements reuse their island's art.
