import { useMemo } from 'react';
import { isArcVisible, useReadingHorizon } from '../reading-horizon';
import { arcs } from './arcs';
import { locations } from './locations';
import { allCharacters as characters } from './all-characters';
import { crews, crewFirstAppearance } from './crews';
import { stagingAtProgress, arcAtProgress, DRAGON_IDENTITY_THROUGH } from './spoiler-overrides';
import { crewAboard } from './crew-roster';
import { characters as strawHats } from './characters';

const canonicalId = (id: string) => id === 'jinbe-knight' ? 'jinbe' : id === 'miss-all-sunday' ? 'robin' : id;
const firstChapter = (text: string) => Number(text.match(/\d+/)?.[0] ?? Infinity);
const lastChapter = (text: string) => Number(text.match(/\d+\s*$/)?.[0] ?? Infinity);

/** Project content before it reaches a view; undated edition-wide prose stays out of limited mode. */
export function buildReaderCatalog(through: number | null) {
  if (through === null) return { arcs, locations, characters, crews };
  const visibleArcs = arcs.filter(a => isArcVisible(a, through)).map(a => arcAtProgress(a, through));
  const arcIds = new Set(visibleArcs.map(a => a.id));
  const cast = new Map(visibleArcs.flatMap(a => (stagingAtProgress(a.id, through)?.cast ?? []).map(c => [canonicalId(c.id), { member: c, arcId: a.id }] as const)));
  const knownCharacters = characters.filter(c => cast.has(c.id)).map(c => {
    const entry = cast.get(c.id)!;
    return {
      ...c, name: entry.member.name, epithet: '', role: 'Character',
      description: entry.member.role, dream: '', recruitment: '', arcId: entry.arcId,
      milestones: [], bounties: c.bounties.filter(b => lastChapter(b.after) <= through),
    };
  });
  const knownIds = new Set(knownCharacters.map(c => c.id));
  const knownPlaces = locations.filter(l => firstChapter(l.chapters) <= through && l.arcIds.some(id => arcIds.has(id))).map(l => ({
    ...l, arcIds: l.arcIds.filter(id => arcIds.has(id)), chapters: `Within chapters 1–${through}`,
    description: `Explore this setting in the story entries available at your reading progress.`,
    landmarks: [], sources: [],
    art: { ...l.art, canon: '', interpretation: 'Original schematic illustration of this setting.' },
  }));
  const placeIds = new Set(knownPlaces.map(l => l.id));
  const latest = visibleArcs.at(-1);
  const aboard = latest ? crewAboard(latest, arcs, strawHats).map(r => r.character.id).filter(id => knownIds.has(id)) : [];
  const knownCrews = crews.filter(c => (c.id === 'revolutionaries' ? DRAGON_IDENTITY_THROUGH : crewFirstAppearance[c.id] ?? Infinity) <= through && c.arcIds.some(id => arcIds.has(id))).map(c => ({
    ...c, description: 'Follow this group through the arcs available at your reading progress.',
    ship: undefined, captain: c.id === 'straw-hat' ? 'luffy' : '',
    memberIds: c.id === 'straw-hat' ? aboard : [],
    arcIds: c.arcIds.filter(id => arcIds.has(id)), chapters: `1–${through}`, sources: [],
  }));
  return {
    arcs: visibleArcs.map(a => ({ ...a, overview: [], legacy: [], locationIds: a.locationIds.filter(id => placeIds.has(id)), characterIds: a.characterIds.filter(id => knownIds.has(id)) })),
    locations: knownPlaces, characters: knownCharacters, crews: knownCrews,
  };
}

export function useReaderCatalog() {
  const through = useReadingHorizon();
  return useMemo(() => buildReaderCatalog(through), [through]);
}
