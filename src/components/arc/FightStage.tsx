import { memo } from 'react';
import type { Battle } from '../../types';
import type { BattleStaging, CastMember } from '../../data/staging';
import { Scene } from '../Scene';
import CharacterPortrait from '../CharacterPortrait';
import { LaboonScene, StrawHatFighter } from './LaboonScene';
import { attackCue, impactCue, type BattleShot } from './battle-timeline';

interface Props {
  battle: Battle;
  staging?: BattleStaging;
  cast?: Map<string, CastMember>;
  locationId?: string;
  frame: number;
  progress: number;
  elapsed: number;
  shot: BattleShot;
}

const Backdrop = memo(function Backdrop({ locationId }: { locationId?: string }) {
  return <span className="comic-ground">{locationId ? <Scene locationId={locationId} name="" /> : null}</span>;
});
const Portrait = memo(CharacterPortrait);

export function FightStage({ battle, staging, cast, locationId, progress, elapsed, shot }: Props) {
  if (battle.id === 'laboon-promise') return <LaboonScene shot={shot} progress={progress} elapsed={elapsed} />;
  const side = (ids: string[] = []) => ids.map(id => cast?.get(id)).filter((c): c is CastMember => !!c);
  const a = side(staging?.a);
  const b = side(staging?.b);
  const striking = shot.kind === 'strike';
  const attack = striking ? attackCue(progress) : 0;
  const hit = striking ? impactCue(progress) : 0;
  const time = elapsed / 1000;
  const direction = shot.actor === 'a' ? 1 : -1;
  const zoom = shot.kind === 'establish' ? 1 + progress * .06 : shot.kind === 'resolve' ? 1.06 - progress * .06 : 1.07 + hit * .07;

  return <span className="comic-scene" aria-hidden="true" data-shot={shot.kind}>
    <span className="comic-world" style={{ transform: `translate(${direction * attack * -2}%, ${Math.sin(progress * 95) * hit * 2}px) scale(${zoom})` }}>
      <Backdrop locationId={locationId} />
      <span className="comic-atmosphere" />
      <svg className="comic-dust" viewBox="0 0 1000 500" preserveAspectRatio="none">
        {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 83 + time * (12 + i % 4)) % 1050} cy={350 - (time * 18 + i * 29) % 290} r={i % 3 + 1} fill="var(--paper)" opacity=".32" />)}
        <ellipse cx="500" cy="423" rx="400" ry="30" fill="var(--ink)" opacity=".35" />
      </svg>
      {([['a', a], ['b', b]] as const).map(([team, members]) => <span className={`comic-team comic-team-${team}`} key={team}>
        {members.slice(0, 3).map((member, index) => {
          const acting = shot.actor === team;
          const sign = team === 'a' ? 1 : -1;
          const displacement = acting ? attack * 155 : -hit * 40;
          const bob = Math.sin(time * 3 + index) * 2;
          return <span key={member.id} className="comic-fighter" style={{ transform: `translate(${sign * displacement}%, ${acting ? -Math.max(0, attack) * 30 + bob : hit * 10 + bob}px) rotate(${sign * (acting ? attack * 16 : -hit * 19)}deg)`, zIndex: 3 - index }}>
            <span className="comic-puppet" style={{ transform: `scaleX(${sign})` }}>
              {member.id === 'luffy' ? <svg viewBox="-65 -155 130 175"><g transform="translate(0 -8)"><StrawHatFighter arm={acting ? attack * 65 : 0} airborne={acting ? Math.max(0, attack) : 0} /></g></svg> : <>
                <svg viewBox="-65 -155 130 175" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M-12-50L-23-6-35 4M12-50L26-6 38 4" fill="none" strokeWidth="14" />
                  <path d="M-20-105L-26-46 0-35 26-46 20-105Z" fill={member.color || 'var(--sea)'} />
                  <path d="M-18-94L-39-67-30-51" fill="none" stroke={member.color || 'var(--sea)'} strokeWidth="13" />
                  <g transform={`rotate(${-attack * (acting ? 60 : -20)} 19 -92)`}><path d="M19-92L40-72 51-90" fill="none" stroke={member.color || 'var(--sea)'} strokeWidth="13" /><circle cx="51" cy="-90" r="7" fill="#ca966f" />
                    {['zoro', 'mihawk', 'brook', 'law', 'shanks'].includes(member.id) ? <path d="M50-90L30-160" stroke="var(--paper)" strokeWidth="5" /> : null}
                  </g>
                </svg>
                <span className="comic-puppet-head"><Portrait characterId={member.id} name={member.name} color={member.color} /></span>
              </>}
            </span>
            <span className="comic-fighter-name">{member.name.split(' ').pop()}</span>
          </span>;
        })}
      </span>)}
    </span>
    <svg className="comic-effects" viewBox="0 0 1000 500" preserveAspectRatio="none" style={{ opacity: hit }}>
      <g stroke="var(--paper)" fill="none">
        {Array.from({ length: 18 }, (_, i) => {
          const angle = i / 18 * Math.PI * 2;
          return <path key={i} d={`M${500 + Math.cos(angle) * 580} ${250 + Math.sin(angle) * 370}L${500 + Math.cos(angle) * (140 + hit * 60)} ${250 + Math.sin(angle) * 130}`} strokeWidth={i % 3 + 2} />;
        })}
        <ellipse cx="500" cy="250" rx={50 + progress * 190} ry={90 + progress * 120} strokeWidth="6" opacity=".7" transform="rotate(-25 500 250)" />
        <path d="M370 340Q490 250 600 135" strokeWidth="12" />
      </g>
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${500 + Math.cos(i * 2.4) * progress * 320} ${260 + Math.sin(i * 2.4) * progress * 220}l8-13 9 18Z`} fill="var(--gold)" />)}
    </svg>
    {shot.impact && <span className="comic-impact-word" style={{ opacity: hit, transform: `translate(-50%, -50%) rotate(-9deg) scale(${.8 + hit * .25})` }}>{shot.impact}</span>}
    {!a.length && !b.length ? <span className="comic-empty-scene">{shot.label}</span> : null}
  </span>;
}
