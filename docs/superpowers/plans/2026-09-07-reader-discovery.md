# Reader Discovery Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for independent components, with integrated review and verification.

**Goal:** Add character journeys, a persistent reading horizon, and source-linked mystery trails.

**Architecture:** App owns persisted `spoilerThrough: number | null` and provides a lightweight ReadingHorizon context. A shared catalog projection filters existing content. Lazy discovery screens derive journey and mystery entries from the authored arc/staging data.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Playwright, existing CSS and Radix dialog.

**Spec:** `docs/superpowers/specs/2026-09-07-reader-discovery-design.md`

## Global constraints

- English only. No dependencies, network services or external artwork.
- Preserve version-1 saves, explored arcs, reading position, motion and all existing detail URLs.
- A direct link never changes the local reading horizon.
- Use the existing paper/ocean palette, buttons, single detail dialog and focus restoration.
- Bound spoiler controls by completed arcs; suppress whole-story prose lacking reveal metadata.
- No publishing or push is part of this task.

## Task 1: Shared horizon and application integration

Files: `src/types.ts`, `src/state.ts`, `src/reading-horizon.tsx`, `src/data/reader-catalog.ts`, `src/components/ReadingControls.tsx`, `src/App.tsx`, `src/components/ExplorerViews.tsx`, `src/components/DetailOverlay.tsx`, `src/components/arc/ArcDetail.tsx` and focused unit tests.

Interfaces: `ReadingHorizonProvider` supplies `number | null`; `useReadingHorizon(): number | null`; `useReaderCatalog()` returns `{arcs, locations, characters, crews}` projected at that horizon; `buildReaderCatalog(through: number | null)` is the pure equivalent. `isArcVisible(arc: {chapters: [number, number]}, through: number | null): boolean` belongs to the lightweight horizon module. Extend `View` with `trails` and `mysteries`.

- [x] Add and run failing migration and projection tests. Core regression:
  ```ts
  expect(decodeReader('{"version":1,"saved":["arc:wano"]}').saved).toEqual(['arc:wano']);
  expect(decodeReader('{"version":1,"spoilerThrough":7}').spoilerThrough).toBe(7);
  expect(buildReaderCatalog(7).arcs.map(a => a.id)).toEqual(['romance-dawn']);
  expect(buildReaderCatalog(7).characters.find(c => c.id === 'luffy')?.bounties).toEqual([]);
  ```
- [x] Implement normalized state, shared projection and controls. Filter App rails/stops, search and saves. Guard details before rendering any title/prose. Retain hidden saved records. Add discovery links.
- [x] In limited arc readers suppress unbounded overview/legacy, sanitize inherited profile fields and filter next/previous links.
- [x] Run unit tests and typecheck before integrating feature screens.

## Task 2: Existing atlas and crew discovery consumers

Files: `src/components/WorldAtlas.tsx`, `src/components/GlobeView.tsx`, `src/components/CrewView.tsx`, projection tests as needed.

Consumes the Task 1 context/catalog interfaces. Preserve full-mode behavior. Derive atlas places from the projected catalog while retaining existing coordinates and shape metadata. Filter voyages, map markers, connections, selected field notes and related arcs. Pass allowed IDs into GlobeView; skip hidden markers, labels and edges at scene creation. Use a stable empty-horizon state. Crew filters, member lists and totals use projected records.

- [x] Add a meaningful failing test for a future atlas/crew record under an early horizon.
- [x] Implement filtering without changing global data or mutating shared arrays.
- [x] Verify both map modes, reset/selection, empty horizon and crew filtering.

## Task 3: Character journeys and mystery board

Files: `src/data/character-journeys.ts`, `src/data/mysteries.ts`, `src/components/CharacterJourney.tsx`, `src/components/DiscoveryViews.tsx`, `src/discovery.css`, unit tests.

Consumes `useReaderCatalog()` and `useReadingHorizon()`. Produces `CharacterJourney({characterId, onOpen})` and default `DiscoveryViews({view, onOpen})`. `onOpen(kind, id, beat?)` uses the existing Route kinds. Keep styles scoped and reuse global tokens.

- [x] Add failing journey tests for chronological ordering, real beat links, absence beyond the horizon and explicit identity aliasing.
- [x] Implement journey derivation and a searchable Trails directory; render exact beat links and staged battle appearances with filtered bounty changes.
- [x] Add failing mystery tests for reveal/status boundaries and valid arc/beat references.
- [x] Author at least four supported question trails from existing story data, each with multiple clues when supported. Implement visible-clue filtering, status filters and native disclosures.
- [x] Run focused tests; integrate directory routes and character-detail journey section in Task 1.

## Task 4: Integrated review and verification

Files: `tests/discovery.spec.ts`, `DESIGN.md`, `UX-CONTRACT.md`, `README.md`, `docs/STATE.md`.

- [x] Add E2E flows for persisted limits, deep links, search, atlas, crew, journeys and mystery reveals.
- [x] Run `npm run validate`, `npm test`, `npm run build`, `npm run test:e2e`. When sandbox IPC blocks tsx CLI, use `node --import tsx scripts/build-index.ts` and direct Vitest/TypeScript/Vite executables or approved escalation.
- [x] Inspect rendered desktop/mobile screens and keyboard interaction, run the premium static audit, fix relevant findings.
- [x] Review the full diff against the spec, fix regressions, update documentation with actual behavior and verification results.

## Execution record

Scope: first three recommended features after the optional scope question received no answer during context inspection. Current checkout is already on `feature/battle-motion-comics`; preserve the user's workspace and keep changes reviewable there. Baseline npm test hit sandbox denial of tsx's IPC socket; retry through the equivalent Node loader before evaluating test health.

### Completed 8 September 2026

Implemented all four tasks. Validation reports 33 arcs, 234 beats, 93 battles, 70 locations, 113 profiles and 46 crews/factions with consistent references. Unit suite: 44/44 across 10 files. TypeScript and production build pass. Browser verification: all 56 existing regressions passed; after correcting stale labels and a desktop-hidden selector, all 12 new discovery tests passed in a focused rerun. This includes keyboard disclosure, axe at 320px, saved-state persistence, restricted links, both atlas modes, exact moment/battle links and mystery resolution. Desktop/mobile screens were visually inspected with no runtime warnings/errors. Strict premium UI audit: zero findings.

Review fixes include conservative early Dragon identity redaction, bounty-to-arc mapping by chapter, saga observer rebinding after progress changes, and immediate removal of outgoing content when a limit changes. The final scoped review found no further actionable bugs. Existing bundle-size warnings remain for the globe and shared content; details are recorded in docs/STATE.md. No dependencies were added. Changes remain local and uncommitted.
