import type { Arc, Battle, StoryBeat } from '../types';
import { allCharacters } from './all-characters';
import { arcs } from './arcs';
import { stagingAtProgress, arcAtProgress } from './spoiler-overrides';

export type JourneyEntryKind = 'moment' | 'battle' | 'bounty';

export interface JourneyEntry {
  id: string;
  kind: JourneyEntryKind;
  arcId: string;
  arcName: string;
  targetId?: string;
  title: string;
  chapters: string;
  chapterStart: number;
  summary: string;
}

/** Deliberate pre-recruitment/stage-name links. No fuzzy name matching belongs here. */
export const characterIdentityAliases: Readonly<Record<string, readonly string[]>> = {
  robin: ['miss-all-sunday'],
  jinbe: ['jinbe-knight'],
};

const firstChapter = (value: string): number => Number(value.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
const trailingChapter = (value: string): number | null => {
  const match = value.match(/(\d+)\s*$/);
  return match ? Number(match[1]) : null;
};

function identityIds(characterId: string) {
  return new Set([characterId, ...(characterIdentityAliases[characterId] ?? [])]);
}

function isVisible(arc: Arc, through: number | null) {
  return through === null || arc.chapters[1] <= through;
}

function appearedInBattle(ids: Set<string>, staging: { a: string[]; b: string[] } | undefined) {
  return staging ? [...staging.a, ...staging.b].some((id) => ids.has(id)) : false;
}

export function buildCharacterJourney(characterId: string, through: number | null): JourneyEntry[] {
  const ids = identityIds(characterId);
  const character = allCharacters.find((candidate) => candidate.id === characterId);
  if (!character) return [];
  const entries: JourneyEntry[] = [];

  for (const originalArc of arcs) {
    const arc = arcAtProgress(originalArc, through);
    if (!isVisible(arc, through)) continue;
    const staging = stagingAtProgress(arc.id, through);
    if (!staging) continue;
    for (const beat of arc.beats) {
      if (!staging.beats[beat.id]?.present.some((id) => ids.has(id))) continue;
      entries.push(momentEntry(arc, beat));
    }
    for (const battle of arc.battles) {
      if (!appearedInBattle(ids, staging.battles[battle.id])) continue;
      entries.push(battleEntry(arc, battle));
    }
  }

  for (const bounty of character.bounties) {
    const chapter = trailingChapter(bounty.after);
    if (chapter === null) continue;
    const arc = arcs.find((candidate) => chapter >= candidate.chapters[0] && chapter <= candidate.chapters[1]);
    if (!arc || !isVisible(arc, through) || (through !== null && chapter > through)) continue;
    entries.push({
      id: `bounty:${characterId}:${chapter}`,
      kind: 'bounty',
      arcId: arc.id,
      arcName: arc.name,
      title: `${bounty.amount} berries`,
      chapters: `Chapter ${chapter}`,
      chapterStart: chapter,
      summary: `A new wanted poster follows the events of ${arc.name}.`,
    });
  }

  const order: Record<JourneyEntryKind, number> = { moment: 0, battle: 1, bounty: 2 };
  return entries.sort((a, b) => a.chapterStart - b.chapterStart || order[a.kind] - order[b.kind] || a.id.localeCompare(b.id));
}

function momentEntry(arc: Arc, beat: StoryBeat): JourneyEntry {
  return { id: `moment:${arc.id}:${beat.id}`, kind: 'moment', arcId: arc.id, arcName: arc.name, targetId: beat.id, title: beat.title, chapters: beat.chapters, chapterStart: firstChapter(beat.chapters), summary: beat.paragraphs[0] ?? arc.premise };
}

function battleEntry(arc: Arc, battle: Battle): JourneyEntry {
  return { id: `battle:${arc.id}:${battle.id}`, kind: 'battle', arcId: arc.id, arcName: arc.name, targetId: battle.id, title: battle.title, chapters: battle.chapters, chapterStart: firstChapter(battle.chapters), summary: battle.outcome };
}
