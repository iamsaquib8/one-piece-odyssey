import { describe, expect, it } from 'vitest';
import { DEFAULT_POSTER, clampPoster, decodePoster, encodePoster, formatBounty } from './poster';

describe('wanted poster state', () => {
  it('round-trips through a share link, names with accents included', () => {
    const poster = { ...DEFAULT_POSTER, name: 'Séverine of Élbaf', epithet: 'Iron Gull', bounty: '1500000000', alive: 'only-alive' as const, recipe: { ...DEFAULT_POSTER.recipe, hat: 'crown' as const, scar: 'cross' as const, glasses: true } };
    const link = encodePoster(poster);
    expect(link).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodePoster(link)).toEqual(poster);
  });

  it('clamps whatever a stranger types into the link', () => {
    const state = clampPoster({ name: '<script>' + 'x'.repeat(60), bounty: '12ab34', backdrop: 'red', alive: 'maybe', recipe: { hat: 'tiara', hairStyle: 'spikes', skin: 'javascript:', glasses: 'yes', horns: true } });
    expect(state.name).not.toContain('<');
    expect(state.name.length).toBeLessThanOrEqual(24);
    expect(state.bounty).toBe('1234');
    expect(state.backdrop).toBe(DEFAULT_POSTER.backdrop);
    expect(state.alive).toBe('dead-or-alive');
    expect(state.recipe.hat).toBeUndefined();
    expect(state.recipe.skin).toBe(DEFAULT_POSTER.recipe.skin);
    expect(state.recipe.glasses).toBeUndefined();
    expect(state.recipe.horns).toBe(true);
  });

  it('opens the default poster for broken links', () => {
    for (const bad of [null, '', '!!!', 'e30', 'a'.repeat(3000)]) expect(decodePoster(bad).recipe).toBeDefined();
    expect(decodePoster('!!!')).toEqual(DEFAULT_POSTER);
  });

  it('groups bounty digits', () => {
    expect(formatBounty('1500000000')).toBe('1,500,000,000');
    expect(formatBounty('000050')).toBe('50');
    expect(formatBounty('')).toBe('0');
  });
});
