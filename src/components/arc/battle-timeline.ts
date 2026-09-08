import type { Battle } from '../../types';
import type { BattleStaging } from '../../data/staging';

export interface BattleShot {
  label: string;
  duration: number;
  actor: 'a' | 'b';
  kind: 'charge' | 'lift' | 'exchange' | 'truce' | 'promise' | 'strike' | 'establish' | 'resolve';
  impact?: string;
}

/** Authored directions are separate from the chapter summaries. Durations are milliseconds. */
export function battleShots(battle: Battle, staging?: BattleStaging): BattleShot[] {
  if (battle.id === 'laboon-promise') return [
    { label: 'The charge', duration: 3600, actor: 'b', kind: 'charge', impact: 'RUMBLE' },
    { label: 'An unlikely weapon', duration: 3200, actor: 'a', kind: 'lift', impact: 'CRACK' },
    { label: 'Boy against whale', duration: 3800, actor: 'a', kind: 'exchange', impact: 'DOOM!' },
    { label: 'An unfinished fight', duration: 2800, actor: 'a', kind: 'truce' },
    { label: 'A promise in paint', duration: 4200, actor: 'a', kind: 'promise' },
  ];
  const frames = battle.frames.length ? battle.frames : [battle.stakes, battle.development, battle.outcome];
  return frames.map((_, index) => ({
    label: index === 0 ? 'The encounter' : index === frames.length - 1 ? 'The aftermath' : 'The clash',
    duration: index === 0 ? 3000 : index === frames.length - 1 ? 3600 : 2800,
    actor: index === frames.length - 1 && (staging?.verdict === 'a' || staging?.verdict === 'b')
      ? staging.verdict : index % 2 === 0 ? 'a' : 'b',
    kind: index === 0 ? 'establish' : index === frames.length - 1 ? 'resolve' : 'strike',
    impact: index > 0 && index < frames.length - 1 ? ['DOOM!', 'CLASH!', 'WHAM!'][index % 3] : undefined,
  }));
}

export const timelineDuration = (shots: BattleShot[]) => shots.reduce((sum, shot) => sum + shot.duration, 0);
export const shotStart = (shots: BattleShot[], index: number) => timelineDuration(shots.slice(0, index));

export function sampleTimeline(shots: BattleShot[], elapsed: number) {
  const duration = timelineDuration(shots);
  const time = Math.max(0, Math.min(duration, Number.isFinite(elapsed) ? elapsed : 0));
  let start = 0;
  for (let index = 0; index < shots.length; index++) {
    const shot = shots[index];
    if (time < start + shot.duration || index === shots.length - 1) {
      return { index, progress: (time - start) / shot.duration, time, duration, shot };
    }
    start += shot.duration;
  }
  throw new Error('A battle timeline must contain at least one shot');
}

/** Smooth interpolation with explicit holds: wind-up → attack → impact hold → recovery. */
export function cue(progress: number, points: readonly (readonly [number, number])[]): number {
  if (progress <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [end, value] = points[i];
    const [start, previous] = points[i - 1];
    if (progress <= end) {
      const t = (progress - start) / (end - start);
      return previous + (value - previous) * t * t * (3 - 2 * t);
    }
  }
  return points[points.length - 1][1];
}

export const attackCue = (p: number) => cue(p, [[0, 0], [.2, -.15], [.43, 1], [.49, 1], [.76, .1], [1, 0]]);
export const impactCue = (p: number) => cue(p, [[0, 0], [.42, 0], [.45, 1], [.52, 1], [.78, 0], [1, 0]]);
