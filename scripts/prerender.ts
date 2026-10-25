/*
 * Writes a real page for every arc, place, character, crew and view after `vite build`.
 *
 * The app is one document that routes on the client, so without this every URL answers with
 * the same title and an empty #root: search engines index one page and shared links show no
 * preview. Each page here is the built index.html with its own title, description, canonical
 * link, Open Graph tags, JSON-LD and a plain readable summary with real links, plus a share
 * image drawn from the site's own code art. React replaces the summary when it mounts.
 *
 * Readers who limit spoilers never see the summary: public/spoiler-guard.js hides it before
 * first paint, because these pages always describe the full edition.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { arcs, sagas } from '../src/data/arcs';
import { locations } from '../src/data/locations';
import { allCharacters } from '../src/data/all-characters';
import { crews } from '../src/data/crews';
import { stagings } from '../src/data/staging';
import { buildMysteries } from '../src/data/mysteries';
import { buildBountyBoard } from '../src/data/bounty-board';
import { canonAnimeArcs } from '../src/data/anime-arcs';
import { coverage } from '../src/data/coverage';
import { encodeRoute } from '../src/state';
import type { Route } from '../src/types';
import { crewRowCard, fruitCard, plainCard, posterCard, posterMakerCard, sceneCard } from './og/cards';
import { devilFruits, fruitTypeLabel } from '../src/data/devil-fruits';
import { characters as strawHats } from '../src/data/characters';

const SITE = (process.env.SITE_URL || 'https://one-piece-odyssey.netlify.app').replace(/\/$/, '');
const NAME = 'One Piece Odyssey';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const clip = (s: string, max = 158) => {
  const flat = s.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : cut.length).replace(/[,;:.\s]+$/, '')}…`;
};
const pathOf = (route: Route) => encodeRoute(route);
const link = (route: Route, label: string) => `<a href="${pathOf(route)}">${esc(label)}</a>`;
const list = (items: string[]) => items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : '';
const paras = (items: string[]) => items.map((p) => `<p>${esc(p)}</p>`).join('');
const section = (title: string, body: string) => body ? `<section><h2>${esc(title)}</h2>${body}</section>` : '';

const REGIONS: Record<string, string> = { 'east-blue': 'East Blue', paradise: 'Paradise', sky: 'Sky Islands', 'red-line': 'Red Line', 'calm-belt': 'Calm Belt', 'new-world': 'New World', other: 'The wider world' };
const CREW_KINDS: Record<string, string> = { central: 'The crew', allies: 'Allied crew', rivals: 'Rival crew', antagonists: 'Antagonists', historic: 'Historic crew', factions: 'Faction' };
const canonicalCast = (id: string) => id === 'jinbe-knight' ? 'jinbe' : id === 'miss-all-sunday' ? 'robin' : id;

const characterById = new Map(allCharacters.map((c) => [c.id, c]));
const locationById = new Map(locations.map((l) => [l.id, l]));
const sagaById = new Map(sagas.map((s) => [s.id, s]));
const stagingByArc = new Map(stagings.map((s) => [s.arcId, s]));
const arcsByCharacter = new Map<string, string[]>();
for (const s of stagings) for (const c of s.cast) {
  const id = canonicalCast(c.id);
  arcsByCharacter.set(id, [...new Set([...(arcsByCharacter.get(id) ?? []), s.arcId])]);
}
const arcName = (id: string) => arcs.find((a) => a.id === id)?.name ?? id;
const crewsOf = (id: string) => crews.filter((c) => c.memberIds.includes(id) || c.captain === id);

interface Page {
  route: Route;
  title: string;
  description: string;
  heading: string;
  body: string;
  image: { path: string; svg: () => string; alt: string };
  crumbs: { name: string; route: Route }[];
  index?: boolean;
}

const nav = `<nav aria-label="Sections">${[
  link({ view: 'journey' }, 'Journey'), link({ view: 'world' }, 'World atlas'), link({ view: 'crew' }, 'Crews'),
  link({ view: 'trails' }, 'Character trails'), link({ view: 'mysteries' }, 'Mysteries'), link({ view: 'bounties' }, 'Bounties'), link({ view: 'devil-fruits' }, 'Devil Fruits'), link({ view: 'poster' }, 'Poster maker'),
].join(' · ')}</nav>`;
const footer = `<footer><p>ONE PIECE © Eiichiro Oda / Shueisha. ${NAME} is an independent, non-commercial fan project. Story summaries are original writing; art is drawn in code. Narrated through chapter ${coverage.coveredThrough}.</p></footer>`;

const pages: Page[] = [];

/* ------------------------------------------------------------------- arcs */
arcs.forEach((arc, i) => {
  const staging = stagingByArc.get(arc.id);
  const saga = sagaById.get(arc.sagaId);
  const span = `Ch. ${arc.chapters[0]}–${arc.chapters[1]}`;
  const cast = (staging?.cast ?? []).map((c) => ({ ...c, id: canonicalCast(c.id) }));
  const prev = arcs[i - 1];
  const next = arcs[i + 1];
  pages.push({
    route: { view: 'journey', kind: 'arc', id: arc.id },
    title: `${arc.name} arc (${span}) — ${NAME}`,
    description: clip(`${staging?.hook ? `${staging.hook} ` : ''}${arc.premise}`),
    heading: `${arc.name} arc`,
    body: `<p><strong>${span}${saga ? ` · ${esc(saga.name)}` : ''}${arc.status === 'ongoing' ? ' · ongoing' : ''}</strong></p>
      <p>${esc(arc.premise)}</p>${paras(arc.overview)}
      ${section('Story', arc.beats.map((b) => `<article><h3>${esc(b.title)} <small>Ch. ${esc(b.chapters)}</small></h3>${paras(b.paragraphs)}</article>`).join(''))}
      ${section('Battles', list(arc.battles.map((b) => `<strong>${esc(b.title)}</strong> (Ch. ${esc(b.chapters)}): ${esc(b.outcome)}`)))}
      ${section('Cast', list(cast.map((c) => `${characterById.has(c.id) ? link({ view: 'journey', kind: 'character', id: c.id }, c.name) : esc(c.name)}: ${esc(c.role)}`)))}
      ${section('Places', list(arc.locationIds.filter((id) => locationById.has(id)).map((id) => link({ view: 'journey', kind: 'location', id }, locationById.get(id)!.name))))}
      ${section('Legacy', paras(arc.legacy))}
      <p>${prev ? `Previous: ${link({ view: 'journey', kind: 'arc', id: prev.id }, prev.name)}` : ''}${prev && next ? ' · ' : ''}${next ? `Next: ${link({ view: 'journey', kind: 'arc', id: next.id }, next.name)}` : ''}</p>`,
    image: { path: `og/arc/${arc.id}.png`, alt: `${arc.name} arc, drawn as pixel art`, svg: () => sceneCard({ locationId: arc.locationIds[0] ?? arc.id, eyebrow: `Arc · ${span}${saga ? ` · ${saga.name}` : ''}`, title: arc.name, subtitle: staging?.hook }) },
    crumbs: [{ name: 'Journey', route: { view: 'journey' } }, { name: arc.name, route: { view: 'journey', kind: 'arc', id: arc.id } }],
  });
});

/* ------------------------------------------------------------------ places */
for (const place of locations) {
  const region = REGIONS[place.region] ?? 'The wider world';
  pages.push({
    route: { view: 'journey', kind: 'location', id: place.id },
    title: `${place.name} — ${region} | ${NAME}`,
    description: clip(place.description),
    heading: place.name,
    body: `<p><strong>${esc(region)} · Ch. ${esc(place.chapters)}</strong></p><p>${esc(place.description)}</p>
      ${section('Landmarks', list(place.landmarks.map(esc)))}
      ${section('Story arcs here', list(place.arcIds.map((id) => link({ view: 'journey', kind: 'arc', id }, arcName(id)))))}`,
    image: { path: `og/location/${place.id}.png`, alt: `${place.name}, drawn as pixel art`, svg: () => sceneCard({ locationId: place.id, eyebrow: `Place · ${region}`, title: place.name }) },
    crumbs: [{ name: 'World atlas', route: { view: 'world' } }, { name: place.name, route: { view: 'journey', kind: 'location', id: place.id } }],
  });
}

/* -------------------------------------------------------------- characters */
for (const person of allCharacters) {
  const appearances = arcsByCharacter.get(person.id) ?? [];
  const groups = crewsOf(person.id);
  const named = person.epithet ? `${person.name} “${person.epithet}”` : person.name;
  pages.push({
    route: { view: 'journey', kind: 'character', id: person.id },
    title: `${named} — ${NAME}`,
    description: clip(`${person.name}, ${person.role}. ${person.description}`),
    heading: person.name,
    body: `<p><strong>${esc([person.epithet, person.role].filter(Boolean).join(' · '))}</strong></p><p>${esc(person.description)}</p>
      ${person.dream ? `<p><strong>Dream:</strong> ${esc(person.dream)}</p>` : ''}
      ${section('Milestones', list(person.milestones.map(esc)))}
      ${section('Bounties', list(person.bounties.map((b) => `฿${esc(b.amount)} (${esc(b.after)})`)))}
      ${section('Crews', list(groups.map((c) => link({ view: 'journey', kind: 'crew', id: c.id }, c.name))))}
      ${section('Appears in', list(appearances.map((id) => link({ view: 'journey', kind: 'arc', id }, arcName(id)))))}`,
    // Name only on the image: epithets and bounties would spoil a link preview.
    image: { path: `og/character/${person.id}.png`, alt: `Wanted poster portrait of ${person.name}, drawn in code`, svg: () => posterCard({ portraitId: person.id, color: person.color, eyebrow: groups[0]?.name ?? 'Character', title: person.name }) },
    crumbs: [{ name: 'Character trails', route: { view: 'trails' } }, { name: person.name, route: { view: 'journey', kind: 'character', id: person.id } }],
  });
}

/* ------------------------------------------------------------------- crews */
for (const group of crews) {
  const captain = characterById.get(group.captain);
  const members = group.memberIds.filter((id) => characterById.has(id));
  pages.push({
    route: { view: 'journey', kind: 'crew', id: group.id },
    title: `${group.name} — ${CREW_KINDS[group.category] ?? 'Crew'} | ${NAME}`,
    description: clip(group.description),
    heading: group.name,
    body: `<p><strong>${esc(CREW_KINDS[group.category] ?? 'Crew')}${captain ? ` · led by ${esc(captain.name)}` : ''}${group.ship ? ` · ship: ${esc(group.ship)}` : ''}</strong></p><p>${esc(group.description)}</p>
      ${section('Members', list(members.map((id) => link({ view: 'journey', kind: 'character', id }, characterById.get(id)!.name))))}
      ${section('Story arcs', list(group.arcIds.map((id) => link({ view: 'journey', kind: 'arc', id }, arcName(id)))))}`,
    image: { path: `og/crew/${group.id}.png`, alt: `${group.name}, with a portrait of their leader drawn in code`, svg: () => posterCard({ portraitId: captain?.id ?? group.id, color: group.color, eyebrow: CREW_KINDS[group.category] ?? 'Crew', title: group.name, subtitle: captain ? `Led by ${captain.name}` : undefined }) },
    crumbs: [{ name: 'Crews', route: { view: 'crew' } }, { name: group.name, route: { view: 'journey', kind: 'crew', id: group.id } }],
  });
}

/* ------------------------------------------------------------- devil fruits */
for (const f of devilFruits) {
  const shown = f.trueIdentity;
  const type = fruitTypeLabel(shown?.type ?? f.type);
  pages.push({
    route: { view: 'journey', kind: 'fruit', id: f.id },
    // Titles and headings use the name the fruit is first revealed under, so search results do not spoil a later identity.
    title: `${f.name} (${f.romaji}) — Devil Fruit | ${NAME}`,
    description: clip(`${f.romaji}, a ${fruitTypeLabel(f.type)} Devil Fruit. ${f.power}`),
    heading: f.name,
    body: `<p><strong>${esc(fruitTypeLabel(f.type))} · ${esc(f.romaji)}${f.meaning ? ` · “${esc(f.meaning)}”` : ''}</strong></p>${shown ? `<p>In chapter ${shown.chapter} it is revealed to be the ${esc(shown.name)}, a ${esc(type)}.</p>` : ''}<p>${esc(f.power)}</p>
      <p>First revealed in chapter ${f.revealChapter}, during ${link({ view: 'journey', kind: 'arc', id: f.arcId }, arcName(f.arcId))}.</p>
      ${section('Who has held it', list(f.users.map((u) => `${u.characterId && characterById.has(u.characterId) ? link({ view: 'journey', kind: 'character', id: u.characterId }, u.name) : esc(u.name)} <small>from chapter ${u.from}${u.until ? `, until ${u.until}` : ''}</small>`)))}
      ${section('Awakening', list((f.awakened ?? []).map((a) => `${esc(characterById.get(a.characterId)?.name ?? a.characterId)}, chapter ${a.chapter}`)))}`,
    // The share image names the fruit as first revealed, so a link preview never spoils its true identity.
    image: { path: `og/fruit/${f.id}.png`, alt: `The ${f.name}, drawn in code`, svg: () => fruitCard({ id: f.id, type: f.type, eyebrow: fruitTypeLabel(f.type), title: f.name, subtitle: f.romaji }) },
    crumbs: [{ name: 'Devil Fruits', route: { view: 'devil-fruits' } }, { name: f.name, route: { view: 'journey', kind: 'fruit', id: f.id } }],
  });
}

/* ------------------------------------------------------------------- views */
const sagaList = sagas.map((s) => {
  const inSaga = arcs.filter((a) => a.sagaId === s.id);
  return inSaga.length ? `<section><h2>${esc(s.name)}</h2>${list(inSaga.map((a) => `${link({ view: 'journey', kind: 'arc', id: a.id }, a.name)} <small>Ch. ${a.chapters[0]}–${a.chapters[1]}</small>`))}</section>` : '';
}).join('');
const view = (route: Route, title: string, eyebrow: string, description: string, body: string, index = true, locationId?: string): Page => ({
  route, title: `${title} — ${NAME}`, description, heading: title, body, index,
  image: { path: `og/view/${route.view}.png`, alt: `${title}, ${NAME}`, svg: () => plainCard({ eyebrow, title, subtitle: description, locationId }) },
  crumbs: [{ name: title, route }],
});
pages.push(
  {
    route: { view: 'journey' },
    title: `${NAME} — an illustrated journey through the One Piece manga`,
    description: clip(`Every arc of One Piece from Romance Dawn to Elbaf as one animated voyage: ${arcs.length} arcs, ${arcs.reduce((n, a) => n + a.beats.length, 0)} story beats and ${arcs.reduce((n, a) => n + a.battles.length, 0)} battles, narrated through chapter ${coverage.coveredThrough}. Drawn in code.`),
    heading: NAME,
    body: `<p>An illustrated, animated fan explorer for the One Piece manga. Every arc is a stop on one continuous voyage, narrated through chapter ${coverage.coveredThrough}. Full spoilers are shown by default; limit them with “I’ve read through”.</p>${sagaList}`,
    image: { path: 'og/default.png', alt: `${NAME}: an illustrated journey through the One Piece manga`, svg: () => crewRowCard({ eyebrow: `Narrated through chapter ${coverage.coveredThrough}`, title: NAME, subtitle: 'Every arc, island and fight as one voyage. Drawn in code.', portraits: strawHats }) },
    crumbs: [],
  },
  view({ view: 'world' }, 'World atlas', 'Atlas', 'A chart and globe of every island, sea and settlement on the voyage, with searchable field notes.', list(locations.map((l) => link({ view: 'journey', kind: 'location', id: l.id }, l.name))), true, 'red-line'),
  view({ view: 'crew' }, 'Crews and factions', 'Registry', 'Wanted posters for the Straw Hats and a registry of the pirate crews and factions around them.', list(crews.map((c) => link({ view: 'journey', kind: 'crew', id: c.id }, c.name)))),
  view({ view: 'trails' }, 'Character trails', 'Discover', 'Follow a character through the story: chronological moments, battles and bounty changes.', list(allCharacters.map((c) => link({ view: 'journey', kind: 'character', id: c.id }, c.name)))),
  view({ view: 'mysteries' }, 'Mystery board', 'Discover', "Source-linked questions whose clues unlock with your reading progress.", list(buildMysteries(null).map((m) => esc(m.question)))),
  view({ view: 'bounties' }, 'Bounty board', 'Discover', 'Every bounty the One Piece story has posted, ranked by latest figure, with how each one grew chapter by chapter.', `<ol>${buildBountyBoard(allCharacters).map((r) => `<li>${link({ view: 'journey', kind: 'character', id: r.character.id }, r.character.name)}: ฿${esc(r.current.amount)} <small>(${esc(r.current.label)}, Ch. ${r.current.chapter})</small></li>`).join('')}</ol>`),
  view({ view: 'devil-fruits' }, 'Devil Fruit encyclopedia', 'Discover', 'Every Devil Fruit eaten by a profiled character, and every one named on Elbaf: what it does, who has held it, and when it awakened.', list(devilFruits.map((f) => link({ view: 'journey', kind: 'fruit', id: f.id }, `${f.name} (${f.romaji})`)))),
  { ...view({ view: 'poster' }, 'Wanted poster maker', 'Make', 'Build a pixel portrait from the recipe every character here is drawn with, set your bounty, and download your own wanted poster.', '<p>Choose a face, a hat, a scar and colours, write your name and bounty, and save the poster as a PNG. Nothing is uploaded; the share link carries the whole poster.</p>'), image: { path: 'og/view/poster.png', alt: 'A sample wanted poster drawn in code', svg: posterMakerCard } },
  view({ view: 'catch-up' }, 'Where am I? Anime episode to manga chapter', 'Discover', 'Enter the last One Piece anime episode you watched to find the manga chapter to start from, with a spoiler-safe recap of the arc so far.', `<p>Each anime arc is matched to the chapters it adapts; filler arcs are marked as anime-original.</p>${list(canonAnimeArcs.map((a) => `${esc(a.name)}: episodes ${a.episodes[0]}–${a.episodes[1]}${a.airing ? ' (still airing)' : `, chapters ${a.chapters[0]}–${a.chapters[1]}`}`))}`),
  view({ view: 'legal' }, 'Disclaimer and terms', 'Notices', 'Rights, privacy and contact details for this non-commercial fan project.', ''),
  view({ view: 'search' }, 'Search', 'Search', 'Search arcs, places, characters and crews.', '', false),
  view({ view: 'saved' }, 'Your logbook', 'Logbook', 'Arcs and places you saved, kept in your own browser.', '', false),
);

/* ---------------------------------------------------------------- writing */
function render(page: Page): string {
  const url = `${SITE}${pathOf(page.route)}`;
  const image = `${SITE}/${page.image.path}`;
  const crumbs = page.crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${SITE}${pathOf(c.route)}` }));
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', name: page.title, description: page.description, url, image, isPartOf: { '@type': 'WebSite', name: NAME, url: `${SITE}/` }, about: { '@type': 'CreativeWork', name: 'One Piece', author: { '@type': 'Person', name: 'Eiichiro Oda' } } },
      ...(crumbs.length ? [{ '@type': 'BreadcrumbList', itemListElement: crumbs }] : []),
    ],
  };
  const head = [
    `<link rel="canonical" href="${url}"/>`,
    page.index === false ? '<meta name="robots" content="noindex"/>' : '',
    `<meta property="og:site_name" content="${NAME}"/>`,
    `<meta property="og:type" content="${page.route.kind ? 'article' : 'website'}"/>`,
    `<meta property="og:title" content="${esc(page.title)}"/>`,
    `<meta property="og:description" content="${esc(page.description)}"/>`,
    `<meta property="og:url" content="${url}"/>`,
    `<meta property="og:image" content="${image}"/>`,
    '<meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/>',
    `<meta property="og:image:alt" content="${esc(page.image.alt)}"/>`,
    '<meta name="twitter:card" content="summary_large_image"/>',
    `<meta name="twitter:title" content="${esc(page.title)}"/>`,
    `<meta name="twitter:description" content="${esc(page.description)}"/>`,
    `<meta name="twitter:image" content="${image}"/>`,
    // JSON is a data block, not script, so the content security policy does not apply to it.
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].filter(Boolean).join('');
  const body = `<div id="prerender">${nav}<main><h1>${esc(page.heading)}</h1>${page.body.replace(/\n\s*/g, '')}</main>${footer}</div>`;
  let html = template;
  const swap = (pattern: RegExp, value: string) => {
    if (!pattern.test(html)) throw new Error(`prerender: template is missing ${pattern}`);
    html = html.replace(pattern, () => value);
  };
  swap(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  swap(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${esc(page.description)}"/>`);
  swap(/<\/head>/, `${head}</head>`);
  swap(/<div id="root"><\/div>/, `<div id="root">${body}</div>`);
  return html;
}

const seen = new Set<string>();
for (const page of pages) {
  const path = pathOf(page.route);
  if (seen.has(path)) throw new Error(`prerender: two pages claim ${path}`);
  seen.add(path);
  const file = join(dist, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(page));
}

// Palette PNGs: the art is flat pixel colour, so 8-bit output is lossless to the eye and small.
const queue = [...pages];
await Promise.all(Array.from({ length: 8 }, async () => {
  for (let page = queue.shift(); page; page = queue.shift()) {
    const file = join(dist, page.image.path);
    mkdirSync(dirname(file), { recursive: true });
    await sharp(Buffer.from(page.image.svg())).png({ palette: true, compressionLevel: 9 }).toFile(file);
  }
}));

const today = new Date().toISOString().slice(0, 10);
const indexed = pages.filter((p) => p.index !== false);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexed.map((p) => `  <url><loc>${SITE}${esc(pathOf(p.route))}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`prerender: ${pages.length} pages, ${pages.length} share images, ${indexed.length} in sitemap.xml`);
