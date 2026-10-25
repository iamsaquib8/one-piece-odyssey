// The Straw Hats as the voyage plays them: base stats and one special each, tied to their role.

export interface CrewSpec {
  id: string;
  name: string;
  hp: number;
  atk: number;
  def: number;
  special: { name: string; cost: number; description: string };
}

export const CREW: Record<string, CrewSpec> = {
  luffy: { id: 'luffy', name: 'Luffy', hp: 60, atk: 11, def: 2, special: { name: 'Gum-Gum Pistol', cost: 2, description: 'A stretched punch for double damage.' } },
  zoro: { id: 'zoro', name: 'Zoro', hp: 54, atk: 12, def: 2, special: { name: 'Oni Giri', cost: 3, description: 'A three-sword cut that hits every foe.' } },
  nami: { id: 'nami', name: 'Nami', hp: 36, atk: 7, def: 1, special: { name: 'Pickpocket', cost: 2, description: 'Steals berries and leaves the foe weakened for two rounds.' } },
  usopp: { id: 'usopp', name: 'Usopp', hp: 38, atk: 8, def: 1, special: { name: 'Lead Star', cost: 2, description: 'A slingshot shot from range; the foe cannot hit back this round.' } },
  sanji: { id: 'sanji', name: 'Sanji', hp: 52, atk: 11, def: 2, special: { name: 'Concassé', cost: 3, description: 'A falling heel kick for heavy damage.' } },
};

/** The order a crew lines up in battle and on the deck. */
export const CREW_ORDER = ['luffy', 'zoro', 'nami', 'usopp', 'sanji'];

/** Passives, described once for the help panel and the crew sheet. */
export const PASSIVES: Record<string, string> = {
  luffy: 'Captain: the crew’s morale never falls below 20 while he stands.',
  nami: 'Navigator: storms and rough water hurt the ship far less.',
  usopp: 'Sniper: strikes first in every battle.',
  sanji: 'Cook: between stops, one ration heals the whole crew a little.',
};
