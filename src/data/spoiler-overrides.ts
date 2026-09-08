import type { Arc } from '../types';
import { stagingFor } from './staging';

/** Conservative editorial boundary: Post-Enies Lobby explicitly discusses Luffy's father. */
export const DRAGON_IDENTITY_THROUGH = 441;

export function stagingAtProgress(arcId: string, through: number | null) {
  const staging = stagingFor(arcId);
  if (!staging || through === null || through >= DRAGON_IDENTITY_THROUGH) return staging;
  return { ...staging, cast: staging.cast.map(c => c.id === 'dragon' ? {
    ...c, name: 'Dragon', role: 'A hooded stranger stops Smoker in the rain and lets the storm carry Luffy back to his ship.',
  } : c) };
}

export function arcAtProgress(arc: Arc, through: number | null): Arc {
  if (arc.id !== 'loguetown' || through === null || through >= DRAGON_IDENTITY_THROUGH) return arc;
  return { ...arc, beats: arc.beats.map(beat => ({ ...beat, paragraphs: beat.paragraphs.map(p =>
    p.replace('Monkey D. Dragon, the revolutionary', 'Dragon, the hooded stranger'),
  ) })) };
}
