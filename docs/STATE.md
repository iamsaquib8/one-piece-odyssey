# Project state — 8 September 2026

Where the project stands, what is verified, and what to pick up next. Read this first when returning to the work.

## Snapshot

The local app includes character journeys, reading-progress controls, and a mystery board. These additions have not been deployed. It is called **One Piece Odyssey** (renamed from Grand Line Odyssey on 6 September; the localStorage key stayed `grand-line-logbook-v1` so nobody's saved logbook is lost, and the privacy notice names that key literally). The repository is prepared for a public GitHub push: README, LICENSE, CONTRIBUTING, CI workflow and a cleaned `.gitignore` are in place.

Coverage runs from chapter 1 to **1191**, the latest released chapter as of 6 September 2026. Elbaf is marked `ongoing`.

Live at **[one-piece-odyssey.netlify.app](https://one-piece-odyssey.netlify.app)**, repository at **[github.com/iamsaquib8/one-piece-odyssey](https://github.com/iamsaquib8/one-piece-odyssey)**.

To pull in newly released chapters, use the `chapter-refresh` skill in `.claude/skills/` — it owns the whole procedure, and `npm run refresh:audit` reports what is stale.

## Verification, last run 8 September

| Command | Result |
|---|---|
| `npm run validate` | ✓ 33 arcs · 234 beats · 93 battles · 70 locations · 113 character profiles · 46 crews/factions · 42 connections · 483 cast entries · coverage Ch. 1–1191 |
| `npm run typecheck` | clean |
| `npm test` | 10 files, 44 tests passed |
| `npm run build` | TypeScript and production build pass; globe and shared content chunk-size warnings, see follow-ups |
| `npm run test:e2e` | 56 existing regression tests passed in the full run; all 12 discovery tests passed in the final focused rerun after correcting selectors. Desktop Chrome, Pixel 7 and axe included. |

Playwright runs against the built output through the preview server, so **rebuild before running end-to-end tests** or you will test a stale `dist`.

## What was built

**Earlier on 6 September.** Codex started the project and left it un-runnable: three imported files were missing and the arcs data file was truncated mid-array. That was repaired and the journey page was rebuilt to match the accepted concept art in `docs/concepts/journey.png`: paper header, dark saga rail, ocean body, islands two abreast with signboards, and a measured dashed gold route with a ship that follows the pointer. Egghead and Elbaf became their own rail stops. Search, world chart, saved logbook and crew posters followed.

**Evening of 6 September.** Two requests: coverage to the current chapter, and "on every arc click, brainstorm and make it very detailed, with animations, character, storyline, not just texts", then "use better images for all beats".

- Elbaf was researched chapter by chapter and rewritten from a single arrival beat into 13 beats and 5 battles reaching 1191, with five new places.
- Six parallel writers deepened every arc: 131 beats and 37 battles became 234 beats and 93 battles.
- A new **staging** layer was introduced so the reader can show people and places without parsing prose: 483 cast entries, every beat given a location, a mood and who is present, every battle given two sides and a verdict.
- The arc dialog was rebuilt as an illustrated log in `src/components/arc/`, and every beat became a diorama with its own camera, mood effects and characters standing in the frame.
- The validator was extended to enforce all of the above.

The design record for this work is `docs/superpowers/specs/2026-09-06-arc-detail-design.md`.

**Later the same evening — refresh tooling.** Keeping up with the manga became a repeatable procedure rather than a memory exercise:

- `.claude/skills/chapter-refresh/` — the skill an agent loads when asked to refresh the story, with the research recipe and the content rules as reference files.
- `npm run refresh:audit` (`scripts/refresh-audit.ts`) — reports the gap between released and narrated, and finds every place that repeats an edition fact and has drifted. `--strict` exits non-zero, so it can gate CI later.
- Edition facts were pulled out of the code that repeated them: the crew page's chapter horizon, the journey page's chapter ticks, and both Playwright suites now read `coverage.ts` instead of a literal, and the saga/arc count assertions derive from the data.
- Battles stopped being captions on a gradient. `FightStage` plays each battle as a scene on the arc's island: the acting side lunges, the other reels, an impact star and a comic sound word land on the beat, speed lines rake out, and a momentum marker swings to the verdict. The choreography is derived — which side a caption names, falling back to alternating, with the winner landing the last blow — so all 93 battles animate without any per-fight authoring.
- Fixed what the audit and a dry run surfaced: two UI claims that Elbaf coverage "stops at the arrival" (untrue since the arc reached 1191), six crew chapter ranges still frozen at the previous cutoff, and the four Elbaf sub-locations missing an atlas parent, which had them scattering instead of clustering on the island.

## Reader discovery update

The shared “I’ve read through” control persists a completed-arc limit in the existing version-1 logbook. Old saves default to full coverage, and direct URLs never raise the limit. Journey stops, search, saved lists, crew discovery, both atlas projections and direct record links respect it. Hidden saved entries remain stored. Limited profiles use staged identities, hide current portraits and undated biographies/affiliations, and bound bounties by their explicit chapter. Retrospective identity reveals have an explicit override module. Authored summaries remain editorial drafts; the controls are arc-based rather than a chapter-by-chapter content audit.

Character journeys derive chronological moments, battles and bounty changes with exact reader links and explicit identity aliases. The searchable directory is at `?view=trails`. Four curated mystery threads at `?view=mysteries` unlock clues and resolutions by progress, with links to their supporting story beats. Existing history and single-dialog focus restoration apply.

Desktop and mobile screenshots were inspected interactively; runtime logs were clear. The strict premium UI audit reports zero findings. Native select ownership is documented in `premium-ui.json` and `UX-CONTRACT.md`. Sandbox verification used the equivalent Node loader for the content scripts and direct Vitest/TypeScript/Vite executables, avoiding the tsx CLI IPC restriction.

Further feature ideas—history timeline, quizzes, notes and recaps—remain outside this implementation. Plan and spec are in `docs/superpowers/`.

## Content inventory

| File | Arcs | Chapters |
|---|---|---|
| `arcs-east-blue.ts` | 6 | 1–100 |
| `arcs-alabasta.ts` | 5 | 101–217 |
| `arcs-paradise.ts` | 7 | 218–489 |
| `arcs-summit-war.ts` | 6 | 490–602 |
| `arcs-new-world.ts` | 8 | 603–1125 |
| `arcs-elbaf.ts` | 1 | 1126–1191, ongoing |

Each has a matching `staging-*.ts`. `staging.ts` merges them and `crew-roster.ts` derives who was aboard and which bounties were posted.

## Conventions that are easy to break

- **Scroll-reveal state lives in `data-seen` and `data-inview` attributes.** Putting it in a React-managed `className` makes island cards vanish on hover, which happened once already.
- **Refs into a Radix portal must go through state.** The portal mounts after the first effect pass, so a bare ref is null when effects run. The dialog scroller uses a state-backed callback ref for this reason.
- **Beat and battle ids are deep-link targets.** Rename them and you break saved links and the resume position.
- **A Straw Hat id must be side `crew` in staging.** The validator enforces it. Use a distinct slug for someone before they join, as Jinbe does with `jinbe-knight`.
- **All animation is gated** on the motion toggle and `prefers-reduced-motion`.
- **`src/data/index.generated.ts` is generated and gitignored.** `predev`, `prebuild` and `pretest` rebuild it.

## Open follow-ups

**Editorial.** Every summary is `editorialStatus: 'draft'` original fan writing, not verified line by line against the source. The writers flagged specific chapter boundaries they were unsure of and widened ranges rather than guess:

- East Blue: Zoro versus Tashigi at 99–100; the Nyaban brothers at 32–35; the Bell-mère flashback at 77–80.
- Alabasta saga: Vivi's reveal around 109–111; Luffy versus Mr. 3 spanning 123–127; the Kureha and Chopper introduction against the start of the Hiriluk flashback.
- Paradise: Enel's arrival at the ruins around 274–275; Luffy versus Franky at 338–339; Zoro versus Ryuma at 466–467. Wanze and T-Bone falling in the sea train battle, and Kokoro's reveal, were written from memory and deserve a check.
- Summit War: the Conqueror's Haki burst placed in the charge beat may belong to 570; the Ace and Whitebeard flashback pinned to 552; Grove 42 versus 46.
- New World: Wano's Flower Capital beat is deliberately broad at 927–958; Egghead's Luffy versus Kizaru at 1092–1107.
- Elbaf: the twins' mother's name, Rocks's bounty figure, and volume numbers were left out for lack of confidence. Imu is written as "it" before chapter 1179 and "he" after, following the source's own inconsistency.

**Art.** `god-valley` has no scene alias in `PixelScene.tsx`, so it falls back to the night "mystery" scene, and no canonical position. The globe deliberately leaves it unplaced, with its field notes available in the searchable list. The flat chart treats its placement as narrative geography. Several settlements reuse their island's art.

**Screenshots.** `docs/screenshots/journey.webp` and `arc-title-card.webp` show the chapter numbers, so they go stale on a refresh. There is no capture script; they were taken by hand.

**Reader.** Cast galleries on the largest arcs run long: Wano 22, Egghead 22, Elbaf 26, Marineford 17. Trim the non-crew entries if the section feels heavy.

**Bundle.** Two chunks exceed the 400 kB warning limit: shared content/crews at about 672 kB (232 kB gzip) and `GlobeView` at about 543 kB (140 kB gzip). The main chunk is about 294 kB (92 kB gzip). Discovery and detail views share the larger content chunk; further content splitting remains a performance follow-up.

**Globe and fleet update.** The world atlas now defaults to a rotatable Three.js globe with 3D landmarks, globe routes, region flights, responsive label density, and a flat-chart fallback. Crew discovery now includes 42 pirate crews, four factions, and 113 character profiles with original animated SVG portraits. Crew and character records share the existing overlay/history and logbook. The registry has a separate content horizon (`crewCoverageThrough`); its concise supporting profiles are not the same editorial coverage as the full arc reader. Maintenance instructions are in `docs/ATLAS-MAINTENANCE.md`.

**Local-only notes.** `docs/research/` holds the chapter-by-chapter Elbaf outline and the brief the content writers worked from. It is gitignored on purpose, since it is derived from wiki research rather than written for publication. Keep it if you plan more content work.

## Suggested next steps

1. Push to GitHub. The repository is initialized with one commit on `main`; no remote is configured yet.
2. Decide the public name. "One Piece Odyssey" matches an official Bandai Namco game title, which sits awkwardly beside the no-affiliation disclaimer. Worth a second thought before the repository becomes public.
3. Replace the MIT copyright holder line, currently "One Piece Odyssey contributors", with a real name if you want attribution.
4. Consider whether the takedown contact address, currently a personal Gmail in `src/data/legal.ts`, is the address you want indexed on a public site.
5. Editorial pass over the flagged chapter boundaries above.
6. ~~Deploy to Netlify.~~ **Done** — live at one-piece-odyssey.netlify.app. `netlify.toml` is written and its content security policy was verified against the real build: no blocked scripts, styles, fonts or images, fonts still load, the arc reader still renders. Connect the repository in Netlify, or run `npx netlify deploy --prod --dir=dist` after a build.
