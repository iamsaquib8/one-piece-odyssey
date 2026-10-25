import { describe, expect, it } from 'vitest';
import { buildCatchUp, chapterForEpisode, episodeForChapter } from './where-am-i';
import { arcs } from './arcs';
import { coverage } from './coverage';
import { LATEST_MAPPED_EPISODE } from './anime-arcs';

const chapterOf = (episode: number) => { const r = chapterForEpisode(episode); return r.kind === 'canon' || r.kind === 'filler' ? r.chapter : NaN; };

describe('episode to chapter', () => {
  it('lands arc boundaries exactly', () => {
    expect(chapterForEpisode(1085)).toEqual({ kind: 'canon', animeArc: 'Wano Country', chapter: 1057 });
    expect(chapterOf(1086)).toBe(1058);
    expect(chapterOf(890)).toBe(909);
    expect(chapterOf(4)).toBeGreaterThanOrEqual(1);
  });

  it('never goes backwards as episodes advance', () => {
    let last = 0;
    for (let e = 1; e <= LATEST_MAPPED_EPISODE; e++) { const c = chapterOf(e); expect(c, `episode ${e}`).toBeGreaterThanOrEqual(last); last = c; }
    expect(last).toBeLessThanOrEqual(coverage.coveredThrough);
  });

  it('answers fillers with where the canon story stands', () => {
    expect(chapterForEpisode(54)).toMatchObject({ kind: 'filler', animeArc: 'Warship Island', chapter: 100 });
    const uta = chapterForEpisode(1029);
    expect(uta.kind).toBe('filler');
    expect(chapterOf(1029)).toBeGreaterThan(909);
  });

  it('estimates the arc still airing from the previous arc’s pace', () => {
    const latest = chapterOf(LATEST_MAPPED_EPISODE);
    expect(latest).toBeGreaterThan(1126);
    expect(latest).toBeLessThan(coverage.coveredThrough);
  });

  it('rejects nonsense and admits what it cannot map', () => {
    expect(chapterForEpisode(0).kind).toBe('invalid');
    expect(chapterForEpisode(2.5).kind).toBe('invalid');
    expect(chapterForEpisode(LATEST_MAPPED_EPISODE + 1).kind).toBe('beyond');
  });
});

describe('chapter to episode', () => {
  it('finds the episode that reaches a chapter, or says the anime is not there yet', () => {
    expect(episodeForChapter(909)).toEqual({ kind: 'episode', episode: 890 });
    expect(episodeForChapter(coverage.coveredThrough).kind).toBe('not-animated');
  });
});

describe('catch-up', () => {
  it('recaps whole beats before the chapter and names the one in progress without its text', () => {
    const catchUp = buildCatchUp(1000, arcs)!;
    expect(catchUp.arc.id).toBe('wano');
    expect(catchUp.earlier.every((a) => a.chapters[1] < 909)).toBe(true);
    for (const beat of catchUp.read) expect(Math.max(...[...beat.chapters.matchAll(/\d+/g)].map((m) => Number(m[0])))).toBeLessThanOrEqual(1000);
    expect(buildCatchUp(coverage.coveredThrough + 5, arcs)).toBeNull();
  });
});
