// Seeded randomness for the voyage. The generator's state lives inside the game state, so every
// step is a pure function of (state, action): the same seed and choices always replay identically.

/** One mulberry32 step: returns a float in [0, 1) and the next state. */
export function roll(state: number): [number, number] {
  const next = (state + 0x6d2b79f5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, next];
}

/** A small stateful view for code that draws several numbers in a row; read `.state` back when done. */
export class Dice {
  constructor(public state: number) {}
  next(): number { const [value, state] = roll(this.state); this.state = state; return value; }
  /** Integer in [min, max]. */
  int(min: number, max: number): number { return min + Math.floor(this.next() * (max - min + 1)); }
  chance(p: number): boolean { return this.next() < p; }
  pick<T>(items: readonly T[]): T { return items[Math.floor(this.next() * items.length)]; }
}

/** A seed from text, for the daily voyage and for tests. */
export function seedFrom(text: string): number {
  let h = 2166136261;
  for (const char of text) h = Math.imul(h ^ char.charCodeAt(0), 16777619);
  return h >>> 0;
}
