import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Swords, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Battle } from '../types';
import type { BattleStaging, CastMember } from '../data/staging';
import { FightStage } from './arc/FightStage';
import { battleShots, healthAt, hitStop, sampleTimeline, shotStart, timelineDuration } from './arc/battle-timeline';
import '../battle.css';

let stopOther: (() => void) | undefined;
const seconds = (ms: number) => `${Math.floor(ms / 1000)}s`;
interface Props { battle: Battle; motion: boolean; staging?: BattleStaging; cast?: Map<string, CastMember>; locationId?: string; onReveal?: () => void }

/** Remount the clock when navigating between records, including identically-sized timelines. */
export function BattlePlayer(props: Props) {
  return <BattlePlayback key={props.battle.id} {...props} />;
}

function BattlePlayback({ battle, motion, staging, cast, locationId, onReveal }: Props) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const stage = useRef<HTMLButtonElement>(null);
  const playedAt = useRef(0);
  const clock = useRef(0);
  const stop = useRef(() => setPlaying(false)).current;
  const captionId = useId();
  const shots = useMemo(() => battleShots(battle, staging), [battle, staging]);
  const duration = timelineDuration(shots);
  const { index: frame, progress, shot } = sampleTimeline(shots, elapsed);
  const frames = battle.frames.length ? battle.frames : [battle.stakes, battle.development, battle.outcome];
  const finished = elapsed >= duration;
  const [guess, setGuess] = useState<'a' | 'b' | null>(null);
  const side = (ids: string[] = []) => ids.map((id) => cast?.get(id)).filter((c): c is CastMember => !!c);
  const teams = { a: side(staging?.a), b: side(staging?.b) };
  const teamName = (team: 'a' | 'b') => teams[team].map((c) => c.name.split(' ').pop()).join(' & ');
  const decided = staging?.verdict === 'a' || staging?.verdict === 'b' ? staging.verdict : undefined;
  const fighting = battle.id !== 'laboon-promise' && teams.a.length > 0 && teams.b.length > 0;
  const health = fighting ? healthAt(shots, staging?.verdict, elapsed) : undefined;
  // The aftermath is on screen once the last shot is reached, by playback, scrubbing or stepping.
  const revealed = frame === shots.length - 1;
  useEffect(() => { if (revealed) onReveal?.(); }, [revealed, onReveal]);

  useEffect(() => { if (!motion) setPlaying(false); }, [motion]);
  useEffect(() => {
    if (!playing || !motion) return;
    let handle = 0;
    let previous = performance.now();
    let painted = previous;
    const tick = (now: number) => {
      clock.current = Math.min(duration, clock.current + (now - previous) * speed);
      previous = now;
      // Only this active illustration updates; the rest of the reader stays idle.
      if (now - painted >= 1000 / 30 || clock.current >= duration) {
        setElapsed(clock.current);
        painted = now;
      }
      if (clock.current >= duration) setPlaying(false);
      else handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(handle); setElapsed(clock.current); };
  }, [playing, motion, speed, duration]);

  useEffect(() => {
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', hidden);
    // Observer reports arrive a frame late. One measured before the latest Play press describes
    // where the stage was before play() scrolled it back into view, so it must not stop playback.
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting && entry.time > playedAt.current) stop(); });
    if (stage.current) observer.observe(stage.current);
    return () => {
      document.removeEventListener('visibilitychange', hidden);
      observer.disconnect();
      if (stopOther === stop) stopOther = undefined;
    };
  }, [stop]);

  function seek(time: number) {
    setPlaying(false);
    clock.current = Math.max(0, Math.min(duration, time));
    setElapsed(clock.current);
  }
  function step(delta: number) {
    const next = Math.max(0, Math.min(shots.length - 1, frame + delta));
    // A manual step presents a readable key pose, even when motion is disabled.
    seek(shotStart(shots, next) + shots[next].duration * .58);
  }
  function play(restart = false) {
    if (!motion) return;
    // Controls can be reached after the art has scrolled above the reader viewport.
    // An explicit play action brings the scene back before visibility-based pausing.
    stage.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
    playedAt.current = performance.now();
    stopOther?.();
    stopOther = stop;
    if (restart || finished) { clock.current = 0; setElapsed(0); }
    setPlaying(true);
  }
  function toggle() { if (!motion) step(frame === shots.length - 1 ? -frame : 1); else if (playing) stop(); else play(); }

  return <div className="battle motion-comic" data-playing={playing && motion} data-time={Math.round(elapsed)}>
    <div className="battle-heading"><Swords size={22} /><div><span className="micro">BATTLE LOG · CH. {battle.chapters}</span><h3>{battle.title}</h3></div></div>
    <div className="comic-player">
      {fighting && decided ? <div className="comic-predict" role="group" aria-label="Predict the winner" aria-live="polite">
        <span>Who wins?</span>
        {!guess ? (['a', 'b'] as const).map((team) => <button key={team} type="button" onClick={() => { setGuess(team); if (motion) play(true); }}>{teamName(team)}</button>)
          : !revealed ? <p>You picked {teamName(guess)}. Watch it play out…</p>
          : <p className={guess === decided ? 'is-right' : 'is-wrong'}>{guess === decided ? 'You called it' : 'Not this time'}: {teamName(decided)} {teams[decided].length > 1 ? 'win' : 'wins'}.</p>}
      </div> : null}
      <div className="comic-slate"><span>MOTION COMIC</span><span>{String(frame + 1).padStart(2, '0')} / {String(shots.length).padStart(2, '0')} · {shot.label}</span></div>
      <button ref={stage} type="button" className="battle-stage comic-stage" aria-label={motion ? `${playing ? 'Pause' : 'Play'} illustrated battle` : 'Next illustrated battle moment'} aria-describedby={captionId}
        onClick={toggle} onKeyDown={e => {
          if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
          if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); seek(e.key === 'Home' ? 0 : duration); }
        }}>
        <FightStage battle={battle} staging={staging} cast={cast} locationId={locationId} frame={frame} progress={hitStop(shot, progress)} shot={shot} elapsed={elapsed} />
        {health ? <span className="comic-hud" aria-hidden="true">
          {(['a', 'b'] as const).map((team) => <span key={team} className={`comic-hud-side is-${team}`} style={{ gridColumn: team === 'a' ? 1 : 3 }}>
            <span>{teamName(team)}</span>
            <span className="comic-hud-bar"><i className={health[team] < .25 ? 'is-low' : ''} style={{ width: `${health[team] * 100}%` }} /></span>
          </span>)}
          {decided && health[decided === 'a' ? 'b' : 'a'] === 0 ? <span className="comic-hud-ko" style={{ gridColumn: 2, gridRow: 1 }}>K.O.</span> : null}
        </span> : null}
        {!playing && elapsed === 0 && motion ? <span className="comic-play-cue"><Play size={18} fill="currentColor" /> Play the encounter</span> : null}
      </button>
      <div className="comic-caption" id={captionId} aria-live={playing ? 'off' : 'polite'}><span>{String(frame + 1).padStart(2, '0')}</span><p>{frames[frame]}</p></div>
      <div className="comic-scrubber">
        <input type="range" min={0} max={duration} step={20} value={elapsed} aria-label="Battle timeline" aria-valuetext={`${seconds(elapsed)} of ${seconds(duration)}. ${shot.label}`} onChange={e => seek(Number(e.target.value))} />
        <span aria-hidden="true">{seconds(elapsed)} / {seconds(duration)}</span>
      </div>
    </div>
    <div className="battle-controls">
      <button className="button small comic-play" disabled={!motion} onClick={() => playing ? stop() : play()}>{playing ? <Pause size={15} /> : <Play size={15} />} {playing ? 'Pause' : finished ? 'Replay sequence' : 'Play sequence'}</button>
      <div className="comic-transport">
        <button className="icon-button" aria-label="Previous frame" disabled={frame === 0} onClick={() => step(-1)}><ChevronLeft size={17} /></button>
        <button className="icon-button" aria-label="Next frame" disabled={frame === shots.length - 1} onClick={() => step(1)}><ChevronRight size={17} /></button>
        <button className="icon-button" aria-label={`Replay ${battle.title}`} disabled={!motion} onClick={() => play(true)}><RotateCcw size={17} /></button>
      </div>
      <div className="comic-speed" role="group" aria-label="Playback speed">{[.5, 1, 1.5].map(value => <button key={value} type="button" aria-pressed={speed === value} aria-label={`${value} times speed`} disabled={!motion} onClick={() => setSpeed(value)}>{value}×</button>)}</div>
    </div>
    <p className="comic-help">{motion ? 'Drag to explore · ← → step through moments · Soundless' : 'Animation off · use the timeline or ← → to explore each moment'}</p>
    <dl className="battle-copy"><dt>The stakes</dt><dd>{battle.stakes}</dd><dt>The turning point</dt><dd>{battle.development}</dd><dt>The outcome</dt><dd>{battle.outcome}</dd></dl>
  </div>;
}
