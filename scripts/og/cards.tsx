/*
 * Share-image layouts, as SVG strings for sharp to rasterise. Everything is drawn from the
 * site's own code art: pixel scenes, recipe portraits and the bitmap font. Nothing depends on
 * fonts or stylesheets, so a build on Netlify produces the same images as one on a laptop.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { PixelScene } from '../../src/components/PixelScene';
import { PortraitSvg } from '../../src/components/PortraitSvg';
import { recipeFor } from '../../src/components/portrait-recipe';
import FruitIcon from '../../src/components/FruitIcon';
import WantedPoster from '../../src/components/WantedPoster';
import { DEFAULT_POSTER } from '../../src/art/poster';
import type { FruitType } from '../../src/data/devil-fruits';
import { pixelText, wrapPixelText } from '../../src/art/pixel-font';

export const W = 1200;
export const H = 630;
const INK = '#10243a';
const PAPER = '#fff8e7';
const PAPER_2 = '#f3e7cb';
const GOLD = '#ffd34e';
const CORAL = '#f45156';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

/** Pixel lettering placed at (x, y), `scale` screen pixels per font pixel. */
function text(value: string, x: number, y: number, scale: number, fill: string, anchor: 'start' | 'end' = 'start') {
  const t = pixelText(value);
  const left = anchor === 'end' ? x - t.width * scale : x;
  return `<path d="${t.d}" transform="translate(${left} ${y}) scale(${scale})" fill="${fill}"/>`;
}

/** Wrapped pixel lettering in at most `maxLines` lines, shrinking the scale until it fits. */
function block(value: string, x: number, y: number, maxWidth: number, maxScale: number, minScale: number, fill: string, maxLines = 2) {
  for (let scale = maxScale; scale >= minScale; scale--) {
    const lines = wrapPixelText(value.toUpperCase(), Math.floor(maxWidth / scale));
    if (lines.length <= maxLines) return { svg: lines.map((line, i) => text(line, x, y + i * scale * 10, scale, fill)).join(''), height: lines.length * scale * 10 - scale * 3 };
  }
  const lines = wrapPixelText(value.toUpperCase(), Math.floor(maxWidth / minScale)).slice(0, maxLines);
  return { svg: lines.map((line, i) => text(line, x, y + i * minScale * 10, minScale, fill)).join(''), height: lines.length * minScale * 10 - minScale * 3 };
}

/** A pixel scene stretched to cover a box, cropping the 16:9 frame rather than letterboxing it. */
function scene(locationId: string, x: number, y: number, w: number, h: number) {
  return renderToStaticMarkup(<PixelScene locationId={locationId} />)
    .replace('preserveAspectRatio="xMidYMid meet"', 'preserveAspectRatio="xMidYMid slice"')
    .replace(/ style="[^"]*"/, '')
    .replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
}

function portrait(id: string, color: string, x: number, y: number, size: number) {
  return renderToStaticMarkup(<PortraitSvg recipe={recipeFor(id, color)} color={color} clipId={`og-${id}`} label="" laboon={id === 'laboon'} still />)
    .replace('<svg ', `<svg x="${x}" y="${y}" width="${size}" height="${size}" `);
}

const frame = (body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">${body}</svg>`;
const mark = (fill = GOLD) => text('ONE PIECE ODYSSEY', W - 56, H - 62, 3, fill, 'end');
const scanlines = `<g opacity=".07">${Array.from({ length: H / 6 }, (_, i) => `<rect y="${i * 6}" width="${W}" height="2" fill="${INK}"/>`).join('')}</g>`;

/** Island art with a title band: arcs and places. */
export function sceneCard(o: { locationId: string; eyebrow: string; title: string; subtitle?: string }) {
  const title = block(o.title, 56, 448, W - 112, 9, 5, PAPER);
  const subtitle = o.subtitle ? block(o.subtitle, 56, 448 + title.height + 26, W - 420, 3, 3, PAPER_2, 1).svg : '';
  return frame(`${scene(o.locationId, 0, 0, W, H)}
    <rect y="380" width="${W}" height="${H - 380}" fill="${INK}" opacity=".9"/>
    <rect y="376" width="${W}" height="6" fill="${GOLD}"/>
    ${text(o.eyebrow.toUpperCase(), 56, 408, 3, GOLD)}${title.svg}${subtitle}${mark()}`);
}

/** A wanted poster: characters, and crews by their captain. */
export function posterCard(o: { portraitId: string; color: string; eyebrow: string; title: string; subtitle?: string }) {
  const title = block(o.title, 520, 236, 620, 9, 5, INK, 3);
  return frame(`<rect width="${W}" height="${H}" fill="${PAPER_2}"/>${scanlines}
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${INK}" stroke-width="6"/>
    <rect x="40" y="40" width="${W - 80}" height="${H - 80}" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="90" y="95" width="380" height="440" fill="${o.color}" stroke="${INK}" stroke-width="6"/>
    ${portrait(o.portraitId, o.color, 105, 130, 350)}
    ${text('WANTED', 520, 92, 14, INK)}
    ${text(o.eyebrow.toUpperCase(), 524, 202, 3, CORAL)}
    ${title.svg}
    ${o.subtitle ? block(o.subtitle, 524, 236 + title.height + 28, 600, 3, 3, INK, 2).svg : ''}
    ${mark(INK)}`);
}

/** The hero-free default for views: sea, a route, the name. */
export function plainCard(o: { eyebrow: string; title: string; subtitle?: string; locationId?: string }) {
  if (o.locationId) return sceneCard({ locationId: o.locationId, eyebrow: o.eyebrow, title: o.title, subtitle: o.subtitle });
  const title = block(o.title, 56, 250, W - 112, 10, 6, PAPER);
  return frame(`<rect width="${W}" height="${H}" fill="#087f91"/>${scanlines}
    <path d="M60 560 C 300 480, 520 600, 760 520 S 1100 470, 1160 520" fill="none" stroke="${GOLD}" stroke-width="6" stroke-dasharray="18 14"/>
    ${text(o.eyebrow.toUpperCase(), 56, 200, 4, GOLD)}${title.svg}
    ${o.subtitle ? block(o.subtitle, 56, 250 + title.height + 30, W - 112, 4, 3, PAPER_2, 2).svg : ''}${mark()}`);
}

/** The site's front door: the name over a row of portraits, used for the home page and repository. */
export function crewRowCard(o: { eyebrow: string; title: string; subtitle?: string; portraits: { id: string; color: string }[] }) {
  const title = block(o.title, 56, 150, W - 112, 10, 6, PAPER);
  const size = 96;
  const gap = 12;
  const row = o.portraits.slice(0, 10);
  const left = (W - (row.length * size + (row.length - 1) * gap)) / 2;
  return frame(`<rect width="${W}" height="${H}" fill="#087f91"/>${scanlines}
    <path d="M40 470 C 300 420, 520 500, 760 450 S 1100 410, 1160 450" fill="none" stroke="${GOLD}" stroke-width="5" stroke-dasharray="16 12" opacity=".8"/>
    ${text(o.eyebrow.toUpperCase(), 56, 100, 4, GOLD)}${title.svg}
    ${o.subtitle ? block(o.subtitle, 56, 150 + title.height + 30, W - 112, 4, 3, PAPER_2, 2).svg : ''}
    ${row.map((p, i) => portrait(p.id, p.color, left + i * (size + gap), 470, size)).join('')}`);
}

/** A Devil Fruit on a pedestal of paper. */
export function fruitCard(o: { id: string; type: FruitType; eyebrow: string; title: string; subtitle?: string }) {
  const icon = renderToStaticMarkup(<FruitIcon id={o.id} type={o.type} />).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" x="70" y="95" width="420" height="420" `);
  const title = block(o.title, 540, 236, 600, 8, 5, INK, 3);
  return frame(`<rect width="${W}" height="${H}" fill="${PAPER_2}"/>${scanlines}
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" fill="none" stroke="${INK}" stroke-width="6"/>
    <circle cx="280" cy="315" r="230" fill="${PAPER}" stroke="${INK}" stroke-width="5"/>
    ${icon}
    ${text('DEVIL FRUIT', 540, 120, 8, INK)}
    ${text(o.eyebrow.toUpperCase(), 544, 202, 3, CORAL)}
    ${title.svg}
    ${o.subtitle ? block(o.subtitle, 544, 236 + title.height + 28, 600, 3, 3, INK, 2).svg : ''}
    ${mark(INK)}`);
}

/** The poster maker: a sample poster pinned beside the invitation. */
export function posterMakerCard() {
  const poster = renderToStaticMarkup(<WantedPoster poster={DEFAULT_POSTER} title="" />).replace(/ width="600" height="860"/, ' x="96" y="42" width="380" height="545"');
  return frame(`<rect width="${W}" height="${H}" fill="#6b4a2b"/>${scanlines}
    <rect x="104" y="50" width="380" height="545" fill="${INK}"/>${poster}
    ${text('MAKE YOUR OWN', 540, 170, 6, GOLD)}
    ${block('WANTED POSTER', 540, 230, 620, 9, 6, PAPER, 2).svg}
    ${block('Pixel portrait, your price, one PNG.', 544, 420, 600, 3, 3, PAPER_2, 2).svg}
    ${mark()}`);
}

export const escapeXml = esc;
