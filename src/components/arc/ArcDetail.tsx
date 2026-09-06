import { useMemo, type CSSProperties, type RefObject } from 'react';
import { ArrowRight, Check, ExternalLink, MapPin } from 'lucide-react';
import { motion as m } from 'motion/react';
import type { Arc, ReaderState, Route } from '../../types';
import { arcs } from '../../data/arcs';
import { sagas } from '../../data/sagas';
import { locations } from '../../data/locations';
import { characters } from '../../data/characters';
import { crews } from '../../data/crews';
import { coverage } from '../../data/coverage';
import { stagingFor, type CastMember } from '../../data/staging';
import { bountyChanges, crewAboard, formatBerries } from '../../data/crew-roster';
import CharacterPortrait from '../CharacterPortrait';
import { ArcHero } from './ArcHero';
import { CastGallery } from './CastGallery';
import { VoyageTimeline } from './VoyageTimeline';
import { BattleCard } from './BattleCard';
import { NextStop } from './NextStop';
import { CountUp } from './CountUp';
import '../../detail.css';

interface Props {
  arc: Arc;
  route: Route;
  reader: ReaderState;
  motion: boolean;
  scroller: RefObject<HTMLDivElement | null>;
  onOpen: (kind: NonNullable<Route['kind']>, id: string, beat?: string) => void;
  onExplore: (id: string, at?: HTMLElement) => void;
  onBeat: (id: string, beat: string) => void;
  onActiveBeat: (id: string | null) => void;
}

/** The whole arc experience: title card, crew and cast, illustrated voyage, versus battles, legacy, neighbouring stops. */
export function ArcDetail({ arc, route, reader, motion, scroller, onOpen, onExplore, onBeat, onActiveBeat }: Props) {
  const staging = stagingFor(arc.id);
  const saga = sagas.find((s) => s.id === arc.sagaId);
  const index = arcs.findIndex((a) => a.id === arc.id);
  const roster = useMemo(() => crewAboard(arc, arcs, characters), [arc]);
  const bounties = useMemo(() => bountyChanges(arc, characters), [arc]);
  /** Straw Hats inherit colour and epithet from their profiles so writers never repeat them. */
  const members = useMemo<CastMember[]>(() => (staging?.cast || []).map((c) => { const ch = characters.find((x) => x.id === c.id); return ch ? { ...c, color: c.color || ch.color, epithet: c.epithet || ch.epithet } : c; }), [staging]);
  const cast = useMemo(() => new Map<string, CastMember>(members.map((c) => [c.id, c])), [members]);
  const explored = reader.explored.includes(arc.id);
  const ease = [0.22, 1, 0.36, 1] as const;

  return <div className="arc-detail" style={{ '--saga': saga?.color || 'var(--sea)' } as CSSProperties}>
    <section id="detail-overview" className="arc-section arc-overview">
      <ArcHero arc={arc} saga={saga} staging={staging} index={index} total={arcs.length} aboard={roster.length} motion={motion} scroller={scroller} />
      <div className="reading-copy">
        <p className="lead">{arc.premise}</p>
        {arc.overview.map((p, i) => <p key={i}>{p}</p>)}
        {arc.status === 'ongoing' ? <aside className="editorial-note">This arc is still being published. The log follows it through chapter {coverage.coveredThrough}; official publication has reached chapter {coverage.latestOfficialChapter}.</aside> : null}
        <div className="location-links"><span className="micro">PLACES IN THIS ARC</span>{arc.locationIds.map((id) => { const l = locations.find((x) => x.id === id); return l ? <button className="place-link" key={id} onClick={() => onOpen('location', id)}><MapPin size={15} />{l.name}<ArrowRight size={14} /></button> : null; })}</div>
      </div>
    </section>

    <section id="detail-characters" className="arc-section arc-cast">
      <header className="arc-section-head"><span className="micro">WHO STANDS WHERE</span><h2>The cast</h2></header>
      <div className="reading-copy"><div className="location-links"><span className="micro">CREWS & FACTIONS IN THIS STORY</span>{crews.filter(c=>c.arcIds.includes(arc.id)).map(c=><button className="place-link" key={c.id} onClick={()=>onOpen('crew',c.id)}>{c.name}<ArrowRight size={14}/></button>)}</div></div>
      <CastGallery cast={members} roster={roster} characters={characters} motion={motion} onOpenCharacter={(id) => onOpen('character', id)} />
    </section>

    <section id="detail-story" className="arc-section arc-story">
      <header className="arc-section-head"><span className="micro">THE VOYAGE, CHAPTER BY CHAPTER</span><h2>The story</h2><p>{arc.beats.length} {arc.beats.length === 1 ? 'entry' : 'entries'} in the log. Scroll to sail; the route draws itself as you read.</p></header>
      <VoyageTimeline arc={arc} staging={staging} cast={cast} locations={locations} currentBeat={route.beat} motion={motion} scroller={scroller} onBeat={onBeat} onOpenLocation={(id) => onOpen('location', id)} onActiveBeat={onActiveBeat} />
    </section>

    <section id="detail-battles" className="arc-section arc-battles">
      <header className="arc-section-head"><span className="micro">STEEL, FISTS AND HAKI</span><h2>Battles</h2></header>
      {arc.battles.map((b) => <BattleCard key={b.id} battle={b} staging={staging?.battles[b.id]} cast={cast} motion={motion} locationId={arc.locationIds[0]} />)}
    </section>

    <section id="detail-legacy" className="arc-section arc-legacy">
      <header className="arc-section-head"><span className="micro">WHAT SAILS ON</span><h2>Legacy</h2></header>
      <div className="reading-copy">
        {arc.legacy.map((p, i) => <p key={i}>{p}</p>)}
        {bounties.length ? <div className="bounty-stamps">
          <span className="micro">BOUNTIES POSTED IN THIS ARC</span>
          <ul>
            {bounties.map(({ character, amount, previous }, i) => <m.li key={`${character.id}-${amount}`} style={{ '--accent': character.color } as CSSProperties} initial={motion ? { opacity: 0, scale: 0.8, rotate: -6 } : false} whileInView={{ opacity: 1, scale: 1, rotate: i % 2 ? 1.5 : -1.5 }} viewport={{ once: true, amount: 0.4 }} transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.08 }}>
              <span className="micro">WANTED</span>
              <CharacterPortrait characterId={character.id} name={character.name} color={character.color} />
              <strong>{character.name}</strong>
              <b>{formatBerries('')}<CountUp value={Number(amount.replaceAll(',', ''))} motion={motion} duration={1.4} delay={0.2 + i * 0.08} /></b>
              <small>{previous ? `was ฿${previous}` : 'first bounty'}</small>
            </m.li>)}
          </ul>
        </div> : null}
        <m.button className={`button ${explored ? 'explored' : ''}`} aria-pressed={explored} onClick={(e) => onExplore(arc.id, e.currentTarget)} whileTap={motion ? { scale: 0.96 } : undefined} transition={{ duration: 0.2, ease }}><Check size={18} />{explored ? 'Arc explored' : 'Mark arc explored'}</m.button>
        <div className="sources"><h3>Chapter references & official reading</h3>{arc.sources.map((s, i) => <a key={i} href={s.url} target="_blank" rel="noreferrer">{s.label}{s.chapters ? ` · Ch. ${s.chapters}` : ''}<ExternalLink size={13} /></a>)}<p>Original fan-written summaries. Arc boundaries are editorial groupings. Read Eiichiro Oda’s manga through the official publishers.</p></div>
      </div>
      <NextStop prev={arcs[index - 1]} next={arcs[index + 1]} locations={locations} motion={motion} onOpenArc={(id) => onOpen('arc', id)} />
    </section>
  </div>;
}
