import { useEffect, useMemo, useRef, useState } from 'react';
import { Shield, Swords, Sparkles, Zap, Wand2 } from 'lucide-react';
import ActionStage from './ActionStage';
import { PortraitSvg } from '../../components/PortraitSvg';
import { recipeFor } from '../../components/portrait-recipe';
import { arcs } from '../../data/arcs';
import { stagingFor } from '../../data/staging';
import { CREW, specialFor } from '../crew';
import { characters } from '../../data/characters';

import { autoPlan, canAct, maxActions } from '../combat';
import type { BattleState, Blow, Fighter, GameAction, Intent } from '../types';
import '../../crews.css';

const crewColor = (id: string) => characters.find((c) => c.id === id)?.color ?? '#d9473f';

interface Props { battle: BattleState; locationId?: string; motion: boolean; dispatch: (a: GameAction) => void }

const BLOW_MS = 860;
/** Specials hold longer so their cut-in can be read. */
const SPECIAL_MS = 1400;
const durationOf = (b?: Blow) => b && (b.kind === 'special' || b.kind === 'steal' || b.kind === 'heal' || b.kind === 'revive') ? SPECIAL_MS : BLOW_MS;
/** Blows that restore health instead of taking it. */
const mends = (b?: Blow) => b?.kind === 'heal' || b?.kind === 'revive';
/**
 * Hit-stop: time slows around the moment of impact (the art lands its blow near progress .47), the
 * way fighting games freeze a frame on a hit, then catches up so the beat keeps its length.
 */
const hitStop = (t: number) => t < .4 ? t : t < .62 ? .4 + (t - .4) * .36 : .479 + (t - .62) * (.521 / .38);
const INTENT_LABEL: Record<Intent['kind'], string> = { attack: 'Attack', heavy: 'Heavy blow', guard: 'Guard' };

function Mini({ id, color, size = 44 }: { id: string; color: string; size?: number }) {
  return <span className="vg-mini" style={{ width: size, height: size }} aria-hidden="true"><PortraitSvg recipe={recipeFor(id, color)} color={color} clipId={`vg-${id}`} label="" still /></span>;
}

/**
 * The fight screen. The engine resolves a whole round at once; this screen replays its blows one by
 * one on the action stage, so players see every move play out: its own choreography, a pause on
 * impact, knockback, the damage number, and a cut-in for special moves. With motion off it shows the result and
 * the written log, which screen readers also hear.
 */
export default function BattleScreen({ battle, locationId, motion, dispatch }: Props) {
  const arc = arcs.find((a) => a.id === battle.arcId);
  const story = arc?.battles.find((b) => b.id === battle.battleId);
  const staging = stagingFor(battle.arcId);
  const colors = useMemo(() => new Map((staging?.cast ?? []).map((c) => [c.id, c.color ?? '#7a5a3a'])), [staging]);
  const [target, setTarget] = useState<string | undefined>();
  const [playing, setPlaying] = useState<{ blows: Blow[]; index: number; hp: Map<string, number> } | null>(null);
  const [progress, setProgress] = useState(.2);
  const previous = useRef<BattleState | null>(null);

  // A new round arrived: replay its blows from the fighters' health before the round.
  useEffect(() => {
    const before = previous.current;
    previous.current = battle;
    if (!before || !battle.blows?.length || before.round === battle.round) return;
    if (!motion) { setPlaying(null); return; }
    setPlaying({ blows: battle.blows, index: 0, hp: new Map([...before.crew, ...before.foes].map((f) => [f.id, f.hp])) });
  }, [battle, motion]);

  // Each blow: swing in, land at the middle of its beat, settle. The engine already knows the result.
  useEffect(() => {
    if (!playing) return;
    const blow = playing.blows[playing.index];
    let frame = 0; const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationOf(blow));
      setProgress(hitStop(t));
      if (t < 1) { frame = requestAnimationFrame(tick); return; }
      const hp = new Map(playing.hp);
      if (blow?.targetId && blow.amount) hp.set(blow.targetId, blow.kind === 'revive' ? blow.amount : Math.max(0, (hp.get(blow.targetId) ?? 0) + (mends(blow) ? blow.amount : -blow.amount)));
      if (playing.index + 1 < playing.blows.length) setPlaying({ ...playing, index: playing.index + 1, hp });
      else { setPlaying(null); setProgress(.2); }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const current = playing?.blows[playing.index];
  const landed = !!current && progress > .47;
  const shownHp = (f: Fighter) => {
    if (!playing) return f.hp;
    const base = playing.hp.get(f.id) ?? f.hp;
    if (current?.targetId !== f.id || !landed) return base;
    return current.kind === 'revive' ? current.amount : Math.min(f.maxHp, Math.max(0, base + (mends(current) ? current.amount : -current.amount)));
  };
  const livingCrew = battle.crew.filter((f) => f.hp > 0);
  const livingFoes = battle.foes.filter((f) => f.hp > 0);
  const chosenTarget = livingFoes.find((f) => f.id === target)?.id ?? livingFoes[0]?.id;
  const colorOf = (id: string) => CREW[id] ? crewColor(id) : colors.get(id) ?? '#5b3f8c';
  // During playback the stage shows health as of this blow, so a foe falls the moment it is beaten.
  const onStage = (list: Fighter[]) => (playing ? list : list.filter((f) => f.hp > 0)).map((f) => ({ ...f, hp: shownHp(f) }));
  const cutIn = current && (current.kind === 'special' || current.kind === 'steal' || current.kind === 'heal') && progress < .47 ? current : null;
  const planned = battle.planned;
  const busy = !!playing;

  const plan = (actorId: string, kind: 'attack' | 'special' | 'guard') => {
    if (planned.some((p) => p.actorId === actorId && p.kind === kind)) dispatch({ type: 'unplan', actorId });
    else dispatch({ type: 'plan', action: { actorId, kind, targetId: kind === 'guard' ? undefined : chosenTarget } });
  };
  const auto = () => { for (const action of autoPlan(battle)) dispatch({ type: 'plan', action }); dispatch({ type: 'fight' }); };

  return <section className="vg-battle" aria-labelledby="vg-battle-title">
    <header className="vg-battle-head">
      <span className="micro">{battle.boss ? 'BOSS BATTLE' : 'BATTLE'} · {arc?.name} · ROUND {battle.round}</span>
      <h2 id="vg-battle-title">{story?.title}</h2>
      {battle.round === 1 && story?.stakes ? <p>{story.stakes}</p> : null}
    </header>

    <div className={`vg-stage-wrap ${landed && motion ? `is-impact ${current?.kind === 'crit' || current?.kind === 'heavy' ? 'is-heavy' : ''}` : ''}`}>
      <div className="vg-stage" aria-hidden="true">
        <ActionStage crew={onStage(battle.crew)} foes={onStage(battle.foes)} blow={motion ? current : undefined} progress={progress} locationId={locationId} colors={colorOf} />
        {current && landed && current.amount > 0 ? <span key={`${playing?.index}-pop`} className={`vg-pop is-${mends(current) ? 'mend' : current.side} ${current.kind === 'crit' ? 'is-crit' : ''}`}>{current.kind === 'crit' ? 'CRIT ' : ''}{mends(current) ? '+' : '−'}{current.amount}</span> : null}
        {cutIn ? <div className="vg-cutin" key={`${playing?.index}-cut`}><Mini id={cutIn.actorId} color={colorOf(cutIn.actorId)} size={72} /><span><small>SPECIAL</small><strong>{specialFor(cutIn.actorId, battle.arcId).name}</strong></span></div> : null}
      </div>
      <p className="vg-caption" aria-hidden="true">{current?.label ?? (battle.result ? '' : 'Choose your moves')}</p>
    </div>

    <div className="vg-sides">
      <ul className="vg-team" aria-label="Your crew">{battle.crew.map((f) => <FighterCard key={f.id} f={f} hp={shownHp(f)} color={colorOf(f.id)} />)}</ul>
      <ul className="vg-team is-foes" aria-label="Foes">{battle.foes.map((f) => {
        const intent = battle.intents.find((i) => i.foeId === f.id);
        return <FighterCard key={f.id} f={f} hp={shownHp(f)} color={colorOf(f.id)} intent={battle.result || busy ? undefined : intent} intentTarget={intent ? battle.crew.find((c) => c.id === intent.targetId)?.name : undefined} selected={chosenTarget === f.id} onSelect={f.hp > 0 && !battle.result ? () => setTarget(f.id) : undefined} />;
      })}</ul>
    </div>

    {/* The verdict waits for the last blow to land. */}
    {battle.result && busy ? null : battle.result ? <div className={`vg-result is-${battle.result}`}>
      <h3>{battle.result === 'win' ? 'Victory!' : 'The crew falls back'}</h3>
      <p>{battle.result === 'win' ? story?.outcome : 'Patch up, resupply if you can, and come back to this fight. Guarding before a heavy blow helps.'}</p>
      <button className="button primary" type="button" onClick={() => dispatch({ type: 'continue' })} autoFocus>Continue</button>
    </div> : <div className="vg-controls" aria-label="Plan your moves">
      <p className="vg-plan-count">{planned.length}/{Math.min(maxActions(battle), livingCrew.length)} moves planned · target: <strong>{livingFoes.find((f) => f.id === chosenTarget)?.name}</strong> <small>(tap a foe to change)</small></p>
      <ul className="vg-moves">{livingCrew.map((f) => {
        const special = specialFor(f.id, battle.arcId); const mine = planned.find((p) => p.actorId === f.id);
        return <li key={f.id}><span className="vg-move-name"><Mini id={f.id} color={colorOf(f.id)} size={32} />{f.name}{f.guest ? <small className="vg-guest">ally</small> : null}</span>
          <button type="button" aria-pressed={mine?.kind === 'attack'} disabled={busy} onClick={() => plan(f.id, 'attack')}><Swords size={16} /> Attack</button>
          <button type="button" aria-pressed={mine?.kind === 'special'} disabled={busy || !canAct(battle, { actorId: f.id, kind: 'special' })} onClick={() => plan(f.id, 'special')} title={special.description}><Sparkles size={16} /> {special.name} <small>{special.cost}⚡</small></button>
          <button type="button" aria-pressed={mine?.kind === 'guard'} disabled={busy} onClick={() => plan(f.id, 'guard')}><Shield size={16} /> Guard</button>
        </li>;
      })}</ul>
      <div className="vg-fight-row">
        <button className="button primary" type="button" disabled={busy || !planned.length} onClick={() => dispatch({ type: 'fight' })}><Zap size={18} /> Fight!</button>
        <button className="button" type="button" disabled={busy} onClick={auto}><Wand2 size={18} /> Auto round</button>
      </div>
    </div>}

    <ol className="vg-log" aria-live="polite" aria-label="Battle log">{(battle.blows ?? []).map((b, i) => <li key={`${battle.round}-${i}`} className={`is-${b.side}`}>{b.label}{b.amount && !mends(b) ? ` (−${b.amount})` : ''}</li>)}</ol>
  </section>;
}

function FighterCard({ f, hp, color, intent, intentTarget, selected, onSelect }: { f: Fighter; hp: number; color: string; intent?: Intent; intentTarget?: string; selected?: boolean; onSelect?: () => void }) {
  const down = hp <= 0;
  const body = <>
    <Mini id={f.id} color={color} />
    <span className="vg-fighter-copy">
      <strong>{f.name}</strong>
      <span className="vg-bar" role="meter" aria-label={`${f.name} health`} aria-valuemin={0} aria-valuemax={f.maxHp} aria-valuenow={hp}><i style={{ width: `${(hp / f.maxHp) * 100}%` }} /></span>
      <small>{down ? 'Down' : `${hp}/${f.maxHp}`}{f.side === 'crew' ? <> · {'⚡'.repeat(f.stamina)}<span className="vg-dim">{'⚡'.repeat(Math.max(0, f.maxStamina - f.stamina))}</span></> : null}{f.weakened ? ' · weakened' : ''}</small>
      {intent ? <span className={`vg-intent is-${intent.kind}`}>{INTENT_LABEL[intent.kind]}{intent.kind !== 'guard' && intentTarget ? ` → ${intentTarget}` : ''}</span> : null}
    </span>
  </>;
  return <li className={`vg-fighter ${down ? 'is-down' : ''} ${selected ? 'is-target' : ''}`}>
    {onSelect ? <button type="button" aria-pressed={selected} aria-label={`Target ${f.name}`} onClick={onSelect}>{body}</button> : <div>{body}</div>}
  </li>;
}
