import type { Arc, Battle, StoryBeat } from '../types';

export const beat = (id: string, title: string, chapters: string, paragraphs: string[], kind: StoryBeat['kind'] = 'story'): StoryBeat => ({ id, title, chapters, paragraphs, kind });
export const battle = (id: string, title: string, chapters: string, stakes: string, development: string, outcome: string, frames: string[]): Battle => ({ id, title, chapters, stakes, development, outcome, frames });
export type DraftArc = Omit<Arc, 'editorialStatus' | 'sources'>;
export const arc = (entry: DraftArc): Arc => ({ ...entry, editorialStatus: 'draft', sources: [{ label: 'Read the original manga · VIZ', url: 'https://www.viz.com/shonenjump/chapters/one-piece', chapters: `${entry.chapters[0]}–${entry.chapters[1]}` }, { label: 'Official volume catalogue · ONE PIECE.com', url: 'https://one-piece.com/comics/' }] });
