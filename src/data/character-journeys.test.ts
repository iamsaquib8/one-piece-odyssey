import { describe, expect, test } from 'vitest';
import { arcs } from './arcs';
import { buildCharacterJourney } from './character-journeys';

describe('buildCharacterJourney', () => {
  test('orders staged moments by story chronology and points at real arc content', () => {
    const journey = buildCharacterJourney('zoro', null);
    expect(journey.length).toBeGreaterThan(10);
    expect(journey.map((entry) => entry.chapterStart)).toEqual(
      journey.map((entry) => entry.chapterStart).slice().sort((a, b) => a - b),
    );
    for (const entry of journey) {
      const arc = arcs.find((candidate) => candidate.id === entry.arcId);
      expect(arc, entry.arcId).toBeDefined();
      if (entry.kind === 'moment') expect(arc?.beats.some((beat) => beat.id === entry.targetId), entry.targetId).toBe(true);
      if (entry.kind === 'battle') expect(arc?.battles.some((battle) => battle.id === entry.targetId), entry.targetId).toBe(true);
    }
  });

  test('resolves Miss All Sunday appearances to Robin without guessing names', () => {
    expect(buildCharacterJourney('robin', 154).some((entry) =>
      entry.arcId === 'whisky-peak' && entry.targetId === 'a-dangerous-farewell',
    )).toBe(true);
  });

  test('resolves Jinbe’s staging identity before Whole Cake Island', () => {
    expect(buildCharacterJourney('jinbe', 549).some((entry) =>
      entry.arcId === 'impel-down' && entry.targetId === 'the-breakout',
    )).toBe(true);
  });

  test('omits arcs and bounty changes beyond a completed reading horizon', () => {
    const journey = buildCharacterJourney('luffy', 100);
    expect(journey.every((entry) => entry.chapterStart <= 100)).toBe(true);
    expect(journey.filter((entry) => entry.kind === 'bounty').map((entry) => entry.title)).toEqual(['30,000,000 berries']);
    expect(journey.some((entry) => entry.arcId === 'reverse-mountain')).toBe(false);
  });

  test('links bounty chapters to the arc that contains the reveal', () => {
    for (const characterId of ['luffy', 'zoro', 'nami', 'sanji', 'robin']) {
      for (const entry of buildCharacterJourney(characterId, null).filter((candidate) => candidate.kind === 'bounty')) {
        const arc = arcs.find((candidate) => candidate.id === entry.arcId);
        expect(entry.chapterStart, `${characterId}: ${entry.title} -> ${entry.arcId}`).toBeGreaterThanOrEqual(arc?.chapters[0] ?? Infinity);
        expect(entry.chapterStart, `${characterId}: ${entry.title} -> ${entry.arcId}`).toBeLessThanOrEqual(arc?.chapters[1] ?? -Infinity);
      }
    }
    expect(buildCharacterJourney('luffy', null).find((entry) => entry.kind === 'bounty' && entry.chapterStart === 96)?.arcId).toBe('loguetown');
    expect(buildCharacterJourney('sanji', null).find((entry) => entry.kind === 'bounty' && entry.chapterStart === 1058)?.arcId).toBe('egghead');
  });

  test('returns no trail for an unknown character', () => {
    expect(buildCharacterJourney('not-a-character', null)).toEqual([]);
  });
});
