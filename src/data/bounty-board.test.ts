import { describe, expect, it } from 'vitest';
import { buildReaderCatalog } from './reader-catalog';
import { buildBountyBoard, crewTotal, shortBerries } from './bounty-board';
import { coverage } from './coverage';

describe('bounty board', () => {
  it('ranks everyone with a bounty by their latest figure', () => {
    const rows = buildBountyBoard(buildReaderCatalog(null).characters);
    expect(rows.length).toBeGreaterThan(40);
    for (let i = 1; i < rows.length; i++) expect(rows[i - 1].current.value).toBeGreaterThanOrEqual(rows[i].current.value);
    expect(rows[0].rank).toBe(1);
    expect(rows.every((r) => r.current.chapter <= coverage.coveredThrough)).toBe(true);
    const law = rows.find((r) => r.character.id === 'law')!;
    const kid = rows.find((r) => r.character.id === 'kid')!;
    expect(law.rank).toBe(kid.rank);
  });

  it('shows only what the reader has reached', () => {
    const early = buildBountyBoard(buildReaderCatalog(105).characters);
    expect(early.length).toBeGreaterThan(0);
    expect(early.every((r) => r.history.every((p) => p.chapter <= 105))).toBe(true);
    expect(early.some((r) => r.character.id === 'luffy')).toBe(true);
    expect(early.some((r) => r.character.id === 'shanks')).toBe(false);
    expect(buildBountyBoard(buildReaderCatalog(0).characters)).toEqual([]);
  });

  it('totals the crew only from bounties already shown', () => {
    const rows = buildBountyBoard(buildReaderCatalog(null).characters);
    const total = crewTotal(rows);
    for (let i = 1; i < total.length; i++) expect(total[i].chapter).toBeGreaterThan(total[i - 1].chapter);
    const last = total.at(-1)!;
    expect(last.total).toBe(rows.filter((r) => r.strawHat).reduce((n, r) => n + r.current.value, 0));
  });

  it('writes short berry figures', () => {
    expect(shortBerries(3_000_000_000)).toBe('฿3B');
    expect(shortBerries(10_000_000_000)).toBe('฿10B');
    expect(shortBerries(100_000_000)).toBe('฿100M');
    expect(shortBerries(5_564_800_000)).toBe('฿5.56B');
    expect(shortBerries(440_000_000)).toBe('฿440M');
    expect(shortBerries(1_500_000)).toBe('฿1.5M');
    expect(shortBerries(50)).toBe('฿50');
  });
});
