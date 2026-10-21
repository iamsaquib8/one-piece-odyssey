# Growth round: findable pages, a current edition, and reference sections

21 October 2026. A dated design record. Living status is in `docs/STATE.md`.

## Why

The site works, but nobody can find it or share it well. Before this round:

- Every URL served the same `<title>` and description.
- There were no Open Graph or canonical tags, so a shared link showed no preview.
- `/robots.txt` and `/sitemap.xml` returned the app shell, because the catch-all rewrite in `netlify.toml` answered them.
- Views lived in query strings, and every in-app link was a button, so crawlers saw one page.
- The edition had fallen five chapters behind (1191 narrated, 1196 released).
- GitHub read the license as "Other" because the rights notice was appended to it.

Fans look up three things most: characters, bounties and Devil Fruits. The site had characters but no bounty table outside the Straw Hats and no Devil Fruit records at all.

## What this round does

The round lands as one pull request with a commit per step, so each step can be reviewed on its own.

1. **Repository polish.**
   - `LICENSE` is plain MIT and the rights notice moves to `NOTICE.md`.
   - Adds issue and pull request templates.
   - The README gets a one-line hook, badges and a contributor section.
   - The refresh audit also checks the README's chapter badge.
2. **Findable, shareable pages.**
   - Path URLs (`/arc/wano`, `/character/luffy`, `/crew`). Legacy query links still open and are rewritten to the path form.
   - After the Vite build, a prerender step writes a page for every arc, place, character, crew and view. Each page has its own title, description, canonical link, Open Graph and Twitter tags, JSON-LD and a static readable summary with real links.
   - A generated sitemap and robots file.
   - Share images are drawn at build time from the same code-drawn art: the portrait recipe, the island scenes, and a bitmap pixel font that renders identically everywhere and needs no font files.
   - A small same-origin script hides the static summary for readers who limit spoilers, so they never see full-edition text before the app mounts.
3. **Chapter refresh to 1196**, through the `chapter-refresh` skill.
4. **Bounty Board.** Sourced bounty histories for supporting profiles, a spoiler-limited leaderboard, and a bounty growth chart.
5. **Devil Fruit encyclopedia.**
   - A new data file with reveal chapters, users, awakenings and later true identities, each gated by reading progress.
   - Its own view, plus a detail record for every fruit.
   - Covered by the validator and the refresh audit.
6. **Wanted-poster maker.**
   - Visitors compose a portrait from the same recipe language and download a PNG.
   - A share link carries the recipe in the URL.
   - No server and no storage.

## Constraints kept

- There are no third-party scripts, no analytics and no outbound requests, so the content security policy is unchanged.
- No manga artwork. Story text is original writing marked `draft`.
- Beat and battle ids never change, because they are deep-link targets.
- Chapter numbers live only in `src/data`. Everything else reads `coverage.ts`.
- All animation stays behind the motion toggle and `prefers-reduced-motion`.
- Share images name characters but leave out epithets and bounties, so link previews stay spoiler-light.

## Left for later

- A daily guessing game.
- An anime-episode-to-chapter converter.
- Catch-up recaps.
- Translations.
- Turning in-app buttons into real links throughout. The prerendered pages already carry a real link graph for crawlers.
