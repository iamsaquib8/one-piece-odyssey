import { describe, expect, it } from 'vitest';
import { battleShots, cue, sampleTimeline, shotStart, timelineDuration } from './battle-timeline';
import { arcs } from '../../data/arcs';
import { stagingFor } from '../../data/staging';

describe('battle timeline', () => {
  it('provides a finite, caption-aligned timeline for every battle', () => {
    for (const arc of arcs) for (const battle of arc.battles) {
      const shots = battleShots(battle, stagingFor(arc.id)?.battles[battle.id]);
      expect(shots).toHaveLength(battle.frames.length || 3);
      expect(shots.every(shot => shot.duration > 0)).toBe(true);
      const end = sampleTimeline(shots, timelineDuration(shots) + 1000);
      expect(end.index).toBe(shots.length - 1);
      expect(end.progress).toBe(1);
    }
  });
  it('moves to the next shot exactly at its boundary and clamps scrubbing', () => {
    const battle = arcs.flatMap(arc => arc.battles).find(b => b.id === 'laboon-promise')!;
    const shots = battleShots(battle);
    expect(sampleTimeline(shots, -100).progress).toBe(0);
    expect(sampleTimeline(shots, shotStart(shots, 2))).toMatchObject({ index: 2, progress: 0 });
    expect(sampleTimeline(shots, 3600 + 1600)).toMatchObject({ index: 1, progress: .5 });
    expect(timelineDuration(shots)).toBe(17600);
    expect(shots.slice(-2).every(s => !s.impact)).toBe(true);
  });
  it('holds a pose at impact and samples deterministically in either direction', () => {
    const points = [[0, 0], [.4, 10], [.5, 10], [1, 0]] as const;
    expect(cue(.45, points)).toBe(10);
    expect(cue(.5, points)).toBe(10);
    expect(cue(-1, points)).toBe(0);
    expect(cue(2, points)).toBe(0);
    expect(cue(.2, points)).toBeCloseTo(5);
  });
});
