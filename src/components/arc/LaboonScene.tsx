import { useId } from 'react';
import { attackCue, cue, impactCue, type BattleShot } from './battle-timeline';

interface Props { shot: BattleShot; progress: number; elapsed: number }

/** Original vector puppets, sampled from the playback clock; no independent animation loops. */
export function LaboonScene({ shot, progress: p, elapsed }: Props) {
  const id = useId().replace(/:/g, '');
  const t = elapsed / 1000;
  const charge = shot.kind === 'charge';
  const lift = shot.kind === 'lift';
  const exchange = shot.kind === 'exchange';
  const promise = shot.kind === 'promise';
  const truce = shot.kind === 'truce';
  const attack = attackCue(p);
  const hit = shot.impact ? impactCue(p) : 0;
  const calm = truce || promise;
  const whaleX = charge ? cue(p, [[0, 75], [.22, 100], [.64, -95], [1, -20]]) : exchange ? -attack * 28 : promise ? -20 : 0;
  const whaleY = charge ? 15 - attack * 22 : calm ? Math.sin(t * 1.4) * 3 : Math.sin(t * 2) * 7;
  const camera = promise ? 1.22 + p * .05 : exchange ? 1.09 + hit * .045 : charge ? 1 + p * .07 : 1.05;
  const pan = promise ? -100 : charge ? 25 * p : exchange ? -attack * 24 : 0;
  const shake = exchange ? Math.sin(p * 110) * hit * 3 : 0;
  const luffyX = promise ? 537 : truce ? 350 : exchange ? 320 + attack * 265 : 302;
  const luffyY = promise ? 273 : truce ? 350 : exchange ? 350 - Math.max(0, attack) * 159 : lift ? 350 - attack * 15 : 350;
  const paint = promise ? cue(p, [[0, 0], [.15, .05], [.78, 1], [1, 1]]) : 0;
  const spray = calm ? .12 : .35 + Math.max(0, attack) * .65;

  return <svg className="laboon-scene" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" data-shot={shot.kind}>
    <defs>
      <linearGradient id={`${id}-sky`} x2="0" y2="1"><stop stopColor="#7acdd0" /><stop offset="1" stopColor="#f5dea1" /></linearGradient>
      <linearGradient id={`${id}-sea`} x2="0" y2="1"><stop stopColor="#258f9f" /><stop offset="1" stopColor="#123d51" /></linearGradient>
      <linearGradient id={`${id}-whale`} x2=".8" y2="1"><stop stopColor="#526786" /><stop offset=".55" stopColor="#283d5a" /><stop offset="1" stopColor="#142940" /></linearGradient>
      <pattern id={`${id}-dots`} width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#10243a" opacity=".13" /></pattern>
    </defs>
    <rect width="1000" height="500" fill={`url(#${id}-sky)`} />
    <circle cx="755" cy="90" r="64" fill="#fff1bf" opacity=".8" />
    <g fill="#fff8e7" opacity=".48" transform={`translate(${Math.sin(t * .12) * 20} 0)`}>
      <path d="M340 72h90l12-16h56l17 16h75v9H340Z" /><path d="M640 140h110l18-10h91l20 10h90v8H640Z" />
    </g>
    <g className="comic-camera" transform={`translate(${500 + pan + shake} 250) scale(${camera}) translate(-500 -250)`}>
      <path d="M0-30H150L184 96 146 178 171 263 126 412H0Z" fill="#ad6552" stroke="#10243a" strokeWidth="6" />
      <path d="M34-20L71 124 44 238 88 347 51 421M139 5L115 115 139 176 106 273 135 330M4 183L52 166M65 110L117 126M47 239L105 263" fill="none" stroke="#713f3d" strokeWidth="13" />
      <path d="M0-20H150L184 96 146 178 171 263 126 412H0Z" fill={`url(#${id}-dots)`} />
      <path d="M140 365L215 299 260 313 290 362Z" fill="#546d69" />
      <g transform="translate(207 240)" stroke="#173648" strokeWidth="3">
        <path d="M-15 87L-10 4H10L17 87Z" fill="#fff1cb" /><path d="M-11 16H12M-13 48H15" stroke="#a9463c" strokeWidth="12" />
        <path d="M-18 0L0-15 18 0Z" fill="#a9463c" /><path d="M-9 0H10V12H-9Z" fill="#ffd34e" />
      </g>
      <rect y="348" width="1000" height="170" fill={`url(#${id}-sea)`} />
      <g opacity=".28" stroke="#d6f6e8" strokeWidth="3" transform={`translate(${-t * 5 % 70} 0)`}>{Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${i * 95 - 60} ${368 + i % 3 * 18}h55`} />)}</g>

      <g data-part="laboon" transform={`translate(${710 + whaleX} ${290 + whaleY}) rotate(${charge ? -attack * 6 : exchange ? attack * 4 : -2})`}>
        <path d="M110 52Q235 101 298-53L330-84 335-31 380-65Q378 11 296 33Q238 140 111 125" fill="#253b56" stroke="#10243a" strokeWidth="6" />
        <path d="M-190 51Q-236-111-120-155Q37-212 167-85Q248 34 173 113Q43 173-117 134Q-176 112-190 51Z" fill={`url(#${id}-whale)`} stroke="#10243a" strokeWidth="7" />
        <path d="M-179 69Q-44 141 160 63Q173 105 138 126Q-33 174-145 119Z" fill="#a3bec2" opacity=".78" />
        <path d="M14 96Q69 170 137 154L89 90" fill="#2f4660" stroke="#10243a" strokeWidth="6" />
        <path d="M-140-119Q-55-159 14-132" fill="none" stroke="#7993aa" strokeWidth="7" strokeLinecap="round" opacity=".55" />
        <path d="M-169-91l49 52m-10-62l-29 71m15-17l-31 4m68-38l27 43m-82 48l47 18" stroke="#aab7bd" strokeWidth="4" fill="none" opacity=".65" />
        <ellipse cx="-138" cy="12" rx="13" ry="15" fill="#fff8e7" stroke="#10243a" strokeWidth="4" />
        <circle cx="-142" cy="13" r="6" fill="#10243a" />
        <path d={calm ? 'M-187 53Q-143 81-92 62' : 'M-190 52Q-138 63-86 49'} fill="none" stroke="#10243a" strokeWidth="5" strokeLinecap="round" />
        {!calm && <path d="M-158-9L-119-1" stroke="#10243a" strokeWidth="7" strokeLinecap="round" />}
        {promise && <g transform="translate(-107 -72) rotate(-12)" fill="none" stroke="#f9f1d8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity={Math.min(1, paint * 5)}>
          <path d="M-29-20L28 30M28-20L-29 30M-27-24l-7 4m57-4l9 5M-32 31l8 5m55-4l-9 5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - paint} />
          <path d="M-16 2Q-23-24 0-25Q24-23 16 2L11 6V19H-11V6Z" fill="#f9f1d8" fillOpacity={paint} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - paint} />
          <g opacity={paint}><circle cx="-7" cy="-5" r="4" fill="#283d5a" stroke="none" /><circle cx="7" cy="-5" r="4" fill="#283d5a" stroke="none" /><path d="M-23-21H24M-16-23Q-15-42 0-40Q17-40 17-23" stroke="#e9b84b" /><path d="M-13-28H13" stroke="#d34d41" /></g>
        </g>}
      </g>

      <g data-part="merry" transform={`translate(247 ${372 + Math.sin(t * 2) * (calm ? 2 : 6)}) rotate(${Math.sin(t * 2) * (calm ? 1 : 3)})`} stroke="#10243a" strokeWidth="4" strokeLinejoin="round">
        <path d="M-83-8Q-18 19 87-14L61 31Q-20 53-70 19Z" fill="#b76d42" /><path d="M-73 6Q-10 31 71 3" fill="none" stroke="#e9b663" />
        <path d="M-64-13H56V1H-64Z" fill="#f0cc80" /><path d="M-31-10V-35H22V-8" fill="#d4a25a" />
        <path d="M57-14Q55-45 75-44Q96-44 87-25L78-20 86-12" fill="#fff1ce" /><circle cx="78" cy="-35" r="3" fill="#10243a" stroke="none" />
        {charge && <g><path d="M-7-25V-143" stroke="#74503b" strokeWidth="7" /><path d="M-4-134Q63-113 51-63H-4Z" fill="#fff8e7" /><path d="M-46-133H55" stroke="#74503b" /></g>}
      </g>

      <g data-part="luffy" transform={`translate(${luffyX} ${luffyY}) rotate(${exchange ? attack * 32 : lift ? -attack * 12 : 0}) scale(${promise ? .68 : .85})`}>
        <StrawHatFighter arm={exchange ? attack * 72 : promise ? 26 + Math.sin(p * 24) * (1 - paint) * 8 : truce ? -42 : lift ? -attack * 80 : 0} airborne={exchange ? Math.max(0, attack) : 0} />
        {lift || exchange ? <g transform={`rotate(${lift ? 22 - attack * 65 : 55} 30 -70)`} stroke="#10243a" strokeWidth="4"><path d="M30-175H40V-10H30Z" fill="#b5834a" /><path d="M-4-143H77V-133H-4Z" fill="#d8b67b" /><path d="M30-10L36-22 40-10" fill="#fff0c8" /></g> : null}
        {promise && <g transform="translate(52 -67) rotate(28)" stroke="#10243a" strokeWidth="3"><path d="M0 0V-30" stroke="#ac794b" strokeWidth="6" /><path d="M-5-30V-43H5V-30Z" fill="#fff8e7" /></g>}
      </g>

      <g stroke="#c7f3e9" fill="none" strokeLinecap="round">
        {Array.from({ length: 20 }, (_, i) => {
          const phase = (t * (calm ? .35 : .9) + i * .137) % 1;
          const x = 445 + i * 25 + whaleX * .5;
          const y = 402 - Math.sin(phase * Math.PI) * (25 + i % 5 * 15) * spray;
          return <path key={i} d={`M${x} ${y}l${(i % 2 ? 1 : -1) * phase * 12} ${-4 - phase * 8}`} opacity={Math.sin(phase * Math.PI) * .8} strokeWidth={i % 3 + 2} />;
        })}
      </g>
      <g data-part="foreground-water" transform={`translate(${Math.sin(t) * 14} ${Math.sin(t * 1.6) * 4})`}>
        <path d="M-30 441Q52 408 151 445T350 437T552 443T750 439T1030 441V530H-30Z" fill="#145366" />
        <path d="M-30 445Q52 412 151 449T350 441T552 447T750 443T1030 445" fill="none" stroke="#71bdbf" strokeWidth="5" />
        <path d="M52 467h105m195 9h85m176-12h134m106 15h65" stroke="#3b8897" strokeWidth="4" />
      </g>
    </g>
    {hit > 0 && <g opacity={hit}>
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${i % 2 ? 1000 : 0} ${35 + i * 39}L${i % 2 ? 780 : 220} ${100 + i * 26}`} stroke="#fff8e7" strokeWidth={i % 3 + 1} opacity=".6" />)}
      <g transform={`translate(${exchange ? 580 : lift ? 300 : 690} ${exchange ? 166 : 95}) rotate(-8) scale(${.85 + hit * .15})`}>
        <text textAnchor="middle" className="comic-sfx">{shot.impact}</text>
      </g>
    </g>}
    <rect width="1000" height="500" fill={`url(#${id}-dots)`} opacity=".3" pointerEvents="none" />
    <path d="M0 0H1000M0 500H1000" stroke="#10243a" strokeWidth="16" />
    <g fill="#fff8e7" fontSize="10" fontFamily="var(--font-utility)" opacity=".85"><text x="25" y="32">TWIN CAPE</text><text x="975" y="477" textAnchor="end">CH. 104</text></g>
  </svg>;
}

export function StrawHatFighter({ arm = 0, airborne = 0 }: { arm?: number; airborne?: number }) {
  return <g stroke="#10243a" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
    <g transform={`rotate(${airborne * 30} -8 -28)`}><path d="M-9-30L-21-5-32 7" fill="none" stroke="#e3a16e" strokeWidth="11" /><path d="M-37 8H-20" stroke="#685237" strokeWidth="8" /></g>
    <g transform={`rotate(${-airborne * 40} 10 -28)`}><path d="M9-30L20-4 31 6" fill="none" stroke="#e3a16e" strokeWidth="11" /><path d="M23 8H40" stroke="#685237" strokeWidth="8" /></g>
    <path d="M-18-48L-22-26-4-19 1-33 9-20 24-29 17-48" fill="#356e9c" />
    <path d="M-15-81L-19-48Q0-39 19-48L15-81Z" fill="#e3a16e" />
    <path d="M-15-82L-23-69-19-46-4-49-5-79M10-80L17-82 24-49 9-46Z" fill="#da4d42" />
    <path d="M-20-75L-32-59-25-43" fill="none" stroke="#e3a16e" strokeWidth="10" />
    <g transform={`rotate(${-arm} 19 -74)`}><path d="M19-74L36-59 51-70" fill="none" stroke="#10243a" strokeWidth="13" /><path d="M19-74L36-59 51-70" fill="none" stroke="#e3a16e" strokeWidth="9" /><circle cx="51" cy="-70" r="7" fill="#e3a16e" /></g>
    <path d="M-15-112L-18-95-10-81 4-79 17-91 17-110Z" fill="#e3a16e" />
    <path d="M-18-104L-21-119-9-115-3-125 4-116 14-120 20-105 10-108 5-104-2-110-8-102Z" fill="#171d28" />
    <path d="M-9-97h1m17-1h1" strokeWidth="3" /><path d="M-5-88Q2-84 9-91M9-94h7" fill="none" strokeWidth="2" />
    <ellipse cx="0" cy="-117" rx="32" ry="7" fill="#e5bd55" /><path d="M-19-119Q-20-144-1-142Q19-142 20-119Z" fill="#e5bd55" /><path d="M-18-124H18" stroke="#d24b3e" strokeWidth="6" />
  </g>;
}
