import { useMemo, type CSSProperties } from 'react';
import { motion as m, AnimatePresence } from 'motion/react';
import type { Battle } from '../../types';
import type { BattleStaging, CastMember } from '../../data/staging';
import { Scene } from '../Scene';
import CharacterPortrait from '../CharacterPortrait';

interface Props {
  battle: Battle;
  staging?: BattleStaging;
  cast: Map<string, CastMember>;
  locationId?: string;
  frame: number;
  playing: boolean;
  motion: boolean;
}

/** Comic impact words. Deliberately generic so nothing is lifted from the manga's own lettering. */
const IMPACTS = ['DOON', 'KRAK', 'SLAM', 'WHAM', 'BOOM', 'CLANG', 'THUD', 'SHNK'];

const hash = (value: string) => { let h = 7; for (const c of value) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };

/** Which side throws the blow in this frame: whoever the caption names, else alternating, with the winner landing the last one. */
function choreograph(frames: string[], a: CastMember[], b: CastMember[], verdict?: BattleStaging['verdict']): ('a' | 'b')[] {
  const names = (side: CastMember[]) => side.flatMap((c) => [c.name, c.name.split(' ').pop() || '', c.epithet || ''].filter((n) => n.length > 2).map((n) => n.toLowerCase()));
  const aNames = names(a);
  const bNames = names(b);
  let previous: 'a' | 'b' = 'b';
  const beats = frames.map((frame) => {
    const text = frame.toLowerCase();
    const hitsA = aNames.some((n) => text.includes(n));
    const hitsB = bNames.some((n) => text.includes(n));
    const actor: 'a' | 'b' = hitsA && !hitsB ? 'a' : hitsB && !hitsA ? 'b' : previous === 'a' ? 'b' : 'a';
    previous = actor;
    return actor;
  });
  if (verdict === 'a' || verdict === 'b') beats[beats.length - 1] = verdict;
  return beats;
}

/** The fight as a moving picture: a place to stand, two sides, and a blow landing on every frame. */
export function FightStage({ battle, staging, cast, locationId, frame, playing, motion }: Props) {
  const side = (ids: string[] = []) => ids.map((id) => cast.get(id)).filter((c): c is CastMember => Boolean(c));
  const a = side(staging?.a);
  const b = side(staging?.b);
  const frames = battle.frames.length ? battle.frames : [battle.stakes, battle.development, battle.outcome];
  const beats = useMemo(() => choreograph(frames, a, b, staging?.verdict), [battle.id, staging, cast]);
  const actor = beats[Math.min(frame, beats.length - 1)] || 'a';
  const impact = IMPACTS[hash(frames[frame] || battle.id) % IMPACTS.length];
  const last = frame === frames.length - 1;
  /** Momentum swings to whoever just struck, and settles where the verdict leaves it. */
  const momentum = beats.slice(0, frame + 1).reduce((n, side) => n + (side === 'a' ? 1 : -1), 0) / (frame + 1);

  if (!a.length && !b.length) return null;

  return <div className={`fight-stage actor-${actor} ${last ? 'final' : ''}`} aria-hidden="true">
    {locationId ? <div className="fight-ground"><Scene locationId={locationId} name="" /></div> : <div className="fight-ground fight-ground-void" />}
    <div className="fight-vignette" />

    <AnimatePresence initial={false}>
      <m.span
        key={frame}
        className="fight-speedlines"
        initial={motion ? { opacity: 0.85, scale: 0.35 } : false}
        animate={{ opacity: 0, scale: 1.9 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      >
        <svg viewBox="-50 -50 100 100">{Array.from({ length: 14 }, (_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          return <line key={i} x1={Math.cos(angle) * 14} y1={Math.sin(angle) * 14} x2={Math.cos(angle) * 48} y2={Math.sin(angle) * 48} />;
        })}</svg>
      </m.span>
    </AnimatePresence>

    <Fighters members={a} team="a" acting={actor === 'a'} motion={motion} frame={frame} />
    <Fighters members={b} team="b" acting={actor === 'b'} motion={motion} frame={frame} />

    <AnimatePresence mode="wait" initial={false}>
      <m.span
        key={frame}
        className="fight-impact"
        initial={motion ? { scale: 0.2, rotate: -25, opacity: 0 } : false}
        animate={{ scale: [0.2, 1.25, 1], rotate: [-25, 6, -4], opacity: 1 }}
        exit={motion ? { scale: 1.5, opacity: 0, transition: { duration: 0.12 } } : undefined}
        transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <svg viewBox="0 0 100 100" className="fight-star"><polygon points="50,2 60,32 92,26 68,48 96,68 63,66 72,97 50,74 28,97 37,66 4,68 32,48 8,26 40,32" /></svg>
        <b>{impact}</b>
      </m.span>
    </AnimatePresence>

    <div className="fight-momentum">
      <m.i animate={{ left: `${50 - momentum * 34}%` }} transition={motion ? { type: 'spring', stiffness: 220, damping: 22 } : { duration: 0 }} />
    </div>

    {playing && motion ? <span className="fight-flash" key={`flash-${frame}`} /> : null}
  </div>;
}

function Fighters({ members, team, acting, motion, frame }: { members: CastMember[]; team: 'a' | 'b'; acting: boolean; motion: boolean; frame: number }) {
  const lunge = team === 'a' ? 1 : -1;
  return <div className={`fight-side fight-${team} ${acting ? 'acting' : 'reeling'}`}>
    {members.slice(0, 3).map((c, i) => <m.span
      key={c.id}
      className="fight-figure"
      style={{ '--accent': c.color || 'var(--sea)', '--depth': i } as CSSProperties}
      animate={motion
        ? acting
          ? { x: lunge * (26 - i * 7), y: -6 - i * 2, rotate: lunge * 7, scale: 1.06 - i * 0.06 }
          : { x: lunge * (-14 + i * 4), y: 3, rotate: lunge * -5, scale: 0.94 - i * 0.05 }
        : { x: 0, y: 0, rotate: 0, scale: 1 - i * 0.06 }}
      transition={{ type: 'spring', stiffness: 320, damping: 18, delay: i * 0.04 }}
    >
      <CharacterPortrait characterId={c.id} name={c.name} color={c.color || '#087f91'} />
      {i === 0 ? <em key={`${c.id}-${frame}`}>{c.name.split(' ').pop()}</em> : null}
    </m.span>)}
  </div>;
}
