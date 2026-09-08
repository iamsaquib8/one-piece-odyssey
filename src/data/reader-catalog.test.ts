import { describe, expect, it } from 'vitest';
import { buildReaderCatalog } from './reader-catalog';
import { stagingAtProgress } from './spoiler-overrides';

describe('reading horizon catalog', () => {
  it('keeps the Loguetown stranger’s later identity out of early reading', () => {
    const catalog = buildReaderCatalog(100);
    expect(catalog.characters.find(c => c.id === 'dragon')?.name).toBe('Dragon');
    expect(catalog.crews.some(c => c.id === 'revolutionaries')).toBe(false);
    expect(JSON.stringify(catalog.arcs.find(a => a.id === 'loguetown'))).not.toMatch(/Monkey D\. Dragon|the revolutionary/);
    expect(stagingAtProgress('loguetown', 100)?.cast.find(c => c.id === 'dragon')?.role).not.toContain('revolutionary');
  });
  it('only opens complete arcs, with no future bounties or profile prose', () => {
    const catalog = buildReaderCatalog(7);
    expect(catalog.arcs.map(a => a.id)).toEqual(['romance-dawn']);
    const luffy = catalog.characters.find(c => c.id === 'luffy');
    expect(luffy).toBeDefined();
    expect(luffy?.bounties).toEqual([]);
    expect(luffy?.milestones).toEqual([]);
    expect(luffy?.dream).not.toContain('undisclosed');
    expect(catalog.characters.some(c => c.id === 'brook')).toBe(false);
    expect(catalog.locations.some(l => l.id === 'water-seven')).toBe(false);
    expect(JSON.stringify(catalog.crews)).not.toMatch(/Jinbe|Sunny|ten current/);
  });
  it('keeps the entire edition in full mode and supports not started', () => {
    expect(buildReaderCatalog(null).arcs.length).toBeGreaterThan(30);
    expect(buildReaderCatalog(0)).toEqual({arcs: [], locations: [], characters: [], crews: []});
    expect(buildReaderCatalog(6).arcs).toEqual([]);
  });
  it('does not claim future crew affiliations just because a character appeared', () => {
    const crew = buildReaderCatalog(441).crews.find(c => c.id === 'straw-hat');
    expect(crew?.memberIds).toContain('franky');
    expect(crew?.memberIds).not.toContain('brook');
    const early = buildReaderCatalog(22).crews.find(c => c.id === 'straw-hat');
    expect(early?.memberIds).toContain('nami');
  });
  it('sanitizes locations and whole-arc editorial prose without mutating the originals', () => {
    const limited = buildReaderCatalog(7);
    expect(limited.arcs[0].overview).toEqual([]);
    expect(limited.arcs[0].legacy).toEqual([]);
    expect(limited.locations.every(l => l.arcIds.every(id => limited.arcs.some(a => a.id === id)))).toBe(true);
    expect(buildReaderCatalog(null).arcs[0].overview.length).toBeGreaterThan(0);
  });
});
