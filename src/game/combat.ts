// Turn-based battles. Each round the player plans up to two crew actions; foes have already shown
// what they intend to do. Resolution produces a list of blows that the battle screen plays back
// one at a time, so the simulation and its animation never disagree.
import { stagingFor } from '../data/staging';
import { arcs } from '../data/arcs';
import { CREW } from './crew';
import { Dice } from './rng';
import type { BattleState, Blow, CrewMember, Fighter, Intent, PlannedAction } from './types';
export type { Blow };


export const MAX_ACTIONS = 2;
const STAMINA_START = 2;
const STAMINA_MAX = 4;

const alive = (f: Fighter) => f.hp > 0;

/** Crew stats grow gently with the story's position, so later arcs are not a stat wall. */
export function crewFighter(member: CrewMember, tier: number): Fighter {
  const spec = CREW[member.id];
  return { id: member.id, name: spec.name, side: 'crew', hp: member.hp, maxHp: member.maxHp, atk: Math.round(spec.atk * (1 + tier * .04)), def: spec.def, stamina: STAMINA_START, maxStamina: STAMINA_MAX, guard: 0, weakened: 0 };
}

/** Foes come from the battle's staging; the first of them leads, and a boss lead hits hardest. */
export function buildFoes(arcId: string, battleId: string, tier: number, boss: boolean): Fighter[] {
  const staging = stagingFor(arcId);
  const ids = (staging?.battles[battleId]?.b ?? []).filter((id) => !CREW[id]).slice(0, 3);
  const names = new Map((staging?.cast ?? []).map((c) => [c.id, c.name]));
  const list = ids.length ? ids : ['thug'];
  return list.map((id, i) => {
    const lead = i === 0;
    const hp = Math.round((29 + tier * 5.5) * (boss ? (lead ? 2.5 : 1.15) : lead ? 1.2 : .72));
    const atk = Math.round((5.5 + tier * 1) * (boss && lead ? 1.4 : lead ? 1.1 : .88));
    return { id, name: names.get(id) ?? 'Pirate', side: 'foe' as const, hp, maxHp: hp, atk, def: 1 + Math.floor(tier / 6), stamina: 0, maxStamina: 0, guard: 0, weakened: 0 };
  });
}

/** Foes decide before the player does, and show it: a plain attack, a heavy blow, or a guard. */
export function rollIntents(battle: Pick<BattleState, 'crew' | 'foes'>, dice: Dice): Intent[] {
  const targets = battle.crew.filter(alive);
  return battle.foes.filter(alive).map((foe) => {
    const r = dice.next();
    const kind = r < .6 ? 'attack' : r < .85 ? 'heavy' : 'guard';
    return { foeId: foe.id, kind, targetId: targets.length ? dice.pick(targets).id : '' };
  });
}

export function startBattle(nodeId: string, arcId: string, battleId: string, boss: boolean, crew: CrewMember[], tier: number, dice: Dice): BattleState {
  const fighters = crew.filter((m) => m.hp > 0).map((m) => crewFighter(m, tier));
  const battle: BattleState = { nodeId, arcId, battleId, boss, round: 1, crew: fighters, foes: buildFoes(arcId, battleId, tier, boss), intents: [], planned: [] };
  battle.intents = rollIntents(battle, dice);
  return battle;
}

const damage = (atk: number, mult: number, def: number, guarded: boolean) => Math.max(1, Math.round((atk * mult - def) * (guarded ? .5 : 1)));

/** Whether an actor can take an action this round. */
export function canAct(battle: BattleState, action: PlannedAction): boolean {
  const actor = battle.crew.find((c) => c.id === action.actorId);
  if (!actor || !alive(actor) || battle.result) return false;
  if (action.kind === 'special' && actor.stamina < CREW[actor.id].special.cost) return false;
  return true;
}

/** Resolve one round. Returns the new battle state and the blows, in the order they land. */
export function resolveRound(input: BattleState, dice: Dice): { battle: BattleState; blows: Blow[]; berries: number } {
  const battle: BattleState = structuredClone(input);
  const blows: Blow[] = [];
  let berries = 0;
  const firstFoe = () => battle.foes.find(alive);
  const target = (id?: string) => battle.foes.find((f) => f.id === id && alive(f)) ?? firstFoe();
  const cancelled = new Set<string>();
  // Usopp shoots first: order the plan so his action resolves before anyone else's.
  const plan = [...battle.planned].filter((p) => canAct(battle, p)).sort((a, b) => Number(b.actorId === 'usopp') - Number(a.actorId === 'usopp'));
  const acted = new Set<string>();

  for (const p of plan) {
    const actor = battle.crew.find((c) => c.id === p.actorId)!;
    if (!alive(actor) || !firstFoe()) continue;
    acted.add(actor.id);
    const foe = target(p.targetId)!;
    const foeGuarding = battle.intents.some((i) => i.foeId === foe.id && i.kind === 'guard');
    if (p.kind === 'guard') { actor.guard = 1; actor.stamina = Math.min(actor.maxStamina, actor.stamina + 1); blows.push({ actorId: actor.id, side: 'a', amount: 0, kind: 'guard', label: `${actor.name} braces` }); continue; }
    if (p.kind === 'attack') {
      const crit = dice.chance(.12);
      const amount = damage(actor.atk, crit ? 1.6 : 1, foe.def, foeGuarding);
      foe.hp = Math.max(0, foe.hp - amount);
      blows.push({ actorId: actor.id, targetId: foe.id, side: 'a', amount, kind: crit ? 'crit' : 'hit', label: `${actor.name} hits ${foe.name}${crit ? ' — critical!' : ''}`, impact: crit ? 'CRITICAL!' : dice.pick(['WHAM!', 'BAM!', 'THWACK!']) });
      continue;
    }
    const spec = CREW[actor.id].special;
    actor.stamina -= spec.cost;
    const hit = (f: Fighter, mult: number) => { const amount = damage(actor.atk, mult, f.def, battle.intents.some((i) => i.foeId === f.id && i.kind === 'guard')); f.hp = Math.max(0, f.hp - amount); return amount; };
    if (actor.id === 'zoro') {
      for (const f of battle.foes.filter(alive)) blows.push({ actorId: actor.id, targetId: f.id, side: 'a', amount: hit(f, 1.2), kind: 'special', label: `${spec.name} cuts ${f.name}`, impact: 'SLASH!' });
    } else if (actor.id === 'nami') {
      const amount = hit(foe, .6);
      foe.weakened = 2;
      const stolen = dice.int(15, 40);
      berries += stolen;
      blows.push({ actorId: actor.id, targetId: foe.id, side: 'a', amount, kind: 'steal', label: `${spec.name}: ${foe.name} is weakened, ฿${stolen} lifted`, impact: 'SWIPE!' });
    } else if (actor.id === 'usopp') {
      const amount = hit(foe, 1.3);
      cancelled.add(foe.id);
      blows.push({ actorId: actor.id, targetId: foe.id, side: 'a', amount, kind: 'special', label: `${spec.name} stuns ${foe.name}`, impact: 'POW!' });
    } else {
      const amount = hit(foe, actor.id === 'luffy' ? 2 : 1.8);
      blows.push({ actorId: actor.id, targetId: foe.id, side: 'a', amount, kind: 'special', label: `${spec.name} on ${foe.name}`, impact: actor.id === 'luffy' ? 'GUM-GUM!' : 'CRUNCH!' });
    }
  }

  // Foes act on their shown intents, unless knocked out or stunned first.
  for (const intent of battle.intents) {
    const foe = battle.foes.find((f) => f.id === intent.foeId)!;
    if (!alive(foe) || cancelled.has(foe.id) || intent.kind === 'guard') { if (alive(foe) && intent.kind === 'guard') blows.push({ actorId: foe.id, side: 'b', amount: 0, kind: 'guard', label: `${foe.name} guards` }); continue; }
    const living = battle.crew.filter(alive);
    if (!living.length) break;
    const victim = living.find((c) => c.id === intent.targetId) ?? dice.pick(living);
    const atk = foe.atk * (foe.weakened ? .6 : 1);
    const dodge = dice.chance(.08);
    if (dodge) { blows.push({ actorId: foe.id, targetId: victim.id, side: 'b', amount: 0, kind: 'miss', label: `${victim.name} dodges ${foe.name}` }); continue; }
    const amount = damage(atk, intent.kind === 'heavy' ? 1.8 : 1, victim.def, victim.guard > 0);
    victim.hp = Math.max(0, victim.hp - amount);
    blows.push({ actorId: foe.id, targetId: victim.id, side: 'b', amount, kind: intent.kind === 'heavy' ? 'heavy' : 'hit', label: `${foe.name} ${intent.kind === 'heavy' ? 'slams' : 'hits'} ${victim.name}`, impact: intent.kind === 'heavy' ? 'DOOM!' : 'CLASH!' });
  }

  // End of round: guards drop, weakness wears off, idle crew catch their breath.
  for (const c of battle.crew) { c.guard = 0; c.stamina = Math.min(c.maxStamina, c.stamina + (acted.has(c.id) ? 1 : 2)); }
  for (const f of battle.foes) f.weakened = Math.max(0, f.weakened - 1);
  battle.planned = [];
  battle.round += 1;
  if (!battle.foes.some(alive)) battle.result = 'win';
  else if (!battle.crew.some(alive)) battle.result = 'lose';
  else battle.intents = rollIntents(battle, dice);
  const last = blows.filter((b) => b.amount > 0).at(-1);
  if (last) battle.lastHit = { side: last.side, impact: last.impact ?? 'WHAM!', key: (input.lastHit?.key ?? 0) + 1 };
  battle.blows = blows;
  return { battle, blows, berries };
}

/** A sensible plan for the Auto button and for the balance bot: specials when affordable, on the weakest foe. */
export function autoPlan(battle: BattleState): PlannedAction[] {
  const weakest = [...battle.foes.filter(alive)].sort((a, b) => a.hp - b.hp)[0];
  const crew = [...battle.crew.filter(alive)].sort((a, b) => b.atk - a.atk);
  return crew.slice(0, MAX_ACTIONS).map((c) => {
    const low = c.hp < c.maxHp * .3;
    if (low && c.stamina < CREW[c.id].special.cost) return { actorId: c.id, kind: 'guard' as const };
    return { actorId: c.id, kind: c.stamina >= CREW[c.id].special.cost ? 'special' as const : 'attack' as const, targetId: weakest?.id };
  });
}

/** The battle's real story outcome line, shown when the crew wins. */
export const battleOutcome = (arcId: string, battleId: string) => arcs.find((a) => a.id === arcId)?.battles.find((b) => b.id === battleId)?.outcome ?? '';
