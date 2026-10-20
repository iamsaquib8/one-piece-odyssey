// The portrait recipe language. Kept free of React so build scripts and the poster maker share it.
export type Hair = 'spikes' | 'swept' | 'long' | 'round' | 'mohawk' | 'bald' | 'flame';
export type Hat = 'straw' | 'cap' | 'top' | 'beanie' | 'bandana' | 'helmet' | 'crown' | 'wide' | 'cowboy';
export type Kind = 'human' | 'skull' | 'reindeer' | 'fishman' | 'mink';
export type Effect = 'sun' | 'embers' | 'snow' | 'ghosts' | 'lightning' | 'petals' | 'bubbles' | 'none';

export interface PortraitRecipe {
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

export const P = (hair: string, coat: string, extras: Partial<PortraitRecipe> = {}): PortraitRecipe => ({
  skin: '#c9855d', hair, coat, hairStyle: 'spikes', kind: 'human', effect: 'none', ...extras,
});

export const RECIPES: Record<string, PortraitRecipe> = {
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

export function hash(value: string) {
  let result = 7;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

export function fallbackRecipe(id: string, color: string): PortraitRecipe {
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

export const recipeFor = (id: string, color = '#087f91'): PortraitRecipe => RECIPES[id] ?? fallbackRecipe(id, color);

export const HAIR_STYLES: Hair[] = ['spikes', 'swept', 'long', 'round', 'mohawk', 'bald', 'flame'];
// cap, wide and cowboy share one brim, so only cap is offered where people choose a hat.
export const HATS: Hat[] = ['straw', 'cap', 'top', 'beanie', 'bandana', 'helmet', 'crown'];
export const KINDS: Kind[] = ['human', 'skull', 'reindeer', 'fishman', 'mink'];
export const EFFECTS: Effect[] = ['none', 'sun', 'embers', 'snow', 'ghosts', 'lightning', 'petals', 'bubbles'];
