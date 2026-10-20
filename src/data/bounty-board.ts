import type { Character } from '../types';
import { bountyChapter, bountyValue } from './bounties';
import { characters as strawHats } from './characters';

export interface BountyPoint { amount: string; value: number; chapter: number; label: string }
export interface BountyRow { character: Character; current: BountyPoint; history: BountyPoint[]; strawHat: boolean; rank: number }

const strawHatIds = new Set(strawHats.map((c) => c.id));

const point = (b: Character['bounties'][number]): BountyPoint | undefined => {
  const chapter = bountyChapter(b.after);
  return chapter === undefined ? undefined : { amount: b.amount, value: bountyValue(b.amount), chapter, label: b.after.replace(/\s*[·;]\s*(?:shown |revealed )?\d+\s*$/, '').trim() };
};

/**
 * Everyone with a bounty the reader may see, highest current bounty first. Takes the reader
 * catalog's characters, which have already dropped people and bounties beyond the reader's
 * progress, so the board never needs to know the spoiler rules itself.
 */
export function buildBountyBoard(characters: Character[]): BountyRow[] {
  const rows = characters.flatMap((character) => {
    const history = character.bounties.map(point).filter((p): p is BountyPoint => !!p);
    const current = history.at(-1);
    return current ? [{ character, current, history, strawHat: strawHatIds.has(character.id), rank: 0 }] : [];
  });
  rows.sort((a, b) => b.current.value - a.current.value || a.character.name.localeCompare(b.character.name));
  // Equal bounties share a rank, as a wanted board would print them.
  rows.forEach((row, i) => { row.rank = i > 0 && rows[i - 1].current.value === row.current.value ? rows[i - 1].rank : i + 1; });
  return rows;
}

/** The Straw Hats' combined bounty after each chapter where any of theirs changed. */
export function crewTotal(rows: BountyRow[]): { chapter: number; total: number }[] {
  const crew = rows.filter((r) => r.strawHat);
  const chapters = [...new Set(crew.flatMap((r) => r.history.map((p) => p.chapter)))].sort((a, b) => a - b);
  return chapters.map((chapter) => ({
    chapter,
    total: crew.reduce((sum, r) => sum + (r.history.filter((p) => p.chapter <= chapter).at(-1)?.value ?? 0), 0),
  }));
}

/** ฿3.0B, ฿440M, ฿50: short enough for an axis or a tooltip. */
export function shortBerries(value: number): string {
  const trim = (n: number, digits: number) => String(Number(n.toFixed(digits)));
  if (value >= 1e9) return `฿${trim(value / 1e9, value >= 1e10 ? 1 : 2)}B`;
  if (value >= 1e6) return `฿${trim(value / 1e6, 1)}M`;
  if (value >= 1e3) return `฿${Math.round(value / 1e3)}K`;
  return `฿${value}`;
}
