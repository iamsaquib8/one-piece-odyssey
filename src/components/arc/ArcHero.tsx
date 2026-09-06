import type { RefObject } from 'react';
import { BookOpen, Flag, MapPin, Swords, Users } from 'lucide-react';
import { motion as m, useScroll, useTransform } from 'motion/react';
import type { Arc, Saga } from '../../types';
import type { ArcStaging } from '../../data/staging';
import { Scene } from '../Scene';
import { CountUp } from './CountUp';

interface Props {
  arc: Arc;
  saga?: Saga;
  staging?: ArcStaging;
  index: number;
  total: number;
  aboard: number;
  motion: boolean;
  scroller: RefObject<HTMLDivElement | null>;
}

const ease = [0.22, 1, 0.36, 1] as const;

/** Title card: parallax panorama, saga-colour wash, slam-in headline, a ship crossing the horizon once, and animated voyage stats. */
export function ArcHero({ arc, saga, staging, index, total, aboard, motion, scroller }: Props) {
  const { scrollY } = useScroll({ container: scroller });
  const sceneY = useTransform(scrollY, [0, 600], [0, motion ? 150 : 0]);
  const titleY = useTransform(scrollY, [0, 600], [0, motion ? 60 : 0]);
  const fade = useTransform(scrollY, [0, 420], [1, motion ? 0 : 1]);
  const stats = [
    { Icon: BookOpen, value: arc.chapters[1] - arc.chapters[0] + 1, label: arc.chapters[1] - arc.chapters[0] === 0 ? 'chapter' : 'chapters' },
    { Icon: Flag, value: arc.beats.length, label: arc.beats.length === 1 ? 'story beat' : 'story beats' },
    { Icon: Swords, value: arc.battles.length, label: arc.battles.length === 1 ? 'battle' : 'battles' },
    { Icon: MapPin, value: arc.locationIds.length, label: arc.locationIds.length === 1 ? 'place' : 'places' },
    { Icon: Users, value: aboard, label: 'aboard' },
  ];
  const region = saga?.region.replaceAll('-', ' ') || 'grand line';
  return <div className="arc-hero" style={{ '--saga': saga?.color || 'var(--sea)' } as React.CSSProperties}>
    <div className="arc-hero-stage">
      <m.div className="arc-hero-scene" style={{ y: sceneY }}><Scene locationId={arc.locationIds[0]} name={arc.name} eager /></m.div>
      <div className="arc-hero-wash" aria-hidden="true" />
      {motion ? <m.svg className="arc-hero-ship" viewBox="0 0 64 40" aria-hidden="true" initial={{ x: '-30vw', opacity: 0 }} animate={{ x: '78vw', opacity: [0, 1, 1, 0] }} transition={{ duration: 9, ease: 'linear', delay: 0.4, times: [0, 0.08, 0.9, 1] }}>
        <path d="M6 28h52l-6 8H12z" fill="#7a4b35" stroke="#10243a" strokeWidth="2" />
        <path d="M30 6v22M30 8l18 12H30M30 8L14 20h16" fill="#fff8e7" stroke="#10243a" strokeWidth="2" strokeLinejoin="round" />
        <path d="M30 4l6 3-6 3z" fill="#f45156" />
      </m.svg> : null}
      <m.div className="arc-hero-copy" style={{ y: titleY, opacity: fade }}>
        <m.span className="micro arc-hero-kicker" initial={motion ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
          STOP {String(index + 1).padStart(2, '0')} OF {total} · CH. <CountUp value={arc.chapters[0]} motion={motion} duration={0.8} plain />–<CountUp value={arc.chapters[1]} motion={motion} duration={1.2} plain />{arc.status === 'ongoing' ? ' →' : ''} · {region}
        </m.span>
        <m.h2 initial={motion ? { clipPath: 'inset(0 100% -20% 0)', x: -12 } : false} animate={{ clipPath: 'inset(0 0% -20% 0)', x: 0 }} transition={{ duration: 0.9, ease, delay: 0.15 }}>{arc.name}</m.h2>
        {staging?.hook ? <m.p className="arc-hero-hook" initial={motion ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.6 }}>{staging.hook}</m.p> : null}
      </m.div>
    </div>
    <ul className="arc-stats" aria-label="Voyage at a glance">
      {stats.map(({ Icon, value, label }, i) => <m.li key={label} initial={motion ? { opacity: 0, y: 16, rotate: -2 } : false} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.5, ease, delay: 0.5 + i * 0.09 }}>
        <Icon size={18} aria-hidden="true" /><strong><CountUp value={value} motion={motion} delay={0.5 + i * 0.09} /></strong><span>{label}</span>
      </m.li>)}
    </ul>
  </div>;
}
