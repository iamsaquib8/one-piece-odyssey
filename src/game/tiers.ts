// Where an arc sits in the whole story, 0-based. The difficulty curve and Luffy's gears read it.
import { arcs } from '../data/arcs';

const ORDER = new Map(arcs.map((a, i) => [a.id, i]));
export const arcTier = (arcId: string) => ORDER.get(arcId) ?? 0;
