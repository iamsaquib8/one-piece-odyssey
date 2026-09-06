import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { Bookmark } from 'lucide-react';
import { motion as m, useScroll, useSpring, useTransform } from 'motion/react';
import type { Arc, Location, StoryBeat } from '../../types';
import type { ArcStaging, BeatStaging, CastMember } from '../../data/staging';
import CharacterPortrait from '../CharacterPortrait';
import { BeatScene } from './BeatScene';

interface Props {
  arc: Arc;
  staging?: ArcStaging;
  cast: Map<string, CastMember>;
  locations: Location[];
  currentBeat?: string;
  motion: boolean;
  scroller: RefObject<HTMLDivElement | null>;
  onBeat: (arcId: string, beatId: string) => void;
  onOpenLocation: (id: string) => void;
  onActiveBeat: (id: string | null) => void;
}

const ease = [0.22, 1, 0.36, 1] as const;
const KIND_LABEL = { story: '', flashback: ' · FLASHBACK', interlude: ' · INTERLUDE' } as const;

/** The story as an illustrated log: a gold route drawn by scroll, ✕ markers, and one scene-lit page per beat. */
export function VoyageTimeline({ arc, staging, cast, locations, currentBeat, motion, scroller, onBeat, onOpenLocation, onActiveBeat }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scroller, target: track, offset: ['start 0.65', 'end 0.65'] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 32, mass: 0.6 });
  const shipTop = useTransform(progress, (v) => `${Math.min(100, Math.max(0, v * 100))}%`);

  useEffect(() => {
    const root = scroller.current;
    const items = track.current?.querySelectorAll<HTMLElement>('[data-beat]');
    if (!root || !items?.length) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).dataset.beat!;
        if (e.isIntersecting) visible.set(id, e.boundingClientRect.top); else visible.delete(id);
      }
      if (!visible.size) { onActiveBeat(null); return; }
      const [top] = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
      onActiveBeat(top);
    }, { root, rootMargin: '-35% 0px -45% 0px', threshold: 0 });
    items.forEach((el) => io.observe(el));
    return () => { io.disconnect(); onActiveBeat(null); };
  }, [arc.id, scroller, onActiveBeat]);

  return <div className="voyage" ref={track}>
    <div className="voyage-line" aria-hidden="true">
      <m.i className="voyage-line-fill" style={{ scaleY: motion ? progress : 1 }} />
      {motion ? <m.span className="voyage-ship" style={{ top: shipTop }}>
        <svg viewBox="0 0 32 24"><path d="M3 15h26l-3 5H6z" fill="#7a4b35" stroke="#10243a" strokeWidth="1.6" /><path d="M15 3v12M15 4l9 7h-9M15 4l-8 7h8" fill="#fff8e7" stroke="#10243a" strokeWidth="1.6" strokeLinejoin="round" /><path d="M15 2l4 1.6-4 1.6z" fill="#f45156" /></svg>
      </m.span> : null}
    </div>
    <ol className="voyage-beats">
      {arc.beats.map((beat, i) => <BeatPage key={beat.id} arc={arc} beat={beat} index={i} stage={staging?.beats[beat.id]} cast={cast} location={locations.find((l) => l.id === (staging?.beats[beat.id]?.location || arc.locationIds[0]))} current={currentBeat === beat.id} motion={motion} onBeat={onBeat} onOpenLocation={onOpenLocation} />)}
    </ol>
  </div>;
}

interface PageProps { arc: Arc; beat: StoryBeat; index: number; stage?: BeatStaging; cast: Map<string, CastMember>; location?: Location; current: boolean; motion: boolean; onBeat: Props['onBeat']; onOpenLocation: Props['onOpenLocation'] }
function BeatPage({ arc, beat, index, stage, cast, location, current, motion, onBeat, onOpenLocation }: PageProps) {
  const mood = stage?.mood || (beat.kind === 'flashback' ? 'flashback' : 'day');
  const present = (stage?.present || []).map((id) => cast.get(id)).filter((c): c is CastMember => Boolean(c));
  return <m.li className={`beat-page ${current ? 'current' : ''}`} data-beat={beat.id} id={`beat-${beat.id}`} data-mood={mood} initial={motion ? { opacity: 0, y: 30 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.6, ease }}>
    <div className="beat-rail" aria-hidden="true">
      <m.span className="beat-mark" initial={motion ? { scale: 0, rotate: -90 } : false} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.1 }}>✕</m.span>
      <span className="beat-number">{String(index + 1).padStart(2, '0')}</span>
    </div>
    <article className="beat-card">
      <BeatScene beat={beat} index={index} mood={mood} location={location} present={present} motion={motion} onOpenLocation={onOpenLocation} />
      <div className="beat-body">
        <div className="beat-kicker"><span>CH. {beat.chapters}{KIND_LABEL[beat.kind || 'story']}</span><button className="text-link" aria-label={`Resume here: ${beat.title}`} onClick={() => onBeat(arc.id, beat.id)}>Resume here <Bookmark size={12} /></button></div>
        <h3>{beat.title}</h3>
        {beat.paragraphs.map((p, j) => <p key={j}>{p}</p>)}
        {present.length ? <ul className="beat-present" aria-label="Who is here">
          {present.map((c, i) => <m.li key={c.id} className={`side-${c.side}`} style={{ '--accent': c.color || 'var(--sea)' } as CSSProperties} initial={motion ? { opacity: 0, x: -10 } : false} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.2 + i * 0.05 }}>
            <CharacterPortrait characterId={c.id} name={c.name} color={c.color || '#087f91'} className="mini" /><span>{c.name}</span>
          </m.li>)}
        </ul> : null}
      </div>
    </article>
  </m.li>;
}
