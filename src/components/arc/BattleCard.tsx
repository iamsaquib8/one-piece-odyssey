import type { CSSProperties } from 'react';
import { motion as m } from 'motion/react';
import type { Battle } from '../../types';
import type { BattleStaging, CastMember } from '../../data/staging';
import CharacterPortrait from '../CharacterPortrait';
import { BattlePlayer } from '../BattlePlayer';

const VERDICT: Record<NonNullable<BattleStaging['verdict']>, { label: string; tone: string }> = {
  a: { label: 'Won', tone: 'win' },
  b: { label: 'Lost', tone: 'loss' },
  draw: { label: 'Stalemate', tone: 'draw' },
  interrupted: { label: 'Interrupted', tone: 'draw' },
};
const ease = [0.22, 1, 0.36, 1] as const;

interface Props { battle: Battle; staging?: BattleStaging; cast: Map<string, CastMember>; motion: boolean }

/** Versus header (both sides face off, VS badge slams in, verdict stamp) above the frame player. */
export function BattleCard({ battle, staging, cast, motion }: Props) {
  const side = (ids: string[] = []) => ids.map((id) => cast.get(id)).filter((c): c is CastMember => Boolean(c));
  const a = side(staging?.a);
  const b = side(staging?.b);
  const verdict = staging?.verdict ? VERDICT[staging.verdict] : undefined;
  return <m.section className="battle-card" aria-label={battle.title} initial={motion ? { opacity: 0, y: 26 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55, ease }}>
    {a.length || b.length ? <div className={`versus ${verdict ? `verdict-${verdict.tone}` : ''}`}>
      <Side members={a} align="left" motion={motion} />
      <div className="versus-middle">
        <m.span className="versus-badge" aria-hidden="true" initial={motion ? { scale: 0.2, rotate: -20, opacity: 0 } : false} whileInView={{ scale: 1, rotate: -6, opacity: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ type: 'spring', stiffness: 420, damping: 16, delay: 0.25 }}>VS</m.span>
        {verdict ? <m.span className={`verdict-stamp ${verdict.tone}`} initial={motion ? { scale: 1.6, opacity: 0, rotate: 8 } : false} whileInView={{ scale: 1, opacity: 1, rotate: -8 }} viewport={{ once: true, amount: 0.6 }} transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.7 }}>{verdict.label}</m.span> : null}
      </div>
      <Side members={b} align="right" motion={motion} />
    </div> : null}
    <BattlePlayer battle={battle} motion={motion} />
  </m.section>;
}

function Side({ members, align, motion }: { members: CastMember[]; align: 'left' | 'right'; motion: boolean }) {
  return <div className={`versus-side ${align}`}>
    <ul className="versus-faces">
      {members.slice(0, 4).map((c, i) => <m.li key={c.id} style={{ '--accent': c.color || 'var(--sea)' } as CSSProperties} initial={motion ? { opacity: 0, x: align === 'left' ? -40 : 40 } : false} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.45, ease, delay: i * 0.08 }}>
        <CharacterPortrait characterId={c.id} name={c.name} color={c.color || '#087f91'} />
      </m.li>)}
    </ul>
    <strong>{members.map((c) => c.name).join(' · ') || 'Unknown'}</strong>
  </div>;
}
