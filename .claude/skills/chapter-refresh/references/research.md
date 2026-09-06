# Researching new chapters

Every command here was run against the live wiki on 6 September 2026 and worked.

## Why the API and not the page

Plain HTML fetches of the fandom wiki are blocked — `https://onepiece.fandom.com/wiki/Chapter_1191` returned **403**, and an earlier attempt got **402**. `WebFetch` on those URLs fails the same way. The MediaWiki API is open and returns clean wikitext.

## Find the latest released chapter

**A chapter's page is created before the chapter comes out.** On 6 September, `Chapter 1192` already existed with `title = TBA` and this body:

```
'''Chapter 1192''' is set to be released on September 7, 2026.
==Short Summary==
<!-- Do not add until official English release -->
```

So page existence proves nothing. Two steps:

**1. Find which pages exist.** One request handles many titles:

```bash
curl -s -H 'User-Agent: one-piece-odyssey/1.0 (fan project)' \
  "https://onepiece.fandom.com/api.php?action=query&format=json&formatversion=2&titles=Chapter%201192%7CChapter%201193%7CChapter%201200%7CChapter%201210"
```

Pages that do not exist come back with `"missing": true`. Walk upward from the current cutoff until you hit missing pages.

**2. Apply the release test** to the highest existing page. It is released only if **both** hold:

- the wikitext contains a `==Short Summary==` section with real prose under it, not `<!-- Do not add until official English release -->`
- the body does **not** say "is set to be released on"

The latest chapter passing both is `latestOfficialChapter`.

## Fetch a chapter

```bash
curl -s -H 'User-Agent: one-piece-odyssey/1.0 (fan project)' \
  "https://onepiece.fandom.com/api.php?action=parse&page=Chapter_1191&prop=wikitext&format=json&formatversion=2"
```

Returns `{"parse": {"title": ..., "wikitext": "..."}}`. A released chapter's wikitext contains:

- `{{Chapter Box | title = ... }}` — the official chapter title
- `==Cover Page==` — usually a cover story, occasionally plot-relevant
- `==Short Summary==` — a paragraph; enough for a beat's shape
- `==Long Summary==` — the detail you need for who was present and what changed

Fetch in batches of 5–10 chapters, and prefer piping through `python3 -c` to pull out just the summary sections. Dumping raw wikitext for 60 chapters into context will drown you — a subagent doing the research and returning an outline is usually the right call.

## What to extract per chapter

| Field | Used for |
|---|---|
| Chapter number and title | beat `chapters` label |
| Location | beat staging `location` |
| Who appears, and whose side they are on | beat staging `present`, arc `cast` |
| What changes | the beat's paragraphs |
| Fights: who, who wins, how | `battle()` records and staging verdicts |
| Time of day, weather, flashback framing | beat staging `mood` and `kind` |
| Bounties, titles, new crews | `characters.ts`, `crews.ts` |
| New islands and landmarks | `locations*.ts` |

## Writing the outline

Write to `docs/research/<arc>-<from>-<to>-outline.md`. That directory is gitignored on purpose: it is derived wiki research, not original prose for publication.

Structure it as:

1. **Arc boundaries** — where the wiki says the arc starts and ends, and the chapter-title list.
2. **Beat groups** — 8–14 narrative groups, each with a chapter range and 4–8 factual bullets. Every bullet carries its chapter number.
3. **Fights** — participants, chapters, outcome.
4. **Characters** — introduced or central, with debut chapters.
5. **Locations** — named places with chapters.
6. **Revelations** — lore drops with chapters.
7. **Bounties and status changes.**
8. **Confidence** — what you verified from a chapter page, what you inferred, and which chapters you could not fetch.

Paraphrase throughout. The outline feeds original prose, so never copy wiki sentences into it verbatim.

## Grouping chapters into beats

Weekly chapters are too granular to be beats. Group 3–8 consecutive chapters into one beat around a single turn in the story — an arrival, a reveal, a fight resolving, a flashback block. A 65-chapter stretch became 13 beats, which reads well; one beat per chapter would not.

Flashback blocks get `kind: 'flashback'` and their own `mood: 'flashback'`. Cutaways to other parts of the world get `kind: 'interlude'`.
