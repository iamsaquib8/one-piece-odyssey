import { describe, expect, it } from 'vitest';
import { newGame, step, reachable, eventFor, nodeById } from './engine';
import { autoPlan } from './combat';
import { buildChart } from './content';
import { decodeVoyage } from './save';
import { seedFrom } from './rng';
import { arcs } from '../data/arcs';
import type { GameAction, GameState } from './types';

/** A simple player: first choice, calm water, auto battles, an inn when it can afford one. */
function botAction(state: GameState, pick: (n: number) => number): GameAction | null {
  const phase = state.phase;
  if (phase.type === 'map') { const options = reachable(state); return options.length ? { type: 'sail', nodeId: options[pick(options.length)].id } : null; }
  if (phase.type === 'event') return phase.outcome ? { type: 'continue' } : { type: 'choose', choiceId: eventFor(state, nodeById(state, phase.nodeId)!).choices[pick(2)]?.id ?? 'x' };
  if (phase.type === 'recruit') return { type: 'continue' };
  if (phase.type === 'port') return !phase.bought.includes('inn') && state.berries >= 80 ? { type: 'buy', itemId: 'inn' } : { type: 'leave' };
  if (phase.type === 'battle') {
    if (phase.battle.result) return { type: 'continue' };
    const plan = autoPlan(phase.battle);
    const missing = plan.find((p) => !phase.battle.planned.some((q) => q.actorId === p.actorId));
    return missing ? { type: 'plan', action: missing } : { type: 'fight' };
  }
  return null;
}

function play(seed: number, mode: 'story' | 'standard', pick: (n: number) => number = () => 0, cap = 6000) {
  let state = newGame(seed, mode, null);
  const actions: GameAction[] = [];
  while (state.phase.type !== 'saga-end' && actions.length < cap) {
    const action = botAction(state, pick);
    if (!action) break;
    actions.push(action);
    const next = step(state, action);
    if (next === state) break;
    state = next;
  }
  return { state, actions };
}

describe('voyage engine', () => {
  it('builds an East Blue chart from every arc in the saga, each ending on its real final battle', () => {
    const chart = buildChart('east-blue', null, 1);
    const eastBlue = arcs.filter((a) => a.sagaId === 'east-blue');
    for (const arc of eastBlue) {
      const boss = chart.nodes.find((n) => n.arcId === arc.id && n.kind === 'boss');
      expect(boss?.battleId, arc.id).toBe(arc.battles.at(-1)!.id);
    }
    for (let c = 0; c < chart.columns; c++) expect(chart.nodes.some((n) => n.column === c), `column ${c}`).toBe(true);
    expect(chart.nodes.filter((n) => n.kind === 'recruit').map((n) => n.recruitId).sort()).toEqual(['nami', 'sanji', 'usopp', 'zoro']);
  });

  it('replays identically from the same seed and actions', () => {
    const { state, actions } = play(seedFrom('replay'), 'standard');
    let replay = newGame(seedFrom('replay'), 'standard', null);
    for (const action of actions) replay = step(replay, action);
    expect(replay).toEqual(state);
  });

  it('can be finished: a simple bot reaches the end of East Blue with the whole crew and the Merry', () => {
    for (const seed of [1, 2, 3, 42, 1999]) {
      const { state, actions } = play(seed, 'standard');
      expect(state.phase.type, `seed ${seed}`).toBe('saga-end');
      expect(state.crew.map((m) => m.id).sort()).toEqual(['luffy', 'nami', 'sanji', 'usopp', 'zoro']);
      expect(state.ship.kind).toBe('merry');
      expect(actions.length).toBeLessThan(6000);
    }
  });

  it('never mutates the state it is given', () => {
    const start = newGame(7, 'story', null);
    const frozen = JSON.stringify(start);
    step(start, { type: 'sail', nodeId: reachable(start)[0].id });
    expect(JSON.stringify(start)).toBe(frozen);
  });

  it('ignores actions that do not fit the moment', () => {
    const start = newGame(7, 'story', null);
    expect(step(start, { type: 'fight' })).toBe(start);
    expect(step(start, { type: 'sail', nodeId: 'nowhere' })).toBe(start);
  });

  it('keeps a reader’s progress: a limited voyage only charts arcs they have finished', () => {
    const chart = buildChart('east-blue', 41, 1);
    expect(new Set(chart.nodes.map((n) => n.arcId))).toEqual(new Set(['romance-dawn', 'orange-town', 'syrup-village']));
  });
});

describe('voyage save', () => {
  it('round-trips a voyage and rejects anything it cannot trust', () => {
    const { state } = play(5, 'story', () => 0, 200);
    expect(decodeVoyage(JSON.stringify(state))).toEqual(state);
    for (const bad of [null, '', '{', '{"version":2}', JSON.stringify({ ...state, crew: [{ id: 'buggy', hp: 1, maxHp: 1 }] }), JSON.stringify({ ...state, berries: 'lots' }), 'x'.repeat(300_000)]) expect(decodeVoyage(bad)).toBeNull();
  });
});
