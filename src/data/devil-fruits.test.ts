import { describe, expect, it } from 'vitest';
import { devilFruits, fruitsAtProgress, fruitsOf } from './devil-fruits';
import { buildReaderCatalog } from './reader-catalog';
import { arcs } from './arcs';

const fruit = (list: typeof devilFruits, id: string) => list.find((f) => f.id === id);

describe('devil fruits', () => {
  it('reveal each fruit inside the arc it links to', () => {
    for (const f of devilFruits) {
      const arc = arcs.find((a) => a.id === f.arcId)!;
      expect(arc, f.id).toBeDefined();
      expect(f.revealChapter, f.id).toBeGreaterThanOrEqual(arc.chapters[0]);
      expect(f.revealChapter, f.id).toBeLessThanOrEqual(arc.chapters[1]);
    }
  });

  it('wait for the reader to finish the revealing arc', () => {
    const early = fruitsAtProgress(105);
    expect(fruit(early, 'gomu-gomu')).toBeDefined();
    expect(fruit(early, 'bara-bara')).toBeDefined();
    expect(fruit(early, 'mera-mera')).toBeUndefined();
    expect(early.every((f) => f.revealChapter <= 105)).toBe(true);
    expect(fruitsAtProgress(0)).toEqual([]);
  });

  it('keep later identities, awakenings, losses and successors hidden until their chapter', () => {
    const beforeWano = fruitsAtProgress(908);
    const gumGum = fruit(beforeWano, 'gomu-gomu')!;
    expect(gumGum.trueIdentity).toBeUndefined();
    expect(gumGum.awakened).toEqual([]);
    expect(gumGum.users.map((u) => u.characterId)).toEqual(['luffy']);
    expect(fruit(fruitsAtProgress(1057), 'gomu-gomu')!.trueIdentity?.name).toMatch(/Nika/);

    const atMarineford = fruitsAtProgress(580)!;
    const flame = fruit(atMarineford, 'mera-mera')!;
    expect(flame.users.map((u) => u.characterId)).toEqual(['ace']);
    expect(flame.users[0].until).toBeDefined();
    expect(fruit(fruitsAtProgress(560) ?? [], 'mera-mera')?.users[0].until).toBeUndefined();
    expect(fruit(fruitsAtProgress(801), 'mera-mera')!.users.map((u) => u.characterId)).toEqual(['ace', 'sabo']);
  });

  it('link users only to profiles the reader has met', () => {
    const catalog = buildReaderCatalog(105);
    const known = new Set(catalog.characters.map((c) => c.id));
    for (const f of catalog.devilFruits) for (const u of f.users) if (u.characterId) expect(known.has(u.characterId)).toBe(true);
    expect(fruitsOf(devilFruits, 'luffy').map((f) => f.id)).toEqual(['gomu-gomu']);
  });
});
