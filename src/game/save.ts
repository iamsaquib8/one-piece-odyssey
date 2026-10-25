// The voyage's save slot, kept apart from the reader's logbook so neither can corrupt the other.
import { CREW } from './crew';
import type { GameState } from './types';

export const VOYAGE_KEY = 'grand-line-voyage-v1';
const MAX_BYTES = 200_000;

/** A saved voyage, or null when there is none or it cannot be trusted. Never throws. */
export function decodeVoyage(raw: string | null): GameState | null {
  if (!raw || raw.length > MAX_BYTES) return null;
  try {
    const v = JSON.parse(raw);
    if (!v || v.version !== 1 || typeof v.seed !== 'number' || typeof v.rng !== 'number') return null;
    if (!v.chart || !Array.isArray(v.chart.nodes) || !Array.isArray(v.crew) || !Array.isArray(v.cleared)) return null;
    if (!v.crew.every((m: { id: unknown; hp: unknown; maxHp: unknown }) => typeof m.id === 'string' && CREW[m.id] && typeof m.hp === 'number' && typeof m.maxHp === 'number')) return null;
    if (!v.phase || typeof v.phase.type !== 'string') return null;
    if (v.at !== null && !v.chart.nodes.some((n: { id: string }) => n.id === v.at)) return null;
    for (const key of ['berries', 'food', 'morale', 'bounty', 'turns'] as const) if (typeof v[key] !== 'number' || !Number.isFinite(v[key])) return null;
    return v as GameState;
  } catch { return null; }
}

export function loadVoyage(storage: Pick<Storage, 'getItem'>): GameState | null {
  try { return decodeVoyage(storage.getItem(VOYAGE_KEY)); } catch { return null; }
}

export function saveVoyage(storage: Pick<Storage, 'setItem'>, state: GameState): boolean {
  try { storage.setItem(VOYAGE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

export function clearVoyage(storage: Pick<Storage, 'removeItem'>) {
  try { storage.removeItem(VOYAGE_KEY); } catch { /* nothing to clear */ }
}
