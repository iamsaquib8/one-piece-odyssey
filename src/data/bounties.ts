import type { Character } from '../types';

type Bounty = Character['bounties'][number];

/**
 * The chapter a bounty figure is first shown in: the trailing number of `after`. Spoiler limits
 * use it, so it is the reveal, which is often the arc after the one where the bounty was earned.
 */
export function bountyChapter(after: string): number | undefined {
  const match = after.match(/(\d{1,4})\s*$/);
  return match ? Number(match[1]) : undefined;
}

export const bountyValue = (amount: string): number => Number(amount.replaceAll(',', ''));

// Bounties for supporting profiles (other-characters.ts), each tied to the chapter that first
// shows the figure. Figures known only from databooks, Vivre Cards, films or novels are left out,
// as is any figure whose reveal chapter could not be pinned down. Listed in story order, which
// for every entry here is also reveal order: the validator requires chapters never to go back.
const b = (amount: string, label: string, chapter: number): Bounty => ({ amount, after: `${label} · ${chapter}` });

export const supportingBounties: Record<string, Bounty[]> = {
  arlong: [b('20,000,000', 'Arlong Park', 69)],
  krieg: [b('17,000,000', 'Baratie', 96)],
  buggy: [b('15,000,000', 'Orange Town', 96), b('3,189,000,000', 'Cross Guild', 1058)],
  dorry: [b('100,000,000', 'Little Garden', 118), b('1,800,000,000', 'After Egghead', 1130)],
  brogy: [b('100,000,000', 'Little Garden', 118), b('1,800,000,000', 'After Egghead', 1130)],
  jango: [b('9,000,000', 'Syrup Village, cover story', 136)],
  crocodile: [b('81,000,000', 'Before the Warlords', 155), b('1,965,000,000', 'Cross Guild', 1058)],
  bellamy: [b('55,000,000', 'Jaya', 222), b('195,000,000', 'Dressrosa', 706)],
  sarquiss: [b('38,000,000', 'Jaya', 223)],
  doflamingo: [b('340,000,000', 'Before the Warlords', 234)],
  foxy: [b('24,000,000', 'Long Ring Long Land', 305)],
  'mr-2': [b('32,000,000', 'Baroque Works, cover story', 372)],
  moria: [b('320,000,000', 'Before the Warlords', 455)],
  law: [b('200,000,000', 'Sabaody', 498), b('440,000,000', 'Punk Hazard', 659), b('500,000,000', 'After Dressrosa', 801), b('3,000,000,000', 'Wano', 1053)],
  kid: [b('315,000,000', 'Sabaody', 498), b('470,000,000', 'After the timeskip', 677), b('3,000,000,000', 'Wano', 1053)],
  killer: [b('162,000,000', 'Sabaody', 498), b('200,000,000', 'After the timeskip', 677)],
  capone: [b('138,000,000', 'Sabaody', 498), b('300,000,000', 'After the timeskip', 812), b('350,000,000', 'After Whole Cake Island, cover story', 966)],
  bonney: [b('140,000,000', 'Sabaody', 498), b('320,000,000', 'After the timeskip', 1060)],
  apoo: [b('198,000,000', 'Sabaody', 498), b('350,000,000', 'After the timeskip', 677)],
  hawkins: [b('249,000,000', 'Sabaody', 498), b('320,000,000', 'After the timeskip', 677)],
  urouge: [b('108,000,000', 'Sabaody', 498)],
  drake: [b('222,000,000', 'Sabaody', 498)],
  hancock: [b('80,000,000', 'Before the Warlords', 522), b('1,659,000,000', 'After the Warlords', 1059)],
  'fisher-tiger': [b('230,000,000', 'After the Mary Geoise raid', 622)],
  pekoms: [b('330,000,000', 'Fish-Man Island', 652)],
  gambia: [b('67,000,000', 'Dressrosa', 705)],
  cavendish: [b('280,000,000', 'Dressrosa', 704), b('330,000,000', 'After Dressrosa', 801)],
  bartolomeo: [b('150,000,000', 'Dressrosa', 706), b('200,000,000', 'After Dressrosa', 801)],
  pedro: [b('382,000,000', 'Zou', 850)],
  katakuri: [b('1,057,000,000', 'Whole Cake Island', 860)],
  'big-mom': [b('50,000,000', 'As a child, in flashback', 868), b('500,000,000', 'Early career, in flashback', 868), b('4,388,000,000', 'Emperor of the Sea', 957)],
  perospero: [b('700,000,000', 'Whole Cake Island', 877)],
  blackbeard: [b('2,247,600,000', 'Emperor of the Sea', 925), b('3,996,000,000', 'After Wano', 1059)],
  queen: [b('1,320,000,000', 'Wano', 935)],
  roger: [b('5,564,800,000', 'Pirate King, Reverie reveal', 957)],
  whitebeard: [b('5,046,000,000', 'Emperor of the Sea, Reverie reveal', 957)],
  kaido: [b('4,611,100,000', 'Emperor of the Sea', 957)],
  shanks: [b('4,048,900,000', 'Emperor of the Sea', 957)],
  mihawk: [b('3,590,000,000', 'Cross Guild', 1058)],
};
