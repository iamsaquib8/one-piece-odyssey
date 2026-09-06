import type { CSSProperties } from 'react';
import { MapPin } from 'lucide-react';
import { motion as m } from 'motion/react';
import type { Location, StoryBeat } from '../../types';
import type { CastMember, Mood } from '../../data/staging';
import { Scene } from '../Scene';
import CharacterPortrait from '../CharacterPortrait';

interface Props {
  beat: StoryBeat;
  index: number;
  mood: Mood;
  location?: Location;
  present: CastMember[];
  motion: boolean;
  onOpenLocation: (id: string) => void;
}

const LEFT_SIDES = new Set(['crew', 'ally']);
const ease = [0.22, 1, 0.36, 1] as const;

/** Spread a group across a horizontal band, biggest figure nearest the centre of the frame. */
function placements(count: number, from: number, to: number, towardsCentre: boolean) {
  if (!count) return [] as { x: number; s: number }[];
  const step = count === 1 ? 0 : (to - from) / (count - 1);
  return Array.from({ length: count }, (_, i) => {
    const x = count === 1 ? (from + to) / 2 : from + step * i;
    const centreness = towardsCentre ? i / Math.max(1, count - 1) : 1 - i / Math.max(1, count - 1);
    return { x, s: 0.82 + centreness * 0.28 };
  });
}

/** One illustrated panel per story beat: staged location, a beat-specific camera, mood effects, and the people present in the shot. */
export function BeatScene({ beat, index, mood, location, present, motion, onOpenLocation }: Props) {
  const left = present.filter((c) => LEFT_SIDES.has(c.side)).slice(0, 4);
  const right = present.filter((c) => !LEFT_SIDES.has(c.side)).slice(0, 4);
  const clash = left.length > 0 && right.some((c) => c.side === 'foe');
  const leftSpots = placements(left.length, 8, right.length ? 38 : 60, true);
  const rightSpots = placements(right.length, left.length ? 62 : 40, 92, false);
  const camera = { '--zoom': 1 + (index % 3) * 0.14, '--pan': `${((index % 4) - 1.5) * 5}%`, '--tilt': `${((index % 5) - 2) * 0.4}deg` } as CSSProperties;
  const kind = beat.kind || 'story';
  return <div className={`beat-scene kind-${kind}`} data-mood={mood}>
    <div className="beat-backdrop" style={camera}>
      {location ? <Scene locationId={location.id} name={location.name} /> : <div className="beat-void" aria-hidden="true" />}
    </div>
    <span className="beat-weather" aria-hidden="true" />
    <Effects mood={mood} />
    {kind === 'flashback' ? <span className="beat-film" aria-hidden="true" /> : null}
    <ul className="beat-figures" aria-label="In this scene">
      {[...left.map((c, i) => ({ c, spot: leftSpots[i], side: 'left', slot: i })), ...right.map((c, i) => ({ c, spot: rightSpots[i], side: 'right', slot: i }))].map(({ c, spot, side, slot }, i) => <m.li key={c.id} className={`figure side-${c.side} ${side}`} data-slot={slot} style={{ '--x': `${spot.x}%`, '--s': spot.s, '--accent': c.color || 'var(--sea)', '--i': i } as CSSProperties} initial={motion ? { opacity: 0, y: 40, scale: 0.6 } : false} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 + i * 0.09 }}>
        <span className="figure-shadow" aria-hidden="true" />
        <CharacterPortrait characterId={c.id} name={c.name} color={c.color || '#087f91'} />
        <span className="figure-name">{c.name.split(' ').pop()}</span>
      </m.li>)}
    </ul>
    {clash ? <m.span className="beat-clash" aria-hidden="true" initial={motion ? { scale: 0, rotate: -40, opacity: 0 } : false} whileInView={{ scale: [0, 1.5, 1], rotate: [-40, 10, 0], opacity: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.6, ease, delay: 0.5 }}>✕</m.span> : null}
    {kind === 'interlude' ? <span className="beat-ribbon micro">MEANWHILE…</span> : null}
    {kind === 'flashback' ? <span className="beat-ribbon micro">YEARS EARLIER</span> : null}
    {location ? <button className="beat-place" onClick={() => onOpenLocation(location.id)} aria-label={`Open ${location.name}`}><MapPin size={13} aria-hidden="true" />{location.name}</button> : null}
    <span className="beat-mood micro" aria-hidden="true">{mood.toUpperCase()} · CH. {beat.chapters}</span>
  </div>;
}

function Effects({ mood }: { mood: Mood }) {
  if (mood === 'night') return <span className="fx fx-stars" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</span>;
  if (mood === 'storm') return <span className="fx fx-storm" aria-hidden="true"><i /><b /></span>;
  if (mood === 'dawn' || mood === 'dusk') return <span className="fx fx-rays" aria-hidden="true" />;
  if (mood === 'flashback') return <span className="fx fx-motes" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--i': i } as CSSProperties} />)}</span>;
  return <span className="fx fx-glint" aria-hidden="true" />;
}
