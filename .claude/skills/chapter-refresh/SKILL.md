---
name: chapter-refresh
description: Use when asked to refresh the story, catch up on the manga, pull in new chapters, or bring this One Piece explorer up to date with the latest released chapter - triggers include "refresh story", "any new chapters", "update to chapter N", "catch up Elbaf", or noticing src/data/coverage.ts is behind.
---

# Chapter refresh

## Overview

This site narrates the One Piece manga up to a cutoff recorded in `src/data/coverage.ts`. A refresh moves that cutoff: find what has been released, research it, write it into the story, and bring every section that depends on it along in the same commit.

**Core principle: the edition's facts live in `coverage.ts`, and every other file either reads them or gets updated with them.** The work is finished when `npm run refresh:audit` reports that every repeated fact matches the data — not when the prose reads well.

## Absolute rules

- **Never guess the latest chapter number from memory.** Your training data lags the manga by months. Probe the wiki (Phase 1).
- **Never invent story events.** Every beat traces to a fetched chapter summary. Unsure of a boundary? Widen the chapter range and record the uncertainty in `docs/STATE.md`.
- **Never rename an existing beat or battle id.** They are deep-link targets (`?arc=elbaf&beat=god-valley`) and reading positions saved in readers' browsers. Add new ids; leave old ones alone.
- **Never set `editorialStatus: 'reviewed'`.** New content is `'draft'` — the `arc()` helper does this for you.
- **Never leave the chapter number written out in a component, test or doc.** Read it from `coverage.ts`. The audit fails the refresh if you do.

## The phases

| # | Phase | Command or file | Done when |
|---|---|---|---|
| 1 | Find the gap | probe the wiki, `npm run refresh:audit` | You know the latest *released* chapter |
| 2 | Research | fandom MediaWiki API → `docs/research/` | Every new chapter has a factual outline |
| 3 | Decide the shape | `src/data/arcs-*.ts` | Extend the ongoing arc, or open a new one |
| 4 | Write the story | `arcs-*.ts` + `staging-*.ts` | New beats, battles, cast, places |
| 5 | Move the cutoff | `src/data/coverage.ts` | All five fields updated |
| 6 | Art | `PixelScene.tsx`, `CharacterPortrait.tsx` | New places and faces have art |
| 7 | Verify | the gauntlet below | Everything green |
| 8 | Land it | docs, screenshots, commit | Pushed, CI green |

### Phase 1 — Find the gap

```bash
npm run refresh:audit      # local state: what is covered, what repeats it, what drifted
```

Then find the real latest chapter. A chapter's wiki page is created **before** the chapter is released, so page existence proves nothing. See `references/research.md` for the probe and the release test. Report the gap before writing anything: "covered through N, released through M, so M−N chapters to write."

If the gap is zero, say so and stop. Still fix anything the audit flags.

### Phase 2 — Research

Fetch every new chapter's summary through the MediaWiki API and write a chapter-tagged outline to `docs/research/` (gitignored — it is derived wiki research, not publishable prose). Full recipe, including the exact URLs and what to extract: `references/research.md`.

Every line of the outline carries its chapter number. Facts you cannot source get left out, not guessed.

### Phase 3 — Decide the shape

Read the ongoing arc first. Two cases:

- **The arc continues** (usual): extend its `chapters` tuple end to the new cutoff and add beats.
- **The arc ended and a new one began**: close the old arc (`chapters` end at its last chapter, drop `status: 'ongoing'`), then add a new arc starting at exactly the next chapter.

  A new arc with its own rail stop takes five separate registrations, and missing one fails quietly rather than loudly:
  1. `src/data/arcs-<era>.ts`, imported and spread in `arcs.ts`
  2. `src/data/staging-<era>.ts`, imported and spread in `staging.ts`
  3. a `Saga` record in `sagas.ts`
  4. an entry in the `railSaga` map in `arcs.ts` — arcs declare `sagaId: 'final-saga'`, which is not a real saga id and is remapped here
  5. an icon in `sagaIcons` in `App.tsx`, plus that icon added to the `lucide-react` import — without it the rail stop renders a default compass and no test catches it

The validator enforces that arcs are contiguous with no gaps and that the last arc ends **exactly** at `coverage.coveredThrough`. Plan for that before writing.

### Phase 4 — Write the story

Prose in `arcs-*.ts`, stage directions in `staging-*.ts`. Both are required — an unstaged beat fails validation. Rules, shapes and length limits: `references/content-rules.md`.

Also update, when the chapters call for it:
- `src/data/locations*.ts` — new islands, plus the ids added to the arc's `locationIds`
- `src/data/characters.ts` — new bounties (these drive the bounty stamps automatically)
- `src/data/crews.ts`, `src/data/other-characters.ts` — new crews and named figures, **and the `chapters` range on every existing crew still active at the cutoff**, which otherwise stays frozen at the old number
- `src/data/locations*.ts` — the `chapters` label and the `art.canon` sentence on places the story revisits
- `src/data/connections.ts` — a voyage edge if the crew sailed somewhere new

For a large gap across several arcs, dispatch one subagent per arc file with `references/content-rules.md` as the brief. They must not share files.

### Phase 5 — Move the cutoff

Update all five fields of `src/data/coverage.ts`: `verifiedDate` (today's real date), `latestOfficialChapter`, `coveredThrough`, `source`, and `note` (rewrite the prose — the old one names specific chapters and dates).

`source` is a VIZ chapter URL ending in an opaque id (`/one-piece-chapter-1191/chapter/51049`). That id cannot be derived from the chapter number; open the VIZ chapter index and copy the real link.

### Phase 6 — Art

- New island? Add an alias or scene kind in `src/components/PixelScene.tsx`. A location id containing an existing island's name inherits its art; anything unmatched falls back to a night "mystery" scene, so check what yours resolves to.
- New named character? Add a recipe to `RECIPES` in `src/components/CharacterPortrait.tsx`. Unlisted ids get a deterministic generated portrait, which is acceptable but plainer.
- New place on an existing island? Add it to the `parents` map in `src/components/atlas-model.ts`, or it floats loose on the world chart instead of clustering with its island.

### Phase 7 — Verify

Run all of it. Playwright tests the **built** output, so build first or you test a stale `dist`.

```bash
npm run refresh:audit    # every repeated fact matches
npm run validate         # referential integrity, chapter continuity, staging
npm run typecheck
npm test
npm run build
npm run test:e2e
```

`npm run validate` regenerates `src/data/index.generated.ts` as a side effect, so it is not a read-only command. Use `npx tsx scripts/validate.ts` if you need to check without writing.

Then look at the result in a browser — at minimum the new beats in the arc reader and the journey page's chapter track.

### Phase 8 — Land it

- Update `docs/STATE.md` — paste the **actual** output of the commands you just ran into the verification table, not the old numbers with the chapter changed. Also the content inventory row and any new editorial uncertainty. Then `docs/IMPLEMENTATION.md`.
- Counts in `README.md` and the `package.json` description come from the audit's CONTENT line. The audit fails if they drift.
- Re-shoot `docs/screenshots/journey.webp`, which renders the footer and the voyage card, so it goes stale on **every** refresh. The others only if their content changed.
- Leave `docs/superpowers/specs/` alone. Those are dated design records, not living documents.
- Commit, push, let CI run. Netlify deploys `main` on its own.

## Common mistakes

| Mistake | What happens | Fix |
|---|---|---|
| Trusting a wiki page's existence as proof of release | You summarize a chapter nobody has read | Apply the release test in `references/research.md` |
| Extending `coveredThrough` without extending the arc | `validate` fails: "last arc ends at N, coverage says M" | The last arc's chapter end and `coveredThrough` are the same number |
| Adding a beat but not staging it | `validate` fails: "beat X not staged" | Every beat and battle needs a staging entry |
| A cast id that is a Straw Hat but not side `crew` | `validate` fails | Use a separate slug before they join, like `jinbe-knight` |
| Writing the new chapter number into a test or component | The audit fails the refresh | Import `coverage` and read the field |
| Running e2e without rebuilding | Tests pass against the old site | `npm run build` first |
| Opening a new arc while e2e asserts the shape of the old one | Tests fail on structure, not on a real defect | The ongoing-arc test derives its expectations from the data; keep it that way rather than hard-coding a beat count |

## Red flags — stop and re-check

- You are about to write a beat from memory rather than the outline.
- You are about to rename a beat id because a better one occurred to you.
- The audit is green but you never actually fetched a chapter summary.
- You are reporting the refresh complete without having run the full gauntlet in Phase 7.
