import { memo, type ReactNode } from 'react';
import { Scene } from '../../components/Scene';
import { PortraitSvg } from '../../components/PortraitSvg';
import { recipeFor } from '../../components/portrait-recipe';
import type { Blow, Fighter } from '../types';

/**
 * The game's fight stage. Each move has its own choreography instead of a shared lunge: Luffy's arm
 * stretches across the screen, Zoro dashes through and leaves sword arcs, Sanji spins into a kick,
 * Usopp fires a shot that arcs over, Nami darts in and lifts coins, and heavy foe blows leap and
 * slam down. Targets are knocked back and flash on impact; a dodge sidesteps. Everything is a pure
 * function of `progress` (0–1 through the current blow), so motion off just shows the impact frame.
 */

interface Props {
  crew: Fighter[];
  foes: Fighter[];
  blow?: Blow;
  progress: number;
  locationId?: string;
  colors: (id: string) => string;
}

const GROUND = 158;
const W = 400;

const ease = (t: number) => t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
/** Progress through a window of the beat, eased. */
const span = (p: number, from: number, to: number) => ease(clamp01((p - from) / (to - from)));

type Move = 'stretch' | 'punch' | 'slash' | 'kick' | 'shot' | 'steal' | 'heavy' | 'guard' | 'miss' | 'heal' | 'revive' | 'bloom' | 'beam' | 'drill';

/** Which choreography a blow plays. */
function moveOf(blow: Blow): Move {
  if (blow.kind === 'guard') return 'guard';
  if (blow.kind === 'miss') return 'miss';
  if (blow.kind === 'heavy') return 'heavy';
  if (blow.kind === 'steal') return 'steal';
  if (blow.kind === 'heal') return 'heal';
  if (blow.kind === 'revive') return 'revive';
  if (blow.side === 'b') return 'punch';
  const special = blow.kind === 'special';
  switch (blow.actorId) {
    case 'luffy': return special ? 'stretch' : 'punch';
    case 'zoro': return 'slash';
    case 'sanji': return 'kick';
    case 'usopp': return 'shot';
    case 'brook': return 'slash';
    case 'robin': return special ? 'bloom' : 'punch';
    case 'franky': return special ? 'beam' : 'punch';
    case 'jinbe': return special ? 'drill' : 'punch';
    default: return 'punch';
  }
}

/**
 * Where each fighter stands at rest: the crew on the left, foes on the right, a little staggered.
 * A big crew forms two rows, the back row smaller and higher up the deck.
 */
function homes(list: Fighter[], side: 'a' | 'b') {
  const front = Math.min(list.length, 5);
  return new Map(list.map((f, i) => {
    const back = i >= front;
    const slot = back ? i - front : i;
    const x = (back ? 129 : 144) - slot * (front > 1 ? Math.min(34, 120 / (front - 1)) : 0);
    return [f.id, { x: side === 'a' ? x : W - x, y: back ? GROUND - 24 : GROUND - (i % 2) * 6, scale: back ? .8 : 1 }];
  }));
}

interface Pose { dx: number; dy: number; lean: number; arm: number; leg: number; flash: number; spin: number; faded: boolean }
const REST: Pose = { dx: 0, dy: 0, lean: 0, arm: 0, leg: 0, flash: 0, spin: 0, faded: false };

const Puppet = memo(function Puppet({ f, x, y, scale = 1, pose, facing, color }: { f: Fighter; x: number; y: number; scale?: number; pose: Pose; facing: 1 | -1; color: string }) {
  const down = f.hp <= 0;
  const bx = x + pose.dx, by = y + pose.dy;
  // Arm reach is in stage units: a rubber arm can be 200 long, a normal punch about 18.
  const shoulder = { x: bx + facing * 8, y: by - 34 };
  const fist = { x: shoulder.x + facing * (10 + pose.arm), y: shoulder.y + 2 };
  const hip = { x: bx, y: by - 14 };
  const kickAngle = pose.leg * Math.PI / 2;
  const foot = { x: hip.x + facing * Math.sin(kickAngle) * 22, y: hip.y + Math.cos(kickAngle) * 18 };
  return <g className={`as-puppet ${down ? 'is-down' : ''}`} transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y}) rotate(${(down ? 80 * facing : pose.lean * facing) + pose.spin} ${bx} ${by})`} opacity={pose.faded ? .35 : 1}>
    <ellipse cx={bx} cy={y + 2} rx={16} ry={4} fill="#10243a" opacity=".25" />
    <path d={`M${hip.x} ${hip.y}L${hip.x - facing * 6} ${by}`} stroke="#10243a" strokeWidth="5" strokeLinecap="round" />
    <path d={`M${hip.x} ${hip.y}L${foot.x} ${foot.y}`} stroke="#10243a" strokeWidth="5" strokeLinecap="round" />
    <path d={`M${bx - 11} ${by - 14}Q${bx} ${by - 44} ${bx + 11} ${by - 14}Z`} fill={color} stroke="#10243a" strokeWidth="2.5" />
    <path d={`M${bx - facing * 8} ${by - 34}L${bx - facing * 14} ${by - 22}`} stroke="#10243a" strokeWidth="4.5" strokeLinecap="round" />
    <path d={`M${shoulder.x} ${shoulder.y}L${fist.x} ${fist.y}`} stroke={pose.arm > 40 ? '#d59a74' : '#10243a'} strokeWidth={pose.arm > 40 ? 5 : 4.5} strokeLinecap="round" />
    <circle cx={fist.x} cy={fist.y} r={pose.arm > 40 ? 6 : 3.5} fill="#d59a74" stroke="#10243a" strokeWidth="2" />
    <svg x={bx - 21} y={by - 78} width="42" height="42" overflow="visible"><PortraitSvg recipe={recipeFor(f.id, color)} color={color} clipId={`as-${f.id}`} label="" still /></svg>
    {pose.flash > 0 ? <circle cx={bx} cy={by - 40} r={30} fill="#fff" opacity={pose.flash * .7} /> : null}
  </g>;
});

export default function ActionStage({ crew, foes, blow, progress: p, locationId, colors }: Props) {
  const a = homes(crew, 'a');
  const b = homes(foes, 'b');
  const poses = new Map<string, Pose>();
  const fx: ReactNode[] = [];
  let shake = 0;

  if (blow) {
    const attackerHome = (blow.side === 'a' ? a : b).get(blow.actorId);
    const move = moveOf(blow);
    // Healing lands on the actor's own side; everything else crosses the stage.
    const friendly = move === 'heal' || move === 'revive';
    const targetHome = blow.targetId ? (blow.side === 'a' ? friendly ? a : b : friendly ? b : a).get(blow.targetId) : undefined;
    const dir = blow.side === 'a' ? 1 : -1;
    const gap = attackerHome && targetHome ? Math.abs(targetHome.x - attackerHome.x) : 160;
    const impact = span(p, .44, .5);
    const after = span(p, .5, .7);
    const back = span(p, .7, 1);
    const hit = p > .46 && blow.amount > 0 && !friendly;
    const pose: Pose = { ...REST };

    if (move === 'stretch') {
      // The rubber arm winds back, then shoots across the whole stage and snaps home.
      // The body only leans into the wind-up: a lean while the arm is out would swing the fist off target.
      pose.lean = -10 * span(p, 0, .2) * (1 - span(p, .2, .3));
      pose.arm = p < .2 ? -8 * span(p, 0, .2) : p < .5 ? (gap - 20) * span(p, .2, .46) : (gap - 20) * (1 - span(p, .55, .85));
      if (p < .46) fx.push(<path key="lines" d={`M${(attackerHome?.x ?? 90) + 20} ${GROUND - 40}h${gap * span(p, .2, .46)}`} stroke="#fff" strokeWidth="1.5" strokeDasharray="4 6" opacity=".7" />);
    } else if (move === 'punch' || move === 'steal') {
      // Dash in, swing, hop back.
      pose.dx = dir * (gap - 34) * (span(p, .15, .42) - back);
      pose.arm = 18 * (span(p, .38, .46) - span(p, .6, .75));
      pose.lean = 14 * span(p, .2, .45) * (1 - back);
      if (move === 'steal' && p > .5) for (let i = 0; i < 4; i++) fx.push(<text key={`coin${i}`} x={(targetHome?.x ?? 300) - 10 + i * 8} y={GROUND - 60 - after * 40 - i * 6} fontSize="12" opacity={1 - back}>฿</text>);
    } else if (move === 'slash') {
      // A blink-fast dash through the target, three arcs left in the air, then a walk back.
      pose.dx = dir * (gap + 30) * (span(p, .3, .4) - back);
      pose.faded = p > .3 && p < .4;
      pose.lean = 20 * span(p, .3, .4) * (1 - back);
      // Brook's cuts leave frost rather than steel.
      const edge = blow.actorId === 'brook' ? '#8fd8ff' : '#e8f4ff';
      if (p > .4 && p < .85 && targetHome) [-.6, 0, .6].forEach((tilt, i) => fx.push(<path key={`slash${i}`} d={`M${targetHome.x - 28} ${GROUND - 56 + i * 14 + tilt * 10}Q${targetHome.x} ${GROUND - 70 + i * 14} ${targetHome.x + 28} ${GROUND - 40 + i * 14 - tilt * 10}`} fill="none" stroke={edge} strokeWidth={4 - i} strokeLinecap="round" opacity={1 - span(p, .55, .85)} />));
    } else if (move === 'kick') {
      // A spinning approach, the leg swinging up into the blow; the special leaves a flame trail.
      pose.dx = dir * (gap - 30) * (span(p, .1, .4) - back);
      pose.spin = dir * 360 * span(p, .1, .4);
      pose.leg = span(p, .35, .46) * (1 - span(p, .6, .8));
      pose.dy = -16 * Math.sin(Math.PI * span(p, .1, .45));
      if (blow.kind === 'special' && p > .3 && p < .7 && targetHome) fx.push(<circle key="flame" cx={targetHome.x - dir * 10} cy={GROUND - 32} r={14 + 10 * after} fill="#ff8a3d" opacity={.75 * (1 - after)} />);
    } else if (move === 'shot') {
      // Usopp stays put; the shot arcs over to the target.
      pose.lean = -8 * span(p, 0, .25) + 8 * span(p, .25, .35);
      pose.arm = 10 * span(p, .1, .25);
      if (p > .25 && p < .5 && attackerHome && targetHome) {
        const t = span(p, .25, .47);
        const x = attackerHome.x + (targetHome.x - attackerHome.x) * t;
        const y = GROUND - 40 - Math.sin(Math.PI * t) * 40;
        const big = blow.kind === 'special';
        fx.push(<path key="trail" d={`M${attackerHome.x + 14} ${GROUND - 40}Q${(attackerHome.x + x) / 2} ${GROUND - 40 - 50 * t} ${x} ${y}`} fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="3 5" opacity=".6" />);
        fx.push(<circle key="shot" cx={x} cy={y} r={big ? 9 : 5} fill={big ? '#ffd34e' : '#5a4426'} stroke="#10243a" strokeWidth="2" />);
      }
    } else if (move === 'heavy') {
      // Wind up, leap, and slam down on the target with a shockwave.
      pose.dx = dir * (gap - 30) * (span(p, .15, .44) - back);
      pose.dy = -60 * Math.sin(Math.PI * span(p, .15, .46));
      pose.arm = 16 * span(p, .3, .46) * (1 - back);
      if (p > .46 && targetHome) fx.push(<ellipse key="shock" cx={targetHome.x} cy={GROUND} rx={20 + 70 * after} ry={6 + 10 * after} fill="none" stroke="#fff" strokeWidth="3" opacity={1 - after} />);
      shake = hit ? 1 - after : 0;
    } else if (move === 'heal' || move === 'revive') {
      // The doctor hops to the patient; Brook plays and the fallen get back up. Crosses or notes rise.
      if (move === 'heal') pose.dx = targetHome && attackerHome ? (targetHome.x - attackerHome.x + 22) * (span(p, .1, .35) - back) : 0;
      pose.dy = -8 * Math.abs(Math.sin(p * Math.PI * 4));
      if (blow.targetId && move === 'revive') poses.set(blow.targetId, { ...REST, dy: -6 * span(p, .4, .6) * (1 - back) });
      if (targetHome && p > .35) for (let i = 0; i < 4; i++) fx.push(<text key={`mend${i}`} x={targetHome.x - 18 + i * 12} y={GROUND - 50 - span(p, .35 + i * .05, .9) * 50} textAnchor="middle" fontSize="14" fontWeight="900" fill={move === 'heal' ? '#7be08a' : '#ffe27a'} stroke="#10243a" strokeWidth="1" opacity={1 - back}>{move === 'heal' ? '+' : '♪'}</text>);
      if (targetHome && p > .4) fx.push(<circle key="glow" cx={targetHome.x} cy={GROUND - 40} r={30} fill={move === 'heal' ? '#7be08a' : '#ffe27a'} opacity={.3 * (1 - after)} />);
    } else if (move === 'bloom') {
      // Robin stays where she is; arms bloom from the ground around her target and clutch.
      pose.lean = -4;
      if (targetHome && p > .2) for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const grow = span(p, .2 + i * .03, .45);
        fx.push(<g key={`arm${i}`} opacity={1 - back}><path d={`M${targetHome.x + Math.cos(angle) * 26} ${GROUND - 34 + Math.sin(angle) * 22}l${-Math.cos(angle) * 14 * grow} ${-Math.sin(angle) * 12 * grow}`} stroke="#c78a8a" strokeWidth="4" strokeLinecap="round" /><circle cx={targetHome.x + Math.cos(angle) * 26} cy={GROUND - 34 + Math.sin(angle) * 22} r={4 * grow} fill="#ff9fc0" /></g>);
      }
    } else if (move === 'beam') {
      // Franky braces and fires from both arms.
      pose.lean = -6 * span(p, .1, .3);
      pose.arm = 14 * span(p, .1, .3) * (1 - back);
      if (attackerHome && targetHome && p > .32 && p < .7) fx.push(<path key="beam" d={`M${attackerHome.x + 24} ${GROUND - 36}L${targetHome.x} ${GROUND - 38}`} stroke="#7fe8ff" strokeWidth={6 + 6 * (1 - span(p, .45, .7))} strokeLinecap="round" opacity={.85} />);
    } else if (move === 'drill') {
      // Jinbe spins in fist-first; rings of water burst from the hit.
      pose.dx = dir * (gap - 34) * (span(p, .12, .42) - back);
      pose.arm = 20 * span(p, .3, .44) * (1 - back);
      pose.spin = dir * 180 * span(p, .12, .42) * (1 - span(p, .42, .6));
      if (targetHome && p > .44) [0, 1, 2].forEach((i) => fx.push(<circle key={`ring${i}`} cx={targetHome.x - dir * 6} cy={GROUND - 40} r={10 + 26 * span(p, .44 + i * .05, .8)} fill="none" stroke="#6fc6ff" strokeWidth={3 - i * .6} opacity={1 - span(p, .6, .9)} />));
    } else if (move === 'guard') {
      pose.lean = -6;
      const home = attackerHome;
      if (home) fx.push(<circle key="guard" cx={home.x} cy={GROUND - 40} r={34} fill="#9fd6ff" fillOpacity={.18 * (1 - back)} stroke="#cfeaff" strokeWidth="3" opacity={span(p, 0, .3) * (1 - back)} />);
    } else if (move === 'miss') {
      pose.dx = dir * (gap - 34) * (span(p, .15, .42) - back);
      pose.arm = 18 * span(p, .38, .46) * (1 - back);
      if (blow.targetId) poses.set(blow.targetId, { ...REST, dx: dir * 16 * span(p, .36, .46) * (1 - back), dy: -10 * Math.sin(Math.PI * span(p, .36, .6)) });
      if (p > .46 && targetHome) fx.push(<text key="miss" x={targetHome.x} y={GROUND - 92 - after * 10} textAnchor="middle" className="as-word" opacity={1 - back}>MISS</text>);
    }
    poses.set(blow.actorId, pose);

    // The target reels: knocked back, a white flash, then recovers.
    if (hit && blow.targetId && move !== 'miss') {
      const knock = move === 'heavy' || blow.kind === 'crit' ? 26 : move === 'stretch' ? 22 : 14;
      poses.set(blow.targetId, { ...REST, dx: dir * knock * (impact - back), lean: -dir * 12 * (impact - back), flash: 1 - after, dy: move === 'heavy' ? 4 * (1 - after) : 0 });
      if (targetHome) {
        fx.push(<g key="star" transform={`translate(${targetHome.x - dir * 12} ${GROUND - 44}) scale(${.6 + impact * .6})`} opacity={1 - after}><path d="M0-22L6-7 22-8 9 2 15 18 0 8-15 18-9 2-22-8-6-7Z" fill="#ffd34e" stroke="#10243a" strokeWidth="2" /></g>);
        if (blow.impact) fx.push(<text key="word" x={targetHome.x} y={GROUND - 96} textAnchor="middle" className="as-word" opacity={1 - back} transform={`rotate(${-dir * 6} ${targetHome.x} ${GROUND - 96})`}>{blow.impact}</text>);
      }
      if (blow.kind === 'crit') shake = Math.max(shake, 1 - after);
    }
    // Speed lines while the attacker is in the air or dashing.
    if (p > .15 && p < .46 && !['guard', 'shot', 'heal', 'revive', 'bloom', 'beam'].includes(move)) for (let i = 0; i < 6; i++) fx.push(<path key={`speed${i}`} d={`M${blow.side === 'a' ? 0 : W} ${40 + i * 22}h${dir * (60 + (i % 3) * 30)}`} stroke="#fff" strokeWidth="2" opacity=".35" />);
  }

  // Back rows first, the attacker last, so the move plays in front of everyone.
  const order = [...[...crew].reverse().map((f) => ({ f, side: 'a' as const })), ...[...foes].reverse().map((f) => ({ f, side: 'b' as const }))]
    .sort((x, y) => Number(x.f.id === blow?.actorId) - Number(y.f.id === blow?.actorId));
  const sx = shake ? Math.sin(p * 90) * 5 * shake : 0;
  return <div className="as-stage">
    {locationId ? <div className="as-backdrop"><Scene locationId={locationId} name="" eager /></div> : null}
    <svg className="as-svg" viewBox={`0 0 ${W} 200`} preserveAspectRatio="xMidYMax meet" role="img" aria-label={blow?.label ?? 'The crew faces its foes'}>
      <g transform={`translate(${sx} ${shake ? Math.cos(p * 70) * 3 * shake : 0})`}>
        {order.map(({ f, side }) => { const h = (side === 'a' ? a : b).get(f.id)!; return <Puppet key={f.id} f={f} x={h.x} y={h.y} scale={h.scale} pose={poses.get(f.id) ?? REST} facing={side === 'a' ? 1 : -1} color={colors(f.id)} />; })}
        {fx}
      </g>
    </svg>
  </div>;
}
