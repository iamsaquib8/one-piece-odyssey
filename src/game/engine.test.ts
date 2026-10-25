import { describe, expect, it } from 'vitest';
import { newGame, step, reachable, eventFor, nodeById, nextSaga } from './engine';
import { autoPlan, startBattle } from './combat';
import { specialFor } from './crew';
import { Dice } from './rng';
import { buildChart } from './content';
import { decodeVoyage } from './save';
import { EMPTY_LOGBOOK, decodeLogbook, record, startingSagas } from './logbook';
import { seedFrom } from './rng';
import { arcs } from '../data/arcs';
import { sagas } from '../data/sagas';
import type { GameAction, GameState } from './types';

/** A simple player: first choice, calm water, auto battles, an inn when it can afford one. */
function botAction(state: GameState, pick: (n: number) => number, campaign = false): GameAction | null {
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
  if (phase.type === 'saga-end' && campaign) return nextSaga(state) ? { type: 'next-saga' } : null;
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

describe('voyage campaign', () => {
  it('sails the whole story: every saga in order, the full crew and the Sunny, a bounty in the billions', () => {
    for (const seed of [11, 12]) {
      let state = newGame(seed, 'standard', null);
      const sagasSeen = [state.sagaId];
      const losses: Record<string, number> = {};
      for (let i = 0; i < 20000 && !(state.phase.type === 'saga-end' && !nextSaga(state)); i++) {
        const action = botAction(state, () => 0, true)!;
        if (state.phase.type === 'battle' && state.phase.battle.result === 'lose') losses[state.sagaId] = (losses[state.sagaId] ?? 0) + 1;
        const next = step(state, action);
        expect(next, `seed ${seed} stuck on ${JSON.stringify(action)}`).not.toBe(state);
        state = next;
        if (state.sagaId !== sagasSeen.at(-1)) sagasSeen.push(state.sagaId);
      }
      expect(state.phase.type).toBe('saga-end');
      expect(sagasSeen).toEqual(sagas.map((s) => s.id));
      expect(state.crew.map((m) => m.id).sort()).toEqual(['brook', 'chopper', 'franky', 'jinbe', 'luffy', 'nami', 'robin', 'sanji', 'usopp', 'zoro']);
      expect(state.ship.kind).toBe('sunny');
      expect(state.bounty).toBeGreaterThan(1e9);
      expect(state.bounty).toBeLessThan(1e10);
      // Hard stretches exist (Luffy fights alone through the Summit War), but no saga is a wall.
      for (const [saga, count] of Object.entries(losses)) expect(count, saga).toBeLessThan(10);
    }
  }, 60_000);

  it('only sails on to sagas the reader has reached', () => {
    expect(nextSaga({ sagaId: 'east-blue', through: 100 })).toBeUndefined();
    expect(nextSaga({ sagaId: 'east-blue', through: 105 })).toBe('alabasta');
    expect(nextSaga({ sagaId: 'elbaf', through: null })).toBeUndefined();
  });

  it('starts a later saga with everyone who joined before it, on their ship', () => {
    const wano = newGame(3, 'story', null, 'wano');
    expect(wano.crew).toHaveLength(10);
    expect(wano.ship.kind).toBe('sunny');
    expect(wano.crew[0].maxHp).toBeGreaterThan(60);
    const alabasta = newGame(3, 'story', null, 'alabasta');
    expect(alabasta.crew.map((m) => m.id)).toEqual(['luffy', 'zoro', 'nami', 'usopp', 'sanji']);
    expect(alabasta.ship.kind).toBe('merry');
  });

  it('scatters the crew after Sabaody: Luffy fights the Summit War with the story’s allies', () => {
    const state = newGame(4, 'standard', null, 'summit-war');
    const node = state.chart.nodes.find((n) => n.arcId === 'impel-down' && n.battleId)!;
    const battle = startBattle(node.id, node.arcId, node.battleId!, false, state.crew.filter((m) => m.id === 'luffy'), 20, new Dice(1));
    expect(battle.crew[0].id).toBe('luffy');
    expect(battle.crew.slice(1).every((f) => f.guest)).toBe(true);
  });

  it('grows Luffy’s special with the story', () => {
    expect(specialFor('luffy', 'romance-dawn').name).toBe('Gum-Gum Pistol');
    expect(specialFor('luffy', 'enies-lobby').name).toMatch(/Gear Second/);
    expect(specialFor('luffy', 'dressrosa').name).toMatch(/Gear Fourth/);
    expect(specialFor('luffy', 'egghead').name).toMatch(/Gear Fifth/);
  });
});

describe('voyage save', () => {
  it('round-trips a voyage and rejects anything it cannot trust', () => {
    const { state } = play(5, 'story', () => 0, 200);
    expect(decodeVoyage(JSON.stringify(state))).toEqual(state);
    for (const bad of [null, '', '{', '{"version":2}', JSON.stringify({ ...state, crew: [{ id: 'buggy', hp: 1, maxHp: 1 }] }), JSON.stringify({ ...state, berries: 'lots' }), 'x'.repeat(300_000)]) expect(decodeVoyage(bad)).toBeNull();
  });
});

describe('voyage logbook', () => {
  it('remembers finished sagas and won fights, and unlocks the next saga as a start', () => {
    const { state } = play(1, 'standard');
    const book = record(EMPTY_LOGBOOK, state);
    expect(book.sagas).toEqual(['east-blue']);
    expect(book.battles.length).toBeGreaterThan(10);
    expect(record(book, state)).toBe(book);
    expect(startingSagas(book)).toEqual(['east-blue', 'alabasta']);
    expect(decodeLogbook(JSON.stringify(book))).toEqual(book);
    for (const bad of [null, '{', '{"version":1,"sagas":["nowhere"],"battles":[],"crew":[],"bestBounty":0,"voyages":0}', JSON.stringify({ ...book, crew: ['buggy'] })]) expect(decodeLogbook(bad)).toEqual(EMPTY_LOGBOOK);
  });
});
