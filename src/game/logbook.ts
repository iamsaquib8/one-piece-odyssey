// The voyage logbook: what every voyage on this device has achieved, kept apart from the save so
// starting a new voyage never wipes it. It unlocks later sagas as starting points.
import { sagas } from '../data/sagas';
import { CREW } from './crew';
import type { GameState } from './types';

export const LOGBOOK_KEY = 'grand-line-voyage-logbook-v1';

export interface Logbook {
  version: 1;
  /** Sagas finished, in story order. */
  sagas: string[];
  /** Story battles won, by battle id. */
  battles: string[];
  /** Straw Hats who have sailed with you. */
  crew: string[];
  bestBounty: number;
  voyages: number;
}

export const EMPTY_LOGBOOK: Logbook = { version: 1, sagas: [], battles: [], crew: [], bestBounty: 0, voyages: 0 };

/** Nothing logged yet: no voyage started and nothing won. */
export const isEmpty = (book: Logbook) => !book.voyages && !book.sagas.length && !book.battles.length && !book.crew.length;

const SAGA_ORDER = new Map(sagas.map((s, i) => [s.id, i]));
const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];

/** Fold a voyage's progress into the logbook. Pure; returns the same book when nothing is new. */
export function record(book: Logbook, state: GameState): Logbook {
  const done = [...(state.sagasDone ?? []), ...(state.phase.type === 'saga-end' ? [state.sagaId] : [])];
  const won = state.chart.nodes.filter((n) => n.battleId && state.cleared.includes(n.id)).map((n) => n.battleId!);
  const next: Logbook = {
    ...book,
    sagas: union(book.sagas, done).sort((a, b) => (SAGA_ORDER.get(a) ?? 0) - (SAGA_ORDER.get(b) ?? 0)),
    battles: union(book.battles, won),
    crew: union(book.crew, state.crew.map((m) => m.id)),
    bestBounty: Math.max(book.bestBounty, state.bounty),
  };
  const same = next.sagas.length === book.sagas.length && next.battles.length === book.battles.length && next.crew.length === book.crew.length && next.bestBounty === book.bestBounty;
  return same ? book : next;
}

/** Sagas a new voyage may start from: the East Blue, every finished saga, and the one after each. */
export function startingSagas(book: Logbook): string[] {
  const open = new Set(['east-blue', ...book.sagas]);
  for (const id of book.sagas) { const next = sagas[(SAGA_ORDER.get(id) ?? -1) + 1]; if (next) open.add(next.id); }
  return sagas.map((s) => s.id).filter((id) => open.has(id));
}

/** A stored logbook, or an empty one when there is none or it cannot be trusted. Never throws. */
export function decodeLogbook(raw: string | null): Logbook {
  if (!raw || raw.length > 100_000) return EMPTY_LOGBOOK;
  try {
    const v = JSON.parse(raw);
    const strings = (x: unknown, ok: (s: string) => boolean) => Array.isArray(x) && x.every((s) => typeof s === 'string' && ok(s));
    if (!v || v.version !== 1 || !strings(v.sagas, (s) => SAGA_ORDER.has(s)) || !strings(v.battles, () => true) || !strings(v.crew, (s) => !!CREW[s])) return EMPTY_LOGBOOK;
    if (typeof v.bestBounty !== 'number' || !Number.isFinite(v.bestBounty) || typeof v.voyages !== 'number' || !Number.isFinite(v.voyages)) return EMPTY_LOGBOOK;
    return { version: 1, sagas: v.sagas, battles: v.battles, crew: v.crew, bestBounty: v.bestBounty, voyages: v.voyages };
  } catch { return EMPTY_LOGBOOK; }
}

export function loadLogbook(storage: Pick<Storage, 'getItem'>): Logbook {
  try { return decodeLogbook(storage.getItem(LOGBOOK_KEY)); } catch { return EMPTY_LOGBOOK; }
}

export function saveLogbook(storage: Pick<Storage, 'setItem'>, book: Logbook) {
  try { storage.setItem(LOGBOOK_KEY, JSON.stringify(book)); } catch { /* storage full or blocked: the logbook is a nicety */ }
}
