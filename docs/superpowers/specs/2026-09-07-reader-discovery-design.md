# Reader discovery design

The user authorized planning and implementation after the feature proposal. This release implements the recommended first three features: character journeys, spoiler controls, and a mystery board. History, quizzes, personal notes, and recaps remain follow-ups.

## Shared reading horizon

Keep the current full-story experience by default. Add a persistent, native select above the main content: all chapters, not started, or completed arc. A single chapter horizon governs every rendered discovery surface and direct detail links. A URL never raises the horizon. Saved entries and resume positions remain stored even when hidden. Invalid stored horizons fail conservatively. Existing version-1 logbooks retain their saves, progress and motion settings.

Arc-scoped story is available only when the whole arc is within the horizon. Whole-story prose on characters, crews and places has no reliable reveal boundary: replace it with conservative, horizon-specific information. Omit unversioned milestones, future affiliations, epithets, and bounties. Bounties with explicit chapter references can be filtered. Future arc labels, map points, route edges, search suggestions and detail links must not leak through. Conservative mode uses neutral character silhouettes because portraits can reveal later appearance changes. Broad original arc overviews and legacy prose may reference future events: in limited mode render the bounded story beats and staging with the whole-arc overview and legacy suppressed.

## Character journeys

A new Trails view offers searchable character discovery, plus a journey section in character details. Derive chronological entries from existing cast, beat presence, battles and explicit bounty chapters. Link a moment to its exact arc/beat with existing history and focus behavior. Resolve known duplicate pre-recruitment identities explicitly; never guess participants from prose. Empty results explain how to change the search or reading horizon.

## Mystery board

A new Mysteries view presents a small curated set of story questions grounded in existing authored content. Each clue has an arc/beat reference and unlocks only after its arc is readable. Derive the displayed status from visible clues, never from a future reveal. Established story clues and personal speculation are distinct: this release contains editorial questions and source-linked clues, no invented fan theories or theory editor. Use native details disclosures for clue trails and filters for all/open/resolved. Empty horizons have a recovery message.

## Visual and behavior contract

Reuse the ocean, paper, gold route markers, Nunito Sans and sparse pixel labels in DESIGN.md. New discovery navigation lives in a wrapping secondary row so the four mobile tabs keep their touch targets. Use shared buttons, existing single detail overlay, App-owned announcements, and document scrolling. English only. No dependencies, network services or external artwork. Motion follows the existing toggle and reduced-motion preference.

## Verification

Unit tests cover old-logbook migration, malformed horizons, catalog filtering, future prose suppression, chronology, identity aliases, clue/status boundaries and deep-link targets. E2E tests cover select persistence, future direct links, search, crew and both atlas projections, character-to-beat navigation, mystery clue opening, mobile layout and keyboard controls. Run content validation, all unit tests, typecheck/build and existing E2E regression suite; inspect desktop and phone screenshots.
