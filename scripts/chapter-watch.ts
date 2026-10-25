/*
 * Reports whether the manga has released chapters this edition does not narrate yet.
 * Run with `npm run chapter:check`. The weekly workflow (.github/workflows/chapter-watch.yml)
 * runs it and opens an issue when it finds some.
 *
 * A wiki chapter page exists before the chapter does, so existence proves nothing. A chapter
 * counts as released only when its page has a real Short Summary and no "set to be released on"
 * line (the release test in .claude/skills/chapter-refresh/references/research.md).
 */
import { appendFileSync } from 'node:fs';
import { coverage } from '../src/data/coverage';

const API = 'https://onepiece.fandom.com/api.php';
const HEADERS = { 'User-Agent': 'one-piece-odyssey/1.0 (fan project; chapter watch)' };

async function released(chapter: number): Promise<boolean> {
  const url = `${API}?action=parse&page=Chapter_${chapter}&prop=wikitext&format=json&formatversion=2`;
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`wiki answered ${response.status} for chapter ${chapter}`);
  const data = await response.json() as { parse?: { wikitext: string }; error?: unknown };
  if (!data.parse) return false;
  const text = data.parse.wikitext;
  if (/is set to be released on/i.test(text)) return false;
  const summary = text.split('==Short Summary==')[1]?.split(/\n==[^=]/)[0] ?? '';
  return summary.replace(/<!--[\s\S]*?-->/g, '').trim().length > 80;
}

let latest = coverage.coveredThrough;
// Breaks mean no more than a handful of chapters pile up between checks; stop at the first gap.
for (let chapter = coverage.coveredThrough + 1; chapter <= coverage.coveredThrough + 12; chapter++) {
  if (!(await released(chapter))) break;
  latest = chapter;
}

const behind = latest - coverage.coveredThrough;
console.log(behind ? `${behind} new chapter${behind === 1 ? '' : 's'} released: ${coverage.coveredThrough + 1}–${latest} (narrated through ${coverage.coveredThrough})` : `Up to date: narrated through ${coverage.coveredThrough}, no newer chapter released.`);
// In GitHub Actions, hand the result to the next step.
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `behind=${behind}\nlatest=${latest}\ncovered=${coverage.coveredThrough}\n`);
