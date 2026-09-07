# Content rules

Everything `scripts/validate.ts` enforces, plus the writing spec the existing arcs were written to. Hand this file to a subagent as its brief.

## Files, and which one owns what

| File | Owns |
|---|---|
| `src/data/arcs-<era>.ts` | Prose: premise, overview, beats, battles, legacy |
| `src/data/staging-<era>.ts` | Stage directions: cast, per-beat location/mood/presence, battle sides |
| `src/data/locations*.ts` | Places, landmarks, map positions, art briefs |
| `src/data/characters.ts` | The ten Straw Hats, including bounty history |
| `src/data/crews.ts`, `other-characters.ts` | Crews, factions and named non-crew figures |
| `src/data/coverage.ts` | The edition's chapter facts — the single source |

Prose and staging are separate so the reader can draw portraits and scenes without parsing paragraphs. Both must be updated together.

## Prose

Built with helpers from `arc-helpers.ts`:

```ts
beat(id, title, chapters, paragraphs, kind?)   // kind: 'story' | 'flashback' | 'interlude'
battle(id, title, chapters, stakes, development, outcome, frames)
```

- **Beats:** group 3–8 consecutive chapters into one beat, around a single turn in the story. That is the rule; a per-arc count follows from it (a 66-chapter arc lands near a dozen beats). Each beat 2–3 paragraphs.
- **Paragraph length:** 140–600 characters. The validator rejects anything under **120**.
- **Voice:** present tense, concrete, literate. Who is where, what they want, what turns. No fan slang, no hype adjectives, no verbatim manga dialogue beyond two or three words.
- **`chapters`** is a string like `'1159–1166'` and must fall inside the arc's span.
- **Battles:** 2–3 for arcs of 25+ chapters, 1–2 for shorter. `stakes` one sentence, `development` two or three, `outcome` one or two, plus **4–6 `frames`**: manga-panel captions under 80 characters each ("Zoro raises three swords").
- Every arc needs at least one beat, one battle and one location.

## Staging

```ts
{
  arcId, hook,                                  // hook: cold-open caption, max 80 chars
  cast: [{ id, name, side, role, epithet?, color?, joins? }],
  beats:   { [beatId]:   { location?, present: string[], mood? } },
  battles: { [battleId]: { a: string[], b: string[], verdict? } },
}
```

- `side`: `'crew'` | `'ally'` | `'foe'` | `'wildcard'`. `mood`: `'dawn'` | `'day'` | `'dusk'` | `'night'` | `'storm'` | `'flashback'`. `verdict`: `'a'` | `'b'` | `'draw'` | `'interrupted'`.
- `role` is 1–2 sentences on what that person wants **in this arc**, minimum 40 characters.
- **Every** beat id and battle id in the arc must appear here, or validation fails.
- Every id in `present`, `a` and `b` must exist in that arc's `cast`.
- `location` must be a real location id. Omit it for a beat with no fitting place rather than pointing at the wrong island. Use `going-merry` or `thousand-sunny` for scenes at sea.
- Straw Hat ids (`luffy zoro nami usopp sanji chopper robin franky brook jinbe`) **must** be side `'crew'`. For someone before they join, use a distinct slug — Jinbe pre-Wano is `jinbe-knight`.
- `joins: true` on a Straw Hat in the arc where they officially join.
- Straw Hats inherit their colour and epithet from `characters.ts`; do not repeat them.

## Portrait ids

Roughly a hundred characters have hand-drawn portraits; everyone else renders through a deterministic fallback, which is fine but plainer. Read the real list rather than trusting one written down here:

```bash
grep -oE "^  '?[a-z0-9-]+'?: P\(" src/components/CharacterPortrait.tsx | tr -d " ':P("
```

Match a cast id to an existing recipe id wherever the character is the same person. Note the aliases: Akainu is `sakazuki`, Aokiji is `kuzan`.

## Locations

Use the `place()` helper and copy the shape of an existing entry exactly:

- `arcIds` includes the arc, and the arc's `locationIds` includes this id.
- `map: { x, y }` in the 0–100 range, near neighbouring islands.
- Exactly **four** palette colours.
- At least one landmark.
- A full `art` brief.
- Put the parent island's name inside the id (`elbaf-owl-library`) so the art resolver picks up the right scene.

## Chapter continuity

The validator is strict about this:

- Each arc starts at the previous arc's end **+ 1**. No gaps, no overlaps.
- The final arc's chapter end equals `coverage.coveredThrough` exactly.
- An arc marked `status: 'ongoing'` must start at or before `coveredThrough`.

## Never

- Never rename or remove an existing beat or battle id.
- Never add a character id to an arc's `characterIds` that is not one of the ten Straw Hats — that field is crew-only and validated against `characters.ts`.
- Never set `editorialStatus`; the `arc()` helper marks everything `'draft'`.
- Never write a chapter number into a component, test or document. Import `coverage` and read the field.

## Crews

`src/data/crews.test.ts` enforces two things the validator does not:

- every crew id must also appear in `crewFirstAppearance` in `crews.ts`
- every `captain` and `memberIds` entry must exist in `other-characters.ts`

So adding a crew means adding its people too, or `npm test` fails.

Existing crews carry a `chapters` range string. For a group still active at the new cutoff, that range's end has to move with it — six of them were left behind at the old cutoff once already.

## Checking your work

```bash
npm run validate        # must print the ✓ line
npx tsc --noEmit -p .
```

Problems naming other people's arcs are theirs. Fix only the lines that name yours.
