import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion as m } from 'motion/react';
import type { Arc, Location } from '../../types';
import { chapterLabel } from '../../data/arc-index';
import { Scene } from '../Scene';

interface Props { prev?: Arc; next?: Arc; locations: Location[]; motion: boolean; onOpenArc: (id: string) => void }

/** Footer that keeps the reader sailing: the previous and next stops as island cards. */
export function NextStop({ prev, next, locations, motion, onOpenArc }: Props) {
  const card = (arc: Arc, dir: 'prev' | 'next') => {
    const loc = locations.find((l) => l.id === arc.locationIds[0]);
    return <m.button key={arc.id} className={`stop-card ${dir}`} onClick={() => onOpenArc(arc.id)} initial={motion ? { opacity: 0, y: 20 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} whileHover={motion ? { y: -4 } : undefined}>
      <span className="stop-scene"><Scene locationId={arc.locationIds[0]} name={loc?.name || arc.name} /></span>
      <span className="stop-copy">
        <span className="micro">{dir === 'prev' ? <><ArrowLeft size={10} aria-hidden="true" /> PREVIOUS STOP</> : <>NEXT STOP <ArrowRight size={10} aria-hidden="true" /></>}</span>
        <strong>{arc.name}</strong>
        <small>{chapterLabel(arc)}{loc ? ` · ${loc.name}` : ''}</small>
      </span>
    </m.button>;
  };
  return <nav className="next-stop" aria-label="Neighbouring arcs">
    {prev ? card(prev, 'prev') : <span className="stop-card empty"><span className="micro">THE LOG BEGINS HERE</span></span>}
    {next ? card(next, 'next') : <span className="stop-card empty"><span className="micro">THE JOURNEY CONTINUES…</span></span>}
  </nav>;
}
