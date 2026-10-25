// The voyage as a reducer: step(state, action) returns the next state and never mutates its input.
// All randomness flows through state.rng, so a seed and a list of actions replay exactly.
import { stagingAtProgress } from '../data/spoiler-overrides';
import { arcs } from '../data/arcs';
import { sagas } from '../data/sagas';
import { buildChart, arcTier, nodesIn, sagaArcs, joinArcs } from './content';
import { CREW, CREW_ORDER, growth } from './crew';
import { islandChoices, seaEvent, PORT_ITEMS, type ChoiceSpec } from './events';
import { resolveRound, startBattle, canAct, maxActions, battleOutcome } from './combat';
import { Dice } from './rng';
import type { ChartNode, CrewMember, Effects, GameAction, GameState, Mode, Ship } from './types';

export const FIRST_SAGA = 'east-blue';

/**
 * Crewmates who are elsewhere in the story. After Sabaody the crew is scattered and Luffy fights
 * on alone, with whoever the story puts beside him; at Whole Cake Island half the crew is in Wano.
 */
const AWAY: Record<string, (id: string) => boolean> = {
  'amazon-lily': (id) => id !== 'luffy',
  'impel-down': (id) => id !== 'luffy',
  marineford: (id) => id !== 'luffy',
  'post-war': (id) => id !== 'luffy',
  'whole-cake-island': (id) => ['zoro', 'usopp', 'robin', 'franky'].includes(id),
};
export const awayIn = (arcId: string | undefined, id: string) => !!arcId && !!AWAY[arcId]?.(id);

/** Bounties climb steeply with the story: East Blue pays in millions, the New World in hundreds of millions. */
export const bountyScale = (tier: number) => 1.16 ** tier;
/** Prices and purses grow with the story too, so a late port is not free. */
export const priceScale = (tier: number) => 1 + tier * .08;

const memberAt = (id: string, tier: number): CrewMember => { const hp = Math.round(CREW[id].hp * growth(tier)); return { id, hp, maxHp: hp }; };
const shipFor = (crew: string[]): Ship => crew.includes('franky') ? { kind: 'sunny', hull: 160, maxHull: 160 } : crew.includes('usopp') ? { kind: 'merry', hull: 80, maxHull: 80 } : { kind: 'dinghy', hull: 40, maxHull: 40 };

/**
 * A new voyage. From the East Blue, Luffy sets out alone; starting at a later saga, the crew is
 * everyone who joined before it, on the ship they had, levelled for that point in the story.
 */
export function newGame(seed: number, mode: Mode, through: number | null, sagaId = FIRST_SAGA): GameState {
  const first = sagaArcs(sagaId, through)[0];
  const tier = first ? arcTier(first.id) : 0;
  const joins = joinArcs();
  const crew = CREW_ORDER.filter((id) => id === 'luffy' || (joins[id] && arcTier(joins[id]) < tier));
  return {
    version: 1, seed, rng: seed, mode, through, sagaId,
    chart: buildChart(sagaId, through, seed),
    at: null, cleared: [],
    crew: crew.map((id) => memberAt(id, tier)),
    ship: shipFor(crew),
    berries: Math.round(100 * priceScale(tier)), food: 4 + Math.floor(crew.length / 2), morale: 60, bounty: sagaId === FIRST_SAGA ? 0 : Math.round(3_000_000 * bountyScale(tier)),
    phase: { type: 'map' },
    log: [sagaId === FIRST_SAGA ? 'A boy in a straw hat pushes a rowing boat off the beach at Foosha Village.' : `The crew sets out into the ${sagas.find((s) => s.id === sagaId)?.name ?? 'next'} saga.`],
    turns: 0,
    sagasDone: [],
  };
}

/** The saga after this one that the reader has reached, if any. */
export function nextSaga(state: Pick<GameState, 'sagaId' | 'through'>): string | undefined {
  const index = sagas.findIndex((s) => s.id === state.sagaId);
  return sagas.slice(index + 1).find((s) => sagaArcs(s.id, state.through).length)?.id;
}

export const nodeById = (state: GameState, id: string | null | undefined) => state.chart.nodes.find((n) => n.id === id);
export const currentColumn = (state: GameState) => nodeById(state, state.at)?.column ?? -1;
/** Nodes the ship can sail to next. */
export const reachable = (state: GameState): ChartNode[] => state.phase.type === 'map' ? nodesIn(state.chart, currentColumn(state) + 1) : [];
/** The arc the ship is in now: the current stop's, or the first arc before the first stop. */
export const hereArc = (state: GameState) => nodeById(state, state.at)?.arcId ?? state.chart.nodes[0]?.arcId;
/** Whether a crewmate is aboard, standing, and present in this part of the story. */
export const hasCrew = (state: GameState, id: string) => state.crew.some((m) => m.id === id && m.hp > 0) && !awayIn(hereArc(state), id);
const tierOf = (node: ChartNode) => arcTier(node.arcId);

/** Choices for the event at a node: the beat's mood for islands, the authored pool for the sea. */
export function eventFor(state: GameState, node: ChartNode): { title: string; text: string; choices: ChoiceSpec[]; arcName: string } {
  const arc = arcs.find((a) => a.id === node.arcId);
  if (node.kind === 'sea') { const e = seaEvent(node.seaEventId); return { title: e.title, text: e.text, choices: e.choices, arcName: arc?.name ?? '' }; }
  const beat = arc?.beats.find((b) => b.id === node.beatId);
  const mood = stagingAtProgress(node.arcId, state.through)?.beats[node.beatId ?? '']?.mood;
  return { title: beat?.title ?? node.title, text: beat?.paragraphs[0] ?? '', choices: islandChoices(mood), arcName: arc?.name ?? '' };
}

function log(state: GameState, line: string) { state.log = [...state.log.slice(-29), line]; }

/** Apply a bundle of resource changes, clamped, with the captain's morale floor. */
export function applyEffects(state: GameState, effects: Effects, scale = 1) {
  // Rough water scales gains and losses alike.
  const s = (v: number | undefined) => Math.round((v ?? 0) * scale);
  state.berries = Math.max(0, state.berries + s(effects.berries));
  state.food = Math.max(0, state.food + s(effects.food));
  state.bounty = Math.max(0, state.bounty + s(effects.bounty));
  const floor = hasCrew(state, 'luffy') ? 20 : 0;
  state.morale = Math.max(floor, Math.min(100, state.morale + s(effects.morale)));
  let hull = s(effects.hull);
  // The helmsman keeps the ship out of harm's way; the navigator halves it.
  if (hull < 0 && hasCrew(state, 'jinbe')) hull = 0;
  else if (hull < 0 && hasCrew(state, 'nami')) hull = Math.round(hull * .5);
  state.ship = { ...state.ship, hull: Math.max(1, Math.min(state.ship.maxHull, state.ship.hull + hull)) };
  if (effects.heal) state.crew = state.crew.map((m) => ({ ...m, hp: Math.max(1, Math.min(m.maxHp, m.hp + Math.round(m.maxHp * s(effects.heal) / 100))) }));
}

function clearAndReturn(state: GameState, nodeId: string) {
  state.cleared = [...new Set([...state.cleared, nodeId])];
  const node = nodeById(state, nodeId)!;
  state.phase = node.column >= state.chart.columns - 1 ? { type: 'saga-end' } : { type: 'map' };
}

/** Event money and fame scale with the story; everything else stays as written. */
function scaled(effects: Effects, tier: number): Effects {
  return { ...effects, berries: effects.berries && Math.round(effects.berries * priceScale(tier)), bounty: effects.bounty && Math.round(effects.bounty * bountyScale(tier)) };
}

/** Story mode is gentler; each retreat from a fight softens it by a tenth, down to 60%. */
export const difficultyAt = (state: GameState, nodeId: string) => (state.mode === 'story' ? .85 : 1) * Math.max(.6, .9 ** (state.retreats?.[nodeId] ?? 0));

export const priceOf = (state: GameState, cost: number) => Math.round(cost * priceScale(arcTier(hereArc(state) ?? '')));

export function step(input: GameState, action: GameAction): GameState {
  const state: GameState = structuredClone(input);
  const dice = new Dice(state.rng);
  state.turns += 1;
  const phase = state.phase;

  if (action.type === 'sail' && phase.type === 'map') {
    const node = reachable(state).find((n) => n.id === action.nodeId);
    if (!node) return input;
    state.at = node.id;
    // Sanji cooks between stops; on the open sea the crew eats regardless.
    if (hasCrew(state, 'sanji') && state.food > 0) { state.food -= 1; applyEffects(state, { heal: 10 }); }
    if (hasCrew(state, 'franky')) applyEffects(state, { hull: 6 });
    if (node.kind === 'sea') {
      if (state.food > 0) state.food -= 1;
      else { applyEffects(state, { morale: -8, heal: -10 }); log(state, 'No food left for the crossing. Stomachs rumble all the way.'); }
    }
    if (node.kind === 'island' || node.kind === 'sea') state.phase = { type: 'event', nodeId: node.id };
    else if (node.kind === 'port') state.phase = { type: 'port', nodeId: node.id, bought: [] };
    else if (node.kind === 'recruit') state.phase = { type: 'recruit', nodeId: node.id };
    else state.phase = { type: 'battle', battle: startBattle(node.id, node.arcId, node.battleId!, node.kind === 'boss', state.crew.filter((m) => !awayIn(node.arcId, m.id)), tierOf(node), dice, difficultyAt(state, node.id)) };
    log(state, `Set course for ${node.title}.`);
  } else if (action.type === 'choose' && phase.type === 'event' && !phase.outcome) {
    const node = nodeById(state, phase.nodeId)!;
    const choice = eventFor(state, node).choices.find((c) => c.id === action.choiceId);
    if (!choice) return input;
    const outcome = choice.resolve(dice, { hasCrew: (id) => hasCrew(state, id), rough: !!node.rough });
    const effects = scaled(outcome.effects, tierOf(node));
    // The archaeologist reads every island for something worth knowing, or selling.
    if (node.kind === 'island' && hasCrew(state, 'robin')) effects.berries = (effects.berries ?? 0) + Math.round(15 * priceScale(tierOf(node)));
    applyEffects(state, effects, node.rough ? 1.5 : 1);
    state.phase = { type: 'event', nodeId: node.id, outcome: { ...outcome, effects } };
    log(state, outcome.text);
  } else if (action.type === 'continue') {
    if (phase.type === 'event' && phase.outcome) clearAndReturn(state, phase.nodeId);
    else if (phase.type === 'recruit') {
      const node = nodeById(state, phase.nodeId)!;
      const spec = CREW[node.recruitId!];
      if (spec && !state.crew.some((m) => m.id === spec.id)) state.crew = [...state.crew, memberAt(spec.id, tierOf(node))];
      // Kaya gives the crew the Going Merry when Usopp sails with them; Franky brings the Sunny.
      if (spec?.id === 'usopp' && state.ship.kind === 'dinghy') { state.ship = shipFor(['usopp']); log(state, 'The Going Merry is yours: a caravel with a ram’s head.'); }
      if (spec?.id === 'franky' && state.ship.kind !== 'sunny') { state.ship = shipFor(['franky']); log(state, 'The Going Merry has had her farewell. The Thousand Sunny takes the crew on from here.'); }
      log(state, `${spec?.name ?? 'A new friend'} joins the crew.`);
      clearAndReturn(state, node.id);
    } else if (phase.type === 'battle' && phase.battle.result) {
      const { battle } = phase;
      // Carry the fight's wounds back to the crew sheet; the doctor sees to everyone afterwards.
      state.crew = state.crew.map((m) => { const f = battle.crew.find((c) => c.id === m.id); return f ? { ...m, hp: Math.max(1, f.hp) } : m; });
      const node = nodeById(state, battle.nodeId)!;
      if (hasCrew(state, 'chopper')) applyEffects(state, { heal: 15 });
      const tier = tierOf(node);
      if (battle.result === 'win') {
        // Rewards sit near the story's scale: the whole of East Blue is worth about 30M in bounty.
        applyEffects(state, { berries: Math.round((18 + tier * 9) * (battle.boss ? 2 : 1)), bounty: Math.round(600_000 * bountyScale(tier) * (battle.boss ? 3 : 1)), morale: 4 });
        log(state, battleOutcome(battle.arcId, battle.battleId) || 'The crew wins the day.');
        clearAndReturn(state, node.id);
      } else {
        // A lost fight is a retreat, not the end of the voyage; the stop stays open to retry.
        // Retreat patches the crew up enough to try again, so a hard fight is a wall to climb, not a loop.
        state.crew = state.crew.map((m) => ({ ...m, hp: Math.max(m.hp, Math.round(m.maxHp * .75)) }));
        applyEffects(state, { hull: -10, berries: -Math.round(state.berries * .25), morale: state.mode === 'standard' ? -15 : -5 });
        state.retreats = { ...state.retreats, [node.id]: (state.retreats?.[node.id] ?? 0) + 1 };
        state.at = previousStop(state, node);
        state.phase = { type: 'map' };
        log(state, 'The crew falls back to lick its wounds. The fight is still there when they are ready.');
      }
    }
  } else if (action.type === 'next-saga' && phase.type === 'saga-end') {
    const next = nextSaga(state);
    if (!next) return input;
    // Between sagas the crew rests and grows into the next stretch of the story.
    const first = sagaArcs(next, state.through)[0];
    const tier = arcTier(first.id);
    state.sagasDone = [...(state.sagasDone ?? []), state.sagaId];
    state.sagaId = next;
    state.chart = buildChart(next, state.through, (state.seed + state.sagasDone.length * 7919) >>> 0);
    state.at = null;
    state.cleared = [];
    state.retreats = {};
    state.crew = state.crew.map((m) => memberAt(m.id, tier));
    state.food = Math.max(state.food, 4);
    state.ship = { ...state.ship, hull: state.ship.maxHull };
    state.phase = { type: 'map' };
    log(state, `On to the ${sagas.find((s) => s.id === next)?.name} saga. The crew is rested and stronger for what came before.`);
  } else if (phase.type === 'battle' && !phase.battle.result) {
    const battle = phase.battle;
    if (action.type === 'plan' && canAct(battle, action.action)) {
      const planned = battle.planned.filter((p) => p.actorId !== action.action.actorId);
      if (planned.length >= maxActions(battle)) planned.shift();
      state.phase = { type: 'battle', battle: { ...battle, planned: [...planned, action.action] } };
    } else if (action.type === 'unplan') {
      state.phase = { type: 'battle', battle: { ...battle, planned: battle.planned.filter((p) => p.actorId !== action.actorId) } };
    } else if (action.type === 'fight' && battle.planned.length) {
      const { battle: next, berries } = resolveRound(battle, dice);
      if (berries) state.berries += Math.round(berries * priceScale(arcTier(battle.arcId)));
      state.phase = { type: 'battle', battle: next };
    } else return input;
  } else if (phase.type === 'port') {
    if (action.type === 'buy') {
      const item = PORT_ITEMS.find((i) => i.id === action.itemId);
      const cost = item ? priceOf(state, item.cost) : 0;
      if (!item || state.berries < cost || phase.bought.includes(item.id)) return input;
      state.berries -= cost;
      if (item.id === 'food') state.food += 3;
      if (item.id === 'repair') state.ship = { ...state.ship, hull: Math.min(state.ship.maxHull, state.ship.hull + Math.round(state.ship.maxHull * .4)) };
      if (item.id === 'inn') state.crew = state.crew.map((m) => ({ ...m, hp: m.maxHp }));
      if (item.id === 'feast') { state.morale = Math.min(100, state.morale + 20); state.food += 1; }
      state.phase = { ...phase, bought: [...phase.bought, item.id] };
      log(state, `Bought: ${item.label}.`);
    } else if (action.type === 'leave') clearAndReturn(state, phase.nodeId);
    else return input;
  } else return input;

  state.rng = dice.state;
  return state;
}

/** After a retreat the ship falls back to the stop before the fight, so the fight is next again. */
function previousStop(state: GameState, node: ChartNode): string | null {
  const before = state.chart.nodes.filter((n) => n.column === node.column - 1 && state.cleared.includes(n.id));
  return before[0]?.id ?? null;
}
