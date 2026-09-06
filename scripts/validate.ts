/* Referential integrity for the content edition. Run with `npm run validate`. */
import { arcs, sagas } from '../src/data/arcs';
import { locations, connections } from '../src/data/locations';
import { characters } from '../src/data/characters';
import { coverage } from '../src/data/coverage';
import { stagings } from '../src/data/staging';

const problems: string[] = [];
const ids = <T extends { id: string }>(list: T[], label: string) => { const seen = new Set<string>(); for (const x of list) { if (seen.has(x.id)) problems.push(`${label}: duplicate id ${x.id}`); seen.add(x.id); } return seen; };
const arcIds = ids(arcs, 'arcs'); const locationIds = ids(locations, 'locations'); const characterIds = ids(characters, 'characters'); const sagaIds = ids(sagas, 'sagas');

let previousEnd = 0;
for (const a of arcs) {
  if (!sagaIds.has(a.sagaId)) problems.push(`arc ${a.id}: unknown saga ${a.sagaId}`);
  for (const l of a.locationIds) if (!locationIds.has(l)) problems.push(`arc ${a.id}: unknown location ${l}`);
  for (const c of a.characterIds) if (!characterIds.has(c)) problems.push(`arc ${a.id}: unknown character ${c}`);
  if (a.chapters[0] !== previousEnd + 1) problems.push(`arc ${a.id}: chapters start at ${a.chapters[0]}, previous arc ended at ${previousEnd}`);
  if (a.chapters[1] < a.chapters[0]) problems.push(`arc ${a.id}: chapter span reversed`);
  previousEnd = a.chapters[1];
  if (a.beats.length === 0) problems.push(`arc ${a.id}: no story beats`);
  if (a.battles.length === 0) problems.push(`arc ${a.id}: no battle`);
  ids(a.beats, `arc ${a.id} beats`);
  for (const b of a.beats) if (b.paragraphs.some((p) => p.length < 120)) problems.push(`arc ${a.id}/${b.id}: paragraph shorter than 120 characters`);
  if (a.status === 'ongoing' && a.chapters[0] > coverage.coveredThrough) problems.push(`arc ${a.id}: ongoing arc starts after the covered chapter`);
  if (!a.locationIds.length) problems.push(`arc ${a.id}: no locations`);
}
if (previousEnd !== coverage.coveredThrough) problems.push(`last arc ends at ${previousEnd}, coverage says ${coverage.coveredThrough}`);
for (const l of locations) {
  for (const a of l.arcIds) if (!arcIds.has(a)) problems.push(`location ${l.id}: unknown arc ${a}`);
  if (l.map.x < 0 || l.map.x > 100 || l.map.y < 0 || l.map.y > 100) problems.push(`location ${l.id}: map out of range`);
  if (l.art.palette.length !== 4) problems.push(`location ${l.id}: palette needs 4 colours`);
  if (!l.landmarks.length) problems.push(`location ${l.id}: no landmarks`);
}
for (const c of characters) if (!arcIds.has(c.arcId)) problems.push(`character ${c.id}: unknown recruitment arc ${c.arcId}`);
for (const c of connections) { if (!locationIds.has(c.from)) problems.push(`connection: unknown from ${c.from}`); if (!locationIds.has(c.to)) problems.push(`connection: unknown to ${c.to}`); }
const orphanLocations = locations.filter((l) => !arcs.some((a) => a.locationIds.includes(l.id)) && !l.arcIds.length);
for (const l of orphanLocations) problems.push(`location ${l.id}: never referenced`);
for (const s of sagas) if (!arcs.some((a) => a.sagaId === s.id)) problems.push(`saga ${s.id}: no arcs`);

const stagingIds = ids(stagings.map((s) => ({ id: s.arcId })), 'staging');
for (const s of stagings) {
  const a = arcs.find((x) => x.id === s.arcId);
  if (!a) { problems.push(`staging ${s.arcId}: unknown arc`); continue; }
  const cast = new Set(s.cast.map((c) => c.id));
  if (s.cast.length < 3) problems.push(`staging ${s.arcId}: fewer than 3 cast members`);
  if (!s.hook || s.hook.length > 80) problems.push(`staging ${s.arcId}: hook missing or over 80 chars`);
  ids(s.cast, `staging ${s.arcId} cast`);
  for (const c of s.cast) {
    if (c.role.length < 40) problems.push(`staging ${s.arcId}/${c.id}: role shorter than 40 chars`);
    if (characterIds.has(c.id) && c.side !== 'crew') problems.push(`staging ${s.arcId}/${c.id}: Straw Hat must be side crew`);
  }
  for (const [beatId, b] of Object.entries(s.beats)) {
    if (!a.beats.some((x) => x.id === beatId)) problems.push(`staging ${s.arcId}: unknown beat ${beatId}`);
    if (b.location && !locationIds.has(b.location)) problems.push(`staging ${s.arcId}/${beatId}: unknown location ${b.location}`);
    for (const p of b.present) if (!cast.has(p)) problems.push(`staging ${s.arcId}/${beatId}: ${p} not in cast`);
  }
  for (const b of a.beats) if (!s.beats[b.id]) problems.push(`staging ${s.arcId}: beat ${b.id} not staged`);
  for (const [battleId, b] of Object.entries(s.battles)) {
    if (!a.battles.some((x) => x.id === battleId)) problems.push(`staging ${s.arcId}: unknown battle ${battleId}`);
    for (const p of [...b.a, ...b.b]) if (!cast.has(p)) problems.push(`staging ${s.arcId}/${battleId}: ${p} not in cast`);
  }
  for (const b of a.battles) if (!s.battles[b.id]) problems.push(`staging ${s.arcId}: battle ${b.id} not staged`);
}
for (const a of arcs) if (!stagingIds.has(a.id)) problems.push(`arc ${a.id}: no staging`);

const summary = `${arcs.length} arcs · ${arcs.reduce((n, a) => n + a.beats.length, 0)} beats · ${arcs.reduce((n, a) => n + a.battles.length, 0)} battles · ${locations.length} locations · ${characters.length} crew · ${connections.length} connections · ${stagings.reduce((n, s) => n + s.cast.length, 0)} cast entries · coverage Ch. 1–${coverage.coveredThrough}`;
if (problems.length) { console.error(`✗ ${problems.length} content problems\n` + problems.map((p) => `  - ${p}`).join('\n')); console.error(summary); process.exit(1); }
console.log(`✓ content edition is consistent\n${summary}`);
