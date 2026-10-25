// The Straw Hats as the voyage plays them: base stats and one special each, tied to their role.
import { arcTier } from './tiers';

export interface Special { name: string; cost: number; description: string; power: number }

export interface CrewSpec {
  id: string;
  name: string;
  hp: number;
  atk: number;
  def: number;
  special: Special;
}

export const CREW: Record<string, CrewSpec> = {
  luffy: { id: 'luffy', name: 'Luffy', hp: 60, atk: 11, def: 2, special: { name: 'Gum-Gum Pistol', cost: 2, power: 2, description: 'A stretched punch for double damage.' } },
  zoro: { id: 'zoro', name: 'Zoro', hp: 54, atk: 12, def: 2, special: { name: 'Oni Giri', cost: 3, power: 1.2, description: 'A three-sword cut that hits every foe.' } },
  nami: { id: 'nami', name: 'Nami', hp: 36, atk: 7, def: 1, special: { name: 'Pickpocket', cost: 2, power: .6, description: 'Steals berries and leaves the foe weakened for two rounds.' } },
  usopp: { id: 'usopp', name: 'Usopp', hp: 38, atk: 8, def: 1, special: { name: 'Lead Star', cost: 2, power: 1.3, description: 'A slingshot shot from range; the foe cannot hit back this round.' } },
  sanji: { id: 'sanji', name: 'Sanji', hp: 52, atk: 11, def: 2, special: { name: 'Concassé', cost: 3, power: 1.8, description: 'A falling heel kick for heavy damage.' } },
  chopper: { id: 'chopper', name: 'Chopper', hp: 42, atk: 8, def: 2, special: { name: 'Rumble Ball', cost: 2, power: .4, description: 'Patches up the most hurt crewmate for 40% of their health.' } },
  robin: { id: 'robin', name: 'Robin', hp: 40, atk: 10, def: 1, special: { name: 'Cien Fleur: Clutch', cost: 2, power: 1.4, description: 'Arms bloom and hold a foe: it cannot act this round and hits softer the next.' } },
  franky: { id: 'franky', name: 'Franky', hp: 62, atk: 11, def: 3, special: { name: 'Radical Beam', cost: 4, power: 2.4, description: 'A beam from both arms for huge damage.' } },
  brook: { id: 'brook', name: 'Brook', hp: 44, atk: 10, def: 1, special: { name: 'Soul Solid', cost: 2, power: 1.3, description: 'A freezing cut that leaves the foe weakened.' } },
  jinbe: { id: 'jinbe', name: 'Jinbe', hp: 70, atk: 12, def: 3, special: { name: 'Vagabond Drill', cost: 3, power: 1.9, description: 'Fish-Man Karate: a spinning strike that also braces Jinbe for the next blow.' } },
};

/** The order a crew lines up in battle and on the deck. */
export const CREW_ORDER = ['luffy', 'zoro', 'nami', 'usopp', 'sanji', 'chopper', 'robin', 'franky', 'brook', 'jinbe'];

/** Passives, described once for the help panel and the crew sheet. */
export const PASSIVES: Record<string, string> = {
  luffy: 'Captain: the crew’s morale never falls below 20 while he stands.',
  nami: 'Navigator: storms and rough water hurt the ship far less.',
  usopp: 'Sniper: strikes first in every battle.',
  sanji: 'Cook: between stops, one ration heals the whole crew a little.',
  chopper: 'Doctor: after every battle, the crew recovers some health.',
  robin: 'Archaeologist: reads the islands, so every island stop pays a little more.',
  franky: 'Shipwright: patches the hull a little at every stop.',
  brook: 'Musician: once a battle, the first crewmate to fall gets back up.',
  jinbe: 'Helmsman: storms and rough water cannot hurt the ship at all.',
};

/** Luffy’s special grows with the story: Gear Second, Fourth and Fifth unlock at their arcs. */
const GEARS: { from: string; special: Special }[] = [
  { from: 'wano', special: { name: 'Gear Fifth: Bajrang Gun', cost: 3, power: 3.2, description: 'Gear Fifth: a punch the size of the sky.' } },
  { from: 'dressrosa', special: { name: 'Gear Fourth: Kong Gun', cost: 3, power: 2.8, description: 'Gear Fourth: a bouncing, Haki-hardened fist.' } },
  { from: 'enies-lobby', special: { name: 'Gear Second: Jet Pistol', cost: 2, power: 2.4, description: 'Gear Second: a punch faster than the eye.' } },
];

/** A friend who fights beside the crew for one battle, as the story stages it. */
export const GUEST_SPECIAL: Special = { name: 'Assist', cost: 2, power: 1.6, description: 'A friend’s strongest blow.' };

/** A fighter’s special at a point in the story; guests share one. */
export function specialFor(id: string, arcId: string): Special {
  if (id === 'luffy') {
    const tier = arcTier(arcId);
    const gear = GEARS.find((g) => tier >= arcTier(g.from));
    if (gear) return gear.special;
  }
  return CREW[id]?.special ?? GUEST_SPECIAL;
}

/** Crew grow with the story so later arcs are a climb, not a wall: health and strength per tier. */
export const growth = (tier: number) => 1 + tier * .07;
