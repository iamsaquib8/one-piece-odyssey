import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Anchor, Apple, Coins, Heart, Ship, Skull, Swords, Waves, UserPlus, Store, Flag, RotateCcw, Play, BookOpen } from 'lucide-react';
import { useReadingHorizon } from '../../reading-horizon';
import { Scene } from '../../components/Scene';
import { MapIsland } from '../../components/PixelScene';
import { PortraitSvg } from '../../components/PortraitSvg';
import { recipeFor } from '../../components/portrait-recipe';
import WantedPoster from '../../components/WantedPoster';
import { characters } from '../../data/characters';
import { formatBounty, DEFAULT_POSTER } from '../../art/poster';
import { CREW, PASSIVES, specialFor } from '../crew';
import { PORT_ITEMS } from '../events';
import { newGame, step, reachable, eventFor, nodeById, currentColumn, hasCrew, nextSaga, priceOf, awayIn, hereArc } from '../engine';
import { EMPTY_LOGBOOK, isEmpty, loadLogbook, saveLogbook, record, startingSagas, type Logbook } from '../logbook';
import { sagas } from '../../data/sagas';
import { loadVoyage, saveVoyage, clearVoyage } from '../save';
import { nodesIn, sagaArcs } from '../content';
import type { ChartNode, GameAction, GameState, Mode } from '../types';
import BattleScreen from './BattleScreen';
import '../voyage.css';

const colorOf = (id: string) => characters.find((c) => c.id === id)?.color ?? '#d9473f';
const berries = (n: number) => `฿${n.toLocaleString('en-US')}`;
const KIND_ICON = { island: Anchor, battle: Swords, boss: Skull, sea: Waves, port: Store, recruit: UserPlus } as const;
const KIND_LABEL = { island: 'Island', battle: 'Battle', boss: 'Boss', sea: 'Open sea', port: 'Port', recruit: 'New crewmate' } as const;
const SHIP_NAME = { dinghy: 'Rowing boat', merry: 'Going Merry', sunny: 'Thousand Sunny' } as const;
const sagaName = (id: string) => sagas.find((s) => s.id === id)?.name ?? id;
/** Each crewmate's poster as a share of the captain's: roughly the story's own proportions, Chopper's joke included. */
const BOUNTY_SHARE: Record<string, number> = { luffy: 1, zoro: .37, sanji: .34, jinbe: .37, robin: .31, usopp: .17, franky: .13, brook: .13, nami: .12, chopper: 3.3e-7 };

/**
 * Grand Line Voyage. The engine (src/game) owns every rule; this component only shows the state and
 * dispatches actions, saving after each one so a voyage survives closing the tab.
 */
export default function VoyageGame({ motion }: { motion: boolean }) {
  const through = useReadingHorizon();
  const [state, setState] = useState<GameState | null>(() => typeof localStorage === 'undefined' ? null : loadVoyage(localStorage));
  const [book, setBook] = useState<Logbook>(() => typeof localStorage === 'undefined' ? EMPTY_LOGBOOK : loadLogbook(localStorage));
  const dispatch = useCallback((action: GameAction) => setState((s) => s ? step(s, action) : s), []);
  useEffect(() => { if (state) saveVoyage(localStorage, state); }, [state]);
  // The logbook outlives any one voyage: fold each step's progress into it.
  useEffect(() => { if (state) setBook((b) => record(b, state)); }, [state]);
  // Nothing is written for visitors who never set sail.
  useEffect(() => { if (!isEmpty(book)) saveLogbook(localStorage, book); }, [book]);
  const start = (mode: Mode, sagaId: string) => {
    setBook((b) => ({ ...b, voyages: b.voyages + 1 }));
    setState(newGame((Date.now() ^ (Math.random() * 1e9)) >>> 0, mode, through, sagaId));
  };

  if (!state) return <GameHome through={through} book={book} onStart={start} />;
  const phase = state.phase;
  const node = phase.type === 'event' || phase.type === 'port' || phase.type === 'recruit' ? nodeById(state, phase.nodeId) : phase.type === 'battle' ? nodeById(state, phase.battle.nodeId) : undefined;

  return <section className="voyage" aria-labelledby="voyage-title">
    <h1 id="voyage-title" className="sr-only">Grand Line Voyage</h1>
    <Hud state={state} onQuit={() => { clearVoyage(localStorage); setState(null); }} />
    {phase.type === 'map' ? <VoyageMap state={state} dispatch={dispatch} /> : null}
    {phase.type === 'event' && node ? <EventPanel state={state} node={node} dispatch={dispatch} /> : null}
    {phase.type === 'battle' ? <BattleScreen battle={phase.battle} locationId={node?.locationId} motion={motion} dispatch={dispatch} /> : null}
    {phase.type === 'port' && node ? <PortPanel state={state} dispatch={dispatch} bought={phase.bought} /> : null}
    {phase.type === 'recruit' && node ? <RecruitPanel node={node} dispatch={dispatch} /> : null}
    {phase.type === 'saga-end' ? <SagaEnd state={state} dispatch={dispatch} onRestart={() => { clearVoyage(localStorage); setState(null); }} /> : null}
  </section>;
}


function GameHome({ through, book, onStart }: { through: number | null; book: Logbook; onStart: (mode: Mode, sagaId: string) => void }) {
  const [mode, setMode] = useState<Mode>('story');
  const locked = through !== null && through < 7;
  // Later sagas open as starting points once the one before them is finished, and only as far as the reader has read.
  const starts = startingSagas(book).filter((id) => sagaArcs(id, through).length);
  const [sagaId, setSagaId] = useState(starts[0] ?? 'east-blue');
  return <section className="voyage voyage-home" aria-labelledby="voyage-home-title">
    <div className="vg-home-hero">
      <span className="micro">A GAME · THE WHOLE STORY IN 13 SAGAS</span>
      <h1 id="voyage-home-title">Grand Line Voyage</h1>
      <p>Sail the story yourself. Start alone in a rowing boat off Foosha Village, recruit all ten Straw Hats where they really joined, fight the arcs’ real battles, and carry the crew saga by saga to Elbaf. Each saga takes ten to thirty minutes, and your voyage saves after every stop.</p>
    </div>
    <div className="vg-home-grid">
      <article className="vg-card">
        <h2>Set sail</h2>
        {locked ? <p>Finish Romance Dawn in “I’ve read through” to start, so the voyage never shows you more than you have read.</p> : <>
          <fieldset className="vg-modes"><legend>Difficulty</legend>
            {(['story', 'standard'] as const).map((m) => <label key={m} className="chip-option"><input type="radio" name="vg-mode" checked={mode === m} onChange={() => setMode(m)} />{m === 'story' ? 'Story: gentle, for the tale' : 'Standard: retreats cost more'}</label>)}
          </fieldset>
          {starts.length > 1 ? <label className="vg-start-at">Start at <select value={sagaId} onChange={(e) => setSagaId(e.target.value)}>{starts.map((id) => <option key={id} value={id}>{sagaName(id)}{id === 'east-blue' ? ' (from the beginning)' : ''}</option>)}</select></label> : null}
          <button className="button primary" type="button" onClick={() => onStart(mode, sagaId)}><Play size={18} /> Set sail</button>
        </>}
      </article>
      <article className="vg-card">
        <h2>How it plays</h2>
        <ul className="vg-how">
          <li><Anchor size={18} /> Pick one stop per column on the chart. Forks offer calm or rough water: rough pays more and hurts more.</li>
          <li><Swords size={18} /> In battle, foes show what they will do next. Plan your moves, guard before heavy blows, and save stamina for specials. Allies from the story join some fights.</li>
          <li><Apple size={18} /> Every crossing eats a ration. Ports sell food, repairs and a bed.</li>
          <li><UserPlus size={18} /> Every crewmate brings a skill: Nami softens storms, Chopper heals, Brook brings the fallen back once a fight, Franky mends the ship, and Luffy’s gears grow with the story.</li>
        </ul>
      </article>
      <VoyageLogbook book={book} through={through} />
    </div>
  </section>;
}

function VoyageLogbook({ book, through }: { book: Logbook; through: number | null }) {
  const visible = sagas.filter((s) => sagaArcs(s.id, through).length);
  return <article className="vg-card vg-logbook" aria-labelledby="vg-logbook-title">
    <h2 id="vg-logbook-title"><BookOpen size={18} /> Voyage logbook</h2>
    {isEmpty(book) ? <p>Nothing logged yet. Finished sagas, won fights and your best bounty will be kept here, even when you start a new voyage.</p> : <>
      <dl className="vg-log-stats">
        <div><dt>Voyages</dt><dd>{book.voyages}</dd></div>
        <div><dt>Story fights won</dt><dd>{book.battles.length}</dd></div>
        <div><dt>Best bounty</dt><dd>฿{formatBounty(String(book.bestBounty))}</dd></div>
      </dl>
      <ol className="vg-log-sagas" aria-label="Sagas">{visible.map((s) => <li key={s.id} className={book.sagas.includes(s.id) ? 'is-done' : ''}>{book.sagas.includes(s.id) ? '✓ ' : ''}{s.name}</li>)}</ol>
      {book.crew.length ? <ul className="vg-log-crew" aria-label="Crew who have sailed with you">{book.crew.map((id) => <li key={id} title={CREW[id].name}><span className="vg-mini" aria-hidden="true"><PortraitSvg recipe={recipeFor(id, colorOf(id))} color={colorOf(id)} clipId={`log-${id}`} label="" still /></span><span className="sr-only">{CREW[id].name}</span></li>)}</ul> : null}
    </>}
  </article>;
}

function Meter({ value, max, label, tone }: { value: number; max: number; label: string; tone: string }) {
  return <span className="vg-meter" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}><i style={{ width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`, background: tone }} /></span>;
}

function Hud({ state, onQuit }: { state: GameState; onQuit: () => void }) {
  // Abandoning a voyage cannot be undone, so the button asks twice instead of opening a blocking dialog.
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 4000); return () => clearTimeout(t); }, [armed]);
  return <header className="vg-hud">
    <div className="vg-hud-stats">
      <span title="Berries"><Coins size={16} /> {berries(state.berries)}</span>
      <span title="Rations"><Apple size={16} /> {state.food}</span>
      <span className="vg-hud-meter" title="Hull"><Ship size={16} /> <Meter value={state.ship.hull} max={state.ship.maxHull} label="Hull" tone="#8c6a3f" /> {SHIP_NAME[state.ship.kind]}</span>
      <span className="vg-hud-meter" title="Morale"><Heart size={16} /> <Meter value={state.morale} max={100} label="Morale" tone="#f45156" /></span>
      <span title="Bounty"><Flag size={16} /> ฿{formatBounty(String(state.bounty))}</span>
    </div>
    <ul className="vg-hud-crew" aria-label="Crew">{state.crew.map((m) => { const away = awayIn(hereArc(state), m.id); return <li key={m.id} className={away ? 'is-away' : ''} title={`${CREW[m.id].name}: ${away ? 'elsewhere in this part of the story' : `${m.hp}/${m.maxHp}`}`}>
      <span className="vg-mini" aria-hidden="true"><PortraitSvg recipe={recipeFor(m.id, colorOf(m.id))} color={colorOf(m.id)} clipId={`hud-${m.id}`} label="" still /></span>
      <Meter value={m.hp} max={m.maxHp} label={`${CREW[m.id].name} health${away ? ' (away)' : ''}`} tone="#2f8f6b" />
    </li>; })}</ul>
    <button className={`vg-quit ${armed ? 'is-armed' : ''}`} type="button" onClick={() => armed ? onQuit() : setArmed(true)}><RotateCcw size={15} /> {armed ? 'Click again to abandon this voyage' : 'New voyage'}</button>
  </header>;
}

function VoyageMap({ state, dispatch }: { state: GameState; dispatch: (a: GameAction) => void }) {
  const next = new Set(reachable(state).map((n) => n.id));
  const here = currentColumn(state);
  const scroller = useRef<HTMLDivElement>(null);
  // Bring the next stops into view sideways only; scrolling the page would hide the status bar.
  useEffect(() => { const box = scroller.current, next = box?.querySelector<HTMLElement>('.is-next'); if (box && next) box.scrollTo({ left: next.offsetLeft - box.clientWidth / 2 + next.offsetWidth / 2, behavior: 'smooth' }); }, [here]);
  const columns = useMemo(() => Array.from({ length: state.chart.columns }, (_, c) => nodesIn(state.chart, c)), [state.chart]);
  return <div className="vg-map">
    <div className="vg-map-head"><h2>Choose your next stop</h2><p>{state.log.at(-1)}</p></div>
    <div className="vg-chart" ref={scroller} role="list" aria-label="Voyage chart">
      {columns.map((nodes, c) => {
        const arcStart = c === 0 || columns[c - 1][0]?.arcId !== nodes[0]?.arcId;
        return <div key={c} className={`vg-col ${arcStart ? 'is-arc-start' : ''}`} role="listitem">
          {arcStart ? <span className="vg-arc-name">{nodes[0]?.arcId.replace(/-/g, ' ')}</span> : null}
          {nodes.map((n) => <NodeButton key={n.id} node={n} state={next.has(n.id) ? 'next' : state.cleared.includes(n.id) ? 'cleared' : state.at === n.id ? 'here' : 'later'} onSail={() => dispatch({ type: 'sail', nodeId: n.id })} />)}
        </div>;
      })}
    </div>
  </div>;
}

function NodeButton({ node, state, onSail }: { node: ChartNode; state: 'next' | 'cleared' | 'here' | 'later'; onSail: () => void }) {
  const Icon = KIND_ICON[node.kind];
  return <button type="button" className={`vg-node is-${node.kind} is-${state} ${node.rough ? 'is-rough' : ''}`} disabled={state !== 'next'} onClick={onSail} aria-label={`${KIND_LABEL[node.kind]}${node.rough ? ', rough water' : ''}: ${node.title}${state === 'cleared' ? ' (done)' : ''}`}>
    <span className="vg-node-art" aria-hidden="true">{node.locationId && node.kind !== 'sea' ? <svg viewBox="0 0 320 180"><MapIsland locationId={node.locationId} /></svg> : <Waves size={34} className="vg-node-wave" />}<span className="vg-node-badge"><Icon size={14} /></span></span>
    <span className="vg-node-title">{node.title}</span>
    <small>{KIND_LABEL[node.kind]}{node.rough ? ' · rough' : ''}</small>
  </button>;
}

function EffectChips({ effects }: { effects: Record<string, number | undefined> }) {
  const label: Record<string, string> = { berries: 'Berries', food: 'Rations', morale: 'Morale', hull: 'Hull', heal: 'Health %', bounty: 'Bounty' };
  return <ul className="vg-effects">{Object.entries(effects).filter(([, v]) => v).map(([k, v]) => <li key={k} className={v! > 0 ? 'is-up' : 'is-down'}>{label[k]} {v! > 0 ? '+' : ''}{k === 'bounty' ? `${(v! / 1e6).toFixed(1)}M` : v}</li>)}</ul>;
}

function EventPanel({ state, node, dispatch }: { state: GameState; node: ChartNode; dispatch: (a: GameAction) => void }) {
  const event = eventFor(state, node);
  const phase = state.phase.type === 'event' ? state.phase : null;
  return <article className="vg-event" aria-labelledby="vg-event-title">
    <div className="vg-event-art"><Scene locationId={node.locationId ?? 'going-merry'} name={event.title} eager /></div>
    <div className="vg-event-copy">
      <span className="micro">{node.kind === 'sea' ? `AT SEA${node.rough ? ' · ROUGH WATER' : ''}` : event.arcName.toUpperCase()}</span>
      <h2 id="vg-event-title">{event.title}</h2>
      <p>{event.text}</p>
      {phase?.outcome ? <div className="vg-outcome" role="status"><p>{phase.outcome.text}</p><EffectChips effects={phase.outcome.effects as Record<string, number>} /><button className="button primary" type="button" onClick={() => dispatch({ type: 'continue' })} autoFocus>Continue</button></div>
        : <ul className="vg-choices">{event.choices.map((c) => <li key={c.id}><button type="button" className="vg-choice" onClick={() => dispatch({ type: 'choose', choiceId: c.id })}>{c.label}{c.needs ? <small>{hasCrew(state, c.needs) ? `${CREW[c.needs]?.name ?? c.needs} can handle this` : `Safer with ${CREW[c.needs]?.name ?? c.needs}`}</small> : null}</button></li>)}</ul>}
    </div>
  </article>;
}

function PortPanel({ state, dispatch, bought }: { state: GameState; dispatch: (a: GameAction) => void; bought: string[] }) {
  return <article className="vg-event vg-port" aria-labelledby="vg-port-title">
    <div className="vg-event-copy">
      <span className="micro">PORT</span><h2 id="vg-port-title">A harbour town</h2>
      <p>Fresh water, a market, a shipwright and an inn. Spend what you can spare.</p>
      <ul className="vg-shop">{PORT_ITEMS.map((item) => <li key={item.id}><span><strong>{item.label}</strong><small>{item.description}</small></span>
        <button className="button" type="button" disabled={bought.includes(item.id) || state.berries < priceOf(state, item.cost)} onClick={() => dispatch({ type: 'buy', itemId: item.id })}>{bought.includes(item.id) ? 'Bought' : berries(priceOf(state, item.cost))}</button></li>)}</ul>
      <button className="button primary" type="button" onClick={() => dispatch({ type: 'leave' })}>Set sail</button>
    </div>
  </article>;
}

function RecruitPanel({ node, dispatch }: { node: ChartNode; dispatch: (a: GameAction) => void }) {
  const spec = CREW[node.recruitId!];
  const special = specialFor(spec.id, node.arcId);
  const record = characters.find((c) => c.id === spec.id);
  return <article className="vg-event vg-recruit" aria-labelledby="vg-recruit-title">
    <div className="vg-recruit-portrait"><PortraitSvg recipe={recipeFor(spec.id, colorOf(spec.id))} color={colorOf(spec.id)} clipId={`recruit-${spec.id}`} label={record?.name ?? spec.name} still /></div>
    <div className="vg-event-copy">
      <span className="micro">NEW CREWMATE · {record?.role?.toUpperCase()}</span>
      <h2 id="vg-recruit-title">{record?.name ?? spec.name} joins the crew</h2>
      <p>{record?.recruitment}</p>
      <dl className="vg-skills"><div><dt>Special</dt><dd><strong>{special.name}</strong> — {special.description}</dd></div>{PASSIVES[spec.id] ? <div><dt>On the voyage</dt><dd>{PASSIVES[spec.id]}</dd></div> : null}</dl>
      <button className="button primary" type="button" onClick={() => dispatch({ type: 'continue' })} autoFocus>Welcome aboard</button>
    </div>
  </article>;
}

function SagaEnd({ state, dispatch, onRestart }: { state: GameState; dispatch: (a: GameAction) => void; onRestart: () => void }) {
  const next = nextSaga(state);
  const finished = sagaName(state.sagaId);
  const bountyOf = (id: string) => Math.max(id === 'chopper' ? 50 : 0, Math.round(state.bounty * (BOUNTY_SHARE[id] ?? .1)));
  const posterFor = (id: string) => {
    const who = characters.find((c) => c.id === id);
    return { ...DEFAULT_POSTER, recipe: recipeFor(id, colorOf(id)), name: who?.name ?? CREW[id].name, epithet: who?.epithet ?? '', bounty: String(bountyOf(id)), backdrop: id === 'luffy' ? '#f2b33d' : colorOf(id) };
  };
  const [captain, ...rest] = state.crew.map((m) => m.id);
  return <article className="vg-event vg-end" aria-labelledby="vg-end-title">
    <div className="vg-end-poster"><WantedPoster poster={posterFor(captain)} title={`Wanted poster for Monkey D. Luffy, bounty ${formatBounty(String(state.bounty))} berries`} /></div>
    <div className="vg-event-copy">
      <span className="micro">{finished.toUpperCase()} SAGA · COMPLETE</span>
      <h2 id="vg-end-title">New bounties</h2>
      <p>The {finished} saga is behind you, with {state.crew.length} aboard the {SHIP_NAME[state.ship.kind]}, {berries(state.berries)} in the purse and ฿{formatBounty(String(state.bounty))} on the captain’s head.</p>
      {rest.length ? <ul className="vg-end-crew" aria-label="The crew’s new bounties">{rest.map((id) => <li key={id}><WantedPoster poster={posterFor(id)} title={`Wanted poster for ${CREW[id].name}, bounty ${formatBounty(String(bountyOf(id)))} berries`} /></li>)}</ul> : null}
      <p>{next ? `The ${sagaName(next)} saga is next. The crew rests, grows stronger, and carries everything else with it.` : state.through !== null ? 'That is as far as your reading goes. Read on and the voyage will be waiting.' : 'That is the story so far. The voyage goes on when the story does.'}</p>
      <div className="vg-fight-row">
        {next ? <button className="button primary" type="button" onClick={() => dispatch({ type: 'next-saga' })} autoFocus><Anchor size={18} /> Sail on to {sagaName(next)}</button> : null}
        <a className="button" href={`/poster/?from=luffy`}><BookOpen size={18} /> Make your own poster</a>
        <button className="button" type="button" onClick={onRestart}><RotateCcw size={18} /> New voyage</button>
      </div>
    </div>
  </article>;
}
