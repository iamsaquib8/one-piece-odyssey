import { forwardRef } from 'react';
import { pixelText, pixelTextWidth, fitScale } from '../art/pixel-font';
import { formatBounty, type PosterState } from '../art/poster';
import { PortraitSvg } from './PortraitSvg';

export const POSTER_W = 600;
export const POSTER_H = 860;
const INK = '#10243a';
const PAPER = '#f3e7cb';

/** Pixel lettering centred on x. */
function Line({ value, y, scale, fill = INK }: { value: string; y: number; scale: number; fill?: string }) {
  const t = pixelText(value);
  return <path d={t.d} transform={`translate(${(POSTER_W - t.width * scale) / 2} ${y}) scale(${scale})`} fill={fill} />;
}

/**
 * The poster itself: one self-contained SVG with literal colours and pixel lettering, so the same
 * element is the on-page preview, the downloaded PNG (serialised to a data: URL and drawn on a
 * canvas) and the build-time share image. It deliberately avoids copying any real poster layout.
 */
const WantedPoster = forwardRef<SVGSVGElement, { poster: PosterState; title?: string }>(function WantedPoster({ poster, title }, ref) {
  const bounty = `฿${formatBounty(poster.bounty)}-`;
  const nameScale = fitScale(poster.name.toUpperCase(), 520, 3, 8);
  const epithet = poster.epithet ? `"${poster.epithet}"` : '';
  return <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${POSTER_W} ${POSTER_H}`} width={POSTER_W} height={POSTER_H} shapeRendering="crispEdges" role="img" aria-label={title ?? `Wanted poster for ${poster.name}, bounty ${formatBounty(poster.bounty)} berries`}>
    <rect width={POSTER_W} height={POSTER_H} fill={PAPER} />
    <g opacity=".06">{Array.from({ length: POSTER_H / 6 }, (_, i) => <rect key={i} y={i * 6} width={POSTER_W} height="2" fill={INK} />)}</g>
    <rect x="18" y="18" width={POSTER_W - 36} height={POSTER_H - 36} fill="none" stroke={INK} strokeWidth="6" />
    <rect x="30" y="30" width={POSTER_W - 60} height={POSTER_H - 60} fill="none" stroke={INK} strokeWidth="2" />
    <Line value="WANTED" y={52} scale={13} />
    <rect x="60" y="160" width="480" height="390" fill={poster.backdrop} stroke={INK} strokeWidth="6" />
    <svg x="125" y="175" width="350" height="350"><PortraitSvg recipe={poster.recipe} color={poster.backdrop} clipId="poster-portrait" label="" still /></svg>
    <Line value={poster.alive === 'only-alive' ? 'ONLY ALIVE' : 'DEAD OR ALIVE'} y={572} scale={5} />
    <Line value={poster.name.toUpperCase() || ' '} y={622 + (8 - nameScale) * 3} scale={nameScale} />
    {epithet ? <Line value={epithet.toUpperCase()} y={700} scale={pixelTextWidth(epithet) * 3 > 520 ? 2 : 3} fill="#5b7089" /> : null}
    <Line value={bounty} y={738} scale={fitScale(bounty, 500, 3, 7)} />
    <Line value="ONE PIECE ODYSSEY · DRAWN IN CODE" y={808} scale={2} fill="#5b7089" />
  </svg>;
});

export default WantedPoster;
