/*
 * Reports what a chapter refresh still has to touch. Run with `npm run refresh:audit`.
 *
 * The edition's facts live in one place (src/data/coverage.ts) but prose, docs and
 * screenshots repeat them in words. This finds the repetitions that have drifted, so a
 * refresh does not rely on anyone remembering where the numbers were written down.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { arcs } from '../src/data/arcs';
import { locations } from '../src/data/locations';
import { characters } from '../src/data/characters';
import { coverage } from '../src/data/coverage';
import { stagings } from '../src/data/staging';

const root = fileURLToPath(new URL('..', import.meta.url));
const strict = process.argv.includes('--strict');
const problems: string[] = [];
const notes: string[] = [];

/* ------------------------------------------------------------------ coverage */
const ongoing = arcs.filter((a) => a.status === 'ongoing');
const last = arcs[arcs.length - 1];
const behind = coverage.latestOfficialChapter - coverage.coveredThrough;
const verifiedDays = Math.floor((Date.now() - Date.parse(coverage.verifiedDate)) / 86_400_000);

console.log('COVERAGE');
console.log(`  verified            ${coverage.verifiedDate} (${verifiedDays} day${verifiedDays === 1 ? '' : 's'} ago)`);
console.log(`  latest official     Ch. ${coverage.latestOfficialChapter}`);
console.log(`  narrated through    Ch. ${coverage.coveredThrough}${behind > 0 ? `  ← ${behind} chapter${behind === 1 ? '' : 's'} behind` : '  ← up to date'}`);
console.log(`  last arc            ${last.name} (${last.id}) Ch. ${last.chapters[0]}–${last.chapters[1]}${last.status === 'ongoing' ? ', ongoing' : ''}`);
console.log(`  ongoing arcs        ${ongoing.length ? ongoing.map((a) => a.id).join(', ') : 'none'}`);

if (last.chapters[1] !== coverage.coveredThrough) problems.push(`last arc ends at ${last.chapters[1]} but coverage.coveredThrough is ${coverage.coveredThrough} (scripts/validate.ts will fail)`);
if (verifiedDays > 14) notes.push(`coverage.verifiedDate is ${verifiedDays} days old — re-check the latest released chapter`);

/* -------------------------------------------------------------------- counts */
const counts = {
  arcs: arcs.length,
  beats: arcs.reduce((n, a) => n + a.beats.length, 0),
  battles: arcs.reduce((n, a) => n + a.battles.length, 0),
  locations: locations.length,
  cast: stagings.reduce((n, s) => n + s.cast.length, 0),
  characters: characters.length,
};
console.log('\nCONTENT');
console.log(`  ${counts.arcs} arcs · ${counts.beats} beats · ${counts.battles} battles · ${counts.locations} locations · ${counts.cast} cast entries · ${counts.characters} crew profiles`);

/* ------------------------------------------- prose that repeats the numbers */
const PROSE = ['README.md', 'docs/STATE.md', 'docs/IMPLEMENTATION.md', 'DESIGN.md', 'UX-CONTRACT.md', 'package.json'];
const CLAIMS: [RegExp, keyof typeof counts][] = [
  [/(\d[\d,]*) arcs/g, 'arcs'],
  [/(\d[\d,]*) (?:story )?beats/g, 'beats'],
  [/(\d[\d,]*) battle/g, 'battles'],
  [/(\d[\d,]*) (?:locations|places)/g, 'locations'],
  [/(\d[\d,]*) cast entries/g, 'cast'],
];

console.log('\nPROSE CLAIMS');
for (const file of PROSE) {
  let text: string;
  try { text = readFileSync(join(root, file), 'utf8'); } catch { continue; }
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    const statesEditionTotals = /\barcs\b/.test(line);
    for (const [pattern, key] of statesEditionTotals ? CLAIMS : []) {
      for (const match of line.matchAll(new RegExp(pattern.source, 'g'))) {
        const claimed = Number(match[1].replaceAll(',', ''));
        if (claimed !== counts[key]) problems.push(`${file}:${i + 1} claims ${claimed} ${key}, actual ${counts[key]}`);
      }
    }
    // A stale edition fact: a sentence about what the edition covers, naming the wrong chapter.
    // Lines that merely cite a chapter for a story event are content, not an edition fact, and a
    // changelog sentence naming an old number is history rather than a claim about today.
    const isEditionClaim = /through|cover|latest|narrat/i.test(line);
    const isHistory = /\bwas\b|\bwere\b|frozen|previous|used to|earlier|moved from|no longer|until /i.test(line);
    if (isEditionClaim && !isHistory) {
      for (const match of line.matchAll(/\b(1[012]\d\d)\b/g)) {
        const n = Number(match[1]);
        if (n !== coverage.coveredThrough && n !== coverage.latestOfficialChapter) problems.push(`${file}:${i + 1} describes coverage as chapter ${n}; coverage.ts says ${coverage.coveredThrough} narrated, ${coverage.latestOfficialChapter} released`);
      }
    }
  });
}
console.log(`  checked ${PROSE.length} documents for stale counts and chapter numbers`);
console.log('  checked src/data for chapters cited beyond the cutoff');

/* ------------------------------- story that claims more than the edition covers */
const dataDir = join(root, 'src', 'data');
for (const entry of readdirSync(dataDir)) {
  if (!entry.endsWith('.ts') || entry === 'coverage.ts' || entry.endsWith('.generated.ts') || entry.endsWith('.test.ts')) continue;
  readFileSync(join(dataDir, entry), 'utf8').split('\n').forEach((line, i) => {
    for (const match of line.matchAll(/\b(1[0-9]\d\d)\b/g)) {
      const n = Number(match[1]);
      if (n > coverage.coveredThrough) problems.push(`src/data/${entry}:${i + 1} cites chapter ${n}, past the covered cutoff of ${coverage.coveredThrough}`);
    }
  });
}

/* ------------------------------- chapter numbers hard-coded outside the data */
const skip = new Set(['node_modules', 'dist', '.git', 'data', 'research', 'screenshots', 'concepts']);
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (skip.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|css|html)$/.test(entry) && !entry.endsWith('.generated.ts')) out.push(full);
  }
  return out;
}
const literals = new Set<string>();
for (const file of walk(join(root, 'src')).concat(walk(join(root, 'tests')), walk(join(root, 'scripts')))) {
  const rel = relative(root, file);
  if (rel === 'scripts/refresh-audit.ts') continue;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const aboutChapters = /\bch(?:apter)?s?\b/i.test(line);
    for (const match of line.matchAll(/\b(1[012]\d\d)\b/g)) {
      const n = Number(match[1]);
      // Either a copy of an edition fact, or a number on a line that talks about chapters.
      // Plain coordinates and viewBox numbers are neither, so the atlas does not trip this.
      const copiesEditionFact = n === coverage.coveredThrough || n === coverage.latestOfficialChapter;
      // Map coordinates collide with chapter numbers by coincidence: a cutoff of 1200 would
      // otherwise flag every atlas camera position. Geometry is never an edition fact.
      const looksLikeGeometry = /\b(?:x|y|cx|cy|width|height|zoom|viewBox)\b|translate\(|\[\s*\d+\s*,|,\s*\d+\s*\]/.test(line);
      if ((copiesEditionFact || aboutChapters) && !looksLikeGeometry) literals.add(`${rel}:${i + 1} literal ${n} — read it from coverage.ts instead: ${line.trim().slice(0, 88)}`);
    }
  });
}
console.log('\nEDITION FACTS COPIED OUTSIDE src/data');
if (literals.size) literals.forEach((l) => console.log(`  ${l}`));
else console.log('  none — components, tests and scripts all read the numbers from coverage.ts');
problems.push(...[...literals].map((l) => `edition fact copied into code: ${l}`));

/* ------------------------------------------------------ needs a human read */
console.log('\nREVIEW BY EYE (no check can judge these)');
console.log('  src/App.tsx            saga boundary banners — do they still describe where the story stands?');
console.log('  src/components/WorldAtlas.tsx  world notes — same question for the chart');
console.log("  src/data/crews.ts      chapters ranges for groups still active at the cutoff");
console.log('  docs/screenshots/      journey.webp and arc-title-card.webp show the chapter numbers');

/* ---------------------------------------------------------------- next steps */
console.log('\nVERDICT');
if (behind > 0) console.log(`  → ${behind} chapter${behind === 1 ? '' : 's'} of story to write: ${coverage.coveredThrough + 1}–${coverage.latestOfficialChapter}`);
for (const n of notes) console.log(`  note: ${n}`);
if (problems.length) {
  console.log(`\n✗ ${problems.length} thing${problems.length === 1 ? '' : 's'} to fix`);
  problems.forEach((p) => console.log(`  - ${p}`));
} else {
  console.log('  ✓ every repeated fact matches the data');
}
if (strict && problems.length) process.exit(1);
