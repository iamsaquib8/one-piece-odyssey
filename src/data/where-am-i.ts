import type { Arc, StoryBeat } from '../types';
import { LATEST_MAPPED_EPISODE, canonAnimeArcs, fillerAnimeArcs, type CanonAnimeArc } from './anime-arcs';

export type EpisodeAnswer =
  | { kind: 'canon'; animeArc: string; chapter: number }
  | { kind: 'filler'; animeArc: string; chapter: number }
  | { kind: 'beyond'; latest: number }
  | { kind: 'invalid' };

/** Chapters per episode for an arc; an arc still airing borrows the previous arc's pace. */
function pace(arc: CanonAnimeArc): number {
  const source = arc.airing ? canonAnimeArcs[canonAnimeArcs.indexOf(arc) - 1] ?? arc : arc;
  return (source.chapters[1] - source.chapters[0] + 1) / (source.episodes[1] - source.episodes[0] + 1);
}

/** The last chapter an episode has adapted, interpolated within its arc. */
function chapterWithin(arc: CanonAnimeArc, episode: number): number {
  const done = Math.floor((episode - arc.episodes[0] + 1) * pace(arc));
  return Math.max(arc.chapters[0], Math.min(arc.chapters[1], arc.chapters[0] + done - 1));
}

/** Where the manga stands after an anime episode. Fillers answer with the canon story's position. */
export function chapterForEpisode(episode: number): EpisodeAnswer {
  if (!Number.isInteger(episode) || episode < 1) return { kind: 'invalid' };
  if (episode > LATEST_MAPPED_EPISODE) return { kind: 'beyond', latest: LATEST_MAPPED_EPISODE };
  const canon = canonAnimeArcs.find((a) => episode >= a.episodes[0] && episode <= a.episodes[1]);
  const filler = fillerAnimeArcs.find((a) => a.episodes.includes(episode));
  const before = [...canonAnimeArcs].reverse().find((a) => a.episodes[1] < episode);
  const chapter = canon ? chapterWithin(canon, episode) : before ? before.chapters[1] : 0;
  if (filler) return { kind: 'filler', animeArc: filler.name, chapter };
  // Recaps and specials between arcs leave the story where the last arc ended.
  return { kind: 'canon', animeArc: (canon ?? before ?? canonAnimeArcs[0]).name, chapter };
}

export type ChapterEpisode = { kind: 'episode'; episode: number } | { kind: 'not-animated'; latest: number } | { kind: 'none' };

/** The first episode that reaches a chapter, or a note that the anime has not got there. */
export function episodeForChapter(chapter: number): ChapterEpisode {
  const arc = canonAnimeArcs.find((a) => chapter >= a.chapters[0] && chapter <= a.chapters[1]);
  if (!arc) return { kind: 'none' };
  const episode = arc.episodes[0] + Math.floor((chapter - arc.chapters[0]) / pace(arc));
  return episode > arc.episodes[1] && arc.airing ? { kind: 'not-animated', latest: arc.episodes[1] } : { kind: 'episode', episode: Math.min(episode, arc.episodes[1]) };
}

const span = (chapters: string): [number, number] => {
  const n = [...chapters.matchAll(/\d+/g)].map((m) => Number(m[0]));
  return [n[0] ?? 0, n.at(-1) ?? n[0] ?? 0];
};

export interface CatchUp {
  arc: Arc;
  /** Beats wholly at or before the reader's chapter. */
  read: StoryBeat[];
  /** The beat the reader is part-way through, shown by title only so it spoils nothing. */
  current?: StoryBeat;
  earlier: Arc[];
}

/** The story so far for a reader who stopped at `chapter`, from arcs they are allowed to see. */
export function buildCatchUp(chapter: number, arcs: Arc[]): CatchUp | null {
  const arc = arcs.find((a) => chapter >= a.chapters[0] && chapter <= a.chapters[1]);
  if (!arc) return null;
  const read = arc.beats.filter((b) => span(b.chapters)[1] <= chapter);
  const current = arc.beats.find((b) => { const [from, to] = span(b.chapters); return from <= chapter && to > chapter; });
  return { arc, read, current, earlier: arcs.filter((a) => a.chapters[1] < arc.chapters[0]) };
}
