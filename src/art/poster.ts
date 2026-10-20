// The wanted-poster maker's state, and its round trip through a share link. Links are typed by
// strangers, so decoding trusts nothing: every field is clamped to the recipe language or dropped.
import { EFFECTS, HAIR_STYLES, HATS, KINDS, P, type PortraitRecipe } from '../components/portrait-recipe';

export interface PosterState {
  recipe: PortraitRecipe;
  name: string;
  epithet: string;
  /** Digits only; formatted with commas when drawn. */
  bounty: string;
  alive: 'dead-or-alive' | 'only-alive';
  backdrop: string;
}

export const LIMITS = { name: 24, epithet: 28, bounty: 13 } as const;
const SCARS = ['eye', 'cheek', 'cross'] as const;
const FLAGS = ['beard', 'moustache', 'glasses', 'horns', 'earring', 'longNose'] as const;

export const DEFAULT_POSTER: PosterState = {
  recipe: P('#2b2321', '#c8473f', { hat: 'straw', skin: '#d59a74', effect: 'sun' }),
  name: 'Your Name Here',
  epithet: 'The Newcomer',
  bounty: '30000000',
  alive: 'dead-or-alive',
  backdrop: '#f2b33d',
};

const isColor = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);
const pick = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined => allowed.includes(value as T) ? value as T : undefined;
const text = (value: unknown, max: number, fallback: string) => typeof value === 'string' ? value.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, max) : fallback;

/** Group digits in threes: 1500000000 becomes 1,500,000,000. */
export const formatBounty = (digits: string) => (digits.replace(/\D/g, '').replace(/^0+(?=\d)/, '') || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function clampPoster(raw: unknown): PosterState {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const r = (value.recipe && typeof value.recipe === 'object' ? value.recipe : {}) as Record<string, unknown>;
  const base = DEFAULT_POSTER.recipe;
  const recipe: PortraitRecipe = {
    skin: isColor(r.skin) ? r.skin : base.skin,
    hair: isColor(r.hair) ? r.hair : base.hair,
    coat: isColor(r.coat) ? r.coat : base.coat,
    hairStyle: pick(r.hairStyle, HAIR_STYLES) ?? base.hairStyle,
    kind: pick(r.kind, KINDS) ?? 'human',
    effect: pick(r.effect, EFFECTS) ?? 'none',
  };
  const hat = pick(r.hat, HATS);
  if (hat) recipe.hat = hat;
  const scar = pick(r.scar, SCARS);
  if (scar) recipe.scar = scar;
  for (const flag of FLAGS) if (r[flag] === true) recipe[flag] = true;
  return {
    recipe,
    name: text(value.name, LIMITS.name, DEFAULT_POSTER.name),
    epithet: text(value.epithet, LIMITS.epithet, ''),
    bounty: typeof value.bounty === 'string' ? value.bounty.replace(/\D/g, '').slice(0, LIMITS.bounty) : DEFAULT_POSTER.bounty,
    alive: pick(value.alive, ['dead-or-alive', 'only-alive'] as const) ?? 'dead-or-alive',
    backdrop: isColor(value.backdrop) ? value.backdrop : DEFAULT_POSTER.backdrop,
  };
}

const toBase64Url = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromBase64Url = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));

export const encodePoster = (state: PosterState) => toBase64Url(JSON.stringify(state));

/** A malformed link opens the default poster rather than an error. */
export function decodePoster(param: string | null): PosterState {
  if (!param || param.length > 2000) return DEFAULT_POSTER;
  try { return clampPoster(JSON.parse(fromBase64Url(param))); } catch { return DEFAULT_POSTER; }
}
