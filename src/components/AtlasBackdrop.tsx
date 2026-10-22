import {memo} from 'react';

const INK = '#2a2117';
const W = 2400;
const H = 1400;

/** Sixteen rhumb lines from a compass rose, the web of bearings every old sea chart carries. */
function Rhumbs({x, y}: {x: number; y: number}) {
  return <g stroke={INK} strokeOpacity=".1" strokeWidth="1.4">{Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return <line key={i} x1={x} y1={y} x2={x + Math.cos(a) * 3200} y2={y + Math.sin(a) * 3200} strokeDasharray={i % 2 ? '10 12' : undefined}/>;
  })}</g>;
}

function Rose({x, y, r}: {x: number; y: number; r: number}) {
  return <g transform={`translate(${x} ${y})`} className="atlas-compass" stroke={INK} fill="none">
    <circle r={r} strokeWidth="2"/><circle r={r * .76} strokeDasharray="2 7"/>
    {[0, 45, 90, 135].map((a) => <g key={a} transform={`rotate(${a})`}>
      <path d={`M0 ${-r * 1.28}L${r * .16} 0 0 ${r * 1.28}${-r * .16} 0Z`} fill="#efe2c0" strokeWidth="1.6"/>
      <path d={`M0 ${-r * 1.28}L${r * .16} 0H0Z`} fill={a % 90 ? '#8c6a3f' : '#b23a2e'} stroke="none"/>
      <path d={`M0 ${r * 1.28}L${-r * .16} 0H0Z`} fill={a % 90 ? '#8c6a3f' : INK} stroke="none"/>
    </g>)}
    <circle r={r * .13} fill={INK}/>
    <text y={-r * 1.45} textAnchor="middle" fill={INK} stroke="none" fontSize={r * .34} fontFamily="Georgia,serif" fontWeight="700">N</text>
  </g>;
}

/** A sea monster in ink linework, the way chart-makers filled empty water. */
const SeaKing = ({transform}: {transform: string}) => <g transform={transform} fill="none" stroke={INK} strokeOpacity=".42" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
  <path d="M0 35q30-65 77-12 20 25 37 0-11 43-38 22Q36-7 11 47Z" fill="#d8cfa8" fillOpacity=".55"/>
  <path d="M36 4L27-9 52-2 65-13 77 11M4 32l-30-5 18 15-12 13L8 48"/><circle cx="-10" cy="36" r="2.5" fill={INK}/>
  <path d="M-40 60q18-8 36 0t36 0 36 0" strokeOpacity=".3"/>
</g>;

/**
 * The flat chart's ground: an old sea chart on parchment, with washes for the seas, hatching for
 * the Calm Belts, rhumb lines from two compass roses and a ticked frame. Positions are the same
 * schematic world as before; only the drawing changed.
 */
export const AtlasBackdrop=memo(function AtlasBackdrop(){
  return <g aria-hidden="true" className="atlas-backdrop-art">
    <defs>
      <radialGradient id="atlas-paper" cx=".5" cy=".46" r=".75"><stop stopColor="#f4e8c8"/><stop offset=".72" stopColor="#ecdcb4"/><stop offset="1" stopColor="#d8c08d"/></radialGradient>
      <linearGradient id="atlas-corridor" x2="0" y2="1"><stop stopColor="#8fc3b9" stopOpacity=".12"/><stop offset=".5" stopColor="#7fb8ad" stopOpacity=".34"/><stop offset="1" stopColor="#8fc3b9" stopOpacity=".12"/></linearGradient>
      <pattern id="atlas-speckle" width="60" height="60" patternUnits="userSpaceOnUse"><circle cx="7" cy="11" r="1.1" fill="#8c6a3f" fillOpacity=".18"/><circle cx="41" cy="33" r=".9" fill="#8c6a3f" fillOpacity=".14"/><circle cx="23" cy="52" r="1.3" fill="#8c6a3f" fillOpacity=".1"/></pattern>
      <pattern id="atlas-waves" width="150" height="110" patternUnits="userSpaceOnUse"><path d="M14 30q6-6 12 0t12 0M96 74q6-6 12 0t12 0" fill="none" stroke={INK} strokeWidth="1.6" strokeOpacity=".2" strokeLinecap="round"/></pattern>
      <pattern id="calm-water" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 9H18" stroke={INK} strokeOpacity=".16" strokeWidth="1.4"/></pattern>
      <pattern id="red-strata" width="45" height="85" patternUnits="userSpaceOnUse"><rect width="45" height="85" fill="#b86f52"/><path d="M0 0h25v35H0M45 50H23v35" fill="#c9876a"/><path d="M0 40h20m7 25h18M35 4v22" stroke="#7a4430" strokeWidth="4"/></pattern>
      <filter id="island-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#5a4426" floodOpacity=".35"/></filter>
    </defs>
    <rect width={W} height={H} fill="url(#atlas-paper)"/>
    <rect width={W} height={H} fill="url(#atlas-speckle)"/>
    {/* Sea washes: the Blues outside the Red Line, a brighter corridor for the Grand Line. */}
    <rect width={W} height={H} fill="#a9cdc4" fillOpacity=".22"/>
    <path d="M625 505H2400V1035H625Z" fill="url(#atlas-corridor)"/>
    <rect x="635" y="395" width="1765" height="95" fill="#d7c79c" fillOpacity=".55"/><rect x="635" y="395" width="1765" height="95" fill="url(#calm-water)"/>
    <rect x="635" y="1050" width="1765" height="185" fill="#d7c79c" fillOpacity=".55"/><rect x="635" y="1050" width="1765" height="185" fill="url(#calm-water)"/>
    <path d="M640 500H2400M640 1040H2400" stroke={INK} strokeOpacity=".45" strokeWidth="2" strokeDasharray="10 8"/>
    <Rhumbs x={175} y={150}/><Rhumbs x={2210} y={1240}/>
    <rect width={W} height={H} fill="url(#atlas-waves)"/>
    {[560, 1735].map((x, i) => <g key={x}>
      <path d={`M${x} 0h75l-10 110 20 82-15 72 17 90-22 72 16 116-23 78 16 80-13 94 15 90-18 72 20 65-16 120 17 84-12 80H${x - 5}l12-92-20-97 14-87-9-84 16-92-12-85 9-88-20-94 16-68-14-109 18-100-9-73 15-110-18-75Z`} fill="url(#red-strata)" stroke={INK} strokeWidth="3" strokeOpacity=".7"/>
      <text transform={`translate(${x + 40} 135) rotate(90)`} className="atlas-terrain-label">RED LINE</text>
      <text x={x + 40} y={i ? 1320 : 1280} className="atlas-tiny-label" textAnchor="middle">{i ? 'SECOND CROSSING' : 'REVERSE MOUNTAIN'}</text>
    </g>)}
    <path d="M540 738l40-15 31 14 35-6 40 18" stroke={INK} strokeOpacity=".6" strokeWidth="16" fill="none"/><path d="M540 738l40-15 31 14 35-6 40 18" stroke="#8fc3b9" strokeWidth="9" fill="none"/>
    <path className="atlas-current" d="M720 930q35 50 110 45m340-420q-45-65-90-40m675 305q-15 85 45 115m380-510q10-70-30-90" stroke={INK} fill="none" strokeWidth="2" strokeDasharray="12 14" opacity=".3"/>
    <SeaKing transform="translate(860 1100)"/><SeaKing transform="translate(1520 420) scale(.8)"/><SeaKing transform="translate(300 1180) scale(.9) rotate(-8)"/>
    {/* Cloud banks for the Sky Seas, outlined like an engraver's clouds. */}
    <g fill="#f6eed6" stroke={INK} strokeOpacity=".35" strokeWidth="2"><path d="M965 210h-75v-20h25v-25h60v-20h60v22h50v25h30v28H965Z"/><path d="M1310 200h-65v-20h20v-23h50v-19h55v21h55v23h27v26H1310Z"/></g>
    <text x="275" y="310" textAnchor="middle" className="atlas-sea-label">EAST BLUE</text>
    <text x="1120" y="470" textAnchor="middle" className="atlas-belt-label">CALM BELT</text>
    <text x="2075" y="1170" textAnchor="middle" className="atlas-belt-label">CALM BELT</text>
    <text x="970" y="745" textAnchor="middle" className="atlas-ocean-label">Paradise</text>
    <text x="2060" y="770" textAnchor="middle" className="atlas-ocean-label">New World</text>
    <text x="1240" y="70" textAnchor="middle" className="atlas-sea-label">THE SKY SEAS</text>
    {/* Cartouche: the chart's title, as a ribbon at the foot of the Grand Line. */}
    <g transform="translate(1180 1318)">
      <path d="M-330 -42H330l-22 34 22 34H-330l22-34Z" fill="#f1e3bd" stroke={INK} strokeWidth="2.5"/>
      <path d="M-300 -30H300M-300 14H300" stroke={INK} strokeOpacity=".35"/>
      <text y="-4" textAnchor="middle" className="atlas-grand-label">THE GRAND LINE</text>
      <text y="36" textAnchor="middle" className="atlas-tiny-label">AN OCEAN OF IMPOSSIBLE POSSIBILITIES</text>
    </g>
    <Rose x={175} y={150} r={62}/><Rose x={2210} y={1240} r={44}/>
    {/* A ticked frame, as if the chart were measured out by hand. */}
    <g fill="none" stroke={INK}>
      <rect x="10" y="10" width={W - 20} height={H - 20} strokeWidth="5"/>
      <rect x="24" y="24" width={W - 48} height={H - 48} strokeWidth="1.5"/>
      <path strokeWidth="1.5" d={[
        ...Array.from({length: 23}, (_, i) => `M${100 + i * 100} 10v14M${100 + i * 100} ${H - 10}v-14`),
        ...Array.from({length: 13}, (_, i) => `M10 ${100 + i * 100}h14M${W - 10} ${100 + i * 100}h-14`),
      ].join('')}/>
    </g>
  </g>;
});
