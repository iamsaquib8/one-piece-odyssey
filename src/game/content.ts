// Builds a saga's chart from the story data: each arc becomes a run of columns on its own islands
// (an arrival, a few beats and battles, a recruit where a Straw Hat joins, then the arc's last
// battle as its boss), with a forked crossing of open sea between arcs.
import { arcs as allArcs } from '../data/arcs';
import { stagingAtProgress, arcAtProgress } from '../data/spoiler-overrides';
import { isArcVisible } from '../reading-horizon';
import { characters as strawHats } from '../data/characters';
import { crewAboard } from '../data/crew-roster';
import type { Arc } from '../types';
import { Dice } from './rng';
import { SEA_EVENTS } from './events';
import { CREW } from './crew';
import type { Chart, ChartNode } from './types';

/** Arcs of a saga the reader may see, already filtered for their progress. */
export function sagaArcs(sagaId: string, through: number | null): Arc[] {
  return allArcs.filter((a) => a.sagaId === sagaId && isArcVisible(a, through)).map((a) => arcAtProgress(a, through));
}

/** The arc in which each playable Straw Hat first sails with the crew. */
export function joinArcs(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const arc of allArcs) for (const { character } of crewAboard(arc, allArcs, strawHats)) if (!out[character.id] && CREW[character.id]) out[character.id] = arc.id;
  return out;
}

export { arcTier } from './tiers';

export function buildChart(sagaId: string, through: number | null, seed: number): Chart {
  const dice = new Dice(seed);
  const arcs = sagaArcs(sagaId, through);
  const joins = joinArcs();
  const nodes: ChartNode[] = [];
  let column = 0;
  const add = (node: Omit<ChartNode, 'column' | 'lane'>, lane = 0) => nodes.push({ ...node, column, lane });
  const seaPool = [...SEA_EVENTS];

  arcs.forEach((arc, arcIndex) => {
    const staging = stagingAtProgress(arc.id, through);
    const beatLocation = (beatId: string) => staging?.beats[beatId]?.location;
    const home = arc.locationIds[0];
    const [arrival, ...rest] = arc.beats;
    const finale = arc.battles.at(-1)!;
    add({ id: `${arc.id}:arrive`, kind: 'island', arcId: arc.id, title: arrival.title, beatId: arrival.id, locationId: beatLocation(arrival.id) ?? home });
    column++;
    // Up to three middle stops: the arc's other battles first, then its beats, in story order.
    const middle = [
      ...arc.battles.slice(0, -1).map((b) => ({ kind: 'battle' as const, id: b.id, title: b.title })),
      ...rest.slice(0, -1).filter((_, i) => i % 2 === 0).map((b) => ({ kind: 'island' as const, id: b.id, title: b.title })),
    ].slice(0, 3);
    for (const stop of middle) {
      if (stop.kind === 'battle') add({ id: `${arc.id}:${stop.id}`, kind: 'battle', arcId: arc.id, title: stop.title, battleId: stop.id, locationId: home });
      else add({ id: `${arc.id}:${stop.id}`, kind: 'island', arcId: arc.id, title: stop.title, beatId: stop.id, locationId: beatLocation(stop.id) ?? home });
      column++;
    }
    for (const [memberId, joinArc] of Object.entries(joins)) {
      if (joinArc !== arc.id || memberId === 'luffy') continue;
      add({ id: `${arc.id}:recruit-${memberId}`, kind: 'recruit', arcId: arc.id, title: `${CREW[memberId].name} joins`, recruitId: memberId, locationId: home });
      column++;
    }
    add({ id: `${arc.id}:boss`, kind: 'boss', arcId: arc.id, title: finale.title, battleId: finale.id, locationId: home });
    column++;
    if (arcIndex === arcs.length - 1) return;
    // The crossing to the next arc forks: a calm passage or rough water that pays better.
    const calm = seaPool.splice(dice.int(0, seaPool.length - 1), 1)[0] ?? SEA_EVENTS[0];
    const rough = seaPool.splice(dice.int(0, Math.max(0, seaPool.length - 1)), 1)[0] ?? SEA_EVENTS[1];
    if (!seaPool.length) seaPool.push(...SEA_EVENTS);
    add({ id: `${arc.id}:sea-calm`, kind: 'sea', arcId: arc.id, title: calm.title, seaEventId: calm.id }, 0);
    add({ id: `${arc.id}:sea-rough`, kind: 'sea', arcId: arc.id, title: rough.title, seaEventId: rough.id, rough: true }, 1);
    column++;
    // A port every other crossing, so the crew can resupply without it becoming a routine.
    if (arcIndex % 2 === 1) { add({ id: `${arc.id}:port`, kind: 'port', arcId: arc.id, title: 'A harbour town' }); column++; }
  });
  return { sagaId, nodes, columns: column };
}

export const nodesIn = (chart: Chart, column: number) => chart.nodes.filter((n) => n.column === column);
