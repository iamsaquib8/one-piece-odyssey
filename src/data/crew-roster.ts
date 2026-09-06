/*
 * Derived roster facts for the arc reader. Nothing here is authored twice: the crew aboard during an
 * arc follows from each Straw Hat's recruitment arc, and bounty changes come from the chapter numbers
 * already recorded on each character's bounty history.
 */
import type { Arc, Character } from '../types';

export interface RosterEntry { character: Character; joins: boolean }
export interface BountyChange { character: Character; amount: string; after: string; previous?: string }

/** Members who sail with the crew before formally joining: the arc they first come aboard. */
const ABOARD_FROM: Record<string, string> = { nami: 'orange-town' };

/** Straw Hats aboard during `arc`, in the order they came aboard. `joins` marks the arc where membership becomes official. */
export function crewAboard(arc: Pick<Arc, 'id'>, arcs: Pick<Arc, 'id'>[], characters: Character[]): RosterEntry[] {
  const order = new Map(arcs.map((a, i) => [a.id, i]));
  const here = order.get(arc.id);
  if (here === undefined) return [];
  const since = (c: Character) => order.get(ABOARD_FROM[c.id] || c.arcId) ?? Infinity;
  return characters
    .filter((c) => since(c) <= here)
    .sort((a, b) => since(a) - since(b))
    .map((c) => ({ character: c, joins: c.arcId === arc.id }));
}

const chapterOf = (after: string): number | undefined => {
  const m = after.match(/(\d{1,4})\s*$/);
  return m ? Number(m[1]) : undefined;
};

/** Bounties first shown inside the arc's chapter span. */
export function bountyChanges(arc: Pick<Arc, 'chapters'>, characters: Character[]): BountyChange[] {
  const [from, to] = arc.chapters;
  const out: BountyChange[] = [];
  for (const c of characters) {
    c.bounties.forEach((b, i) => {
      const ch = chapterOf(b.after);
      if (ch !== undefined && ch >= from && ch <= to) out.push({ character: c, amount: b.amount, after: b.after, previous: c.bounties[i - 1]?.amount });
    });
  }
  return out;
}

export const formatBerries = (amount: string): string => `฿${amount}`;
