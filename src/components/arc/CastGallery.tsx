import { useState, type CSSProperties, type KeyboardEvent } from 'react';
import { ArrowRight, Anchor } from 'lucide-react';
import { motion as m } from 'motion/react';
import type { Character } from '../../types';
import type { CastMember, Side } from '../../data/staging';
import type { RosterEntry } from '../../data/crew-roster';
import CharacterPortrait from '../CharacterPortrait';
import '../../crews.css';

const SIDE_LABEL: Record<Side, string> = { crew: 'Straw Hat', ally: 'Ally', foe: 'Foe', wildcard: 'Wild card' };
const GROUPS: { side: Side; title: string; blurb: string }[] = [
  { side: 'crew', title: 'The crew', blurb: 'Who sails under the straw hat in this stretch of the voyage.' },
  { side: 'ally', title: 'Allies', blurb: 'People who stand with the crew, at least for now.' },
  { side: 'wildcard', title: 'Wild cards', blurb: 'Loyalties that shift, or were never anyone’s to begin with.' },
  { side: 'foe', title: 'Foes', blurb: 'What stands in the way.' },
];
const ease = [0.22, 1, 0.36, 1] as const;

interface Props {
  cast: CastMember[];
  roster: RosterEntry[];
  characters: Character[];
  motion: boolean;
  onOpenCharacter: (id: string) => void;
}

/** Crew deck (who is aboard) plus the arc's cast grouped by side. Cards flip to reveal what each person wants here. */
export function CastGallery({ cast, roster, characters, motion, onOpenCharacter }: Props) {
  const colorOf = (member: CastMember) => member.color || characters.find((c) => c.id === member.id)?.color || '#087f91';
  return <>
    <div className="crew-deck">
      <span className="micro">ABOARD AT THIS STOP · {roster.length} {roster.length === 1 ? 'PIRATE' : 'PIRATES'}</span>
      <ul aria-label="Crew aboard">
        {roster.map(({ character, joins }, i) => <m.li key={character.id} initial={motion ? { opacity: 0, y: 14, scale: 0.9 } : false} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.45, ease, delay: i * 0.06 }}>
          <button className={`deck-member ${joins ? 'joins' : ''}`} style={{ '--accent': character.color } as CSSProperties} onClick={() => onOpenCharacter(character.id)} aria-label={`${character.name}${joins ? ', joins the crew in this arc' : ''}`}>
            <CharacterPortrait characterId={character.id} name={character.name} color={character.color} />
            <span className="deck-name">{character.name.split(' ').pop()}</span>
            {joins ? <span className="deck-joins micro"><Anchor size={9} aria-hidden="true" /> JOINS</span> : null}
          </button>
        </m.li>)}
      </ul>
    </div>
    {GROUPS.map(({ side, title, blurb }) => {
      const members = cast.filter((c) => c.side === side);
      if (!members.length) return null;
      return <div className={`cast-group side-${side}`} key={side}>
        <h3>{title} <small>{members.length}</small></h3>
        <p className="cast-blurb">{blurb}</p>
        <ul className="cast-grid">
          {members.map((member, i) => <CastCard key={member.id} member={member} color={colorOf(member)} index={i} motion={motion} isCrew={characters.some((c) => c.id === member.id)} onOpenCharacter={onOpenCharacter} />)}
        </ul>
      </div>;
    })}
  </>;
}

function CastCard({ member, color, index, motion, isCrew, onOpenCharacter }: { member: CastMember; color: string; index: number; motion: boolean; isCrew: boolean; onOpenCharacter: (id: string) => void }) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped((f) => !f);
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } };
  return <m.li initial={motion ? { opacity: 0, y: 22 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.5, ease, delay: Math.min(index, 6) * 0.07 }}>
    <article className={`cast-card ${flipped ? 'flipped' : ''}`} style={{ '--accent': color } as CSSProperties} tabIndex={0} role="group" aria-label={`${member.name}, ${SIDE_LABEL[member.side].toLowerCase()}. ${member.role}`} onClick={toggle} onKeyDown={onKey}>
      <div className="cast-inner">
        <div className="cast-front">
          <span className="cast-stamp micro">{SIDE_LABEL[member.side].toUpperCase()}</span>
          <CharacterPortrait characterId={member.id} name={member.name} color={color} />
          <strong>{member.name}</strong>
          {member.epithet ? <em>{member.epithet}</em> : null}
          {member.joins ? <span className="cast-joins micro">JOINS THE CREW</span> : null}
          <span className="cast-hint micro" aria-hidden="true">TAP TO READ</span>
        </div>
        <div className="cast-back" aria-hidden={!flipped}>
          <span className="micro">{SIDE_LABEL[member.side].toUpperCase()} · IN THIS ARC</span>
          <strong>{member.name}</strong>
          <p>{member.role}</p>
          {isCrew ? <button className="text-link" tabIndex={flipped ? 0 : -1} onClick={(e) => { e.stopPropagation(); onOpenCharacter(member.id); }}>Full profile <ArrowRight size={14} /></button> : null}
        </div>
      </div>
    </article>
  </m.li>;
}
