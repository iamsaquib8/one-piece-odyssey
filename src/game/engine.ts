// The voyage as a reducer: step(state, action) returns the next state and never mutates its input.
// All randomness flows through state.rng, so a seed and a list of actions replay exactly.
import { stagingAtProgress } from '../data/spoiler-overrides';
import { arcs } from '../data/arcs';
import { buildChart, arcTier, nodesIn } from './content';
import { CREW } from './crew';
import { islandChoices, seaEvent, PORT_ITEMS, type ChoiceSpec } from './events';
import { resolveRound, startBattle, canAct, MAX_ACTIONS, battleOutcome } from './combat';
import { Dice } from './rng';
import type { ChartNode, Effects, GameAction, GameState, Mode } from './types';

export const FIRST_SAGA = 'east-blue';

export function newGame(seed: number, mode: Mode, through: number | null, sagaId = FIRST_SAGA): GameState {
  const luffy = CREW.luffy;
  return {
    version: 1, seed, rng: seed, mode, through, sagaId,
    chart: buildChart(sagaId, through, seed),
    at: null, cleared: [],
    crew: [{ id: 'luffy', hp: luffy.hp, maxHp: luffy.hp }],
    ship: { kind: 'dinghy', hull: 40, maxHull: 40 },
    berries: 100, food: 4, morale: 60, bounty: 0,
    phase: { type: 'map' },
    log: ['A boy in a straw hat pushes a rowing boat off the beach at Foosha Village.'],
    turns: 0,
  };
}

export const nodeById = (state: GameState, id: string | null | undefined) => state.chart.nodes.find((n) => n.id === id);
export const currentColumn = (state: GameState) => nodeById(state, state.at)?.column ?? -1;
/** Nodes the ship can sail to next. */
export const reachable = (state: GameState): ChartNode[] => state.phase.type === 'map' ? nodesIn(state.chart, currentColumn(state) + 1) : [];
export const hasCrew = (state: GameState, id: string) => state.crew.some((m) => m.id === id && m.hp > 0);
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
  if (hull < 0 && hasCrew(state, 'nami')) hull = Math.round(hull * .5);
  state.ship = { ...state.ship, hull: Math.max(1, Math.min(state.ship.maxHull, state.ship.hull + hull)) };
  if (effects.heal) state.crew = state.crew.map((m) => ({ ...m, hp: Math.max(1, Math.min(m.maxHp, m.hp + Math.round(m.maxHp * s(effects.heal) / 100))) }));
}

function clearAndReturn(state: GameState, nodeId: string) {
  state.cleared = [...new Set([...state.cleared, nodeId])];
  const node = nodeById(state, nodeId)!;
  state.phase = node.column >= state.chart.columns - 1 ? { type: 'saga-end' } : { type: 'map' };
}

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
    if (node.kind === 'sea') {
      if (state.food > 0) state.food -= 1;
      else { applyEffects(state, { morale: -8, heal: -10 }); log(state, 'No food left for the crossing. Stomachs rumble all the way.'); }
    }
    if (node.kind === 'island' || node.kind === 'sea') state.phase = { type: 'event', nodeId: node.id };
    else if (node.kind === 'port') state.phase = { type: 'port', nodeId: node.id, bought: [] };
    else if (node.kind === 'recruit') state.phase = { type: 'recruit', nodeId: node.id };
    else state.phase = { type: 'battle', battle: startBattle(node.id, node.arcId, node.battleId!, node.kind === 'boss', state.crew, tierOf(node), dice) };
    log(state, `Set course for ${node.title}.`);
  } else if (action.type === 'choose' && phase.type === 'event' && !phase.outcome) {
    const node = nodeById(state, phase.nodeId)!;
    const choice = eventFor(state, node).choices.find((c) => c.id === action.choiceId);
    if (!choice) return input;
    const outcome = choice.resolve(dice, { hasCrew: (id) => hasCrew(state, id), rough: !!node.rough });
    applyEffects(state, outcome.effects, node.rough ? 1.5 : 1);
    state.phase = { type: 'event', nodeId: node.id, outcome };
    log(state, outcome.text);
  } else if (action.type === 'continue') {
    if (phase.type === 'event' && phase.outcome) clearAndReturn(state, phase.nodeId);
    else if (phase.type === 'recruit') {
      const node = nodeById(state, phase.nodeId)!;
      const spec = CREW[node.recruitId!];
      if (spec && !state.crew.some((m) => m.id === spec.id)) state.crew = [...state.crew, { id: spec.id, hp: spec.hp, maxHp: spec.hp }];
      // Kaya gives the crew the Going Merry when Usopp sails with them.
      if (spec?.id === 'usopp' && state.ship.kind === 'dinghy') { state.ship = { kind: 'merry', hull: 80, maxHull: 80 }; log(state, 'The Going Merry is yours: a caravel with a ram’s head.'); }
      log(state, `${spec?.name ?? 'A new friend'} joins the crew.`);
      clearAndReturn(state, node.id);
    } else if (phase.type === 'battle' && phase.battle.result) {
      const { battle } = phase;
      // Carry the fight's wounds back to the crew sheet.
      state.crew = state.crew.map((m) => { const f = battle.crew.find((c) => c.id === m.id); return f ? { ...m, hp: Math.max(1, f.hp) } : m; });
      const node = nodeById(state, battle.nodeId)!;
      const tier = tierOf(node);
      if (battle.result === 'win') {
        // Rewards sit near the story's scale: the whole of East Blue is worth about 30M in bounty.
        applyEffects(state, { berries: (18 + tier * 9) * (battle.boss ? 2 : 1), bounty: (tier + 1) * 300_000 * (battle.boss ? 3 : 1), morale: 4 });
        log(state, battleOutcome(battle.arcId, battle.battleId) || 'The crew wins the day.');
        clearAndReturn(state, node.id);
      } else {
        // A lost fight is a retreat, not the end of the voyage; the stop stays open to retry.
        // Retreat patches the crew up enough to try again, so a hard fight is a wall to climb, not a loop.
        state.crew = state.crew.map((m) => ({ ...m, hp: Math.max(m.hp, Math.round(m.maxHp * .75)) }));
        applyEffects(state, { hull: -10, berries: -Math.round(state.berries * .25), morale: state.mode === 'standard' ? -15 : -5 });
        state.at = input.phase.type === 'battle' ? previousStop(state, node) : state.at;
        state.phase = { type: 'map' };
        log(state, 'The crew falls back to lick its wounds. The fight is still there when they are ready.');
      }
    }
  } else if (phase.type === 'battle' && !phase.battle.result) {
    const battle = phase.battle;
    if (action.type === 'plan' && canAct(battle, action.action)) {
      const planned = battle.planned.filter((p) => p.actorId !== action.action.actorId);
      if (planned.length >= MAX_ACTIONS) planned.shift();
      state.phase = { type: 'battle', battle: { ...battle, planned: [...planned, action.action] } };
    } else if (action.type === 'unplan') {
      state.phase = { type: 'battle', battle: { ...battle, planned: battle.planned.filter((p) => p.actorId !== action.actorId) } };
    } else if (action.type === 'fight' && battle.planned.length) {
      const { battle: next, berries } = resolveRound(battle, dice);
      if (berries) state.berries += berries;
      state.phase = { type: 'battle', battle: next };
    } else return input;
  } else if (phase.type === 'port') {
    if (action.type === 'buy') {
      const item = PORT_ITEMS.find((i) => i.id === action.itemId);
      if (!item || state.berries < item.cost || phase.bought.includes(item.id)) return input;
      state.berries -= item.cost;
      if (item.id === 'food') state.food += 3;
      if (item.id === 'repair') state.ship = { ...state.ship, hull: Math.min(state.ship.maxHull, state.ship.hull + 30) };
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
