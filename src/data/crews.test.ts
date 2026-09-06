import { describe, expect, it } from 'vitest';
import { arcs } from './arcs';
import { characters } from './characters';
import { crewFirstAppearance, crews } from './crews';
import { allCharactersWithPortraits, animatedPortraitIds, otherCharacters } from './other-characters';

describe('crew registry', () => {
  it('keeps a broad, uniquely identified relevance catalog', () => {
    expect(crews.length).toBeGreaterThanOrEqual(35);
    expect(new Set(crews.map((crew) => crew.id)).size).toBe(crews.length);
    expect(new Set(allCharactersWithPortraits.map((character) => character.id)).size).toBe(allCharactersWithPortraits.length);
    expect(crews[0]?.id).toBe('straw-hat');
    expect(crews.every((crew) => crew.relevance > 0 && crew.id in crewFirstAppearance)).toBe(true);
    expect(allCharactersWithPortraits.every((character) => character.animatedPortrait)).toBe(true);
  });

  it('resolves every member and story reference', () => {
    const characterIds = new Set([...characters, ...otherCharacters].map((character) => character.id));
    const arcIds = new Set(arcs.map((arc) => arc.id));
    const referencedCharacters = crews.flatMap((crew) => [crew.captain, ...crew.memberIds]);

    expect(referencedCharacters.filter((id) => !characterIds.has(id))).toEqual([]);
    expect(crews.flatMap((crew) => crew.arcIds).filter((id) => !arcIds.has(id))).toEqual([]);
    expect(referencedCharacters.every((id) => animatedPortraitIds.has(id))).toBe(true);
  });

  it('labels non-pirate organizations as factions', () => {
    const required = ['marines', 'revolutionaries', 'baroque-works'];
    expect(required.every((id) => crews.find((crew) => crew.id === id)?.category === 'factions')).toBe(true);
  });
});
