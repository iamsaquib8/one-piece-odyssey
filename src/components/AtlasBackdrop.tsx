import {memo} from 'react';

export const AtlasBackdrop=memo(function AtlasBackdrop(){
  return <g aria-hidden="true" className="atlas-backdrop-art">
    <defs>
      <linearGradient id="atlas-ocean" x2="1" y2="1"><stop stopColor="#073d4b"/><stop offset=".52" stopColor="#075266"/><stop offset="1" stopColor="#172f53"/></linearGradient>
      <linearGradient id="atlas-corridor" x2="0" y2="1"><stop stopColor="#127a88" stopOpacity=".05"/><stop offset=".5" stopColor="#2099a1" stopOpacity=".45"/><stop offset="1" stopColor="#106d83" stopOpacity=".1"/></linearGradient>
      <pattern id="atlas-grid" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#bcece3" strokeWidth="1" strokeOpacity=".09"/><path d="M50 0V100M0 50H100" fill="none" stroke="#bcece3" strokeOpacity=".025"/></pattern>
      <pattern id="atlas-waves" width="140" height="105" patternUnits="userSpaceOnUse"><path d="M12 31h15m3 3h12m58 37h18m-15 5h24" fill="none" stroke="#7accc9" strokeWidth="2" strokeOpacity=".18"/></pattern>
      <pattern id="calm-water" width="80" height="24" patternUnits="userSpaceOnUse"><path d="M3 12H55" stroke="#87b4ac" strokeOpacity=".1"/></pattern>
      <pattern id="red-strata" width="45" height="85" patternUnits="userSpaceOnUse"><rect width="45" height="85" fill="#985744"/><path d="M0 0h25v35H0M45 50H23v35" fill="#b57451"/><path d="M0 40h20m7 25h18M35 4v22" stroke="#693d39" strokeWidth="5"/></pattern>
      <filter id="island-shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="9" stdDeviation="6" floodColor="#011d2b" floodOpacity=".7"/></filter>
    </defs>
    <rect width="2400" height="1400" fill="url(#atlas-ocean)"/>
    <path d="M625 505H2400V1035H625Z" fill="url(#atlas-corridor)"/>
    <rect x="635" y="395" width="1765" height="95" fill="#0d363f"/><rect x="635" y="395" width="1765" height="95" fill="url(#calm-water)"/>
    <rect x="635" y="1050" width="1765" height="185" fill="#0b343c"/><rect x="635" y="1050" width="1765" height="185" fill="url(#calm-water)"/>
    <path d="M640 500H2400M640 1040H2400" stroke="#add6b2" strokeOpacity=".32" strokeWidth="2" strokeDasharray="8 10"/>
    <rect width="2400" height="1400" fill="url(#atlas-grid)"/>
    <rect width="2400" height="1400" fill="url(#atlas-waves)"/>
    {[560,1735].map((x,i)=><g key={x}>
      <path d={`M${x} 0h75l-10 110 20 82-15 72 17 90-22 72 16 116-23 78 16 80-13 94 15 90-18 72 20 65-16 120 17 84-12 80H${x-5}l12-92-20-97 14-87-9-84 16-92-12-85 9-88-20-94 16-68-14-109 18-100-9-73 15-110-18-75Z`} fill="url(#red-strata)" stroke="#dda06e" strokeWidth="3" strokeOpacity=".65"/>
      <text transform={`translate(${x+40} 135) rotate(90)`} className="atlas-terrain-label">RED LINE</text>
      <text x={x+40} y={i?1320:1280} className="atlas-tiny-label" textAnchor="middle">{i?'SECOND CROSSING':'REVERSE MOUNTAIN'}</text>
    </g>)}
    <path d="M540 738l40-15 31 14 35-6 40 18" stroke="#082e43" strokeWidth="25" fill="none"/><path d="M540 738l40-15 31 14 35-6 40 18" stroke="#80d8df" strokeWidth="13" fill="none"/>
    <path className="atlas-current" d="M720 930q35 50 110 45m340-420q-45-65-90-40m675 305q-15 85 45 115m380-510q10-70-30-90" stroke="#75b7b4" fill="none" strokeWidth="3" strokeDasharray="12 16" opacity=".35"/>
    <g className="atlas-sea-king" transform="translate(860 1100)" fill="#719d8d" opacity=".22"><path d="M0 35q30-65 77-12 20 25 37 0-11 43-38 22Q36-7 11 47Z"/><path d="M36 4L27-9 52-2 65-13 77 11ZM4 32l-30-5 18 15-12 13L8 48Z"/><circle cx="-10" cy="36" r="3" fill="#d9e3b9"/></g>
    <g transform="translate(1520 420) scale(.8)" fill="#719d8d" opacity=".22"><path d="M0 35q30-65 77-12 20 25 37 0-11 43-38 22Q36-7 11 47Z"/><path d="M36 4L27-9 52-2 65-13 77 11ZM4 32l-30-5 18 15-12 13L8 48Z"/></g>
    <g fill="#d0e9df" opacity=".14"><path d="M965 210h-75v-20h25v-25h60v-20h60v22h50v25h30v28H965Z"/><path d="M1310 200h-65v-20h20v-23h50v-19h55v21h55v23h27v26H1310Z"/></g>
    <text x="275" y="310" textAnchor="middle" className="atlas-sea-label">EAST BLUE</text>
    <text x="1120" y="470" textAnchor="middle" className="atlas-belt-label">CALM BELT</text>
    <text x="2075" y="1170" textAnchor="middle" className="atlas-belt-label">CALM BELT</text>
    <text x="970" y="745" textAnchor="middle" className="atlas-ocean-label">PARADISE</text>
    <text x="2060" y="770" textAnchor="middle" className="atlas-ocean-label">NEW WORLD</text>
    <text x="1240" y="70" textAnchor="middle" className="atlas-sea-label">THE SKY SEAS</text>
    <text x="1180" y="1320" textAnchor="middle" className="atlas-grand-label">THE GRAND LINE</text>
    <text x="1180" y="1354" textAnchor="middle" className="atlas-tiny-label">AN OCEAN OF IMPOSSIBLE POSSIBILITIES</text>
    <g transform="translate(175 130)" className="atlas-compass" stroke="#ddc688" fill="none" opacity=".85"><circle r="65"/><circle r="48" strokeDasharray="2 7"/>{[0,45,90,135].map(a=><g key={a} transform={`rotate(${a})`}><path d="M0-83L12 0 0 83-12 0Z" fill="#102e3c"/><path d="M0-83L12 0H0Z" fill="#ddc688"/><path d="M0 83L-12 0H0Z" fill="#ddc688"/></g>)}<circle r="10" fill="#ddc688"/><text y="-96" textAnchor="middle" fill="#ddc688" stroke="none" fontSize="21">N</text></g>
  </g>;
});
