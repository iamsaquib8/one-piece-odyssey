import { describe, expect, test } from 'vitest';
import { arcs } from './arcs';
import { buildMysteries } from './mysteries';

describe('buildMysteries', () => {
  test('keeps every visible clue linked to an authored beat', () => {
    const mysteries = buildMysteries(null);
    expect(mysteries.length).toBeGreaterThanOrEqual(4);
    for (const mystery of mysteries) for (const clue of mystery.clues) {
      const arc = arcs.find((candidate) => candidate.id === clue.arcId);
      expect(arc?.beats.some((beat) => beat.id === clue.beatId), `${clue.arcId}/${clue.beatId}`).toBe(true);
    }
  });

  test('derives resolution only when the resolution clue is visible', () => {
    const early = buildMysteries(105).find((mystery) => mystery.id === 'laboon-promise');
    const resolved = buildMysteries(489).find((mystery) => mystery.id === 'laboon-promise');
    expect(early).toMatchObject({ status: 'open' });
    expect(early?.clues).toHaveLength(2);
    expect(resolved).toMatchObject({ status: 'resolved' });
    expect(resolved?.clues.at(-1)?.isResolution).toBe(true);
  });

  test('does not expose a mystery or clue before its whole arc is readable', () => {
    expect(buildMysteries(100)).toEqual([]);
    expect(buildMysteries(217).find((mystery) => mystery.id === 'stone-language')?.clues).toHaveLength(1);
    expect(buildMysteries(217).flatMap((mystery) => mystery.clues).some((clue) => clue.arcId === 'skypiea')).toBe(false);
  });
});
