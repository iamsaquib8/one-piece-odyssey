import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';

interface CharacterPortraitProps {
  characterId: string;
  name?: string;
  color?: string;
  className?: string;
}

type Hair = 'spikes' | 'swept' | 'long' | 'round' | 'mohawk' | 'bald' | 'flame';
type Hat = 'straw' | 'cap' | 'top' | 'beanie' | 'bandana' | 'helmet' | 'crown' | 'wide' | 'cowboy';
type Kind = 'human' | 'skull' | 'reindeer' | 'fishman' | 'mink';
type Effect = 'sun' | 'embers' | 'snow' | 'ghosts' | 'lightning' | 'petals' | 'bubbles' | 'none';

interface PortraitRecipe {
  skin: string;
  hair: string;
  coat: string;
  hairStyle: Hair;
  hat?: Hat;
  kind?: Kind;
  effect?: Effect;
  beard?: boolean;
  moustache?: boolean;
  scar?: 'eye' | 'cheek' | 'cross';
  glasses?: boolean;
  horns?: boolean;
  earring?: boolean;
  longNose?: boolean;
}

const P = (hair: string, coat: string, extras: Partial<PortraitRecipe> = {}): PortraitRecipe => ({
  skin: '#c9855d', hair, coat, hairStyle: 'spikes', kind: 'human', effect: 'none', ...extras,
});

const RECIPES: Record<string, PortraitRecipe> = {
  luffy: P('#18191b', '#d9473f', { hat: 'straw', scar: 'cheek', effect: 'sun' }),
  zoro: P('#4a9c64', '#315844', { hairStyle: 'spikes', scar: 'eye', earring: true }),
  nami: P('#e77d35', '#4a78a3', { hairStyle: 'long' }),
  usopp: P('#251e19', '#9e793b', { hairStyle: 'round', hat: 'cap', longNose: true }),
  sanji: P('#dfc254', '#252a32', { hairStyle: 'swept', glasses: false, effect: 'embers' }),
  chopper: P('#7e503b', '#cb7893', { kind: 'reindeer', hat: 'top', hairStyle: 'round', effect: 'snow', skin: '#8b5a43' }),
  robin: P('#1d1c22', '#684f88', { hairStyle: 'long', glasses: true, effect: 'petals' }),
  franky: P('#4c9bc1', '#b73e3e', { hairStyle: 'mohawk', glasses: true }),
  brook: P('#111317', '#55436f', { kind: 'skull', hairStyle: 'round', hat: 'top', effect: 'ghosts', skin: '#e9dfc5' }),
  jinbe: P('#172e3d', '#b76d43', { kind: 'fishman', hairStyle: 'round', scar: 'eye', skin: '#488fa4' }),
  shanks: P('#a72f35', '#24262c', { hairStyle: 'swept', scar: 'eye', effect: 'lightning' }),
  beckman: P('#a9a39b', '#343b43', { hairStyle: 'swept', scar: 'cheek' }),
  yasopp: P('#171719', '#c2a347', { hairStyle: 'round', hat: 'bandana' }),
  whitebeard: P('#efe8cf', '#efe5ce', { hairStyle: 'bald', moustache: true, effect: 'lightning' }),
  marco: P('#edc82f', '#6d3b73', { hairStyle: 'flame', effect: 'embers' }),
  ace: P('#17191b', '#b95535', { hat: 'cowboy', effect: 'embers' }),
  blackbeard: P('#141213', '#493b58', { hairStyle: 'round', hat: 'bandana', beard: true, longNose: true }),
  shiryu: P('#2f3133', '#6a313a', { hat: 'cap', beard: true }),
  kuzan: P('#1b1b1d', '#4d86aa', { hairStyle: 'round', glasses: true, effect: 'snow' }),
  'big-mom': P('#e96692', '#d65b8a', { hairStyle: 'flame', hat: 'crown', effect: 'lightning', skin: '#d99878' }),
  katakuri: P('#7f3054', '#472b45', { hairStyle: 'spikes', scar: 'cheek' }),
  perospero: P('#9b285f', '#c97831', { hat: 'top', longNose: true }),
  kaido: P('#171c2d', '#344477', { hairStyle: 'long', horns: true, beard: true, effect: 'lightning' }),
  king: P('#141519', '#232631', { hairStyle: 'long', effect: 'embers', skin: '#58392e' }),
  queen: P('#e5c748', '#ca9d37', { hairStyle: 'long', glasses: true, moustache: true }),
  law: P('#17191c', '#333945', { hat: 'beanie', scar: 'cheek' }),
  bepo: P('#f0ead8', '#e5d6b4', { kind: 'mink', hairStyle: 'round', skin: '#eee6d2', effect: 'snow' }),
  'jean-bart': P('#32241f', '#5a6d72', { hairStyle: 'bald', beard: true }),
  kid: P('#bd2835', '#7a3038', { hairStyle: 'spikes', scar: 'eye', glasses: true, effect: 'lightning' }),
  killer: P('#d9bd45', '#6a5485', { hairStyle: 'long', hat: 'helmet', effect: 'lightning' }),
  heat: P('#4e6ba0', '#323a4b', { hairStyle: 'spikes', effect: 'embers' }),
  buggy: P('#3d6dad', '#c74646', { hairStyle: 'long', hat: 'bandana', longNose: true }),
  cabaji: P('#3b8a6f', '#714a8e', { hairStyle: 'long', hat: 'bandana', glasses: true }),
  mohji: P('#d8d1b4', '#9a6f45', { hairStyle: 'round', beard: true }),
  crocodile: P('#161718', '#4a4542', { hairStyle: 'swept', scar: 'cheek', effect: 'embers' }),
  mihawk: P('#171419', '#66313d', { hat: 'wide', beard: true, effect: 'lightning' }),
  hancock: P('#19151c', '#8e3150', { hairStyle: 'long', earring: true, effect: 'petals' }),
  marigold: P('#df7f26', '#b14a36', { hairStyle: 'flame', skin: '#b76d48' }),
  sandersonia: P('#4b8d5c', '#73528a', { hairStyle: 'long', skin: '#b96f51' }),
  capone: P('#151618', '#3c4650', { hat: 'top', beard: true, moustache: true }),
  vito: P('#3f744b', '#455a48', { hairStyle: 'spikes', longNose: true }),
  chiffon: P('#bf7475', '#d59a72', { hairStyle: 'long', skin: '#d89a79' }),
  bonney: P('#df6d94', '#7e394f', { hairStyle: 'long', effect: 'bubbles' }),
  gyogyo: P('#5c8f83', '#50746d', { hat: 'cap', hairStyle: 'spikes' }),
  cavendish: P('#e5cb5b', '#8f6aae', { hairStyle: 'long', effect: 'petals' }),
  suleiman: P('#e2ded0', '#495762', { hairStyle: 'long', scar: 'eye' }),
  bartolomeo: P('#55a553', '#6f3f58', { hairStyle: 'mohawk', effect: 'lightning' }),
  gambia: P('#478953', '#7b6143', { hairStyle: 'mohawk', glasses: true }),
  sai: P('#202020', '#3f7891', { hairStyle: 'bald', hat: 'cap' }),
  boo: P('#202022', '#596999', { hairStyle: 'bald', skin: '#a86244' }),
  ideo: P('#923e2e', '#b16645', { hairStyle: 'spikes', skin: '#9b4e3a' }),
  'blue-gilly': P('#486aa8', '#6a77a5', { hairStyle: 'long', skin: '#b46d50' }),
  leo: P('#d99734', '#6d823f', { hat: 'cap', kind: 'human', skin: '#d09a5d' }),
  mansherry: P('#f2c64f', '#db718d', { hairStyle: 'long', hat: 'crown', effect: 'petals' }),
  hajrudin: P('#b68752', '#69513f', { hat: 'helmet', hairStyle: 'long', beard: true }),
  gerd: P('#c67542', '#ad6977', { hairStyle: 'long', hat: 'helmet' }),
  stansen: P('#6f4931', '#75604f', { hairStyle: 'long', hat: 'helmet', beard: true }),
  orlumbus: P('#202022', '#496a7d', { hat: 'helmet', beard: true }),
  columbus: P('#3b2a2b', '#815d65', { hairStyle: 'long', hat: 'cap' }),
  alvida: P('#17151a', '#b74d79', { hat: 'wide', hairStyle: 'long' }),
  heppoko: P('#775b39', '#778461', { hairStyle: 'bald', hat: 'bandana' }),
  kuro: P('#17191c', '#3f4b5d', { hairStyle: 'swept', glasses: true }),
  jango: P('#284473', '#4f75a3', { hairStyle: 'round', glasses: true, longNose: true }),
  krieg: P('#d0b33b', '#7f783e', { hairStyle: 'spikes', skin: '#b77655' }),
  gin: P('#242426', '#53686e', { hat: 'bandana', hairStyle: 'long' }),
  arlong: P('#151d22', '#4f91a9', { kind: 'fishman', hairStyle: 'long', longNose: true, skin: '#559cb0' }),
  hachi: P('#d26f74', '#bd7a61', { kind: 'fishman', hairStyle: 'spikes', skin: '#d87c7f' }),
  dorry: P('#d36332', '#496c91', { hat: 'helmet', beard: true }),
  brogy: P('#c63b2f', '#87513c', { hat: 'helmet', beard: true }),
  bellamy: P('#dcc44e', '#a55845', { hairStyle: 'spikes', scar: 'eye' }),
  sarquiss: P('#d5bb54', '#687267', { hairStyle: 'long', glasses: true }),
  foxy: P('#552f75', '#7c5a92', { hairStyle: 'spikes', longNose: true }),
  porche: P('#d8649b', '#c05b88', { hairStyle: 'long', glasses: true }),
  hamburg: P('#65452f', '#7e6549', { hairStyle: 'round', beard: true, skin: '#956046' }),
  moria: P('#613e78', '#3d344d', { horns: true, hairStyle: 'flame', skin: '#9b7995', effect: 'ghosts' }),
  perona: P('#df6ca2', '#8a425f', { hairStyle: 'long', hat: 'crown', effect: 'ghosts', skin: '#dd9d83' }),
  hogback: P('#5b446e', '#64646b', { hairStyle: 'round', glasses: true, longNose: true }),
  lola: P('#dc6e80', '#b36274', { hairStyle: 'long', skin: '#c98369' }),
  'risky-brothers': P('#604a3b', '#617d74', { hairStyle: 'spikes', hat: 'bandana', glasses: true }),
  doflamingo: P('#e975a0', '#b64e76', { hairStyle: 'spikes', glasses: true, effect: 'lightning' }),
  trebol: P('#78912f', '#6b7336', { hairStyle: 'long', longNose: true }),
  corazon: P('#17282e', '#343b47', { hairStyle: 'spikes', effect: 'embers' }),
  hody: P('#ebe9de', '#465e77', { kind: 'fishman', hairStyle: 'long', skin: '#8aa8ad' }),
  zeo: P('#b8d3d0', '#4f7880', { kind: 'fishman', hairStyle: 'long', hat: 'bandana', skin: '#7fa8a6' }),
  'vander-decken': P('#332f49', '#655678', { kind: 'fishman', hat: 'top', beard: true, skin: '#7391a0' }),
  wadatsumi: P('#b27a94', '#786579', { kind: 'fishman', hairStyle: 'round', skin: '#c38da1' }),
  apoo: P('#322326', '#a44f48', { hairStyle: 'long', longNose: true }),
  shanba: P('#26272a', '#657d74', { hairStyle: 'long', beard: true }),
  hawkins: P('#d8c366', '#7c6950', { hairStyle: 'long', effect: 'petals' }),
  faust: P('#8c504d', '#865e62', { kind: 'mink', hairStyle: 'round', skin: '#a96a63' }),
  urouge: P('#24201d', '#6b5b44', { hairStyle: 'bald', beard: true, skin: '#9a6043' }),
  drake: P('#973944', '#5b3840', { hat: 'helmet', hairStyle: 'spikes', scar: 'cheek' }),
  pedro: P('#375349', '#577365', { kind: 'mink', hairStyle: 'spikes', scar: 'eye', skin: '#846447' }),
  pekoms: P('#aa743d', '#6a583d', { kind: 'mink', hairStyle: 'round', glasses: true, skin: '#a47a4f' }),
  carrot: P('#f1dfca', '#db8a70', { kind: 'mink', hairStyle: 'long', skin: '#ead3ba', effect: 'lightning' }),
  roger: P('#171718', '#a74638', { hat: 'wide', hairStyle: 'round', moustache: true, effect: 'lightning' }),
  rayleigh: P('#ddd6ca', '#5c6268', { hairStyle: 'long', glasses: true, scar: 'eye', beard: true }),
  crocus: P('#ddd6c9', '#a59a4d', { hairStyle: 'spikes', glasses: true }),
  rocks: P('#24202a', '#4e3c59', { hairStyle: 'flame', effect: 'lightning' }),
  'fisher-tiger': P('#912f28', '#864638', { kind: 'fishman', hairStyle: 'spikes', skin: '#b65749' }),
  aladine: P('#222529', '#4b7e83', { kind: 'fishman', hairStyle: 'long', beard: true, skin: '#568a91' }),
  yorki: P('#81955b', '#687849', { hat: 'cowboy', hairStyle: 'long' }),
  sakazuki: P('#19191a', '#962f2e', { hat: 'cap', hairStyle: 'spikes', effect: 'embers' }),
  garp: P('#dedcd3', '#486d91', { hairStyle: 'spikes', scar: 'eye', beard: true }),
  coby: P('#d47782', '#4f7fa3', { hairStyle: 'swept', glasses: true, scar: 'cheek' }),
  dragon: P('#181a1a', '#2d5d55', { hairStyle: 'spikes', scar: 'cross', effect: 'lightning' }),
  sabo: P('#e5c351', '#3b5c83', { hat: 'top', scar: 'eye', effect: 'embers' }),
  ivankov: P('#36324a', '#a84b83', { hairStyle: 'round', skin: '#b9725c' }),
  'mr-1': P('#171719', '#5e6971', { hairStyle: 'bald', skin: '#84543e' }),
  'mr-2': P('#212127', '#ce7289', { hairStyle: 'round' }),
  lucci: P('#161719', '#474957', { hairStyle: 'long', beard: true }),
  kaku: P('#272522', '#64745f', { hairStyle: 'spikes', longNose: true }),
  stussy: P('#d1a857', '#a77a68', { hairStyle: 'long', effect: 'bubbles' }),
};

function hash(value: string) {
  let result = 7;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

function fallbackRecipe(id: string, color: string): PortraitRecipe {
  const seed = hash(id);
  const hairs: Hair[] = ['spikes', 'swept', 'long', 'round', 'mohawk', 'bald'];
  return P(['#252126', '#5b3e2e', '#d3b747', '#87413d', '#426e73'][seed % 5], color, {
    hairStyle: hairs[seed % hairs.length],
    skin: ['#d59a74', '#a9674d', '#754735', '#e0ad88'][seed % 4],
    hat: seed % 5 === 0 ? 'cap' : undefined,
    beard: seed % 7 === 0,
    glasses: seed % 11 === 0,
  });
}

function HairShape({ recipe }: { recipe: PortraitRecipe }) {
  if (recipe.hairStyle === 'bald') return null;
  if (recipe.hairStyle === 'long') return <path d="M28 71Q18 28 60 19Q103 27 92 82L79 101H37L27 77Z" fill={recipe.hair} stroke="var(--portrait-ink)" strokeWidth="4" />;
  if (recipe.hairStyle === 'round') return <path d="M25 60Q13 22 42 20Q59 5 73 19Q105 18 96 60L82 48H37Z" fill={recipe.hair} stroke="var(--portrait-ink)" strokeWidth="4" />;
  if (recipe.hairStyle === 'mohawk') return <path d="M43 39L45 12L54 29L63 8L69 30L83 15L78 45Z" fill={recipe.hair} stroke="var(--portrait-ink)" strokeWidth="4" />;
  if (recipe.hairStyle === 'flame') return <path d="M29 54Q19 32 35 12L43 29L54 7L62 30L77 9L80 31L99 23L88 58Z" fill={recipe.hair} stroke="var(--portrait-ink)" strokeWidth="4" />;
  if (recipe.hairStyle === 'swept') return <path d="M28 55Q27 22 57 20Q87 13 95 39L77 33L84 47L61 36L39 52Z" fill={recipe.hair} stroke="var(--portrait-ink)" strokeWidth="4" />;
  return <path d="M28 52L31 30L41 36L46 18L56 32L68 13L71 32L88 20L85 40L99 38L88 58Z" fill={recipe.hair} stroke="var(--portrait-ink)" strokeWidth="4" />;
}

function HatShape({ hat }: { hat?: Hat }) {
  if (!hat) return null;
  if (hat === 'straw') return <g><ellipse cx="60" cy="35" rx="43" ry="9" fill="#e6bd4b" stroke="var(--portrait-ink)" strokeWidth="4" /><path d="M35 35Q36 9 60 9Q84 9 86 35Z" fill="#e6bd4b" stroke="var(--portrait-ink)" strokeWidth="4" /><path d="M36 27H85" stroke="#d84b3c" strokeWidth="7" /></g>;
  if (hat === 'top') return <g><path d="M37 33L41 4H79L84 33Z" fill="var(--portrait-hat)" stroke="var(--portrait-ink)" strokeWidth="4" /><path d="M26 34H94" stroke="var(--portrait-ink)" strokeWidth="8" /></g>;
  if (hat === 'crown') return <path d="M32 36L27 10L45 23L60 5L75 23L94 9L88 38Z" fill="#ffd34e" stroke="var(--portrait-ink)" strokeWidth="4" />;
  if (hat === 'helmet') return <path d="M28 42Q29 10 60 10Q92 10 93 43L80 35H39Z" fill="#8b806a" stroke="var(--portrait-ink)" strokeWidth="5" />;
  if (hat === 'bandana') return <g><path d="M29 46Q31 15 60 15Q90 15 92 46Z" fill="var(--portrait-hat)" stroke="var(--portrait-ink)" strokeWidth="4" /><path d="M89 35L108 29L97 49Z" fill="var(--portrait-hat)" stroke="var(--portrait-ink)" strokeWidth="3" /></g>;
  if (hat === 'beanie') return <path d="M27 44Q28 10 60 10Q92 10 93 44Z" fill="#dfc13d" stroke="var(--portrait-ink)" strokeWidth="5" />;
  return <g><path d="M29 39Q32 12 60 12Q87 12 91 39Z" fill="var(--portrait-hat)" stroke="var(--portrait-ink)" strokeWidth="4" /><path d="M22 40H98" stroke="var(--portrait-ink)" strokeWidth="7" /></g>;
}

export default function CharacterPortrait({ characterId, name, color = '#087f91', className = '' }: CharacterPortraitProps) {
  const host = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const rawId = useId();
  const clipId = `portrait-${rawId.replace(/:/g, '')}`;
  const recipe = useMemo(() => RECIPES[characterId] ?? fallbackRecipe(characterId, color), [characterId, color]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let intersecting = false;
    const sync = () => setActive(intersecting && document.visibilityState === 'visible');
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; sync(); }, { rootMargin: '80px' });
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);

  const style = {
    '--portrait-color': color,
    '--portrait-coat': recipe.coat,
    '--portrait-hat': recipe.hair,
  } as CSSProperties;
  const eyeY = recipe.kind === 'skull' ? 59 : 57;

  if (characterId === 'laboon') return <span ref={host} className={`character-portrait ${className}`.trim()} data-active={active ? 'true' : 'false'} style={style}>
    <svg viewBox="0 0 120 120" role="img" aria-label={`${name ?? 'Laboon'} — original illustrated portrait`}>
      <defs><clipPath id={clipId}><circle cx="60" cy="60" r="56" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`} stroke="#10243a" strokeWidth="3" strokeLinecap="round">
        <circle cx="60" cy="60" r="58" fill="#78bac2" />
        <path d="M18 100Q8 30 54 20Q102 10 116 67L122 114Z" fill="#354b69" />
        <path d="M24 85Q60 112 116 88V116H32Z" fill="#a5bdc0" />
        <path d="M30 38l22 23m-5-27L30 65m33-26l11 17" stroke="#b9c6c7" fill="none" />
        <circle cx="35" cy="75" r="7" fill="#fff8e7" /><circle cx="33" cy="76" r="3" fill="#10243a" />
        <path d="M20 86Q44 98 69 88" fill="none" />
        <path d="M-5 106Q20 96 48 108T125 104" fill="none" stroke="#d2efe6" strokeWidth="5" />
      </g>
      <circle cx="60" cy="60" r="56" fill="none" stroke="#10243a" strokeWidth="4" />
    </svg>
  </span>;

  return <span ref={host} className={`character-portrait ${className}`.trim()} data-active={active ? 'true' : 'false'} data-effect={recipe.effect} style={style}>
    <svg viewBox="0 0 120 120" role="img" aria-label={`${name ?? characterId} — original illustrated portrait`}>
      <defs><clipPath id={clipId}><circle cx="60" cy="60" r="56" /></clipPath></defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="60" cy="60" r="58" fill="var(--portrait-color)" />
        <path className="portrait-current" d="M-10 100Q19 85 40 101T88 99T132 96V130H-10Z" fill="rgba(255,248,231,.18)" />
        <g className="portrait-aura" aria-hidden="true"><path d="M10 40L23 34M94 25L105 16M98 79L111 83M14 79L5 87" stroke="#ffd34e" strokeWidth="4" strokeLinecap="round" /></g>
        <g className="portrait-bust">
          {recipe.horns ? <path d="M34 39Q10 27 18 8Q29 27 43 29M85 35Q108 24 102 5Q90 26 78 29" fill="#e3d3aa" stroke="var(--portrait-ink)" strokeWidth="4" /> : null}
          <HairShape recipe={recipe} />
          <path d="M18 128Q20 85 44 80H76Q101 85 104 128Z" fill={recipe.coat} stroke="var(--portrait-ink)" strokeWidth="5" />
          {recipe.kind === 'skull' ? <g><path d="M31 47Q31 27 60 25Q89 27 89 54Q87 75 74 78V94L66 88L60 96L53 88L45 94V78Q32 72 31 47Z" fill="#eee5ca" stroke="var(--portrait-ink)" strokeWidth="5" /><path d="M49 73L45 82M70 73L75 82" stroke="var(--portrait-ink)" strokeWidth="4" /></g>
            : recipe.kind === 'reindeer' ? <g><path d="M34 39L20 20M37 37L32 14M85 40L100 21M82 35L88 13" stroke="#8b5a43" strokeWidth="7" strokeLinecap="round" /><path d="M31 45Q31 26 60 24Q89 26 89 57Q86 82 60 85Q34 82 31 45Z" fill={recipe.skin} stroke="var(--portrait-ink)" strokeWidth="5" /><ellipse cx="60" cy="71" rx="11" ry="8" fill="#77b8c6" stroke="var(--portrait-ink)" strokeWidth="3" /></g>
            : <g><ellipse cx="31" cy="59" rx="8" ry="11" fill={recipe.skin} stroke="var(--portrait-ink)" strokeWidth="4" /><ellipse cx="89" cy="59" rx="8" ry="11" fill={recipe.skin} stroke="var(--portrait-ink)" strokeWidth="4" /><path d="M31 43Q34 23 60 23Q87 24 90 45V65Q86 84 60 88Q34 83 30 64Z" fill={recipe.skin} stroke="var(--portrait-ink)" strokeWidth="5" /></g>}
          {recipe.kind === 'mink' ? <path d="M34 37L27 15L47 27M84 38L93 16L74 28" fill={recipe.skin} stroke="var(--portrait-ink)" strokeWidth="4" /> : null}
          {recipe.kind === 'fishman' ? <path d="M32 51L17 43L24 61M88 51L104 43L96 63" fill={recipe.skin} stroke="var(--portrait-ink)" strokeWidth="4" /> : null}
          <g className="portrait-eyes">
            <path d={`M40 ${eyeY}Q47 ${eyeY - 4} 53 ${eyeY}`} stroke="var(--portrait-ink)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d={`M67 ${eyeY}Q74 ${eyeY - 4} 81 ${eyeY}`} stroke="var(--portrait-ink)" strokeWidth="4" strokeLinecap="round" fill="none" />
            <g className="portrait-lids"><path d={`M39 ${eyeY - 1}Q47 ${eyeY + 5} 54 ${eyeY - 1}`} stroke={recipe.skin} strokeWidth="6" fill="none" /><path d={`M66 ${eyeY - 1}Q74 ${eyeY + 5} 82 ${eyeY - 1}`} stroke={recipe.skin} strokeWidth="6" fill="none" /></g>
          </g>
          {recipe.longNose ? <path d="M59 55Q72 65 58 69" fill="none" stroke="var(--portrait-ink)" strokeWidth="4" strokeLinecap="round" /> : <path d="M59 57L56 67L63 67" fill="none" stroke="var(--portrait-ink)" strokeWidth="3" strokeLinecap="round" />}
          {recipe.moustache ? <path d="M59 71Q45 60 31 70Q43 71 52 80Q58 80 60 74Q63 80 69 80Q78 71 91 70Q76 60 61 71Z" fill={recipe.hair} stroke="var(--portrait-ink)" strokeWidth="3" /> : null}
          {recipe.beard ? <path d="M39 75Q43 101 60 108Q78 100 82 74Q73 86 60 84Q48 86 39 75Z" fill={recipe.hair} stroke="var(--portrait-ink)" strokeWidth="3" /> : null}
          {!recipe.moustache && !recipe.beard ? <path d="M49 76Q60 83 71 76" fill="none" stroke="var(--portrait-ink)" strokeWidth="3" strokeLinecap="round" /> : null}
          {recipe.scar === 'eye' ? <path d="M43 37L49 69" stroke="#74362f" strokeWidth="3" strokeLinecap="round" /> : null}
          {recipe.scar === 'cheek' ? <path d="M67 67L77 74M69 72L75 68" stroke="#74362f" strokeWidth="2.5" strokeLinecap="round" /> : null}
          {recipe.scar === 'cross' ? <path d="M37 37L74 78M71 33L39 78" stroke="#74362f" strokeWidth="3" strokeLinecap="round" /> : null}
          {recipe.glasses ? <g fill="rgba(92,185,207,.3)" stroke="var(--portrait-ink)" strokeWidth="3"><circle cx="47" cy="57" r="10" /><circle cx="74" cy="57" r="10" /><path d="M57 56H64" /></g> : null}
          {recipe.earring ? <g fill="#ffd34e" stroke="var(--portrait-ink)" strokeWidth="2"><circle cx="29" cy="69" r="3" /><circle cx="28" cy="77" r="3" /><circle cx="30" cy="85" r="3" /></g> : null}
          <HatShape hat={recipe.hat} />
        </g>
        <g className="portrait-particles" aria-hidden="true"><circle cx="20" cy="69" r="4" /><circle cx="101" cy="47" r="3" /><circle cx="92" cy="92" r="5" /></g>
      </g>
      <circle cx="60" cy="60" r="56" fill="none" stroke="var(--portrait-ink)" strokeWidth="4" />
    </svg>
  </span>;
}

export type { CharacterPortraitProps };
