import type { FruitType } from '../data/devil-fruits';
import { hash } from './portrait-recipe';

// One colour family per type, so a shelf of fruits sorts itself by eye; the swirl count, body
// shape and leaf come from the id, so no two neighbours look stamped from one mould.
const PALETTE: Record<FruitType, { body: string; swirl: string }> = {
  paramecia: { body: '#8b5fbf', swirl: '#d9c2f0' },
  zoan: { body: '#4f9a52', swirl: '#c8e8b8' },
  'ancient-zoan': { body: '#a8743d', swirl: '#efd2a8' },
  'mythical-zoan': { body: '#2f8fa6', swirl: '#ffd34e' },
  logia: { body: '#e0663a', swirl: '#ffd9a8' },
  smile: { body: '#e8b73a', swirl: '#fff3c4' },
};
const INK = '#10243a';

/** A spiral drawn as a short run of quarter arcs, the pattern every Devil Fruit wears. */
const swirl = (x: number, y: number, r: number) => `M${x} ${y}m${-r * 0.2} 0a${r * 0.2} ${r * 0.2} 0 1 1 ${r * 0.4} 0a${r * 0.45} ${r * 0.45} 0 1 1 ${-r * 0.9} 0a${r * 0.7} ${r * 0.7} 0 1 1 ${r * 1.4} 0`;

export default function FruitIcon({ id, type, className = '' }: { id: string; type: FruitType; className?: string }) {
  const seed = hash(id);
  const { body, swirl: line } = PALETTE[type];
  const rx = 22 + (seed % 5);
  const ry = 21 + ((seed >> 3) % 6);
  const lean = ((seed >> 6) % 3) - 1;
  const spots: [number, number][] = [[40, 44], [27, 34], [52, 32], [31, 54], [50, 55], [40, 27]];
  const count = 3 + (seed % 3);
  return <svg className={`fruit-icon ${className}`.trim()} viewBox="0 0 80 80" aria-hidden="true" focusable="false">
    <ellipse cx="40" cy="74" rx="20" ry="3" fill={INK} opacity=".18" />
    <path d={`M${40 + lean * 2} 20Q${42 + lean * 6} 10 ${46 + lean * 6} 7`} fill="none" stroke="#6b4a2b" strokeWidth="4" strokeLinecap="round" />
    <path d={`M${44 + lean * 4} 13Q${58 + lean * 3} ${4 + (seed % 4)} ${64} ${14}Q${54} ${20} ${44 + lean * 4} 13Z`} fill="#5aa04a" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
    <ellipse cx="40" cy={44} rx={rx} ry={ry} fill={body} stroke={INK} strokeWidth="3.5" />
    <g fill="none" stroke={line} strokeWidth="2.6" strokeLinecap="round">{spots.slice(0, count).map(([x, y], i) => <path key={i} d={swirl(x, y, 7 + ((seed >> (i + 2)) % 3))} />)}</g>
    <ellipse cx="30" cy="34" rx="5" ry="3" fill="#fff" opacity=".35" transform="rotate(-30 30 34)" />
  </svg>;
}
