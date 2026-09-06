import { describe, expect, it } from 'vitest';
import { bountyChanges, crewAboard } from './crew-roster';
import { characters } from './characters';
import { arcs } from './arcs';

describe('crewAboard', () => {
  it('starts with Luffy and Zoro on Romance Dawn', () => {
    const roster = crewAboard({ id: 'romance-dawn' }, arcs, characters);
    expect(roster.map((r) => r.character.id)).toEqual(['luffy', 'zoro']);
    expect(roster.every((r) => r.joins)).toBe(true);
  });
  it('marks Chopper as joining on Drum Island with six aboard', () => {
    const roster = crewAboard({ id: 'drum-island' }, arcs, characters);
    expect(roster.map((r) => r.character.id)).toEqual(['luffy', 'zoro', 'nami', 'usopp', 'sanji', 'chopper']);
    expect(roster.find((r) => r.character.id === 'chopper')?.joins).toBe(true);
    expect(roster.find((r) => r.character.id === 'luffy')?.joins).toBe(false);
  });
  it('counts Nami aboard from Orange Town but joining at Arlong Park', () => {
    expect(crewAboard({ id: 'syrup-village' }, arcs, characters).map((r) => r.character.id)).toEqual(['luffy', 'zoro', 'nami', 'usopp']);
    expect(crewAboard({ id: 'arlong-park' }, arcs, characters).find((r) => r.character.id === 'nami')?.joins).toBe(true);
  });
  it('has all ten aboard by Egghead', () => {
    expect(crewAboard({ id: 'egghead' }, arcs, characters)).toHaveLength(10);
  });
  it('returns nothing for an unknown arc', () => {
    expect(crewAboard({ id: 'nowhere' }, arcs, characters)).toEqual([]);
  });
});

describe('bountyChanges', () => {
  it('finds the first bounty shown in Loguetown', () => {
    const changes = bountyChanges({ chapters: [96, 100] }, characters);
    expect(changes.map((c) => `${c.character.id}:${c.amount}`)).toEqual(['luffy:30,000,000']);
    expect(changes[0].previous).toBeUndefined();
  });
  it('lists every crew member after Enies Lobby with their previous amounts', () => {
    const changes = bountyChanges({ chapters: [431, 441] }, characters);
    expect(changes.length).toBeGreaterThanOrEqual(7);
    expect(changes.find((c) => c.character.id === 'luffy')).toMatchObject({ amount: '300,000,000', previous: '100,000,000' });
  });
});
