/*
 * Stage directions for the illustrated arc reader: who is in each arc, which side they stand on,
 * where each story beat happens, and who fights whom. Kept apart from the prose in arcs-*.ts so
 * the reader can render portraits, scenes and versus cards without parsing paragraphs.
 */
import { eastBlueStaging } from './staging-east-blue';
import { alabastaStaging } from './staging-alabasta';
import { paradiseStaging } from './staging-paradise';
import { summitWarStaging } from './staging-summit-war';
import { newWorldStaging } from './staging-new-world';
import { elbafStaging } from './staging-elbaf';

export type Side = 'crew' | 'ally' | 'foe' | 'wildcard';
export type Mood = 'dawn' | 'day' | 'dusk' | 'night' | 'storm' | 'flashback';

export interface CastMember {
  /** Kebab-case id. Straw Hats use their character ids (luffy, zoro…); others use a stable slug (arlong, crocodile, vivi). */
  id: string;
  name: string;
  side: Side;
  /** One or two sentences: what this person wants and does in THIS arc. */
  role: string;
  epithet?: string;
  /** Accent colour for the card and portrait fallback. */
  color?: string;
  /** True when this person joins the Straw Hats during this arc. */
  joins?: boolean;
}
export interface BeatStaging { location?: string; present: string[]; mood?: Mood }
export interface BattleStaging { a: string[]; b: string[]; verdict?: 'a' | 'b' | 'draw' | 'interrupted' }
export interface ArcStaging {
  arcId: string;
  /** Cold-open caption for the title card, under ten words. */
  hook: string;
  cast: CastMember[];
  /** Keyed by beat id. */
  beats: Record<string, BeatStaging>;
  /** Keyed by battle id. */
  battles: Record<string, BattleStaging>;
}

export const stagings: ArcStaging[] = [...eastBlueStaging, ...alabastaStaging, ...paradiseStaging, ...summitWarStaging, ...newWorldStaging, ...elbafStaging];
const byArc = new Map(stagings.map((s) => [s.arcId, s]));
export const stagingFor = (arcId: string): ArcStaging | undefined => byArc.get(arcId);
