# Project state — 21 October 2026

Where the project stands, what is verified, and what to pick up next. Read this first when returning to the work.

## Snapshot

The growth round of 21 October is on one branch, `chore/repo-polish`, awaiting review as pull request #6. The design record is `docs/superpowers/specs/2026-10-21-growth-design.md`. It is called **One Piece Odyssey**. The localStorage key is still `grand-line-logbook-v1` from the old name, so saved logbooks survive, and the privacy notice names that key literally.

What the round adds:
- Path URLs, and a prerendered page and share image for every record.
- The chapter refresh to 1196.
- A Bounty Board, a Devil Fruit encyclopedia and a wanted-poster maker.
- Repository polish: plain MIT `LICENSE` with `NOTICE.md`, issue and PR templates, badges.

The details are under "Growth round" below.

Coverage runs from chapter 1 to **1196**, the latest released chapter as of 21 October 2026. Elbaf is marked `ongoing`.

Live at **[one-piece-odyssey.netlify.app](https://one-piece-odyssey.netlify.app)**, repository at **[github.com/iamsaquib8/one-piece-odyssey](https://github.com/iamsaquib8/one-piece-odyssey)**.

To pull in newly released chapters, use the `chapter-refresh` skill in `.claude/skills/` — it owns the whole procedure, and `npm run refresh:audit` reports what is stale.

## Verification, last run 21 October

| Command | Result |
|---|---|
| `npm run refresh:audit` | ✓ every repeated fact matches the data |
| `npm run validate` | ✓ 33 arcs · 237 beats · 95 battles · 70 locations · 113 character profiles · 99 bounties · 56 Devil Fruits · 46 crews/factions · 42 connections · 486 cast entries · coverage Ch. 1–1196 |
| `npm run typecheck` | clean |
| `npm test` | 13 files, 59 tests passed |
| `npm run build` | passes; `prerender: 329 pages, 329 share images, 327 in sitemap.xml`. The shared content chunk (now named after `DevilFruits`, about 693 kB / 239 kB gzip) and `GlobeView` (about 530 kB / 135 kB gzip) still exceed the 400 kB warning |
| `npm run test:e2e` | 100/100 passed, desktop Chrome and Pixel 7. Two timing-heavy tests (the Laboon battle clock, the atlas chart) have each failed once under full local parallel load and pass alone; CI is green |

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

## Growth round, 21 October

Why: the site could not be found or shared. Every URL returned the same title and description, there were no Open Graph tags, and `robots.txt` and `sitemap.xml` were the app shell. The edition had also fallen five chapters behind.

- **Path routing.** `src/state.ts` encodes `/arc/wano/?beat=…`, `/character/luffy/`, `/crew/` and so on.
  - Detail URLs keep the view they opened from as `?view=`.
  - `decodeRoute` takes `pathname + search` and still reads the old query-only links. `App.tsx` rewrites those to their path on load, keeping the atlas's `mapPlace`.
  - Every path ends in a slash, because Netlify 301s `/arc/wano` to `/arc/wano/` once `arc/wano/index.html` exists (checked on the deploy preview).
- **Prerendering.** `scripts/prerender.ts` runs after `vite build` and writes a page for every arc, place, character, crew, fruit and view, plus `sitemap.xml` and `robots.txt`.
  - Each page has its own title, description, canonical link, Open Graph and Twitter tags, JSON-LD breadcrumbs, and a static readable summary with real links.
  - `public/spoiler-guard.js` hides that summary before first paint for readers who limit spoilers.
  - Share images come from `scripts/og/cards.tsx`, drawn with the site's own art: pixel scenes, recipe portraits, fruit icons and the 5×7 bitmap font in `src/art/pixel-font.ts`, so no font files are needed.
  - Character and fruit images name only what a first-time reader would know.
- **Portrait refactor.** The recipe language moved to `src/components/portrait-recipe.ts` and the drawing to `PortraitSvg.tsx`, with literal colour fallbacks so it renders without `crews.css`. Before/after screenshots of the crew page, a dossier and an arc were pixel-identical.
- **Chapter refresh to 1196**, through the skill. Three new Elbaf beats (`dawn-thor-bullet`, `still-practicing`, `self-love`) and two new battles (`zoro-vs-sommers`, `sanji-vs-killingham`). `luffy-hajrudin-loki-vs-imu` now runs to 1193. Prose no longer writes the cutoff chapter number.
- **Bounty Board** (`/bounties/`). 61 sourced bounties for 39 supporting profiles live in `src/data/bounties.ts`; there are now 99 in all. One `bountyChapter()` parser replaces three copies, and the validator checks amounts and chapter order. `StepChart.tsx` draws the growth and crew-total charts, with crosshairs, a table view and validated categorical colours.
- **Devil Fruit encyclopedia** (`/devil-fruits/`, `/fruit/<id>/`). 56 fruits in `src/data/devil-fruits.ts`.
  - Reveal chapter, users in story order, awakenings and true identities, each gated separately by `fruitsAtProgress()`.
  - A new detail kind (`fruit`), with search, logbook and dossier links.
  - Validator and refresh-audit coverage.
- **Wanted-poster maker** (`/poster/`).
  - Built from the recipe language, with clamped base64url share links (`src/art/poster.ts`).
  - The PNG is downloaded through a `data:` URL and canvas, both allowed by the CSP. It can start from a dossier (`?from=<id>`).
- **Tooling and tests.**
  - `npm run capture` re-shoots the README screenshots, records the animated `demo.webp` and draws `docs/social-preview.png`. ffmpeg only decodes frames; sharp assembles the WebP.
  - New e2e specs: `seo`, `bounties`, `devil-fruits` and `poster`.
  - The Laboon battle test now scrolls the stage, not the button, into view; it had failed on CI since 8 September.

## Treasure-chart atlas, 22 October

- **The chart opens first.** The atlas now opens on the flat chart, which loads at once. The 3D globe is one click away.
- **Redrawn as an old sea chart.** `AtlasBackdrop.tsx` draws parchment with sea washes, ink-hatched Calm Belts, rhumb lines from two compass roses, ink sea kings, a Grand Line cartouche and a ticked frame.
- **Red-ink route.** The voyage route is dashed red ink.
- **Island names.** Every name that fits is shown, majors first. Names never overprint each other or a neighbour's island art, and stay inside the frame; the rest appear as you zoom in. Names draw in their own layer above the islands.
- **Restyled shell and globe.** The shell and toolbars use paper and ink. The globe is a matte parchment sphere with an ink grid and hatched Calm Belts; the gloss and the blue glow are gone.
- **The frame matches the chart.** The canvas is sized to the chart's 12:7 ratio, so there are no empty bands, on phones included.
- **Island art kept its size.** The flat-chart anchoring test caught overlaps when islands were scaled up, so the art stays at its original size.
- **Tests and capture.** Atlas tests now open the globe explicitly when they test it. `npm run capture` also re-shoots `world-atlas.webp`.

## UX pass, 25 October

- **Search.** Results rank by how well the title matches, and a "Best match" leads. On a tie, records outrank sagas. Groups follow their best hit, so "zoro" opens on Roronoa Zoro, not 27 arcs.
- **Discover.** Discover opens a hub (`/discover/`) with a card per tool and live counts. The journey page has a "More to explore" strip, which scrolls sideways on phones. The strip's cards (`FeatureCards.tsx`) carry no story data, so the main bundle does not grow.
- **Saga rail.** The rail renders only on the journey page; other pages get the full width.
- **Header.** The spoiler setting keeps its label ("Full spoilers" or "Ch. N") down to 1100px. The animation switch also sits in reading settings with words, and the header button for it is hidden on phones.
- **Arc reader.** The chapter line on the title card has a backing band, the stats sit in a two-column grid on phones, and the section tabs fade at the edge to show they scroll.
- **Phone home.** The first screen is shorter, gives a plainer pitch with the covered chapter, and has a "Where am I?" button.
- **Crews.** The page labels its 1126 cutoff as "profiles reviewed", so it no longer reads as a stale edition.

## Content inventory

| File | Arcs | Chapters |
|---|---|---|
| `arcs-east-blue.ts` | 6 | 1–100 |
| `arcs-alabasta.ts` | 5 | 101–217 |
| `arcs-paradise.ts` | 7 | 218–489 |
| `arcs-summit-war.ts` | 6 | 490–602 |
| `arcs-new-world.ts` | 8 | 603–1125 |
| `arcs-elbaf.ts` | 1 | 1126–1196, ongoing |

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

**Screenshots.** `journey.webp`, `arc-title-card.webp`, `mobile-arc.webp` and `demo.webp` show edition facts and go stale on every refresh. Re-shoot them with `npm run build && npm run capture`. The other screenshots are still hand-taken and only change with the UI.

**Reader.** Cast galleries on the largest arcs run long: Wano 22, Egghead 22, Elbaf 26, Marineford 17. Trim the non-crew entries if the section feels heavy.

**Bundle.** Two chunks exceed the 400 kB warning limit: the shared content chunk at about 693 kB (239 kB gzip), now named after `DevilFruits`, and `GlobeView` at about 530 kB (135 kB gzip). The main chunk is about 290 kB (90 kB gzip). Discovery and detail views share the larger content chunk; further content splitting remains a performance follow-up.

**Globe and fleet update.** The world atlas now defaults to a rotatable Three.js globe with 3D landmarks, globe routes, region flights, responsive label density, and a flat-chart fallback. Crew discovery now includes 42 pirate crews, four factions, and 113 character profiles with original animated SVG portraits. Crew and character records share the existing overlay/history and logbook. The registry has a separate content horizon (`crewCoverageThrough`); its concise supporting profiles are not the same editorial coverage as the full arc reader. Maintenance instructions are in `docs/ATLAS-MAINTENANCE.md`.

**Research gaps.**
- Bounties are left out where the only source is a databook, Vivre Card, film or novel: Marco, King, Ace's 550M, Sabo, Shanks' 1,040M and others. Kaido's boyhood 70M is also out, because its reveal comes after his current bounty and the validator requires chapter order.
- Fruits are left out when the story never names them (Imu), or when the wiki hedges (Killingham's awakening).
- Raw extracts sit in `docs/research/bounties.json` and `devil-fruits.json`.

**Links.** In-app navigation is still buttons, not anchors. The prerendered pages carry real links for crawlers, but turning the main `open`/`navigate` buttons into `<a href>` would help middle-click and crawl depth.

**Social preview.** The GitHub API cannot set a repository's social image. Upload `docs/social-preview.png` under Settings → Social preview.

**Local-only notes.** `docs/research/` holds the chapter-by-chapter Elbaf outline and the brief the content writers worked from. It is gitignored on purpose, since it is derived from wiki research rather than written for publication. Keep it if you plan more content work.

## Suggested next steps

1. Review and merge the growth-round pull request; Netlify deploys `main`.
2. Upload `docs/social-preview.png` as the repository's social preview.
3. Submit `https://one-piece-odyssey.netlify.app/sitemap.xml` in Google Search Console once it is live.
4. Decide the public name. "One Piece Odyssey" matches an official Bandai Namco game title, which competes for the same search and sits awkwardly beside the no-affiliation disclaimer.
5. Consider whether the takedown contact address, currently a personal Gmail in `src/data/legal.ts`, is the address you want indexed on a public site.
6. Editorial pass over the flagged chapter boundaries above.
7. Refresh weekly as chapters release: `npm run refresh:audit`, then the `chapter-refresh` skill.
