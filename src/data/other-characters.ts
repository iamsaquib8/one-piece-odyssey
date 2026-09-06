import type { Character } from '../types';
import { characters as strawHatCharacters } from './characters';

export interface PortraitCharacter extends Character {
  animatedPortrait: true;
  crewIds: string[];
  formerAffiliations?: string[];
}

type Profile = Pick<PortraitCharacter, 'id' | 'name' | 'epithet' | 'role' | 'arcId' | 'color' | 'crewIds'> &
  Partial<Pick<PortraitCharacter, 'dream' | 'recruitment' | 'description' | 'milestones' | 'bounties' | 'formerAffiliations'>>;

function profile(p: Profile): PortraitCharacter {
  return {
    dream: 'Pursue the course this character has chosen on the Grand Line.',
    recruitment: 'Their affiliation is established in the manga during the crew’s relevant story era.',
    description: `${p.name} is included as a key figure in the story’s network of crews and factions. This profile records a representative affiliation rather than an exhaustive roster.`,
    milestones: [],
    bounties: [],
    animatedPortrait: true,
    ...p,
  };
}

// Supporting profiles are intentionally concise. The long-form Straw Hat profiles remain
// in characters.ts; this file supplies the captains and representative members needed by
// the fleet registry through crewCoverageThrough (see crews.ts).
export const otherCharacters: PortraitCharacter[] = [
  profile({ id: 'shanks', name: 'Shanks', epithet: 'Red-Haired', role: 'Captain', arcId: 'romance-dawn', color: '#b83b42', crewIds: ['red-hair'], description: 'The pirate who entrusts Luffy with the straw hat later becomes one of the Four Emperors. His small veteran crew is first a childhood ideal, then an active rival in the final race.', milestones: ['Saves Luffy and leaves him the straw hat (1).', 'Ends the fighting at Marineford (580).', 'Defeats the Kid Pirates near Elbaf (1079).'] }),
  profile({ id: 'beckman', name: 'Benn Beckman', epithet: 'First Mate', role: 'First mate', arcId: 'romance-dawn', color: '#59606b', crewIds: ['red-hair'] }),
  profile({ id: 'yasopp', name: 'Yasopp', epithet: 'Chaser', role: 'Sniper', arcId: 'romance-dawn', color: '#b7843e', crewIds: ['red-hair'], description: 'Usopp’s father and the Red Hair Pirates’ celebrated marksman links Luffy’s first pirate models to one of his earliest crewmates.' }),

  profile({ id: 'whitebeard', name: 'Edward Newgate', epithet: 'Whitebeard', role: 'Captain', arcId: 'marineford', color: '#d8cda4', crewIds: ['whitebeard', 'rocks'], formerAffiliations: ['Rocks Pirates'], dream: 'Build a family at sea.', description: 'Newgate treats his vast crew and allied captains as sons. The former Rocks Pirate becomes Roger’s great rival and stakes his final battle on rescuing Ace.', milestones: ['Clashes with Roger during Oden’s voyage (966).', 'Leads the attempt to rescue Ace at Marineford (552–576).'] }),
  profile({ id: 'marco', name: 'Marco', epithet: 'The Phoenix', role: 'First Division Commander', arcId: 'marineford', color: '#e3b735', crewIds: ['whitebeard'] }),
  profile({ id: 'ace', name: 'Portgas D. Ace', epithet: 'Fire Fist', role: 'Second Division Commander', arcId: 'alabasta', color: '#e76131', crewIds: ['whitebeard', 'spade'], formerAffiliations: ['Spade Pirates'], description: 'Luffy’s sworn brother captained the Spade Pirates before joining Whitebeard. His capture becomes the immediate cause of the Summit War.' }),

  profile({ id: 'blackbeard', name: 'Marshall D. Teach', epithet: 'Blackbeard', role: 'Admiral', arcId: 'jaya', color: '#493b58', crewIds: ['blackbeard', 'whitebeard'], formerAffiliations: ['Whitebeard Pirates'], description: 'Teach leaves Whitebeard’s crew after killing Thatch, gathers dangerous specialists, and rises from opportunistic rookie to Emperor while hunting powerful Devil Fruits.' }),
  profile({ id: 'shiryu', name: 'Shiryu', epithet: 'Of the Rain', role: 'Captain of the Second Ship', arcId: 'impel-down', color: '#673548', crewIds: ['blackbeard'], formerAffiliations: ['Impel Down'] }),
  profile({ id: 'kuzan', name: 'Kuzan', epithet: 'Aokiji', role: 'Captain of the Tenth Ship', arcId: 'long-ring-long-land', color: '#4f93b8', crewIds: ['blackbeard', 'marines'], formerAffiliations: ['Marines'], description: 'The former Admiral travels with the Blackbeard Pirates after leaving the Marines; his personal purpose remains his own.' }),

  profile({ id: 'big-mom', name: 'Charlotte Linlin', epithet: 'Big Mom', role: 'Captain', arcId: 'whole-cake-island', color: '#cc668f', crewIds: ['big-mom', 'rocks'], formerAffiliations: ['Rocks Pirates'], description: 'Linlin’s pirate empire merges crew, family, and Totto Land’s government. Her childhood among giants and former place in Rocks’s crew connect multiple eras.' }),
  profile({ id: 'katakuri', name: 'Charlotte Katakuri', epithet: 'Minister of Flour', role: 'Sweet Commander', arcId: 'whole-cake-island', color: '#9c4268', crewIds: ['big-mom'] }),
  profile({ id: 'perospero', name: 'Charlotte Perospero', epithet: 'Candy Man', role: 'Officer', arcId: 'whole-cake-island', color: '#b85286', crewIds: ['big-mom'] }),

  profile({ id: 'kaido', name: 'Kaido', epithet: 'Of the Beasts', role: 'Governor-General', arcId: 'wano', color: '#46599a', crewIds: ['beasts', 'rocks'], formerAffiliations: ['Rocks Pirates'], description: 'Kaido builds an army around Zoan powers and weapons production, occupying Wano with Orochi while preparing a global war.' }),
  profile({ id: 'king', name: 'King', epithet: 'The Wildfire', role: 'Lead Performer', arcId: 'wano', color: '#2f3342', crewIds: ['beasts'], formerAffiliations: ['Punk Hazard test subject'] }),
  profile({ id: 'queen', name: 'Queen', epithet: 'The Plague', role: 'Lead Performer', arcId: 'wano', color: '#d5ac39', crewIds: ['beasts'], formerAffiliations: ['MADS'] }),

  profile({ id: 'law', name: 'Trafalgar D. Water Law', epithet: 'Surgeon of Death', role: 'Captain', arcId: 'sabaody-archipelago', color: '#deb733', crewIds: ['heart', 'donquixote'], formerAffiliations: ['Donquixote Pirates'], description: 'Law turns a temporary alliance at Punk Hazard into the plan that topples Doflamingo and Kaido. His childhood in the Donquixote crew makes Dressrosa personal.' }),
  profile({ id: 'bepo', name: 'Bepo', epithet: 'Polar Bear', role: 'Navigator', arcId: 'sabaody-archipelago', color: '#eff1df', crewIds: ['heart'] }),
  profile({ id: 'jean-bart', name: 'Jean Bart', epithet: 'Former Captain', role: 'Helmsman', arcId: 'sabaody-archipelago', color: '#8d684d', crewIds: ['heart'], formerAffiliations: ['Captain of his own crew'] }),

  profile({ id: 'kid', name: 'Eustass Kid', epithet: 'Captain', role: 'Captain', arcId: 'sabaody-archipelago', color: '#bb3940', crewIds: ['kid'] }),
  profile({ id: 'killer', name: 'Killer', epithet: 'Massacre Soldier', role: 'First mate', arcId: 'sabaody-archipelago', color: '#a88cc4', crewIds: ['kid'] }),
  profile({ id: 'heat', name: 'Heat', epithet: 'Fire-Breather', role: 'Combatant', arcId: 'sabaody-archipelago', color: '#4a70a4', crewIds: ['kid'] }),

  profile({ id: 'buggy', name: 'Buggy', epithet: 'The Genius Jester', role: 'Figurehead / Captain', arcId: 'orange-town', color: '#3f75ad', crewIds: ['cross-guild', 'buggy', 'roger'], formerAffiliations: ['Roger Pirates'], description: 'A former apprentice of Roger, Buggy survives by spectacle and improbable momentum. He becomes the public Emperor figurehead of Cross Guild beside Crocodile and Mihawk.' }),
  profile({ id: 'crocodile', name: 'Crocodile', epithet: 'Desert King', role: 'Founder', arcId: 'alabasta', color: '#9b7754', crewIds: ['cross-guild', 'baroque-works'] }),
  profile({ id: 'mihawk', name: 'Dracule Mihawk', epithet: 'Hawk Eyes', role: 'Founder', arcId: 'baratie', color: '#7b3341', crewIds: ['cross-guild'] }),
  profile({ id: 'cabaji', name: 'Cabaji', epithet: 'Acrobat', role: 'Chief of Staff', arcId: 'orange-town', color: '#547e70', crewIds: ['buggy'] }),
  profile({ id: 'mohji', name: 'Mohji', epithet: 'Beast Tamer', role: 'Officer', arcId: 'orange-town', color: '#b8a267', crewIds: ['buggy'] }),

  profile({ id: 'hancock', name: 'Boa Hancock', epithet: 'Pirate Empress', role: 'Captain', arcId: 'amazon-lily', color: '#8e3150', crewIds: ['kuja'], formerAffiliations: ['Seven Warlords'] }),
  profile({ id: 'marigold', name: 'Boa Marigold', epithet: 'Gorgon Sister', role: 'Officer', arcId: 'amazon-lily', color: '#d18537', crewIds: ['kuja'] }),
  profile({ id: 'sandersonia', name: 'Boa Sandersonia', epithet: 'Gorgon Sister', role: 'Officer', arcId: 'amazon-lily', color: '#5e9b72', crewIds: ['kuja'] }),

  profile({ id: 'capone', name: 'Capone Bege', epithet: 'Gang Bege', role: 'Captain', arcId: 'sabaody-archipelago', color: '#5d6670', crewIds: ['fire-tank'] }),
  profile({ id: 'vito', name: 'Vito', epithet: 'Monster Gun', role: 'Advisor', arcId: 'whole-cake-island', color: '#779878', crewIds: ['fire-tank'] }),
  profile({ id: 'chiffon', name: 'Charlotte Chiffon', epithet: 'Fire Tank Matriarch', role: 'Officer', arcId: 'whole-cake-island', color: '#d48291', crewIds: ['fire-tank'], formerAffiliations: ['Charlotte Family'] }),
  profile({ id: 'bonney', name: 'Jewelry Bonney', epithet: 'Big Eater', role: 'Captain', arcId: 'sabaody-archipelago', color: '#d96d90', crewIds: ['bonney'] }),
  profile({ id: 'gyogyo', name: 'Gyogyo', epithet: 'Bonney Pirate', role: 'Crewmate', arcId: 'sabaody-archipelago', color: '#73998f', crewIds: ['bonney'] }),

  profile({ id: 'cavendish', name: 'Cavendish', epithet: 'White Horse', role: 'Captain / First Ship Captain', arcId: 'dressrosa', color: '#ae82c8', crewIds: ['beautiful'] }),
  profile({ id: 'suleiman', name: 'Suleiman', epithet: 'Beheader', role: 'Combatant', arcId: 'dressrosa', color: '#4a6472', crewIds: ['beautiful'] }),
  profile({ id: 'bartolomeo', name: 'Bartolomeo', epithet: 'The Cannibal', role: 'Captain / Second Ship Captain', arcId: 'dressrosa', color: '#5ca65e', crewIds: ['barto-club'] }),
  profile({ id: 'gambia', name: 'Gambia', epithet: 'Missionary', role: 'Chief of Staff', arcId: 'dressrosa', color: '#7ea45e', crewIds: ['barto-club'] }),
  profile({ id: 'sai', name: 'Sai', epithet: 'Don Sai', role: 'Leader / Third Ship Captain', arcId: 'dressrosa', color: '#4d87a3', crewIds: ['happo-navy'] }),
  profile({ id: 'boo', name: 'Boo', epithet: 'Happo Officer', role: 'Vice leader', arcId: 'dressrosa', color: '#6877a1', crewIds: ['happo-navy'] }),
  profile({ id: 'ideo', name: 'Ideo', epithet: 'Destruction Cannon', role: 'Captain / Fourth Ship Captain', arcId: 'dressrosa', color: '#a96b4d', crewIds: ['ideo'] }),
  profile({ id: 'blue-gilly', name: 'Blue Gilly', epithet: 'Longleg Martial Artist', role: 'Combatant', arcId: 'dressrosa', color: '#658eb1', crewIds: ['ideo'] }),
  profile({ id: 'leo', name: 'Leo', epithet: 'Warrior', role: 'Captain / Fifth Ship Captain', arcId: 'dressrosa', color: '#d0993b', crewIds: ['tontatta'] }),
  profile({ id: 'mansherry', name: 'Mansherry', epithet: 'Princess', role: 'Healer', arcId: 'dressrosa', color: '#dd768f', crewIds: ['tontatta'] }),
  profile({ id: 'hajrudin', name: 'Hajrudin', epithet: 'Pirate Mercenary', role: 'Captain / Sixth Ship Captain', arcId: 'dressrosa', color: '#8d6f50', crewIds: ['new-giant'] }),
  profile({ id: 'gerd', name: 'Gerd', epithet: 'Giant Doctor', role: 'Doctor', arcId: 'whole-cake-island', color: '#bc7283', crewIds: ['new-giant'] }),
  profile({ id: 'stansen', name: 'Stansen', epithet: 'Giant Shipwright', role: 'Shipwright', arcId: 'sabaody-archipelago', color: '#9a7353', crewIds: ['new-giant'] }),
  profile({ id: 'orlumbus', name: 'Orlumbus', epithet: 'Massacre Ruler', role: 'Admiral / Seventh Ship Captain', arcId: 'dressrosa', color: '#4e7189', crewIds: ['yonta-maria'] }),
  profile({ id: 'columbus', name: 'Columbus', epithet: 'Standing Commander', role: 'Officer', arcId: 'dressrosa', color: '#91666c', crewIds: ['yonta-maria'] }),

  profile({ id: 'alvida', name: 'Alvida', epithet: 'Iron Mace', role: 'Captain', arcId: 'romance-dawn', color: '#bb5c83', crewIds: ['alvida'] }),
  profile({ id: 'heppoko', name: 'Heppoko', epithet: 'Alvida Pirate', role: 'Crewmate', arcId: 'romance-dawn', color: '#7d8a64', crewIds: ['alvida'] }),
  profile({ id: 'kuro', name: 'Kuro', epithet: 'Of a Hundred Plans', role: 'Captain', arcId: 'syrup-village', color: '#485870', crewIds: ['black-cat'] }),
  profile({ id: 'jango', name: 'Jango', epithet: 'The Hypnotist', role: 'Former first mate', arcId: 'syrup-village', color: '#4f75a3', crewIds: ['black-cat', 'marines'], formerAffiliations: ['Black Cat Pirates'] }),
  profile({ id: 'krieg', name: 'Don Krieg', epithet: 'Pirate Fleet Admiral', role: 'Captain', arcId: 'baratie', color: '#a59443', crewIds: ['krieg'] }),
  profile({ id: 'gin', name: 'Gin', epithet: 'Man-Demon', role: 'Battle commander', arcId: 'baratie', color: '#607577', crewIds: ['krieg'] }),
  profile({ id: 'arlong', name: 'Arlong', epithet: 'Saw', role: 'Captain', arcId: 'arlong-park', color: '#4f91a9', crewIds: ['arlong', 'sun'], formerAffiliations: ['Sun Pirates'] }),
  profile({ id: 'hachi', name: 'Hatchan', epithet: 'Six-Sword Style', role: 'Officer', arcId: 'arlong-park', color: '#d27a79', crewIds: ['arlong', 'sun'], formerAffiliations: ['Sun Pirates', 'Arlong Pirates'] }),

  profile({ id: 'dorry', name: 'Dorry', epithet: 'Blue Ogre', role: 'Co-captain', arcId: 'little-garden', color: '#4b72a2', crewIds: ['giant-warrior'] }),
  profile({ id: 'brogy', name: 'Brogy', epithet: 'Red Ogre', role: 'Co-captain', arcId: 'little-garden', color: '#a94f42', crewIds: ['giant-warrior'] }),
  profile({ id: 'bellamy', name: 'Bellamy', epithet: 'The Hyena', role: 'Captain', arcId: 'jaya', color: '#bd7557', crewIds: ['bellamy', 'donquixote'], formerAffiliations: ['Donquixote Pirates'] }),
  profile({ id: 'sarquiss', name: 'Sarquiss', epithet: 'Big Knife', role: 'First mate', arcId: 'jaya', color: '#708172', crewIds: ['bellamy'] }),
  profile({ id: 'foxy', name: 'Foxy', epithet: 'Silver Fox', role: 'Captain', arcId: 'long-ring-long-land', color: '#765c98', crewIds: ['foxy'] }),
  profile({ id: 'porche', name: 'Porche', epithet: 'Cutie Baton', role: 'Cheerleader', arcId: 'long-ring-long-land', color: '#d4779c', crewIds: ['foxy'] }),
  profile({ id: 'hamburg', name: 'Hamburg', epithet: 'Gorilla', role: 'Combatant', arcId: 'long-ring-long-land', color: '#856344', crewIds: ['foxy'] }),
  profile({ id: 'moria', name: 'Gecko Moria', epithet: 'Master of Shadows', role: 'Captain', arcId: 'thriller-bark', color: '#796094', crewIds: ['thriller-bark'], formerAffiliations: ['Seven Warlords'] }),
  profile({ id: 'perona', name: 'Perona', epithet: 'Ghost Princess', role: 'Officer', arcId: 'thriller-bark', color: '#cf6f9e', crewIds: ['thriller-bark'] }),
  profile({ id: 'hogback', name: 'Hogback', epithet: 'Genius Surgeon', role: 'Officer', arcId: 'thriller-bark', color: '#6c747b', crewIds: ['thriller-bark'] }),
  profile({ id: 'lola', name: 'Lola', epithet: 'Marriage Proposal', role: 'Captain', arcId: 'thriller-bark', color: '#d9808f', crewIds: ['rolling'], formerAffiliations: ['Charlotte Family'] }),
  profile({ id: 'risky-brothers', name: 'Risky Brothers', epithet: 'Rolling Pirates', role: 'Officers', arcId: 'thriller-bark', color: '#6d8980', crewIds: ['rolling'] }),

  profile({ id: 'doflamingo', name: 'Donquixote Doflamingo', epithet: 'Heavenly Demon', role: 'Captain', arcId: 'dressrosa', color: '#d35f8a', crewIds: ['donquixote'] }),
  profile({ id: 'trebol', name: 'Trebol', epithet: 'Club Seat', role: 'Elite officer', arcId: 'dressrosa', color: '#7a883b', crewIds: ['donquixote'] }),
  profile({ id: 'corazon', name: 'Donquixote Rosinante', epithet: 'Corazon', role: 'Former elite officer', arcId: 'dressrosa', color: '#3c5369', crewIds: ['donquixote', 'marines'], formerAffiliations: ['Marines undercover'] }),
  profile({ id: 'hody', name: 'Hody Jones', epithet: 'New Fish-Man Captain', role: 'Captain', arcId: 'fish-man-island', color: '#4a718a', crewIds: ['new-fish-man'] }),
  profile({ id: 'zeo', name: 'Zeo', epithet: 'Noble of the Fish-Man District', role: 'Officer', arcId: 'fish-man-island', color: '#739aa1', crewIds: ['new-fish-man'] }),
  profile({ id: 'vander-decken', name: 'Vander Decken IX', epithet: 'Flying Dutchman', role: 'Captain', arcId: 'fish-man-island', color: '#76618e', crewIds: ['flying'] }),
  profile({ id: 'wadatsumi', name: 'Wadatsumi', epithet: 'Big Monk', role: 'Crewmate', arcId: 'fish-man-island', color: '#8f738e', crewIds: ['flying', 'sun'], formerAffiliations: ['Flying Pirates'] }),

  profile({ id: 'apoo', name: 'Scratchmen Apoo', epithet: 'Roar of the Sea', role: 'Captain', arcId: 'sabaody-archipelago', color: '#bd625b', crewIds: ['on-air', 'beasts'], formerAffiliations: ['Beasts Pirates'] }),
  profile({ id: 'shanba', name: 'Shanba', epithet: 'On Air Pirate', role: 'Crewmate', arcId: 'sabaody-archipelago', color: '#657d74', crewIds: ['on-air'] }),
  profile({ id: 'hawkins', name: 'Basil Hawkins', epithet: 'Magician', role: 'Captain', arcId: 'sabaody-archipelago', color: '#b9a46a', crewIds: ['hawkins', 'beasts'], formerAffiliations: ['Beasts Pirates'] }),
  profile({ id: 'faust', name: 'Faust', epithet: 'Magician', role: 'Crewmate', arcId: 'sabaody-archipelago', color: '#926a69', crewIds: ['hawkins'] }),
  profile({ id: 'urouge', name: 'Urouge', epithet: 'Mad Monk', role: 'Captain', arcId: 'sabaody-archipelago', color: '#7d6c4f', crewIds: ['fallen-monk'] }),
  profile({ id: 'drake', name: 'X Drake', epithet: 'Red Flag', role: 'Captain / undercover Marine', arcId: 'sabaody-archipelago', color: '#8e3f45', crewIds: ['drake', 'marines', 'beasts'], formerAffiliations: ['Marines', 'Beasts Pirates'] }),

  profile({ id: 'pedro', name: 'Pedro', epithet: 'Tree-top', role: 'Captain', arcId: 'zou', color: '#5d7f6c', crewIds: ['nox'] }),
  profile({ id: 'pekoms', name: 'Pekoms', epithet: 'Fighter', role: 'Former member', arcId: 'zou', color: '#a37e4d', crewIds: ['nox', 'big-mom'], formerAffiliations: ['Nox Pirates', 'Big Mom Pirates'] }),
  profile({ id: 'carrot', name: 'Carrot', epithet: 'Kingsbird', role: 'Mink ally', arcId: 'zou', color: '#d98b73', crewIds: [] }),

  profile({ id: 'roger', name: 'Gol D. Roger', epithet: 'Pirate King', role: 'Captain', arcId: 'loguetown', color: '#b34d3e', crewIds: ['roger'] }),
  profile({ id: 'rayleigh', name: 'Silvers Rayleigh', epithet: 'Dark King', role: 'First mate', arcId: 'sabaody-archipelago', color: '#b4b7b5', crewIds: ['roger'] }),
  profile({ id: 'crocus', name: 'Crocus', epithet: 'Keeper of the Lighthouse', role: 'Doctor', arcId: 'reverse-mountain', color: '#b6a95a', crewIds: ['roger'], formerAffiliations: ['Roger Pirates'] }),
  profile({ id: 'rocks', name: 'Rocks D. Xebec', epithet: 'Captain of Hachinosu', role: 'Captain', arcId: 'levely', color: '#4e3c59', crewIds: ['rocks'] }),
  profile({ id: 'fisher-tiger', name: 'Fisher Tiger', epithet: 'Adventurer', role: 'Captain', arcId: 'fish-man-island', color: '#b45a4a', crewIds: ['sun'] }),
  profile({ id: 'aladine', name: 'Aladine', epithet: 'Doctor', role: 'First mate', arcId: 'fish-man-island', color: '#5f8c91', crewIds: ['sun'] }),
  profile({ id: 'yorki', name: 'Yorki', epithet: 'Calico', role: 'Captain', arcId: 'thriller-bark', color: '#7c9560', crewIds: ['rumbar'] }),

  profile({ id: 'sakazuki', name: 'Sakazuki', epithet: 'Akainu', role: 'Fleet Admiral', arcId: 'marineford', color: '#9e3934', crewIds: ['marines'] }),
  profile({ id: 'garp', name: 'Monkey D. Garp', epithet: 'Hero of the Marines', role: 'Vice Admiral', arcId: 'post-enies-lobby', color: '#567da0', crewIds: ['marines'] }),
  profile({ id: 'coby', name: 'Koby', epithet: 'Hero', role: 'Marine captain', arcId: 'romance-dawn', color: '#d27a84', crewIds: ['marines'] }),
  profile({ id: 'dragon', name: 'Monkey D. Dragon', epithet: 'World’s Worst Criminal', role: 'Supreme Commander', arcId: 'loguetown', color: '#356b63', crewIds: ['revolutionaries'] }),
  profile({ id: 'sabo', name: 'Sabo', epithet: 'Flame Emperor', role: 'Chief of Staff', arcId: 'dressrosa', color: '#496f9c', crewIds: ['revolutionaries'] }),
  profile({ id: 'ivankov', name: 'Emporio Ivankov', epithet: 'Miracle Person', role: 'Commander', arcId: 'impel-down', color: '#b44e89', crewIds: ['revolutionaries'] }),
  profile({ id: 'mr-1', name: 'Daz Bonez', epithet: 'Mr. 1', role: 'Officer agent', arcId: 'alabasta', color: '#69747b', crewIds: ['baroque-works', 'cross-guild'], formerAffiliations: ['Baroque Works'] }),
  profile({ id: 'mr-2', name: 'Bentham', epithet: 'Mr. 2 Bon Kurei', role: 'Officer agent', arcId: 'alabasta', color: '#d07388', crewIds: ['baroque-works'] }),
  profile({ id: 'lucci', name: 'Rob Lucci', epithet: 'Massacre Weapon', role: 'CP0 masked agent', arcId: 'water-seven', color: '#565968', crewIds: ['cp0'], formerAffiliations: ['CP9'] }),
  profile({ id: 'kaku', name: 'Kaku', epithet: 'Mountain Wind', role: 'CP0 masked agent', arcId: 'water-seven', color: '#6f8068', crewIds: ['cp0'], formerAffiliations: ['CP9', 'Galley-La'] }),
  profile({ id: 'stussy', name: 'Stussy', epithet: 'MADS Clone', role: 'Former CP0 agent', arcId: 'whole-cake-island', color: '#b98a72', crewIds: ['cp0'], formerAffiliations: ['CP0'] }),
];

export const animatedPortraitIds = new Set([
  'luffy', 'zoro', 'nami', 'usopp', 'sanji', 'chopper', 'robin', 'franky', 'brook', 'jinbe',
  ...otherCharacters.map((character) => character.id),
]);

export const allCharactersWithPortraits: PortraitCharacter[] = [
  ...strawHatCharacters.map((character) => ({ ...character, animatedPortrait: true as const, crewIds: ['straw-hat'] })),
  ...otherCharacters,
];
