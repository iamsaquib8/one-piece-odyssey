// Event writing for the voyage. Island events wrap a real story beat (its title and opening
// paragraph come from the arc data) in choices picked by the beat's mood; sea events are an
// authored pool. All text here is original writing.
import type { EventChoice, Outcome } from './types';
import type { Mood } from '../data/staging';
import type { Dice } from './rng';

export interface ChoiceSpec extends EventChoice {
  /** Who makes this choice safe, if anyone. */
  needs?: string;
  resolve: (dice: Dice, ctx: { hasCrew: (id: string) => boolean; rough: boolean }) => Outcome;
}

const ok = (text: string, effects: Outcome['effects']): Outcome => ({ text, effects });

/** Choices for an island stop, by the mood of the beat it stages. */
export function islandChoices(mood: Mood | undefined): ChoiceSpec[] {
  switch (mood) {
    case 'storm': return [
      { id: 'read-sky', label: 'Read the sky and steer around the worst of it', needs: 'nami', resolve: (d, c) => c.hasCrew('nami') ? ok('Nami reads the clouds like a page and the ship slips between the squalls.', { morale: 6 }) : d.chance(.4) ? ok('A lucky gap opens in the cloud.', { morale: 2 }) : ok('Nobody aboard can read this weather. The waves win the argument.', { hull: -14 }) },
      { id: 'ride-out', label: 'Lash everything down and ride it out', resolve: (d) => ok('The crew holds on through the night. The ship creaks but stays whole.', { hull: -d.int(5, 10), morale: -2 }) },
    ];
    case 'night': return [
      { id: 'keep-watch', label: 'Keep a watch through the night', resolve: () => ok('Someone stays up with the lantern. Tired, but nobody is caught off guard.', { morale: -3, heal: 5 }) },
      { id: 'sleep', label: 'Everyone sleeps', resolve: (d) => d.chance(.65) ? ok('A full night’s sleep does more than any medicine.', { heal: 25 }) : ok('Thieves come aboard in the dark and leave with the purse.', { berries: -d.int(30, 70), heal: 10 }) },
    ];
    case 'flashback': return [
      { id: 'listen', label: 'Sit and listen to the story', resolve: () => ok('An old story, told by someone who lived it. The crew understands this place a little better.', { morale: 10, bounty: 0 }) },
      { id: 'move-on', label: 'Thank them and move on', resolve: () => ok('Someone presses a parcel of food into your hands as you leave.', { food: 1 }) },
    ];
    case 'dusk': return [
      { id: 'camp', label: 'Make camp and cook', resolve: () => ok('A fire, a pot, and nobody in a hurry.', { food: -1, heal: 25, morale: 4 }) },
      { id: 'push-on', label: 'Push on while the light lasts', resolve: (d) => ok('You make good time and find a little salvage along the way.', { berries: d.int(20, 60), morale: -3 }) },
    ];
    default: return [
      { id: 'help', label: 'Help the people here', resolve: (d) => ok('Word of a crew that helps travels faster than the ship.', { morale: 8, food: -1, bounty: d.int(1, 3) * 500_000 }) },
      { id: 'trade', label: 'Trade at the market', resolve: (d) => ok('A good haggle. Nami would approve.', { berries: d.int(50, 110) }) },
      { id: 'explore', label: 'Explore off the path', resolve: (d) => d.chance(.55) ? ok('Behind a waterfall: an old chest, still heavy.', { berries: d.int(100, 180) }) : ok('A wrong turn, a cliff, and some bruises.', { heal: -12 }) },
    ];
  }
}

export interface SeaEvent { id: string; title: string; text: string; choices: ChoiceSpec[] }

export const SEA_EVENTS: SeaEvent[] = [
  { id: 'sea-king', title: 'A Sea King surfaces', text: 'A shadow longer than the ship rises under the hull, and an eye the size of a sail opens.', choices: [
    { id: 'fight', label: 'Punch it back where it came from', resolve: (d) => d.chance(.7) ? ok('One stretched fist later, the Sea King decides to be somewhere else. Dinner is served.', { food: 2, morale: 6 }) : ok('It thrashes before it flees, and the hull takes the blow.', { hull: -12 }) },
    { id: 'drift', label: 'Go still and let it pass', resolve: () => ok('Nobody breathes. It loses interest.', { morale: -2 }) },
  ] },
  { id: 'cask', title: 'A floating cask', text: 'A barrel bobs past, sealed with wax and marked with a skull.', choices: [
    { id: 'open', label: 'Haul it aboard and open it', resolve: (d) => d.chance(.6) ? ok('Rum, rope and a forgotten purse.', { berries: d.int(60, 120), morale: 4 }) : ok('It was a decoy. Smoke, and laughter from a ship on the horizon.', { hull: -6, morale: -4 }) },
    { id: 'leave', label: 'Leave it to the sea', resolve: () => ok('Some things are better left floating.', {}) },
  ] },
  { id: 'marines', title: 'A Marine patrol', text: 'A white sail with a blue gull on it turns toward you.', choices: [
    { id: 'outrun', label: 'Outrun them', needs: 'nami', resolve: (d, c) => c.hasCrew('nami') || d.chance(.45) ? ok('A shift in the wind only your navigator saw coming, and the patrol is a dot behind you.', { morale: 5 }) : ok('They close the gap and a cannonball finds the stern.', { hull: -15 }) },
    { id: 'bluff', label: 'Fly a merchant flag and bluff', needs: 'usopp', resolve: (d, c) => c.hasCrew('usopp') || d.chance(.35) ? ok('A tall tale about a cargo of plague rats, and they wave you through.', { morale: 4 }) : ok('They do not believe a word, and fine you for it.', { berries: -80 }) },
  ] },
  { id: 'merchant', title: 'A merchant ship', text: 'A fat trading ship flies a flag of peace and calls across the water.', choices: [
    { id: 'buy', label: 'Buy supplies', resolve: () => ok('Fresh bread, salted fish, and a fair price.', { berries: -60, food: 3 }) },
    { id: 'sell', label: 'Sell what you can spare', resolve: (d) => ok('They pay well for things you did not know were valuable.', { berries: d.int(50, 90), food: -1 }) },
  ] },
  { id: 'squall', title: 'A sudden squall', text: 'The sky goes from blue to black in the time it takes to look up.', choices: [
    { id: 'reef', label: 'Reef the sails', needs: 'nami', resolve: (d, c) => ok(c.hasCrew('nami') ? 'Nami called it a minute early, and a minute is enough.' : 'Late, but in time to save the mast.', { hull: c.hasCrew('nami') ? 0 : -d.int(6, 12) }) },
    { id: 'run', label: 'Run before the wind', resolve: (_d, c) => ok('The ship flies, and so does half the cargo.', { food: -1, hull: c.rough ? -10 : -4 }) },
  ] },
  { id: 'fishing', title: 'Calm water, good fish', text: 'For once the sea is flat and the fish are biting.', choices: [
    { id: 'fish', label: 'Everybody fishes', resolve: (d) => ok('A competition breaks out. Everyone claims to have won.', { food: d.int(2, 3), morale: 6 }) },
    { id: 'rest', label: 'Nap on deck', resolve: () => ok('Sun, a breeze, and nothing to do.', { heal: 20 }) },
  ] },
  { id: 'raft', title: 'A castaway on a raft', text: 'A thin figure waves from a raft made of three planks and stubbornness.', choices: [
    { id: 'rescue', label: 'Pull them aboard', resolve: (d) => d.chance(.7) ? ok('They eat a week of rations in one sitting, then tell you where a treasure is buried.', { food: -2, berries: d.int(120, 200) }) : ok('A grateful stranger, a long story, and one less ration.', { food: -1, morale: 5 }) },
    { id: 'toss', label: 'Toss them food and sail on', resolve: () => ok('They shout something that might be thanks.', { food: -1, morale: 2 }) },
  ] },
  { id: 'fog', title: 'A fog bank', text: 'White on every side. Somewhere close, a bell rings that is not yours.', choices: [
    { id: 'creep', label: 'Creep forward with a lookout', needs: 'usopp', resolve: (d, c) => c.hasCrew('usopp') || d.chance(.5) ? ok('Sharp eyes spot the rocks just in time.', { morale: 3 }) : ok('The rocks find you first.', { hull: -12 }) },
    { id: 'anchor', label: 'Drop anchor and wait', resolve: () => ok('A long, cold wait. The fog lifts at dawn.', { food: -1 }) },
  ] },
  { id: 'whirlpool', title: 'A whirlpool', text: 'The water ahead begins to turn, slowly at first.', choices: [
    { id: 'skirt', label: 'Skirt the edge', resolve: (d, c) => c.rough && !c.hasCrew('nami') ? ok('The edge is wider than it looked.', { hull: -16 }) : ok('A wide berth and a few prayers.', { hull: -d.int(0, 5) }) },
    { id: 'ride', label: 'Ride it for speed', resolve: (d) => d.chance(.5) ? ok('Flung out the far side like a stone from a sling, ahead of schedule.', { morale: 8, bounty: 1_000_000 }) : ok('Round and round, and everyone is sick.', { hull: -10, morale: -5 }) },
  ] },
  { id: 'rival', title: 'A rival crew', text: 'A ship with a grinning jolly roger hails you: a toll, or a fight.', choices: [
    { id: 'pay', label: 'Pay the toll', resolve: () => ok('Cheaper than a new mast.', { berries: -70 }) },
    { id: 'refuse', label: 'Refuse, loudly', resolve: (d) => d.chance(.6) ? ok('They were bluffing. Now they are swimming.', { berries: d.int(80, 140), bounty: 2_000_000, morale: 6 }) : ok('They were not bluffing.', { hull: -14, berries: d.int(20, 60) }) },
  ] },
  { id: 'news', title: 'A News Coo', text: 'A seagull in a cap lands on the rail and waits, pointedly, for payment.', choices: [
    { id: 'pay', label: 'Buy the paper', resolve: () => ok('Your own crew is in it, small, near the back. The crew is delighted.', { berries: -10, morale: 8 }) },
    { id: 'shoo', label: 'Shoo it away', resolve: () => ok('It leaves a gift on the deck as it goes.', { morale: -2 }) },
  ] },
  { id: 'island-of-meat', title: 'A tiny island', text: 'A speck of sand with one tree and, improbably, wild boar.', choices: [
    { id: 'hunt', label: 'Hunt', resolve: (d) => ok('Meat. Meat for days.', { food: d.int(2, 4), morale: 5 }) },
    { id: 'skip', label: 'Keep sailing', resolve: () => ok('The captain sulks for an hour.', { morale: -4 }) },
  ] },
];

export const seaEvent = (id: string | undefined) => SEA_EVENTS.find((e) => e.id === id) ?? SEA_EVENTS[0];

export const PORT_ITEMS = [
  { id: 'food', label: 'Rations ×3', cost: 90, description: 'Three days of food for the whole crew.' },
  { id: 'repair', label: 'Repair the hull', cost: 140, description: 'Restores 30 hull.' },
  { id: 'inn', label: 'A night at the inn', cost: 80, description: 'Heals the whole crew to full.' },
  { id: 'feast', label: 'A feast', cost: 120, description: 'Morale +20, and a ration saved.' },
] as const;
