# Contributing

Thanks for wanting to help chart the Grand Line. This is a non-commercial fan project, so the bar for contributions is care rather than volume.

## Ground rules

1. **No manga artwork, panels, scans or translations.** Ever, anywhere, including in issues and screenshots. Art is drawn in code.
2. **No verbatim dialogue** beyond a few words. Summaries are original prose written in your own words.
3. **Never claim official status.** Nothing may present itself as Shueisha, VIZ or Oda material.
4. **Animation is opt-out.** Every effect must be gated behind the motion toggle (`html[data-motion='on']` in CSS, or the `motion` prop in components) and must respect `prefers-reduced-motion`.

## Before you open a pull request

```bash
npm run validate     # content integrity, must print the ✓ line
npm run typecheck
npm test
npm run build
npm run test:e2e     # runs against the built output
```

All five must pass. `npm run test:e2e` starts a preview server on port 4173 itself.

## Adding or editing story content

Content is split so several people can work without collisions. Prose and stage directions live in separate files.

1. **Prose** in the matching `src/data/arcs-<era>.ts`, built with helpers from `arc-helpers.ts`:
   - `beat(id, title, chapters, paragraphs, kind?)` where `kind` is `'story'`, `'flashback'` or `'interlude'`.
   - `battle(id, title, chapters, stakes, development, outcome, frames)` with four to six frame captions under 80 characters each.
   - Keep existing beat and battle ids. They are deep-link targets that people may have bookmarked.
   - Paragraphs run 140 to 600 characters. The validator rejects anything under 120.
2. **Staging** in the matching `src/data/staging-<era>.ts`:
   - A hook under 80 characters, a cast of people who matter in that arc, and for every beat a location, a mood and who is present.
   - Sides are `crew`, `ally`, `wildcard` or `foe`. A Straw Hat id must always be `crew`; use a separate slug for someone before they join (Jinbe before Wano is `jinbe-knight`).
   - Every beat and every battle must appear, or `npm run validate` fails.
3. **Places** in `src/data/locations*.ts` via the `place()` helper: four palette colours, at least one landmark, a map position in the 0 to 100 range, and an art brief.
4. Run `npm run validate` and fix only the lines that name your ids.

Facts should be checkable against the manga. If you are unsure of an exact chapter, widen the range rather than guess a precise number, and say so in the pull request.

## Adding art

- **Islands:** add a scene kind or an alias in `src/components/PixelScene.tsx`. Location ids resolve through that alias list, so an id containing an existing island name inherits its look.
- **Characters:** add a recipe to `RECIPES` in `src/components/CharacterPortrait.tsx`. Anyone without one still renders through the deterministic fallback.

## Code conventions

- TypeScript strict mode, no `any`, no new dependencies without a reason in the pull request.
- Scroll-reveal state belongs in `data-seen` and `data-inview` attributes, never in a React-managed `className`, which React rewrites and which silently broke hover once already.
- Bind refs that a Radix portal owns through state, not a bare ref, because the portal mounts after the first effect pass.
- Keep the arc reader's section ids (`detail-overview`, `detail-characters`, `detail-story`, `detail-battles`, `detail-legacy`) and per-beat `beat-<id>` ids intact.
- Comments explain why, not what.

## Reporting problems

Story errors are welcome: name the chapter and what the summary gets wrong. For anything about rights, use the contact address on the notices page rather than an issue.
