import type { ArcStaging } from './staging';

/** Stage directions for Paradise after Alabasta: Jaya through Thriller Bark. */
export const paradiseStaging: ArcStaging[] = [
  {
    arcId: 'jaya',
    hook: 'A ship falls out of the sky.',
    cast: [
      { id: 'luffy', name: 'Monkey D. Luffy', side: 'crew', role: 'Wants to reach the island the compass says is in the sky, and refuses to fight over an insult until someone is actually hurt.' },
      { id: 'zoro', name: 'Roronoa Zoro', side: 'crew', role: 'Takes Bellamy’s beating beside his captain without drawing a sword, then hunts a South Bird through the dark.' },
      { id: 'nami', name: 'Nami', side: 'crew', role: 'Cannot accept a Log Pose that points up and is furious that her captain will not hit back, until she understands why.' },
      { id: 'robin', name: 'Nico Robin', side: 'crew', role: 'One day aboard, she salvages a map of Skypiea from the fallen wreck and reads Noland’s logbook as a navigator’s record rather than a fairy tale.' },
      { id: 'bellamy', name: 'Bellamy the Hyena', side: 'foe', role: 'Preaches the end of the age of dreams, beats Luffy and Zoro for a laugh, then robs Cricket of the gold he raised from the seabed.', color: '#c8a23a' },
      { id: 'sarquiss', name: 'Sarquiss', side: 'foe', role: 'Bellamy’s first mate and loudest admirer, who throws money at strangers and follows his captain to Cricket’s house.', color: '#6e7fa8' },
      { id: 'mont-blanc-cricket', name: 'Mont Blanc Cricket', side: 'ally', role: 'Noland’s descendant dives every day for the gold that would prove his ancestor was not a liar, and gives the crew the Knock Up Stream.', color: '#b8743a' },
      { id: 'masira', name: 'Masira', side: 'ally', role: 'Salvage king of the eastern seas and Cricket’s loyal son in all but blood, who claims the fallen wreck and then rebuilds the Merry overnight.', color: '#d97a3a' },
      { id: 'shoujou', name: 'Shoujou', side: 'ally', role: 'Masira’s brother in salvage, whose sonar voice finds sunken ships and whose crew reinforces the Merry for the ride into the sky.', color: '#c25a4a' },
      { id: 'blackbeard', name: 'Marshall D. Teach', side: 'wildcard', role: 'A laughing stranger who argues with Luffy about pie and shouts that dreams never end, then arrives too late to take his head for a Warlord seat.', color: '#3a2f45' }
    ],
    beats: {
      'mock-town': { location: 'mock-town', present: ['luffy', 'zoro', 'nami', 'robin', 'bellamy', 'sarquiss', 'blackbeard'], mood: 'day' },
      'crickets-evidence': { location: 'jaya', present: ['luffy', 'nami', 'robin', 'mont-blanc-cricket', 'masira', 'shoujou'], mood: 'dusk' },
      'a-real-reason': { location: 'mock-town', present: ['luffy', 'bellamy', 'sarquiss', 'mont-blanc-cricket'], mood: 'night' },
      'world-powers': { present: ['blackbeard', 'bellamy'], mood: 'dawn' },
      'take-the-current': { location: 'going-merry', present: ['luffy', 'zoro', 'nami', 'robin', 'mont-blanc-cricket', 'blackbeard'], mood: 'storm' }
    },
    battles: {
      bellamy: { a: ['luffy'], b: ['bellamy'], verdict: 'a' }
    }
  },
  {
    arcId: 'skypiea',
    hook: 'A bell has waited four hundred years.',
    cast: [
      { id: 'luffy', name: 'Monkey D. Luffy', side: 'crew', role: 'Comes to the sky for gold and adventure, and turns out to be the one body on the island that lightning cannot touch.' },
      { id: 'zoro', name: 'Roronoa Zoro', side: 'crew', role: 'Cuts down Braham and Ohm in the forest, is dropped by Enel in the ruins, and still helps fell Giant Jack toward the ark.' },
      { id: 'nami', name: 'Nami', side: 'crew', role: 'Learns the waver in an hour, is spared by Enel as useful cargo, and drives Luffy up the beanstalk to the bell.' },
      { id: 'usopp', name: 'Usopp', side: 'crew', role: 'Survives Satori’s ordeal, then boards the Ark Maxim with Sanji to sabotage it from inside.' },
      { id: 'sanji', name: 'Sanji', side: 'crew', role: 'Finishes Satori in mid-air and climbs into Enel’s ark to jam its engines while the god fights above.' },
      { id: 'chopper', name: 'Tony Tony Chopper', side: 'crew', role: 'Guards the Merry against Shura, calls the Sky Knight with a whistle, and wins his first fight alone against Gedatsu.' },
      { id: 'robin', name: 'Nico Robin', side: 'crew', role: 'Recognises Shandora under the roots, reads its Poneglyph, and finds Roger’s message at the foot of the bell tower.' },
      { id: 'gan-fall', name: 'Gan Fall', side: 'ally', role: 'The deposed God of Skypiea rides Pierre as a mercenary knight, answers the crew’s whistle, and takes a spear for Chopper.', epithet: 'Knight of the Sky', color: '#7a8fb5' },
      { id: 'conis', name: 'Conis', side: 'ally', role: 'Guides the crew into the forest under orders, confesses to the whole beach, survives the lightning, and leads Angel Island to safety.', color: '#e8c3d8' },
      { id: 'enel', name: 'Enel', side: 'foe', role: 'Rules Skypiea with lightning and Mantra, stages a survival game for sport, and plans to leave for the moon after erasing the islands below.', epithet: 'God', color: '#e6c34a' },
      { id: 'ohm', name: 'Ohm', side: 'foe', role: 'The last of Enel’s priests, whose iron cloud whip and enormous dog Holy guard the Ordeal of Iron on the ruins’ roof.', color: '#8a8f99' },
      { id: 'gedatsu', name: 'Gedatsu', side: 'foe', role: 'Priest of the Ordeal of Swamp, dangerous in his clouds and hopeless at remembering to breathe, beaten by Chopper alone.', color: '#7c9a5a' },
      { id: 'wyper', name: 'Wyper', side: 'wildcard', role: 'Kalgara’s descendant leads the Shandians to reclaim their homeland and empties a Reject Dial into the god’s heart.', epithet: 'Berserker', color: '#b0553a' },
      { id: 'noland', name: 'Mont Blanc Noland', side: 'ally', role: 'The explorer who saved Shandora from plague four centuries ago and was hanged as a liar when the city vanished into the sky.', color: '#8a6a3a' },
      { id: 'calgara', name: 'Kalgara', side: 'ally', role: 'The Shandian warrior who tried to kill Noland and became his friend, and rang the bell into the clouds for a man who never came.', color: '#a34a3a' }
    ],
    beats: {
      'heavens-gate': { location: 'white-sea', present: ['luffy', 'nami', 'usopp', 'sanji', 'chopper', 'robin', 'gan-fall', 'conis'], mood: 'day' },
      'ordeal-of-balls': { location: 'upper-yard', present: ['luffy', 'sanji', 'usopp', 'chopper', 'robin', 'gan-fall', 'conis'], mood: 'day' },
      'vearth-by-firelight': { location: 'going-merry', present: ['luffy', 'zoro', 'nami', 'robin', 'gan-fall', 'wyper', 'enel'], mood: 'night' },
      'survival-game': { location: 'upper-yard', present: ['luffy', 'zoro', 'chopper', 'robin', 'wyper', 'gedatsu', 'ohm', 'enel'], mood: 'day' },
      'the-city-of-gold': { location: 'shandora', present: ['zoro', 'nami', 'robin', 'gan-fall', 'wyper', 'ohm', 'enel', 'conis'], mood: 'dusk' },
      'death-piea': { location: 'giant-jack', present: ['luffy', 'nami', 'zoro', 'sanji', 'usopp', 'wyper', 'enel'], mood: 'storm' },
      'noland-and-kalgara': { location: 'shandora', present: ['noland', 'calgara'], mood: 'flashback' },
      'ring-the-bell': { location: 'giant-jack', present: ['luffy', 'nami', 'zoro', 'robin', 'wyper', 'enel', 'gan-fall', 'conis'], mood: 'dawn' }
    },
    battles: {
      gedatsu: { a: ['chopper'], b: ['gedatsu'], verdict: 'a' },
      ohm: { a: ['zoro'], b: ['ohm'], verdict: 'a' },
      wyper: { a: ['wyper'], b: ['enel'], verdict: 'b' },
      enel: { a: ['luffy'], b: ['enel'], verdict: 'a' }
    }
  },
  {
    arcId: 'long-ring-long-land',
    hook: 'Lose the game, lose a friend.',
    cast: [
      { id: 'luffy', name: 'Monkey D. Luffy', side: 'crew', role: 'Accepts a Davy Back Fight without hearing the rules, then has to win back the crewmate his acceptance gambled away.' },
      { id: 'zoro', name: 'Roronoa Zoro', side: 'crew', role: 'Tells Chopper to stop crying, then carries the Groggy Ring with the one man he refuses to cooperate with.' },
      { id: 'nami', name: 'Nami', side: 'crew', role: 'Rows the Donut Race to a lead the Slow-Slow Beam takes away, and later thaws Robin in the bath.' },
      { id: 'usopp', name: 'Usopp', side: 'crew', role: 'Builds the Barrel Tiger for the Donut Race and spends the rest of the games shouting at the referee.' },
      { id: 'sanji', name: 'Sanji', side: 'crew', role: 'Kicks his way through the Groggy Ring beside Zoro while arguing with him about who is carrying whom.' },
      { id: 'chopper', name: 'Tony Tony Chopper', side: 'crew', role: 'Becomes the prize of the first game and has to cheer for his own crew from the enemy bench.' },
      { id: 'robin', name: 'Nico Robin', side: 'crew', role: 'Races the Donut course with Nami and Usopp, then meets an Admiral who tells her every home she has had was destroyed.' },
      { id: 'foxy', name: 'Foxy the Silver Fox', side: 'foe', role: 'Collects crewmates through Davy Back Fights and cheats with a beam that stops time for thirty seconds.', color: '#c05a8a' },
      { id: 'porche', name: 'Porche', side: 'foe', role: 'Foxy’s idol and Donut Race champion, who takes Chopper for her collection of cute things.', color: '#e88ab8' },
      { id: 'hamburg', name: 'Hamburg', side: 'foe', role: 'Captain of the Groggy Monsters, who plays with hidden iron and a referee who never looks his way.', color: '#7a6a5a' },
      { id: 'kuzan', name: 'Aokiji', side: 'wildcard', role: 'A napping Admiral who freezes Robin where she stands, beats Luffy without effort, and leaves both alive as a warning.', epithet: 'Admiral', color: '#5aa0c8' },
      { id: 'tonjit', name: 'Tonjit', side: 'ally', role: 'An old man stuck ten years on his stilts, reunited with his horse Shelly and sent across the frozen sea to his village.', color: '#9a8a6a' }
    ],
    beats: {
      'tonjit-and-shelly': { location: 'long-ring-long-land', present: ['luffy', 'chopper', 'tonjit', 'foxy'], mood: 'day' },
      'the-wager': { location: 'long-ring-long-land', present: ['luffy', 'nami', 'usopp', 'robin', 'chopper', 'foxy', 'porche'], mood: 'day' },
      'groggy-ring': { location: 'long-ring-long-land', present: ['zoro', 'sanji', 'chopper', 'hamburg', 'foxy'], mood: 'day' },
      combat: { location: 'long-ring-long-land', present: ['luffy', 'foxy', 'porche'], mood: 'day' },
      'captain-and-admiral': { location: 'long-ring-long-land', present: ['luffy', 'robin', 'zoro', 'sanji', 'kuzan', 'tonjit'], mood: 'dusk' }
    },
    battles: {
      'groggy-ring-match': { a: ['zoro', 'sanji'], b: ['hamburg'], verdict: 'a' },
      foxy: { a: ['luffy'], b: ['foxy'], verdict: 'a' },
      aokiji: { a: ['luffy'], b: ['kuzan'], verdict: 'b' }
    }
  },
  {
    arcId: 'water-seven',
    hook: 'The keel is broken.',
    cast: [
      { id: 'luffy', name: 'Monkey D. Luffy', side: 'crew', role: 'Decides to replace the Merry, fights the friend who cannot accept it, and ends the arc wedged between two buildings with the tide rising.' },
      { id: 'zoro', name: 'Roronoa Zoro', side: 'crew', role: 'Crosses swords with the shipwright who turns out to be a CP9 agent, then cuts a hole through Aqua Laguna for Rocketman.' },
      { id: 'nami', name: 'Nami', side: 'crew', role: 'Learns Robin’s real reason from Iceburg and runs through a drowning city to bring it to Luffy.' },
      { id: 'usopp', name: 'Usopp', side: 'crew', role: 'Robbed, beaten, and told the ship is finished, he leaves the crew, loses a duel for the Merry, and returns as a masked hero.' },
      { id: 'sanji', name: 'Sanji', side: 'crew', role: 'Watches Robin say goodbye in an alley, then boards the Puffing Tom alone to follow her.' },
      { id: 'chopper', name: 'Tony Tony Chopper', side: 'crew', role: 'Sees Robin with a masked man, is told to forget her, and helps Nami find the captain stuck between walls.' },
      { id: 'robin', name: 'Nico Robin', side: 'crew', role: 'Sells herself to CP9 to keep the Buster Call off the crew, and tells her friends never to look for her.' },
      { id: 'franky-cutty-flam', name: 'Franky', side: 'wildcard', role: 'Cyborg boss of the Franky Family, who robs the crew, fights Luffy for his flattened house, and keeps Tom’s blueprints hidden under the bridge.', epithet: 'Cutty Flam', color: '#5c9faa' },
      { id: 'iceburg', name: 'Iceburg', side: 'ally', role: 'Mayor and master shipwright, shot in his own bed, who tells Nami what Robin is really buying with her surrender.', color: '#6a8aa8' },
      { id: 'paulie', name: 'Paulie', side: 'ally', role: 'Galley-La’s rope-fighting foreman, who hunts the Straw Hats for the attack on Iceburg and then boards Rocketman beside them.', color: '#c8a05a' },
      { id: 'kokoro', name: 'Kokoro', side: 'ally', role: 'Shift Station’s drunken stationmaster, who unveils Rocketman and drives a brakeless train into Aqua Laguna.', color: '#7ab8a0' },
      { id: 'lucci', name: 'Rob Lucci', side: 'foe', role: 'The silent shipwright who speaks through a pigeon until the mask comes off, then throws the Straw Hats through the mansion walls.', epithet: 'CP9', color: '#3a3a4a' },
      { id: 'kaku', name: 'Kaku', side: 'foe', role: 'Diagnoses the Merry’s broken keel by day and reveals himself as a CP9 swordsman by night.', epithet: 'CP9', color: '#a08050' },
      { id: 'spandam', name: 'Spandam', side: 'foe', role: 'The Government agent who framed Tom with Cutty Flam’s warships and now runs CP9 from Enies Lobby.', color: '#8a5a8a' },
      { id: 'tom', name: 'Tom', side: 'ally', role: 'The fish-man shipwright who built Roger’s ship and the sea train, and confessed to a crime he did not commit to save his apprentices.', color: '#d8703a' }
    ],
    beats: {
      'the-merry-cannot-sail': { location: 'galley-la-headquarters', present: ['luffy', 'usopp', 'nami', 'zoro', 'sanji', 'chopper', 'kaku', 'iceburg', 'franky-cutty-flam'], mood: 'day' },
      'luffy-and-usopp': { location: 'going-merry', present: ['luffy', 'usopp'], mood: 'night' },
      'the-mayor-is-shot': { location: 'water-seven', present: ['luffy', 'sanji', 'chopper', 'robin', 'franky-cutty-flam', 'paulie', 'iceburg'], mood: 'dusk' },
      'cp9-unmasked': { location: 'galley-la-headquarters', present: ['luffy', 'zoro', 'nami', 'chopper', 'robin', 'lucci', 'kaku', 'iceburg', 'paulie'], mood: 'night' },
      'warehouse-under-the-bridge': { location: 'water-seven', present: ['franky-cutty-flam', 'usopp', 'nami', 'chopper', 'sanji', 'lucci', 'kaku'], mood: 'storm' },
      'toms-workers': { location: 'water-seven', present: ['tom', 'iceburg', 'franky-cutty-flam', 'spandam'], mood: 'flashback' },
      'chase-the-sea-train': { location: 'sea-train', present: ['luffy', 'nami', 'zoro', 'chopper', 'kokoro', 'paulie'], mood: 'storm' },
      'the-train-battle': { location: 'sea-train', present: ['sanji', 'usopp', 'franky-cutty-flam', 'robin', 'zoro'], mood: 'storm' }
    },
    battles: {
      'luffy-usopp': { a: ['luffy'], b: ['usopp'], verdict: 'a' },
      'luffy-franky': { a: ['luffy'], b: ['franky-cutty-flam'], verdict: 'interrupted' },
      'galley-la-night': { a: ['luffy', 'zoro', 'nami', 'chopper'], b: ['lucci', 'kaku'], verdict: 'b' },
      'puffing-tom': { a: ['sanji', 'franky-cutty-flam', 'usopp', 'zoro'], b: ['lucci'], verdict: 'interrupted' }
    }
  },
  {
    arcId: 'enies-lobby',
    hook: 'Say you want to live.',
    cast: [
      { id: 'luffy', name: 'Monkey D. Luffy', side: 'crew', role: 'Storms the island ahead of everyone, burns the Government’s flag, and beats Rob Lucci on the last bridge with Usopp’s voice behind him.' },
      { id: 'zoro', name: 'Roronoa Zoro', side: 'crew', role: 'Runs from Jabra handcuffed to Sogeking, then shows Kaku a nine-sword shape no one can explain.' },
      { id: 'nami', name: 'Nami', side: 'crew', role: 'Fights Kalifa alone in a bathhouse and wins with the storm she has been learning to build since Skypiea.' },
      { id: 'usopp', name: 'Usopp', side: 'crew', role: 'As Sogeking he turns two giants, shoots the flag, slows Spandam across the chasm, and shouts Luffy back onto his feet.' },
      { id: 'sanji', name: 'Sanji', side: 'crew', role: 'Refuses Jabra’s lies, lights his leg for the first time, and shuts the Gates of Justice on the Buster Call.' },
      { id: 'chopper', name: 'Tony Tony Chopper', side: 'crew', role: 'Eats a third rumble ball against Kumadori and becomes something the crew has to stop.' },
      { id: 'robin', name: 'Nico Robin', side: 'crew', role: 'Asks the crew to let her die, hears them refuse, and screams across the chasm that she wants to live.' },
      { id: 'franky-cutty-flam', name: 'Franky', side: 'ally', role: 'Burns the Pluton blueprints in front of Spandam, beats Fukurou on the stairs, and frees Robin on the bridge.', epithet: 'Cutty Flam', color: '#5c9faa' },
      { id: 'spandam', name: 'Spandam', side: 'foe', role: 'Chief of CP9, who drags Robin toward the Gates of Justice and accidentally calls a Buster Call on his own island.', color: '#8a5a8a' },
      { id: 'lucci', name: 'Rob Lucci', side: 'foe', role: 'CP9’s strongest agent, a leopard who guards the bridge and nearly kills the captain before Usopp’s call.', epithet: 'CP9', color: '#3a3a4a' },
      { id: 'kaku', name: 'Kaku', side: 'foe', role: 'A giraffe swordsman who cuts the tower into slices and carries the one key that fits Robin’s cuffs.', epithet: 'CP9', color: '#a08050' },
      { id: 'kalifa', name: 'Kalifa', side: 'foe', role: 'Iceburg’s former secretary, whose bubbles make Nami slide out of her own control in the bathhouse.', epithet: 'CP9', color: '#c8a8c8' },
      { id: 'jabra', name: 'Jabra', side: 'foe', role: 'The wolf of CP9, who chases a handcuffed Zoro and Sogeking and tries to talk Sanji out of fighting.', epithet: 'CP9', color: '#7a5a3a' },
      { id: 'kumadori', name: 'Kumadori', side: 'foe', role: 'A theatrical agent who refuses to fall until Chopper becomes a monster to make him.', epithet: 'CP9', color: '#c85a5a' },
      { id: 'fukurou', name: 'Fukurou', side: 'foe', role: 'The round agent who cannot keep a secret and fights Franky up and down the tower stairs.', epithet: 'CP9', color: '#6a9a6a' },
      { id: 'blueno', name: 'Blueno', side: 'foe', role: 'The barman who opens doors in the air, taken apart on the courthouse roof by Gear Second.', epithet: 'CP9', color: '#5a6a8a' },
      { id: 'saul', name: 'Jaguar D. Saul', side: 'ally', role: 'A giant Vice Admiral who deserted rather than burn Ohara, befriended a child on the beach, and froze laughing so that she would remember how.', color: '#c89a5a' }
    ],
    beats: {
      'storm-the-courthouse': { location: 'enies-lobby', present: ['luffy', 'usopp', 'franky-cutty-flam', 'zoro', 'sanji', 'nami', 'chopper', 'spandam'], mood: 'day' },
      'gear-second': { location: 'enies-lobby', present: ['luffy', 'blueno'], mood: 'day' },
      'the-roof-and-the-tower': { location: 'tower-of-justice', present: ['luffy', 'zoro', 'nami', 'usopp', 'sanji', 'chopper', 'franky-cutty-flam', 'robin', 'spandam'], mood: 'day' },
      ohara: { present: ['robin', 'saul'], mood: 'flashback' },
      'declaration-of-war': { location: 'tower-of-justice', present: ['luffy', 'usopp', 'robin', 'franky-cutty-flam', 'spandam', 'zoro', 'nami', 'sanji'], mood: 'day' },
      'keys-to-freedom': { location: 'tower-of-justice', present: ['zoro', 'usopp', 'franky-cutty-flam', 'chopper', 'jabra', 'fukurou', 'kumadori', 'spandam'], mood: 'day' },
      'wolves-and-giraffes': { location: 'tower-of-justice', present: ['nami', 'sanji', 'zoro', 'kalifa', 'jabra', 'kaku'], mood: 'day' },
      'the-bridge-of-hesitation': { location: 'bridge-of-hesitation', present: ['luffy', 'lucci', 'robin', 'spandam', 'franky-cutty-flam', 'usopp'], mood: 'storm' },
      'the-last-ship': { location: 'going-merry', present: ['luffy', 'usopp', 'lucci', 'zoro', 'nami', 'sanji', 'chopper', 'robin'], mood: 'dusk' }
    },
    battles: {
      fukurou: { a: ['franky-cutty-flam'], b: ['fukurou'], verdict: 'a' },
      kumadori: { a: ['chopper'], b: ['kumadori'], verdict: 'a' },
      kalifa: { a: ['nami'], b: ['kalifa'], verdict: 'a' },
      jabra: { a: ['sanji'], b: ['jabra'], verdict: 'a' },
      kaku: { a: ['zoro'], b: ['kaku'], verdict: 'a' },
      lucci: { a: ['luffy'], b: ['lucci'], verdict: 'a' }
    }
  },
  {
    arcId: 'post-enies-lobby',
    hook: 'A new ship, an old apology.',
    cast: [
      { id: 'luffy', name: 'Monkey D. Luffy', side: 'crew', role: 'Learns his grandfather is a Vice Admiral and his father a revolutionary, and stretches an arm back across the harbour for Usopp.' },
      { id: 'zoro', name: 'Roronoa Zoro', side: 'crew', role: 'Refuses to let Usopp return without an apology, and would leave the crew before he let the captain be treated lightly.' },
      { id: 'nami', name: 'Nami', side: 'crew', role: 'Finds her own face in the paper at sixteen million and watches the Sunny take shape in the yard.' },
      { id: 'usopp', name: 'Usopp', side: 'crew', role: 'Waits on the pier for an invitation that does not come, then runs after the ship shouting the apology he owes.' },
      { id: 'sanji', name: 'Sanji', side: 'crew', role: 'Receives a bounty poster with a sketch so bad he cannot look at it, and keeps cooking anyway.' },
      { id: 'chopper', name: 'Tony Tony Chopper', side: 'crew', role: 'Listed on his poster as a pet worth fifty berries, which he decides to take as a compliment.' },
      { id: 'robin', name: 'Nico Robin', side: 'crew', role: 'Settles the question of Franky’s membership by seizing what he cannot leave behind and walking to the ship.' },
      { id: 'franky', name: 'Franky', side: 'crew', joins: true, role: 'Builds the Thousand Sunny from Adam wood, refuses to sail on it, and is talked aboard by his own family in a speedo.' },
      { id: 'garp', name: 'Monkey D. Garp', side: 'wildcard', role: 'Luffy’s grandfather, a Vice Admiral who knocks him through a wall with love and then chases the Sunny with hand-thrown cannonballs.', epithet: 'Hero of the Marines', color: '#8a8a9a' },
      { id: 'coby', name: 'Coby', side: 'ally', role: 'The boy from Alvida’s ship, now Garp’s trainee, who has learned to fight and to name the Four Emperors.', color: '#e8a0b0' },
      { id: 'helmeppo', name: 'Helmeppo', side: 'ally', role: 'The Marine captain’s spoiled son from Shells Town, hardened into a decent officer under Garp.', color: '#c8b070' },
      { id: 'iceburg', name: 'Iceburg', side: 'ally', role: 'Helps build the Sunny in his own yard, names it, and sends Franky off to finish what Tom started.', color: '#6a8aa8' },
      { id: 'ace', name: 'Portgas D. Ace', side: 'ally', role: 'Catches Blackbeard on Banaro Island and fights him for the crewmate he murdered, far from his brother’s knowledge.', epithet: 'Fire Fist', color: '#e07030' },
      { id: 'blackbeard', name: 'Marshall D. Teach', side: 'foe', role: 'Offers Ace a place in his new crew and a plan to take Luffy’s head, then meets fire with a darkness that swallows it.', color: '#3a2f45' }
    ],
    beats: {
      'a-family-of-surprises': { location: 'water-seven', present: ['luffy', 'garp', 'coby', 'helmeppo', 'zoro', 'nami', 'sanji'], mood: 'day' },
      wanted: { location: 'water-seven', present: ['luffy', 'zoro', 'nami', 'usopp', 'sanji', 'chopper', 'robin', 'iceburg'], mood: 'day' },
      'the-dream-ship': { location: 'water-seven', present: ['franky', 'iceburg', 'robin', 'luffy', 'nami'], mood: 'day' },
      'an-apology-and-a-departure': { location: 'thousand-sunny', present: ['usopp', 'zoro', 'luffy', 'franky', 'garp', 'coby'], mood: 'dawn' },
      'banaro-island': { present: ['ace', 'blackbeard'], mood: 'dusk' }
    },
    battles: {
      'garps-fists': { a: ['luffy', 'franky', 'usopp', 'zoro'], b: ['garp'], verdict: 'a' },
      'ace-blackbeard': { a: ['ace'], b: ['blackbeard'], verdict: 'b' }
    }
  },
  {
    arcId: 'thriller-bark',
    hook: 'A skeleton with a promise to keep.',
    cast: [
      { id: 'luffy', name: 'Monkey D. Luffy', side: 'crew', role: 'Invites a skeleton to join the crew on sight, loses his shadow to Oars, and carries a hundred borrowed ones into the dawn.' },
      { id: 'zoro', name: 'Roronoa Zoro', side: 'crew', role: 'Takes Shusui from Ryuma, then offers Kuma his life in place of his captain’s and says nothing happened.' },
      { id: 'nami', name: 'Nami', side: 'crew', role: 'Is carried from her bath to an invisible man’s wedding, and later puts lightning through a giant’s spine.' },
      { id: 'usopp', name: 'Usopp', side: 'crew', role: 'Too negative for Perona’s ghosts to touch, he becomes the only one who can fight her, and does.' },
      { id: 'sanji', name: 'Sanji', side: 'crew', role: 'Stops Absalom’s wedding at the altar and is knocked out trying to take Zoro’s place before Kuma.' },
      { id: 'chopper', name: 'Tony Tony Chopper', side: 'crew', role: 'Confronts the surgeon he admired and tells him that the woman he built is not the woman he loved.' },
      { id: 'robin', name: 'Nico Robin', side: 'crew', role: 'Holds Oars down with a hundred arms and helps Chopper break Hogback’s hold on Cindry.' },
      { id: 'franky', name: 'Franky', side: 'crew', role: 'Builds the crew into a tower against Oars and pins the giant for Luffy’s final blow.' },
      { id: 'brook', name: 'Brook', side: 'crew', joins: true, role: 'A skeleton who has hunted his own shadow for years, and who learns that the whale he promised to return to is still waiting.', epithet: 'Humming' },
      { id: 'moria', name: 'Gecko Moria', side: 'foe', role: 'A Warlord who cuts shadows from the living to animate the dead, and swallows a thousand of them to hold his kingdom.', epithet: 'Warlord', color: '#6a3a8a' },
      { id: 'perona', name: 'Perona', side: 'foe', role: 'The Ghost Princess whose hollows leave people apologising for existing, undone by a man already at rock bottom.', epithet: 'Ghost Princess', color: '#e070a0' },
      { id: 'hogback', name: 'Doctor Hogback', side: 'foe', role: 'A celebrated surgeon who builds obedient corpses and cannot admit that his rebuilt Cindry is not the woman he loved.', color: '#8a9a5a' },
      { id: 'absalom', name: 'Absalom', side: 'foe', role: 'The invisible commander of the zombie soldiers, who carries Nami from her bath to a wedding she did not agree to.', color: '#7a6a8a' },
      { id: 'ryuma', name: 'Ryuma', side: 'foe', role: 'The legendary swordsman of Wano, raised as a zombie with Brook’s shadow, who gives Zoro his sword before he burns.', epithet: 'Sword God', color: '#4a5a6a' },
      { id: 'oars', name: 'Oars', side: 'foe', role: 'A frozen giant the size of a fortress, given Luffy’s shadow and Luffy’s appetite for adventure.', color: '#a05a3a' },
      { id: 'kuma', name: 'Bartholomew Kuma', side: 'wildcard', role: 'A Warlord in a Marine coat who brings news of Ace, is ordered to erase the survivors, and takes Zoro’s bargain instead.', epithet: 'Tyrant', color: '#5a7a5a' }
    ],
    beats: {
      'a-gentleman-skeleton': { location: 'florian-triangle', present: ['luffy', 'nami', 'usopp', 'sanji', 'brook', 'franky'], mood: 'night' },
      'hogbacks-mansion': { location: 'hogback-mansion', present: ['nami', 'usopp', 'chopper', 'hogback', 'absalom', 'luffy', 'moria'], mood: 'night' },
      'the-stolen-shadows': { location: 'thriller-bark', present: ['luffy', 'zoro', 'sanji', 'moria', 'perona', 'brook', 'oars', 'absalom'], mood: 'night' },
      'the-scattered-fights': { location: 'hogback-mansion', present: ['sanji', 'absalom', 'usopp', 'perona', 'zoro', 'ryuma', 'chopper', 'hogback'], mood: 'night' },
      'against-oars': { location: 'thriller-bark', present: ['luffy', 'zoro', 'nami', 'usopp', 'sanji', 'chopper', 'robin', 'franky'], mood: 'night' },
      'nightmare-luffy': { location: 'thriller-bark', present: ['luffy', 'oars', 'moria', 'zoro', 'nami', 'robin', 'franky', 'brook'], mood: 'dawn' },
      'nothing-happened': { location: 'thriller-bark', present: ['zoro', 'kuma', 'sanji', 'luffy'], mood: 'dawn' },
      'the-last-song': { location: 'thousand-sunny', present: ['brook', 'luffy'], mood: 'flashback' }
    },
    battles: {
      ryuma: { a: ['zoro'], b: ['ryuma'], verdict: 'a' },
      'oars-moria': { a: ['luffy', 'zoro', 'nami', 'usopp', 'sanji', 'chopper', 'robin', 'franky'], b: ['oars', 'moria'], verdict: 'a' },
      moria: { a: ['luffy'], b: ['moria'], verdict: 'a' }
    }
  }
];
