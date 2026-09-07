import type { CSSProperties } from 'react';

type Palette = {
  sky: string;
  skyLow: string;
  cloud: string;
  cloudShade: string;
  sea: string;
  seaDark: string;
  foam: string;
  ink: string;
  land: string;
  landDark: string;
  green: string;
  greenDark: string;
  accent: string;
  light: string;
};

type SceneKind =
  | 'foosha'
  | 'mount-colubo'
  | 'gray-terminal'
  | 'shells'
  | 'orange'
  | 'rare-animals'
  | 'syrup'
  | 'baratie'
  | 'arlong'
  | 'logue'
  | 'reverse'
  | 'whisky'
  | 'little-garden'
  | 'drum'
  | 'desert-port'
  | 'desert-oasis'
  | 'desert-ruins'
  | 'royal-tomb'
  | 'alubarna'
  | 'jaya'
  | 'angel-island'
  | 'upper-yard'
  | 'long-ring'
  | 'water-seven'
  | 'sea-train'
  | 'enies'
  | 'thriller'
  | 'sabaody'
  | 'amazon'
  | 'impel'
  | 'marineford'
  | 'fishman'
  | 'punk-hazard'
  | 'dressrosa'
  | 'green-bit'
  | 'zou'
  | 'whole-cake'
  | 'cacao'
  | 'mirror-world'
  | 'wano'
  | 'flower-capital'
  | 'udon'
  | 'ringo'
  | 'onigashima'
  | 'egghead'
  | 'elbaf'
  | 'ohara'
  | 'ship'
  | 'mystery';

type SceneSpec = {
  kind: SceneKind;
  palette: Palette;
  night?: boolean;
  clouds?: 'none' | 'small' | 'storm' | 'cloud-sea';
  water?: 'sea' | 'canal' | 'cloud' | 'ice' | 'lava' | 'void';
};

const DAY: Palette = {
  sky: '#7ed4df', skyLow: '#d8f0d5', cloud: '#fff8df', cloudShade: '#bfd7d0',
  sea: '#168cb1', seaDark: '#0a567b', foam: '#d8fff5', ink: '#172b3a',
  land: '#d1a15d', landDark: '#7a4b35', green: '#5f9f55', greenDark: '#276442',
  accent: '#d94b3f', light: '#ffe68c',
};

const DESERT: Palette = {
  ...DAY, sky: '#84cbd2', skyLow: '#f8d89e', sea: '#258daa', seaDark: '#155578',
  land: '#dfae58', landDark: '#8e5534', green: '#7f9d49', greenDark: '#3d6d49',
  accent: '#b94837', light: '#fff0ad',
};

const NIGHT: Palette = {
  ...DAY, sky: '#172a4b', skyLow: '#4b536b', cloud: '#a7adbd', cloudShade: '#62677c',
  sea: '#143c68', seaDark: '#0b213e', foam: '#85a9b8', ink: '#111725',
  land: '#6d5a52', landDark: '#342c35', green: '#385d53', greenDark: '#173b37',
  accent: '#a83d4b', light: '#ffd878',
};

const SNOW: Palette = {
  ...DAY, sky: '#8bbac9', skyLow: '#dce9e5', cloud: '#f8f3e7', cloudShade: '#b7ccd0',
  sea: '#3c7898', seaDark: '#244b70', foam: '#e8fcfb', land: '#e7ece9',
  landDark: '#718594', green: '#486d61', greenDark: '#284c4b', accent: '#8c4050', light: '#fff1b3',
};

const CANDY: Palette = {
  ...DAY, sky: '#8bd8dd', skyLow: '#f7c5cf', cloud: '#fff5e9', cloudShade: '#d7b6c3',
  sea: '#4aaac1', seaDark: '#276b8c', land: '#e9af71', landDark: '#9b5c63',
  green: '#79aa5b', greenDark: '#416b51', accent: '#d9577d', light: '#fff09c',
};

const FUTURE: Palette = {
  ...DAY, sky: '#7abccc', skyLow: '#b8eef0', cloud: '#e9ffff', cloudShade: '#8ecbd1',
  sea: '#147fa8', seaDark: '#16476e', land: '#b9c9b8', landDark: '#536779',
  green: '#5ab174', greenDark: '#235d55', accent: '#e55f43', light: '#ffe37a',
};

const spec = (kind: SceneKind, palette = DAY, extras: Partial<SceneSpec> = {}): SceneSpec => ({
  kind, palette, clouds: 'small', water: 'sea', ...extras,
});

const EXACT_SCENES: Record<string, SceneSpec> = {
  'foosha-village': spec('foosha'),
  'windmill-village': spec('foosha'),
  'mount-colubo': spec('mount-colubo', { ...DAY, green: '#467f48', greenDark: '#214b3d' }),
  'gray-terminal': spec('gray-terminal', { ...NIGHT, sky: '#71808b', skyLow: '#b08b6f', land: '#987054' }, { clouds: 'storm' }),
  'shells-town': spec('shells'),
  'orange-town': spec('orange'),
  'island-of-rare-animals': spec('rare-animals', CANDY),
  'syrup-village': spec('syrup'),
  baratie: spec('baratie'),
  'arlong-park': spec('arlong'),
  'cocoyasi-village': spec('arlong'),
  loguetown: spec('logue', NIGHT, { night: true, clouds: 'storm' }),
  'reverse-mountain': spec('reverse', { ...DAY, land: '#b84b42', landDark: '#682f35' }, { clouds: 'storm' }),
  'twin-cape': spec('reverse', { ...DAY, land: '#b84b42', landDark: '#682f35' }),
  'whisky-peak': spec('whisky', DESERT),
  'little-garden': spec('little-garden', { ...DAY, green: '#4e8845', greenDark: '#214e3b' }),
  'drum-island': spec('drum', SNOW, { water: 'ice', clouds: 'storm' }),
  nanohana: spec('desert-port', DESERT),
  rainbase: spec('desert-oasis', DESERT),
  yuba: spec('desert-oasis', DESERT, { clouds: 'none' }),
  erumalu: spec('desert-ruins', DESERT, { clouds: 'none' }),
  alubarna: spec('alubarna', DESERT),
  alabasta: spec('alubarna', DESERT),
  'royal-tomb-alabasta': spec('royal-tomb', NIGHT, { night: true, water: 'void', clouds: 'none' }),
  jaya: spec('jaya', DESERT),
  'mock-town': spec('jaya', DESERT),
  'angel-island': spec('angel-island', DAY, { water: 'cloud', clouds: 'cloud-sea' }),
  skypiea: spec('angel-island', DAY, { water: 'cloud', clouds: 'cloud-sea' }),
  'upper-yard': spec('upper-yard', { ...DAY, green: '#579353', greenDark: '#1e5a42' }, { water: 'cloud', clouds: 'cloud-sea' }),
  shandora: spec('upper-yard', NIGHT, { night: true, water: 'cloud', clouds: 'cloud-sea' }),
  'long-ring-long-land': spec('long-ring'),
  'water-7': spec('water-seven', DAY, { water: 'canal' }),
  'sea-train': spec('sea-train', NIGHT, { night: true, clouds: 'storm' }),
  'enies-lobby': spec('enies', { ...DAY, sky: '#92d3e4', skyLow: '#f3e7b7' }, { water: 'void' }),
  'thriller-bark': spec('thriller', NIGHT, { night: true, clouds: 'storm' }),
  'sabaody-archipelago': spec('sabaody', { ...DAY, skyLow: '#bfe6cb', accent: '#d65d82' }),
  'amazon-lily': spec('amazon', { ...DAY, accent: '#a44466', green: '#477f55' }),
  'impel-down': spec('impel', NIGHT, { night: true, clouds: 'storm' }),
  marineford: spec('marineford', { ...DAY, land: '#d1d0c0', landDark: '#6d7274' }),
  'fish-man-island': spec('fishman', { ...NIGHT, sky: '#123963', skyLow: '#286b83', accent: '#dc6385' }, { night: true }),
  'ryugu-palace': spec('fishman', { ...NIGHT, sky: '#123963', skyLow: '#286b83', accent: '#dc6385' }, { night: true }),
  'punk-hazard': spec('punk-hazard', NIGHT, { water: 'lava', clouds: 'storm' }),
  dressrosa: spec('dressrosa', CANDY),
  'green-bit': spec('green-bit', { ...DAY, green: '#5c9a4b', greenDark: '#275f43' }),
  zou: spec('zou', { ...DAY, sky: '#80c9d2', skyLow: '#d7e3bf' }),
  'whole-cake-island': spec('whole-cake', CANDY),
  'totto-land': spec('whole-cake', CANDY),
  'cacao-island': spec('cacao', CANDY),
  chocolat: spec('cacao', CANDY),
  'mirror-world': spec('mirror-world', NIGHT, { night: true, water: 'void' }),
  wano: spec('wano', { ...DAY, accent: '#d94e69', land: '#af8152' }),
  'wano-country': spec('wano', { ...DAY, accent: '#d94e69', land: '#af8152' }),
  kuri: spec('wano', DESERT),
  hakumai: spec('wano', SNOW),
  kibi: spec('wano', { ...DESERT, skyLow: '#d6bba0' }),
  'flower-capital': spec('flower-capital', CANDY, { night: true }),
  udon: spec('udon', DESERT, { clouds: 'storm' }),
  ringo: spec('ringo', SNOW),
  onigashima: spec('onigashima', NIGHT, { night: true, clouds: 'storm' }),
  egghead: spec('egghead', FUTURE),
  elbaf: spec('elbaf', { ...DAY, land: '#9c744d', landDark: '#57412f', green: '#477f4a' }),
  ohara: spec('ohara', { ...DAY, green: '#477b50', greenDark: '#24453b' }),
  'going-merry': spec('ship'),
  'thousand-sunny': spec('ship', CANDY),
};

function normalizeId(value: string) {
  return value.trim().toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function resolveScene(locationId: string): SceneSpec {
  const id = normalizeId(locationId);
  const exact = EXACT_SCENES[id];
  if (exact) return exact;

  const aliases: Array<[string[], SceneSpec]> = [
    [['foosha', 'windmill'], spec('foosha')],
    [['colubo'], spec('mount-colubo')],
    [['gray-terminal'], spec('gray-terminal', NIGHT, { clouds: 'storm' })],
    [['shell', 'morgan'], spec('shells')],
    [['orange'], spec('orange')],
    [['rare-animal'], spec('rare-animals', CANDY)],
    [['syrup'], spec('syrup')],
    [['baratie'], spec('baratie')],
    [['arlong', 'cocoyasi'], spec('arlong')],
    [['logue'], spec('logue', NIGHT, { night: true, clouds: 'storm' })],
    [['reverse-mountain', 'twin-cape'], spec('reverse', { ...DAY, land: '#b84b42', landDark: '#682f35' })],
    [['whisky'], spec('whisky', DESERT)],
    [['little-garden'], spec('little-garden')],
    [['drum'], spec('drum', SNOW, { water: 'ice', clouds: 'storm' })],
    [['nano', 'rainbase', 'yuba', 'erumalu', 'alubarna', 'alabasta'], spec('alubarna', DESERT)],
    [['royal-tomb'], spec('royal-tomb', NIGHT, { night: true, water: 'void', clouds: 'none' })],
    [['jaya', 'mock-town'], spec('jaya', DESERT)],
    [['skypiea', 'angel-island'], spec('angel-island', DAY, { water: 'cloud', clouds: 'cloud-sea' })],
    [['upper-yard', 'shandora'], spec('upper-yard', DAY, { water: 'cloud', clouds: 'cloud-sea' })],
    [['long-ring'], spec('long-ring')],
    [['water-7', 'water-seven'], spec('water-seven', DAY, { water: 'canal' })],
    [['sea-train'], spec('sea-train', NIGHT, { night: true, clouds: 'storm' })],
    [['enies'], spec('enies', DAY, { water: 'void' })],
    [['thriller'], spec('thriller', NIGHT, { night: true, clouds: 'storm' })],
    [['sabaody'], spec('sabaody')],
    [['amazon'], spec('amazon')],
    [['impel'], spec('impel', NIGHT, { night: true, clouds: 'storm' })],
    [['marineford'], spec('marineford')],
    [['fish-man', 'fishman', 'ryugu'], spec('fishman', NIGHT, { night: true })],
    [['punk-hazard'], spec('punk-hazard', NIGHT, { water: 'lava', clouds: 'storm' })],
    [['dressrosa'], spec('dressrosa', CANDY)],
    [['green-bit'], spec('green-bit')],
    [['zou'], spec('zou')],
    [['whole-cake', 'totto'], spec('whole-cake', CANDY)],
    [['cacao', 'chocolat'], spec('cacao', CANDY)],
    [['mirror'], spec('mirror-world', NIGHT, { night: true, water: 'void' })],
    [['wano', 'kuri', 'hakumai', 'kibi'], spec('wano')],
    [['flower-capital'], spec('flower-capital', CANDY, { night: true })],
    [['udon'], spec('udon', DESERT)],
    [['ringo'], spec('ringo', SNOW)],
    [['onigashima'], spec('onigashima', NIGHT, { night: true, clouds: 'storm' })],
    [['egghead'], spec('egghead', FUTURE)],
    [['elbaf'], spec('elbaf')],
    [['ohara'], spec('ohara')],
    [['merry', 'sunny', 'ship'], spec('ship')],
  ];
  for (const [needles, scene] of aliases) if (needles.some((needle) => id.includes(needle))) return scene;
  return spec('mystery', NIGHT, { night: true, clouds: 'storm' });
}

function Clouds({ p, kind }: { p: Palette; kind: SceneSpec['clouds'] }) {
  if (kind === 'none') return null;
  if (kind === 'storm') return <g className="px-clouds" fill={p.cloudShade} opacity=".88"><path d="M0 28h20v-7h11v-8h25v5h18v9h18v8H0z"/><path d="M205 17h18V9h32v5h14v7h31v14h20v18H205z"/><rect x="46" y="42" width="3" height="13"/><rect x="274" y="57" width="3" height="16"/></g>;
  const extra = kind === 'cloud-sea' ? <><path d="M0 124h34v-7h31v8h32v-9h41v8h36v-6h39v8h41v-9h34v7h32v56H0z" fill={p.cloud}/><path d="M0 139h56v-5h43v7h67v-6h58v7h96v38H0z" fill={p.cloudShade}/></> : null;
  return <g className="px-clouds"><path d="M13 30h16v-7h9v-7h18v5h13v8h17v8H13z" fill={p.cloud}/><path d="M222 38h14v-8h12v-6h19v7h16v7h21v8h-82z" fill={p.cloud}/><path d="M22 37h52v4H22zM231 46h63v4h-63z" fill={p.cloudShade}/>{extra}</g>;
}

function Sky({ scene }: { scene: SceneSpec }) {
  const { palette: p } = scene;
  return <g><rect width="320" height="180" fill={p.sky}/><rect y="66" width="320" height="65" fill={p.skyLow}/>{scene.night ? <><rect className="px-sun" x="259" y="18" width="23" height="23" fill={p.light}/><rect x="252" y="13" width="23" height="23" fill={p.sky}/><g fill={p.light}><rect x="35" y="17" width="3" height="3"/><rect x="104" y="29" width="2" height="2"/><rect x="187" y="14" width="3" height="3"/><rect x="298" y="65" width="2" height="2"/></g></> : <rect className="px-sun" x="260" y="18" width="24" height="24" fill={p.light}/>}<Clouds p={p} kind={scene.clouds}/></g>;
}

function Water({ scene }: { scene: SceneSpec }) {
  const p = scene.palette;
  if (scene.water === 'void') return <g className="px-water"><rect y="128" width="320" height="52" fill={p.ink}/><path d="M0 132h58v4h35v-3h51v6h44v-4h63v5h69v40H0z" fill={p.seaDark}/><path d="M8 151h41v3H8zm74 11h58v3H82zm115-13h67v3h-67zm49 18h50v3h-50z" fill={p.foam} opacity=".55"/></g>;
  if (scene.water === 'cloud') return null;
  if (scene.water === 'ice') return <g className="px-water"><rect y="133" width="320" height="47" fill={p.sea}/><path d="M0 142l38-8 35 8 44-6 45 9 42-8 47 5 35-9 34 8v39H0z" fill={p.foam}/><path d="M41 147l18 11 22-12 25 6-27 8-17 15zm119 4l29 10 17-13 25 6-18 9 22 10h-64z" fill={p.cloudShade}/></g>;
  if (scene.water === 'lava') return <g className="px-water"><rect y="134" width="320" height="46" fill="#342b3c"/><path d="M0 148h38v-8h34v10h47v8h38v-13h43v7h49v-11h34v8h37v31H0z" fill="#d64d32"/><path d="M12 157h44v4H12zm74 10h57v4H86zm102-7h51v4h-51zm62 10h45v3h-45z" fill="#ffb33c"/></g>;
  return <g className="px-water"><rect y="126" width="320" height="54" fill={p.sea}/><path d="M0 143h34v-4h29v5h43v-3h35v5h49v-5h35v3h46v-5h49v41H0z" fill={p.seaDark}/><g fill={p.foam}><path d="M7 136h39v3H7zm52 13h43v3H59zm66-12h31v3h-31zm54 17h56v3h-56zm68-17h43v3h-43z"/><path d="M26 164h58v3H26zm92-3h27v3h-27zm98 8h64v3h-64z" opacity=".7"/></g></g>;
}

function Tree({ x, y, scale = 1, autumn = false }: { x: number; y: number; scale?: number; autumn?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><rect x="-2" y="8" width="4" height="15" fill="#674332"/><path d="M-12 8h6V1h5v-7h7v6h6v9h-5v6H-9V9h-3z" fill={autumn ? '#d95769' : '#2f7048'}/><path d="M-7 3h7v-6h6v7h5v5H4v4H-7z" fill={autumn ? '#f08a8b' : '#65a24f'}/></g>;
}

function House({ x, y, roof = '#b94b3f', w = 22, h = 16 }: { x: number; y: number; roof?: string; w?: number; h?: number }) {
  return <g><path d={`M${x - 3} ${y}h${w + 6}l-5-8H${x + 2}z`} fill={roof}/><rect x={x} y={y} width={w} height={h} fill="#e8d2a4"/><rect x={x + 4} y={y + 5} width="5" height="6" fill="#5d7190"/><rect x={x + w - 8} y={y + 7} width="5" height={h - 7} fill="#76513e"/></g>;
}

function Foreground({ p, kind }: { p: Palette; kind: SceneKind }) {
  if (['reverse', 'baratie', 'sea-train', 'impel', 'marineford', 'fishman', 'punk-hazard', 'enies'].includes(kind)) return null;
  return <g><path d="M0 165h29l8-11 14 4 9 22H0zm320 0h-35l-10-12-17 6-7 21h69z" fill={p.ink}/><g fill={p.greenDark}><rect x="6" y="151" width="4" height="18"/><rect x="12" y="145" width="4" height="25"/><rect x="303" y="148" width="4" height="22"/><rect x="309" y="142" width="4" height="28"/></g></g>;
}

function SceneLandmark({ kind, p, mobile }: { kind: SceneKind; p: Palette; mobile: boolean }) {
  const nudge = mobile ? -9 : 0;
  switch (kind) {
    case 'foosha': return <g transform={`translate(${nudge} 0)`}><path d="M38 132l20-24 33-5 33 9 31 20z" fill={p.land}/><path d="M44 132l22-17 38-4 45 21z" fill={p.green}/><House x={73} y={103}/><House x={104} y={108} roof="#456f8a"/><Tree x={57} y={105}/><Tree x={139} y={112} scale={.8}/><g transform="translate(166 68)"><rect x="-4" y="11" width="8" height="55" fill="#e5d1ac"/><path d="M-22 9h44l-5 13h-34z" fill="#bb4e3d"/><rect x="-2" y="-7" width="4" height="39" fill={p.ink}/><rect x="-20" y="10" width="40" height="4" fill={p.ink}/><path d="M-4-6h8v13h-8zm0 40h8v13h-8zM-20 7h13v8h-13zm27 0h13v8H7z" fill={p.cloud}/></g><path d="M155 132l25-29 26 2 27 27z" fill={p.landDark}/><path d="M169 113h33l7 19h-56z" fill={p.greenDark}/></g>;
    case 'mount-colubo': return <g><path d="M0 136l32-54 43-34 43 18 35 70zm111 0l33-65 49-38 49 29 58 74z" fill={p.greenDark}/><path d="M17 134l29-44 32-26 56 72zm118 0l28-52 34-31 67 85z" fill={p.green}/><g fill="#204238"><path d="M21 105l11-36 10 36zm31-25l13-43 13 43zm42-5l12-39 13 39zm62 18l15-52 14 52zm45-21l15-50 14 50zm42 30l14-45 13 45z"/></g><path d="M122 135l17-26 13-2 17 28z" fill="#6f4c3d"/><path d="M135 111h18l-9-13z" fill="#ddd09b"/></g>;
    case 'gray-terminal': return <g><path d="M0 136l27-31 38 7 32-24 44 20 29-11 39 22 33-26 55 43z" fill="#5f5149"/><g fill="#89715b"><path d="M12 129l21-17 15 4 13-12 20 10 14-14 17 12 15-5 23 22zM178 131l17-17 18 5 11-14 25 13 18-14 31 27z"/></g><g fill="#332e31"><rect x="38" y="102" width="5" height="28"/><rect x="77" y="93" width="5" height="37"/><rect x="218" y="101" width="5" height="31"/><rect x="263" y="94" width="5" height="36"/><path d="M24 120h58v5H24zm166 3h88v5h-88z"/></g><g fill="#c05a37"><rect x="105" y="112" width="16" height="9"/><rect x="109" y="106" width="7" height="7"/></g><g fill="#b7aa91"><rect x="50" y="112" width="14" height="9"/><rect x="235" y="114" width="17" height="10"/></g></g>;
    case 'shells': return <g><path d="M43 132l23-25 41-8 36 9 19 24z" fill={p.land}/><g transform="translate(89 53)"><rect width="81" height="69" fill="#c9d3c5" stroke={p.ink} strokeWidth="4"/><rect x="7" y="12" width="15" height="15" fill="#547589"/><rect x="58" y="12" width="15" height="15" fill="#547589"/><rect x="31" y="34" width="19" height="35" fill="#5f5360"/><path d="M-8 8h15V-8h18V8h31V-8h18V8h15v11H-8z" fill="#a64841"/><rect x="34" y="-31" width="5" height="31" fill={p.ink}/><path d="M39-29l25 8-25 9z" fill={p.accent}/></g><path d="M38 130h144v6H38z" fill={p.landDark}/></g>;
    case 'orange': return <g><path d="M31 133l20-25 42-11 47 6 36 30z" fill={p.land}/><path d="M40 126l25-17 65-5 34 28H35z" fill={p.green}/><House x={55} y={105} roof="#dc713e"/><House x={82} y={96} roof="#d94f42" w={27}/><House x={115} y={104} roof="#ec963f"/><path d="M166 132l18-19 14 5 11 14z" fill={p.landDark}/><rect x="95" y="78" width="10" height="19" fill="#e6d2a5"/><path d="M91 78h18l-4-7H95z" fill="#47788a"/><Tree x={40} y={112} scale={.7}/><Tree x={148} y={106} scale={.9}/></g>;
    case 'rare-animals': return <g><path d="M24 135l25-29 41-10 39 9 27 30zm130 0l21-20 34-7 34 9 27 18z" fill={p.land}/><path d="M35 130l21-17 37-8 50 30zm133 1l17-11 27-4 44 19z" fill={p.green}/><g fill="#6b5043"><rect x="72" y="83" width="6" height="30"/><rect x="198" y="91" width="6" height="27"/></g><g fill={p.greenDark}><path d="M56 86h39l-8-18H65zM182 94h38l-9-18h-21z"/></g><g fill="#f2ddbd" stroke={p.ink} strokeWidth="2"><path d="M101 119h21v10h-21zM105 111h12v10h-12z"/><path d="M215 122h25v10h-25zM222 112h11v12h-11z"/></g><g fill={p.accent}><rect x="106" y="113" width="3" height="3"/><rect x="229" y="115" width="3" height="3"/></g></g>;
    case 'syrup': return <g><path d="M17 133l38-40 47-13 55 18 32 35z" fill={p.greenDark}/><path d="M28 133l36-32 46-12 64 44z" fill={p.green}/><path d="M80 133l12-31 15-8 9 39z" fill="#e0c388"/><g transform="translate(120 53)"><rect width="69" height="44" fill="#ead6a9"/><path d="M-6 2h81L62-9H8z" fill="#516680"/><rect x="28" y="22" width="14" height="22" fill="#795541"/><rect x="8" y="11" width="9" height="9" fill="#72a5aa"/><rect x="53" y="11" width="9" height="9" fill="#72a5aa"/></g><Tree x={50} y={91}/><Tree x={204} y={104}/><Tree x={226} y={113} scale={.8}/><path d="M98 133l2-18h5l2 18z" fill={p.landDark}/></g>;
    case 'baratie': return <g transform={mobile ? 'translate(-22 2)' : undefined}><path d="M57 130h202l-13 19H76z" fill="#6b3d32" stroke={p.ink} strokeWidth="4"/><path d="M91 89h125l17 42H75z" fill="#d8a95c" stroke={p.ink} strokeWidth="4"/><rect x="110" y="63" width="89" height="30" fill="#e9d9ad" stroke={p.ink} strokeWidth="4"/><path d="M103 63h103l-16-14h-72z" fill="#cf483c"/><g fill="#4c7785"><rect x="119" y="72" width="10" height="10"/><rect x="142" y="72" width="10" height="10"/><rect x="166" y="72" width="10" height="10"/><rect x="184" y="72" width="10" height="10"/></g><path d="M57 130L31 112l8 27 39 10zm202 0l25-19-7 28-39 10z" fill="#c9813c"/><path d="M146 49v-27h5v27zm39 0V30h5v19z" fill={p.ink}/><path d="M151 23l30 9-30 8z" fill={p.accent}/></g>;
    case 'arlong': return <g><path d="M34 133l21-18 42-7 33 8 37 17z" fill={p.land}/><g transform="translate(87 52)"><rect x="18" y="26" width="71" height="52" fill="#e8c99a" stroke={p.ink} strokeWidth="4"/><path d="M11 29h85L78 15H28z" fill="#d55b43"/><rect x="30" y="-1" width="47" height="25" fill="#ecd6aa"/><path d="M22 2h63L69-11H38z" fill="#4c8291"/><path d="M44 78V48h20v30" fill="#6e4a3f"/><g fill="#456e84"><rect x="27" y="37" width="10" height="9"/><rect x="71" y="37" width="10" height="9"/></g></g><path d="M55 116h21v17H49zm108-9h17v26h-25z" fill={p.greenDark}/><Tree x={45} y={103}/><Tree x={194} y={106}/></g>;
    case 'logue': return <g><path d="M0 132h320v6H0z" fill="#61545a"/><g fill="#403843"><rect x="18" y="80" width="46" height="52"/><rect x="68" y="68" width="53" height="64"/><rect x="211" y="75" width="47" height="57"/><rect x="262" y="63" width="58" height="69"/></g><g fill={p.light}><rect x="28" y="91" width="7" height="8"/><rect x="46" y="104" width="7" height="8"/><rect x="79" y="81" width="7" height="8"/><rect x="99" y="97" width="7" height="8"/><rect x="224" y="88" width="7" height="8"/><rect x="278" y="76" width="7" height="8"/></g><path d="M137 132V69h7v63m35 0V69h7v63M132 69h59v6h-59z" fill="#49352e"/><rect x="145" y="88" width="34" height="5" fill="#74503e"/><path d="M122 132h81v11h-81z" fill="#82726a"/></g>;
    case 'reverse': return <g><path d="M0 129L52 43l29-21 29 32 30 75zM320 129l-50-91-26-17-29 43-32 65z" fill={p.landDark}/><path d="M23 129l38-72 17-16 23 29 22 59zm274 0l-37-76-14-13-19 36-24 53z" fill={p.land}/><path d="M127 132l11-102h16l8 101zm31 0l9-78h16l9 78z" fill={p.sea}/><path d="M137 56h17v5h-17zm-4 31h25v5h-25zm31-8h21v5h-21z" fill={p.foam}/><rect x="150" y="102" width="5" height="22" fill={p.ink}/><path d="M155 103l17 7-17 7z" fill={p.accent}/></g>;
    case 'whisky': return <g><path d="M20 134l26-28 40-8 34 14 28 22z" fill={p.land}/><g fill={p.landDark}><path d="M48 109l7-40 8 40z"/><path d="M84 101l10-53 9 56z"/><path d="M126 116l9-58 9 62z"/></g><g fill={p.greenDark}><rect x="57" y="78" width="4" height="23"/><rect x="51" y="84" width="10" height="5"/><rect x="94" y="61" width="4" height="29"/><rect x="89" y="68" width="13" height="5"/><rect x="135" y="72" width="4" height="30"/><rect x="130" y="80" width="13" height="5"/></g><path d="M157 134l27-19 46 1 35 18z" fill={p.landDark}/><g fill="#d9c18b"><rect x="183" y="101" width="23" height="15"/><rect x="211" y="96" width="29" height="20"/></g></g>;
    case 'little-garden': return <g><path d="M0 134l33-39 40-12 31 13 25 38zm105 0l35-50 49-20 47 24 40 46z" fill={p.landDark}/><path d="M8 133l31-29 38-10 40 40zm111 0l31-36 42-18 65 55z" fill={p.greenDark}/><g fill={p.green}><path d="M25 102l12-32 10 32zM53 94l11-39 13 39zM151 93l13-49 13 49zM189 78l15-53 15 54zM224 99l14-47 13 51z"/></g><path d="M106 132l14-17 13 2 11 15z" fill="#73513d"/><path d="M113 116l5-11 4 10 6-8 4 10z" fill="#e9d6aa"/><path d="M254 132l8-23 7-4 5 27z" fill={p.land}/></g>;
    case 'drum': return <g><g fill={p.landDark}><path d="M15 135L56 32l25 103zM65 135L119 9l47 126zM137 135L203 42l39 93zM213 135l46-89 44 89z"/></g><g fill={p.land}><path d="M32 110L57 45l10 34 12 56H23zM87 111l33-84 15 45 26 63H77zm73 12l43-65 15 41 20 36h-88zm73 5l27-65 15 31 24 41h-73z"/></g><g transform="translate(104 18)"><rect x="8" y="31" width="40" height="27" fill="#67475c"/><rect x="14" y="8" width="10" height="30" fill="#7e5367"/><rect x="34" y="2" width="10" height="36" fill="#7e5367"/><path d="M10 9h18L19 0zm20-6h18L39-7z" fill={p.ink}/><g fill={p.light}><rect x="17" y="17" width="4" height="6"/><rect x="37" y="12" width="4" height="6"/><rect x="19" y="40" width="5" height="6"/><rect x="35" y="40" width="5" height="6"/></g></g></g>;
    case 'desert-port': return <g><path d="M0 134h220l-39-21-43-8-48 12-55-2z" fill={p.land}/><g fill="#e7c780"><rect x="27" y="91" width="43" height="30"/><rect x="75" y="98" width="32" height="25"/><rect x="114" y="85" width="54" height="39"/></g><g fill="#a66a48"><path d="M27 91a22 15 0 0143 0zM75 98a16 11 0 0132 0zM114 85a27 17 0 0154 0z"/></g><path d="M191 134h49l-16-40-16-1z" fill={p.landDark}/><rect x="208" y="70" width="5" height="25" fill={p.ink}/><path d="M213 71l21 8-21 8z" fill={p.accent}/></g>;
    case 'desert-oasis': return <g><path d="M0 137q75-38 160-3 76-38 160 3v43H0z" fill={p.land}/><path d="M104 129h84l18 18H83z" fill={p.sea}/><g fill="#e5c17c"><rect x="119" y="86" width="55" height="37"/><rect x="104" y="99" width="19" height="25"/><rect x="171" y="96" width="22" height="28"/></g><path d="M119 86a28 19 0 0155 0z" fill="#b86c46"/><Tree x={81} y={105}/><Tree x={211} y={107}/><path d="M0 151h62v4H0zm232 5h88v4h-88z" fill={p.landDark}/></g>;
    case 'desert-ruins': return <g><path d="M0 135q70-21 136-4 82-27 184 5v44H0z" fill={p.land}/><g fill="#aa754d"><rect x="48" y="101" width="39" height="27"/><rect x="105" y="86" width="13" height="42"/><rect x="127" y="94" width="48" height="34"/><rect x="196" y="107" width="31" height="23"/></g><g fill={p.skyLow}><rect x="55" y="108" width="8" height="20"/><rect x="137" y="103" width="11" height="25"/><rect x="206" y="114" width="8" height="16"/></g><path d="M20 120h29v8H20zm67 3h21v7H87zm88-5h22v12h-22z" fill={p.landDark}/></g>;
    case 'royal-tomb': return <g><rect x="24" y="55" width="272" height="84" fill="#3d3540"/><g fill="#786555"><rect x="35" y="45" width="17" height="91"/><rect x="82" y="45" width="17" height="91"/><rect x="221" y="45" width="17" height="91"/><rect x="268" y="45" width="17" height="91"/><path d="M28 45h31l-5-9H33zm47 0h31l-5-9H80zm139 0h31l-5-9h-21zm47 0h31l-5-9h-21z"/></g><path d="M112 137V76h96v61z" fill="#5a493f"/><path d="M125 137V91q35-37 70 0v46z" fill="#201e29"/><g fill={p.light}><rect x="51" y="64" width="4" height="24"/><rect x="266" y="64" width="4" height="24"/><path d="M45 64h16l-8-13zm213 0h16l-8-13z"/></g><path d="M0 139h320v41H0z" fill="#181925"/><path d="M22 151h276v5H22zm37 17h204v4H59z" fill="#65564e"/></g>;
    case 'alubarna': return <g><path d="M0 134l27-22 50-8 52 9 30 21zm136 0l31-27 56-10 57 15 40 22z" fill={p.land}/><g transform="translate(91 49)"><rect x="14" y="33" width="116" height="50" fill="#e3c17d"/><rect x="38" y="18" width="69" height="65" fill="#d6aa68"/><path d="M38 18a35 25 0 0169 0z" fill="#b75b44"/><rect x="3" y="43" width="17" height="40" fill="#c7985e"/><rect x="124" y="43" width="17" height="40" fill="#c7985e"/><g fill="#694d43"><rect x="51" y="48" width="12" height="35"/><rect x="82" y="48" width="12" height="35"/><rect x="13" y="58" width="7" height="12"/><rect x="124" y="58" width="7" height="12"/></g></g><path d="M126 132h55v5h-55z" fill={p.landDark}/></g>;
    case 'jaya': return <g><path d="M0 134l38-31 45-6 40 19 26 18zm142 0l28-21 41-2 43 23z" fill={p.land}/><path d="M11 133l31-21 45-6 51 28z" fill={p.greenDark}/><g fill="#7d5140"><rect x="53" y="91" width="35" height="25"/><rect x="91" y="99" width="30" height="21"/><rect x="174" y="93" width="44" height="28"/></g><path d="M48 91h46L86 80H58zm120 2h56l-13-12h-31z" fill="#bf4f3f"/><rect x="231" y="77" width="5" height="56" fill={p.ink}/><path d="M236 78l25 9-25 9z" fill={p.accent}/><path d="M221 134h52l-8 14h-36z" fill="#714536"/></g>;
    case 'angel-island': return <g><path d="M40 125l29-25 45-4 28 29z" fill={p.cloudShade}/><path d="M49 121l24-17 38-3 23 24z" fill={p.green}/><House x={80} y={93} roof="#e9dfc5"/><g transform="translate(177 43)"><path d="M0 81l19-52 25 52z" fill="#efdcad"/><path d="M14 35h13L21 0z" fill={p.light}/><path d="M9 53h24l-5-10H14z" fill={p.accent}/><rect x="17" y="61" width="9" height="20" fill="#74544d"/></g><g fill={p.cloud}><rect x="142" y="119" width="100" height="12"/><rect x="159" y="111" width="64" height="17"/></g></g>;
    case 'upper-yard': return <g><path d="M28 126l26-48 45-31 57 26 31 53z" fill={p.greenDark}/><path d="M42 126l22-40 39-24 62 64z" fill={p.green}/><g fill="#8d7652"><rect x="91" y="71" width="8" height="48"/><rect x="112" y="58" width="10" height="61"/><rect x="135" y="77" width="8" height="42"/><path d="M82 75h70v9H82zm13-18h40v8H95z"/></g><Tree x={57} y={77}/><Tree x={164} y={90}/><path d="M199 126l21-33 31-7 26 40z" fill={p.cloudShade}/></g>;
    case 'long-ring': return <g><path d="M0 133h320l-40-12-69 2-55-7-61 8-50-6z" fill={p.land}/><path d="M25 126h267v9H18z" fill={p.green}/><g fill={p.greenDark}><path d="M52 124l8-66 8 66zM113 124l7-89 9 89zM197 124l8-76 8 76zM263 124l6-54 7 54z"/></g><path d="M146 126l5-42 17 0 5 42z" fill="#d6c28e"/><path d="M143 84h33l-8-12h-17z" fill={p.accent}/></g>;
    case 'water-seven': return <g transform={mobile ? 'translate(-4 1) scale(.98)' : undefined}><path d="M52 132L73 73l36-33h102l35 33 22 59z" fill="#c5ac7b" stroke={p.ink} strokeWidth="4"/><path d="M82 132l15-69h125l17 69z" fill="#dcce9e"/><path d="M112 132l7-89h80l10 89z" fill="#b98f65"/><path d="M133 132V61h50v71z" fill="#e1d09f"/><path d="M143 61a15 20 0 0130 0z" fill="#4b7890"/><g fill={p.sea}><path d="M151 132V74h13v58zM105 132l11-50h9l-7 50zm82 0l-5-51h9l9 51z"/></g><g fill={p.ink}><rect x="90" y="70" width="8" height="11"/><rect x="216" y="70" width="8" height="11"/><rect x="138" y="91" width="8" height="10"/><rect x="173" y="91" width="8" height="10"/></g><path d="M0 142h110v4H0zm208 0h112v4H208z" fill={p.foam}/></g>;
    case 'sea-train': return <g><path d="M0 141h320v5H0z" fill={p.foam}/><g transform={mobile ? 'translate(-35 4)' : 'translate(0 0)'}><path d="M56 119h184l18 16H50z" fill="#202b3b"/><rect x="75" y="89" width="137" height="31" fill="#394556"/><rect x="195" y="76" width="28" height="44" fill="#2e3847"/><path d="M223 82h17l12 37h-29z" fill="#697180"/><g fill={p.light}><rect x="85" y="97" width="15" height="11"/><rect x="109" y="97" width="15" height="11"/><rect x="133" y="97" width="15" height="11"/><rect x="157" y="97" width="15" height="11"/><rect x="201" y="86" width="12" height="10"/></g><rect x="63" y="118" width="171" height="6" fill="#121a27"/><g fill="#121a27"><rect x="83" y="124" width="25" height="10"/><rect x="188" y="124" width="25" height="10"/></g><path d="M252 92h24v4h-24zm8-9h21v4h-21z" fill={p.cloudShade}/></g></g>;
    case 'enies': return <g><path d="M55 127l24-33 53-10 31 15 34-13 51 11 22 30z" fill="#d8ca9d"/><g transform="translate(106 38)"><rect x="8" y="39" width="91" height="48" fill="#d9d5bd" stroke={p.ink} strokeWidth="4"/><rect x="29" y="16" width="49" height="25" fill="#c0c4b6"/><path d="M23 17h61L75 5H32z" fill="#4e7491"/><rect x="42" y="55" width="22" height="32" fill="#4b596a"/><rect x="-2" y="49" width="15" height="38" fill="#babfae"/><rect x="94" y="49" width="15" height="38" fill="#babfae"/></g><path d="M0 128h95v7H0zm225 0h95v7h-95z" fill={p.ink}/><path d="M134 139h52l-7 18h-39z" fill="#0a1b30"/></g>;
    case 'thriller': return <g><path d="M24 132Q36 57 92 32q72-29 139 6 53 29 63 94z" fill="#28323a" stroke={p.ink} strokeWidth="5"/><path d="M66 124Q78 72 117 61h89q38 13 49 63z" fill="#4d4c50"/><g transform="translate(122 40)"><rect x="11" y="35" width="67" height="47" fill="#5f4b59"/><rect x="31" y="10" width="27" height="29" fill="#6e5362"/><path d="M25 12h39L55 0H34z" fill="#252836"/><path d="M20 35h49l-7-10H28z" fill="#252836"/><g fill={p.light}><rect x="20" y="48" width="8" height="9"/><rect x="62" y="48" width="8" height="9"/><rect x="42" y="20" width="7" height="9"/></g></g><path d="M29 132h262v11H29z" fill="#151d29"/><g fill={p.cloudShade}><rect x="3" y="112" width="70" height="7"/><rect x="252" y="102" width="68" height="8"/></g></g>;
    case 'sabaody': return <g><path d="M0 135h320l-30-19-51 4-40-12-54 9-51-10-48 10z" fill={p.land}/><g fill="#805b43"><path d="M36 132l12-91h29l8 91zM124 132l14-112h34l13 112zM225 132l13-83h26l11 83z"/></g><g fill={p.green}><path d="M30 51h68l-11-22H44zM116 33h80l-13-25h-54zM217 61h70l-13-24h-46z"/></g><g fill={p.foam} stroke="#76abc1" strokeWidth="2"><circle cx="101" cy="62" r="8"/><circle cx="210" cy="37" r="6"/><circle cx="283" cy="89" r="10"/><circle cx="24" cy="83" r="6"/><circle cx="196" cy="101" r="5"/></g><House x={92} y={111} roof="#ce6d64" w={18} h={13}/><House x={194} y={112} roof="#5e7e92" w={20} h={14}/></g>;
    case 'amazon': return <g><path d="M21 134l27-49 44-26 66-6 58 33 41 48z" fill={p.greenDark}/><path d="M39 134l24-37 44-24 61-3 67 64z" fill={p.green}/><g fill="#d7b77c"><path d="M95 119V82h76v37z"/><path d="M107 82l26-24 27 24z"/><rect x="128" y="38" width="10" height="27"/></g><path d="M115 119V91h14v28zm25 0V91h14v28z" fill="#76504c"/><g fill={p.accent}><path d="M75 107l8-20 8 20zM182 101l9-25 9 25z"/></g><Tree x={54} y={101}/><Tree x={222} y={97}/></g>;
    case 'impel': return <g><path d="M102 136l10-99h96l11 99z" fill="#343f4d" stroke={p.ink} strokeWidth="5"/><path d="M122 42h76l-6-20h-64z" fill="#596373"/><rect x="135" y="9" width="50" height="18" fill="#707783"/><path d="M129 9h62l-8-9h-46z" fill={p.ink}/><g fill="#171f2d"><rect x="125" y="57" width="13" height="15"/><rect x="182" y="57" width="13" height="15"/><rect x="125" y="85" width="13" height="15"/><rect x="182" y="85" width="13" height="15"/><rect x="151" y="106" width="19" height="30"/></g><path d="M89 136h144v8H89z" fill={p.ink}/><g fill={p.cloudShade}><rect x="13" y="119" width="95" height="7"/><rect x="211" y="108" width="96" height="8"/></g></g>;
    case 'marineford': return <g><path d="M17 136Q51 79 104 75h112q54 8 87 61z" fill={p.landDark}/><path d="M41 132q30-43 73-47h94q42 6 69 47z" fill={p.land}/><g transform="translate(93 39)"><rect x="0" y="38" width="134" height="54" fill="#d9d8c5"/><rect x="32" y="15" width="70" height="27" fill="#c7c8ba"/><path d="M24 16h86L98 3H39z" fill="#58768b"/><path d="M53 92V61h29v31" fill="#59616d"/><g fill="#4e6374"><rect x="12" y="53" width="10" height="12"/><rect x="112" y="53" width="10" height="12"/><rect x="41" y="26" width="10" height="10"/><rect x="84" y="26" width="10" height="10"/></g><rect x="64" y="-8" width="6" height="23" fill={p.ink}/><path d="M70-7l25 8-25 9z" fill={p.accent}/></g><path d="M0 138h96l19 14H0zm320 0h-96l-19 14h115z" fill={p.foam}/></g>;
    case 'fishman': return <g><ellipse cx="160" cy="87" rx="113" ry="72" fill="#4b98a2" opacity=".55" stroke={p.foam} strokeWidth="4"/><g fill="#df9a7b"><path d="M61 128l11-49 12 49zM238 129l12-60 13 60z"/></g><g fill="#d95e83"><path d="M52 128h39l-8-26H63zM227 128h45l-9-34h-24z"/></g><g transform="translate(111 45)"><rect x="14" y="33" width="74" height="51" fill="#e1ba80"/><path d="M8 34h86L75 19H28z" fill="#cf5c5b"/><rect x="35" y="7" width="31" height="18" fill="#e5c88d"/><path d="M28 8h45L58-5H43z" fill="#d95775"/><path d="M44 84V58h15v26" fill="#5a4b65"/></g><g fill="#7fd2d0"><circle cx="83" cy="43" r="4"/><circle cx="220" cy="56" r="6"/><circle cx="276" cy="101" r="3"/></g></g>;
    case 'punk-hazard': return <g><path d="M0 136l25-39 43-18 45 18 37 39z" fill="#7793a1"/><path d="M170 136l23-43 38-23 42 17 47 49z" fill="#472f33"/><path d="M16 128l28-27 38-9 45 44H8z" fill="#cbdce0"/><path d="M183 129l24-26 38-20 57 53H177z" fill="#8c3d35"/><path d="M228 84l10-32 12 27 8-19 12 34z" fill="#ef6a35"/><path d="M233 75l7-16 7 16z" fill="#ffbd48"/><g transform="translate(139 76)"><rect x="0" y="20" width="40" height="38" fill="#69717b"/><path d="M-5 21h50L37 10H4z" fill="#313846"/><rect x="15" y="32" width="11" height="26" fill="#27303c"/></g></g>;
    case 'dressrosa': return <g><path d="M11 134l30-51 53-23 59 19 24 55zm141 0l22-29 38-7 44 14 34 22z" fill={p.landDark}/><path d="M25 134l30-40 42-19 62 59zm145 0l19-22 29-4 49 26z" fill={p.green}/><g transform="translate(111 37)"><rect x="8" y="38" width="82" height="50" fill="#e7c89f"/><path d="M2 39h94L79 25H18z" fill="#d45769"/><rect x="31" y="9" width="37" height="20" fill="#e9d3b0"/><path d="M24 10h51L63-2H37z" fill="#765b8a"/><g fill="#5f6680"><rect x="18" y="52" width="10" height="11"/><rect x="70" y="52" width="10" height="11"/><rect x="41" y="63" width="16" height="25"/></g></g><House x={46} y={109} roof="#e56c58"/><House x={211} y={107} roof="#ef9b48"/></g>;
    case 'green-bit': return <g><path d="M18 134l29-65 44-31 52 21 34 75z" fill={p.greenDark}/><path d="M35 134l27-55 32-25 63 80z" fill={p.green}/><g fill="#8a6848"><path d="M76 80l11-58h19l11 58z"/><rect x="87" y="17" width="8" height="115"/></g><path d="M49 44h91l-14-24H67z" fill={p.green}/><path d="M169 135l28-31 41-6 54 37z" fill={p.land}/><g fill={p.foam}><circle cx="199" cy="77" r="7"/><circle cx="225" cy="59" r="5"/></g></g>;
    case 'zou': return <g transform={mobile ? 'translate(-12 3) scale(1.03)' : undefined}><g fill="#756453"><path d="M64 131l10-58 20-36h131l25 39 9 55h-24l-5-39H90l-5 39z"/><rect x="86" y="112" width="21" height="55"/><rect x="211" y="112" width="21" height="55"/><path d="M225 57l42 38-14 8-43-31z"/></g><path d="M93 62l29-28 70-3 35 31-18 36H107z" fill={p.greenDark}/><path d="M106 67l28-24h49l30 24-18 22h-72z" fill={p.green}/><g fill="#d9ba80"><rect x="136" y="55" width="17" height="16"/><rect x="165" y="50" width="19" height="19"/></g><path d="M80 84h167v6H80z" fill={p.foam} opacity=".8"/></g>;
    case 'whole-cake': return <g><path d="M23 136l25-24h223l27 24z" fill="#bc785e"/><g transform="translate(89 27)"><rect x="0" y="75" width="140" height="31" rx="4" fill="#f0c080"/><rect x="16" y="48" width="108" height="30" rx="4" fill="#e9909f"/><rect x="33" y="24" width="74" height="27" rx="3" fill="#f3d188"/><rect x="50" y="4" width="40" height="23" fill="#d87f91"/><path d="M0 78h140v8l-12-5-12 6-12-6-12 6-12-6-12 6-12-6-12 6-12-6-12 6-10-5zM16 51h108v7l-12-5-12 6-12-6-12 6-12-6-12 6-12-6-12 6-10-5z" fill="#fff0d3"/><g fill={p.light}><rect x="19" y="91" width="13" height="15"/><rect x="108" y="91" width="13" height="15"/><rect x="64" y="80" width="15" height="26"/></g><path d="M65 4V-12h7V4" fill={p.ink}/><path d="M72-10l18 7-18 7z" fill={p.accent}/></g></g>;
    case 'cacao': return <g><path d="M0 136l38-26 49-4 45 13 34 17zm147 0l29-23 52-5 54 28z" fill="#9c684f"/><g fill="#e7c18a"><rect x="43" y="84" width="45" height="35"/><rect x="94" y="94" width="33" height="28"/><rect x="178" y="81" width="53" height="39"/><rect x="237" y="94" width="31" height="28"/></g><g fill="#754b42"><path d="M39 84h53L80 69H54zM89 94h43l-9-13h-24zM173 81h63l-14-16h-35zM232 94h41l-8-12h-24z"/></g><g fill="#da7690"><rect x="50" y="96" width="7" height="9"/><rect x="109" y="103" width="7" height="9"/><rect x="191" y="94" width="8" height="9"/><rect x="249" y="103" width="7" height="9"/></g></g>;
    case 'mirror-world': return <g><path d="M0 132h320v48H0z" fill="#231f39"/><g stroke="#9c6fa0" strokeWidth="5" fill="#493b62"><path d="M35 132V57h43v75zM99 132V38h51v94zM173 132V49h47v83zM243 132V65h39v67z"/></g><g fill="#704f7b"><path d="M44 124V67h25v57zM109 124V50h31v74zM183 124V60h27v64zM252 124V75h21v49z"/></g><g fill={p.light} opacity=".6"><rect x="49" y="72" width="15" height="4"/><rect x="116" y="57" width="18" height="4"/><rect x="188" y="66" width="16" height="4"/><rect x="256" y="82" width="13" height="4"/></g></g>;
    case 'wano': return <g><path d="M0 135l34-48 47-18 47 24 25 42zm143 0l27-35 38-12 48 17 40 30z" fill={p.landDark}/><path d="M14 135l29-39 38-13 54 52zm143 0l25-27 31-8 60 35z" fill={p.green}/><g transform="translate(113 43)"><rect x="13" y="40" width="64" height="43" fill="#e1c495"/><path d="M6 43h78L70 30H20z" fill="#495f75"/><rect x="25" y="20" width="41" height="15" fill="#e6cf9f"/><path d="M18 22h55L61 10H30z" fill={p.accent}/><rect x="39" y="58" width="13" height="25" fill="#654b47"/></g><Tree x={73} y={101} autumn/><Tree x={222} y={101} autumn/><path d="M255 134l16-68h12l9 68z" fill={p.land}/><path d="M268 75h17v5h-17zm-5 18h25v5h-25z" fill={p.foam}/></g>;
    case 'flower-capital': return <g><path d="M0 135h320l-41-20-51 2-43-14-52 11-44-9-47 12z" fill={p.land}/><g fill="#e2c897"><rect x="39" y="94" width="36" height="29"/><rect x="80" y="84" width="44" height="39"/><rect x="130" y="98" width="35" height="27"/><rect x="171" y="79" width="51" height="45"/><rect x="228" y="95" width="39" height="30"/></g><g fill="#c84e63"><path d="M33 95h48L70 84H44zM73 85h58l-13-12H87zM124 99h47l-10-11h-27zM163 80h67l-16-14h-35zM221 96h52l-12-12h-28z"/></g><g fill={p.light}><rect x="49" y="104" width="7" height="8"/><rect x="95" y="95" width="8" height="9"/><rect x="190" y="92" width="9" height="9"/><rect x="242" y="105" width="8" height="9"/></g><Tree x={20} y={108} autumn/><Tree x={289} y={108} autumn/></g>;
    case 'udon': return <g><path d="M0 136l27-42 46-19 51 25 32 36zm154 0l32-33 41-10 48 16 45 27z" fill={p.landDark}/><g transform="translate(105 67)"><rect width="104" height="61" fill="#806b57"/><path d="M-7 1h118l-15-15H10z" fill="#393b44"/><rect x="39" y="28" width="26" height="33" fill="#343440"/><g fill="#363944"><rect x="10" y="15" width="16" height="16"/><rect x="78" y="15" width="16" height="16"/></g><path d="M0 8h104v5H0z" fill="#b95443"/></g><g fill="#5a4639"><rect x="49" y="107" width="7" height="29"/><rect x="68" y="100" width="7" height="36"/><rect x="246" y="104" width="7" height="32"/></g></g>;
    case 'ringo': return <g><path d="M0 136l29-48 39-25 49 29 34 44zm132 0l39-69 45-31 49 40 43 80z" fill={p.landDark}/><path d="M17 133l19-35 31-20 62 58zm136 0l31-56 31-25 72 84z" fill={p.land}/><g transform="translate(139 83)"><rect x="0" y="16" width="49" height="35" fill="#d7c08f"/><path d="M-6 17h61L43 5H8z" fill="#526576"/><rect x="19" y="28" width="11" height="23" fill="#614b47"/></g><Tree x={87} y={109} autumn/><Tree x={237} y={99} autumn/></g>;
    case 'onigashima': return <g><path d="M33 136l25-61 47-38 55 17 52-18 48 42 27 58z" fill="#4b4549"/><path d="M57 132l20-44 35-31 48 19 45-19 37 33 19 42z" fill="#75605b"/><g fill={p.ink}><path d="M86 65L60 25l13-9 35 35zM215 53l34-38 12 10-27 45z"/><path d="M97 92q9-29 30-26h66q22-1 31 26l-15 40H111z"/></g><g fill="#d7c29b"><rect x="124" y="83" width="16" height="17"/><rect x="181" y="83" width="16" height="17"/><path d="M145 113l15-12 16 12-7 19h-17z"/></g><path d="M145 56h31l-6-28h-19z" fill="#9e4d48"/></g>;
    case 'egghead': return <g><path d="M25 135l28-32 48-8 50 20 28 20zm139 0l24-24 42-8 51 12 28 20z" fill={p.land}/><g transform={mobile ? 'translate(-4 0)' : undefined}><path d="M89 117q3-77 73-82 70 5 73 82z" fill="#e1ece2" stroke={p.ink} strokeWidth="4"/><path d="M105 117q3-60 57-65 54 4 57 65z" fill="#91c8ce"/><rect x="117" y="76" width="90" height="41" fill="#d5e4dc"/><g fill="#436985"><rect x="128" y="87" width="13" height="12"/><rect x="151" y="87" width="13" height="12"/><rect x="174" y="87" width="13" height="12"/><rect x="151" y="103" width="18" height="14"/></g><path d="M162 52V23h7v29" fill={p.ink}/><path d="M169 25l28 9-28 9z" fill={p.accent}/><path d="M77 115h171v8H77z" fill="#566777"/></g></g>;
    case 'elbaf': return <g><path d="M0 137l34-52 53-27 49 30 28 49zm160 0l30-42 49-17 46 24 35 35z" fill={p.landDark}/><path d="M12 136l31-42 43-20 61 63zm164 0l23-31 39-13 61 45z" fill={p.green}/><g transform="translate(139 8)"><rect x="13" y="27" width="18" height="105" fill="#684d38"/><path d="M-30 41h103L57 16H-13z" fill={p.greenDark}/><path d="M-17 20h77L47 0H-5z" fill={p.green}/></g><g fill="#d6b77e"><rect x="53" y="104" width="41" height="25"/><rect x="220" y="103" width="43" height="26"/></g><g fill="#815145"><path d="M47 105h53L87 91H60zM214 104h55l-13-15h-29z"/><path d="M52 94l-9-17 13 7 5-18 7 20 14-7-8 16zm166 0l-8-18 13 8 6-19 7 20 14-7-8 16z"/></g></g>;
    case 'ohara': return <g><path d="M28 135l28-42 43-19 54 20 27 41zm136 0l24-31 43-11 50 20 25 22z" fill={p.greenDark}/><g transform="translate(104 20)"><rect x="43" y="25" width="16" height="90" fill="#75513b"/><path d="M-3 39h108L89 16H14z" fill={p.greenDark}/><path d="M10 20h82L78 0H24z" fill={p.green}/><g fill="#e0c291"><rect x="0" y="81" width="37" height="35"/><rect x="65" y="80" width="39" height="36"/></g><path d="M-6 82h49L32 68H7zm65-1h51L98 67H70z" fill="#6d5e64"/></g></g>;
    case 'ship': return <g transform={mobile ? 'translate(-24 3)' : undefined}><path d="M60 126h196l-22 25H85z" fill="#7a4a34" stroke={p.ink} strokeWidth="4"/><path d="M93 124V59h6v65m75 0V38h7v86" fill={p.ink}/><path d="M100 65h61l-14 43h-47zm82-21h68l-17 48h-51z" fill={p.cloud}/><path d="M100 65h61v6h-61zm82-21h68v6h-68z" fill={p.accent}/><rect x="131" y="112" width="63" height="14" fill="#d39a54"/><g fill="#3f6171"><rect x="140" y="116" width="8" height="7"/><rect x="158" y="116" width="8" height="7"/><rect x="176" y="116" width="8" height="7"/></g><path d="M181 40l25 9-25 9z" fill={p.accent}/></g>;
    case 'mystery': return <g><path d="M65 136l31-53 45-26 47 8 44 36 24 35z" fill={p.landDark}/><path d="M86 132l26-39 34-20 44 8 42 51z" fill="#334951"/><g fill={p.cloudShade} opacity=".9"><rect x="35" y="73" width="86" height="10"/><rect x="7" y="89" width="139" height="12"/><rect x="178" y="65" width="107" height="11"/><rect x="157" y="83" width="156" height="13"/></g><path d="M148 116V96q0-16 15-16 14 0 14 13 0 9-10 14v9h-12v-15q9-3 9-9 0-4-4-4-5 0-5 8v20z" fill={p.light}/><rect x="153" y="122" width="14" height="13" fill={p.light}/></g>;
  }
}

export type PixelSceneProps = {
  locationId: string;
  className?: string;
  mobile?: boolean;
};

/** Decorative, code-native location art. The surrounding card supplies the location name. */
export function PixelScene({ locationId, className, mobile = false }: PixelSceneProps) {
  const scene = resolveScene(locationId);
  const style = { '--pixel-scene-ratio': mobile ? '1 / 1' : '16 / 9' } as CSSProperties;
  return (
    <svg
      aria-hidden="true"
      className={className}
      data-scene={scene.kind}
      focusable="false"
      preserveAspectRatio={mobile ? 'xMidYMid slice' : 'xMidYMid meet'}
      shapeRendering="crispEdges"
      style={style}
      viewBox={mobile ? '44 0 232 180' : '0 0 320 180'}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Sky scene={scene}/>
      <Water scene={scene}/>
      <SceneLandmark kind={scene.kind} p={scene.palette} mobile={mobile}/>
      <Foreground p={scene.palette} kind={scene.kind}/>
      <rect x="1.5" y="1.5" width="317" height="177" fill="none" stroke={scene.palette.ink} strokeOpacity=".22" strokeWidth="3" vectorEffect="non-scaling-stroke"/>
    </svg>
  );
}

export default PixelScene;

/** A transparent landmark for the navigational atlas; shares the scene's original art. */
export function MapIsland({locationId}:{locationId:string}) {
  const scene=resolveScene(locationId);
  // Nested SVG viewports need explicit dimensions; CSS alone can leave them
  // sized to the entire atlas, enlarging and displacing every landmark.
  return <svg width={320} height={180} viewBox="0 0 320 180" aria-hidden="true" focusable="false" overflow="visible" shapeRendering="crispEdges"><SceneLandmark kind={scene.kind} p={scene.palette} mobile={false}/></svg>;
}
