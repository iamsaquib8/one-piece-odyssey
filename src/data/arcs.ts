import type { Arc } from '../types';
import { eastBlueArcs } from './arcs-east-blue';
import { alabastaArcs } from './arcs-alabasta';
import { paradiseArcs } from './arcs-paradise';
import { summitWarArcs } from './arcs-summit-war';
import { newWorldArcs } from './arcs-new-world';
import { elbafArcs } from './arcs-elbaf';

export { sagas } from './sagas';

/** Rail sagas split Punk Hazard, Egghead and Elbaf into their own stops, matching the concept art. */
const railSaga: Record<string, string> = { 'punk-hazard': 'punk-hazard', egghead: 'egghead', elbaf: 'elbaf' };
export const arcs: Arc[] = [...eastBlueArcs, ...alabastaArcs, ...paradiseArcs, ...summitWarArcs, ...newWorldArcs, ...elbafArcs].map((a) => (railSaga[a.id] ? { ...a, sagaId: railSaga[a.id] } : a));
