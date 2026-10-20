import { arcs } from './arcs';
import { isArcVisible } from '../reading-horizon';

export type FruitType = 'paramecia' | 'zoan' | 'ancient-zoan' | 'mythical-zoan' | 'logia' | 'smile';
export interface FruitUser {
  /** A profile id when the user has one (other-characters.ts or characters.ts). */
  characterId?: string;
  name: string;
  /** The chapter that first shows this person with the power; it gates the entry. */
  from: number;
  /** The chapter they lose it, by death or otherwise. */
  until?: number;
}
export interface DevilFruit {
  id: string;
  /** The VIZ English name where one exists. */
  name: string;
  romaji: string;
  /** What the Japanese name means. */
  meaning: string;
  type: FruitType;
  /** The chapter that first names the fruit or shows its power; the fruit is hidden before it. */
  revealChapter: number;
  /** The arc containing revealChapter, where the record links. */
  arcId: string;
  /** One or two plain sentences of original description. */
  power: string;
  /** In story order, so a past user can come before a later one even when revealed after. */
  users: FruitUser[];
  awakened?: { characterId: string; chapter: number }[];
  /** A later reveal that the fruit is something else (Gum-Gum is the Human-Human Fruit, Model: Nika). */
  trueIdentity?: { name: string; romaji: string; type: FruitType; chapter: number };
}

export const FRUIT_TYPES: { id: FruitType; label: string }[] = [
  { id: 'paramecia', label: 'Paramecia' },
  { id: 'zoan', label: 'Zoan' },
  { id: 'ancient-zoan', label: 'Ancient Zoan' },
  { id: 'mythical-zoan', label: 'Mythical Zoan' },
  { id: 'logia', label: 'Logia' },
  { id: 'smile', label: 'Artificial (SMILE)' },
];
export const fruitTypeLabel = (type: FruitType) => FRUIT_TYPES.find((t) => t.id === type)?.label ?? type;

// Facts were researched chapter by chapter through the wiki API and every chapter checked against
// the edition's cutoff; the descriptions are original writing. Names follow VIZ where it has one.
// Sorted by reveal chapter.
export const devilFruits: DevilFruit[] = [
  { id: 'gomu-gomu', name: 'Gum-Gum Fruit', romaji: 'Gomu Gomu no Mi', meaning: 'Rubber', type: 'paramecia', revealChapter: 1, arcId: 'romance-dawn',
    power: 'Gives the user a rubber body that stretches, bounces and shrugs off blunt force. Awakened (Gear 5), it lets the user treat their body and surroundings like rubber with cartoon-like freedom.',
    users: [{ name: 'Joy Boy', from: 1114 }, { characterId: 'luffy', name: 'Monkey D. Luffy', from: 1 }], awakened: [{ characterId: 'luffy', chapter: 1044 }], trueIdentity: { name: 'Human-Human Fruit, Model: Nika', romaji: 'Hito Hito no Mi, Model: Nika', type: 'mythical-zoan', chapter: 1044 } },
  { id: 'bara-bara', name: 'Chop-Chop Fruit', romaji: 'Bara Bara no Mi', meaning: 'Scattered; in pieces', type: 'paramecia', revealChapter: 9, arcId: 'orange-town',
    power: 'Lets the user split their body into pieces that float and move independently. Makes the user immune to being cut by blades.',
    users: [{ characterId: 'buggy', name: 'Buggy', from: 9 }] },
  { id: 'sube-sube', name: 'Slip-Slip Fruit', romaji: 'Sube Sube no Mi', meaning: 'Smooth', type: 'paramecia', revealChapter: 98, arcId: 'loguetown',
    power: 'Makes the user’s skin perfectly smooth, so blows and objects slide off. Also transformed Alvida’s appearance, making her slimmer.',
    users: [{ characterId: 'alvida', name: 'Alvida', from: 98 }] },
  { id: 'hana-hana', name: 'Flower-Flower Fruit', romaji: 'Hana Hana no Mi', meaning: 'Flower; Bloom', type: 'paramecia', revealChapter: 114, arcId: 'whisky-peak',
    power: 'Lets the user sprout copies of their body parts on any surface, including on other people. Can form full-size clones of the user.',
    users: [{ characterId: 'robin', name: 'Nico Robin', from: 114 }] },
  { id: 'suna-suna', name: 'Sand-Sand Fruit', romaji: 'Suna Suna no Mi', meaning: 'Sand', type: 'logia', revealChapter: 127, arcId: 'little-garden',
    power: 'Lets the user create, control and turn into sand. Can drain moisture from whatever the user touches, drying it out.',
    users: [{ characterId: 'crocodile', name: 'Crocodile', from: 127 }] },
  { id: 'hito-hito', name: 'Human-Human Fruit', romaji: 'Hito Hito no Mi', meaning: 'Human', type: 'zoan', revealChapter: 138, arcId: 'drum-island',
    power: 'Lets an animal take human or half-human forms and gives it human intelligence and speech. Chopper extends it to extra forms with his Rumble Ball drug.',
    users: [{ characterId: 'chopper', name: 'Tony Tony Chopper', from: 138 }] },
  { id: 'mane-mane', name: 'Clone-Clone Fruit', romaji: 'Mane Mane no Mi', meaning: 'Imitation', type: 'paramecia', revealChapter: 156, arcId: 'alabasta',
    power: 'Lets the user copy the face and body of anyone they have touched with their right hand. Touching the face with the left hand returns the user to their own appearance.',
    users: [{ name: 'Kurozumi Higurashi', from: 965, until: 972 }, { characterId: 'mr-2', name: 'Bentham', from: 156 }] },
  { id: 'mera-mera', name: 'Flame-Flame Fruit', romaji: 'Mera Mera no Mi', meaning: 'Sound of fire burning', type: 'logia', revealChapter: 158, arcId: 'alabasta',
    power: 'Lets the user create, control and become fire.',
    users: [{ characterId: 'ace', name: 'Portgas D. Ace', from: 158, until: 574 }, { characterId: 'sabo', name: 'Sabo', from: 744 }] },
  { id: 'supa-supa', name: 'Dice-Dice Fruit', romaji: 'Supa Supa no Mi', meaning: 'Sound of cutting', type: 'paramecia', revealChapter: 160, arcId: 'alabasta',
    power: 'Lets the user turn any part of the body into steel blades. Hardens the body to steel, making it resistant to cuts.',
    users: [{ characterId: 'mr-1', name: 'Daz Bonez', from: 160 }] },
  { id: 'bane-bane', name: 'Spring-Spring Fruit', romaji: 'Bane Bane no Mi', meaning: 'Spring', type: 'paramecia', revealChapter: 231, arcId: 'jaya',
    power: 'Turns the user’s legs, and other body parts, into springs for explosive jumps and punches.',
    users: [{ characterId: 'bellamy', name: 'Bellamy', from: 231 }] },
  { id: 'ito-ito', name: 'String-String Fruit', romaji: 'Ito Ito no Mi', meaning: 'String; Thread', type: 'paramecia', revealChapter: 234, arcId: 'jaya',
    power: 'Lets the user create and control strings strong enough to cut, bind or puppet other people. Awakened, it turns the surrounding ground and buildings into strings.',
    users: [{ characterId: 'doflamingo', name: 'Donquixote Doflamingo', from: 234 }], awakened: [{ characterId: 'doflamingo', chapter: 785 }] },
  { id: 'hie-hie', name: 'Chilly-Chilly Fruit', romaji: 'Hie Hie no Mi', meaning: 'Chilly', type: 'logia', revealChapter: 303, arcId: 'long-ring-long-land',
    power: 'Lets the user create, control and become ice. Can freeze people solid and freeze the sea into walkable ice.',
    users: [{ characterId: 'kuzan', name: 'Kuzan', from: 303 }] },
  { id: 'noro-noro', name: 'Slow-Slow Fruit', romaji: 'Noro Noro no Mi', meaning: 'Slowly; Sluggishly', type: 'paramecia', revealChapter: 308, arcId: 'long-ring-long-land',
    power: 'Fires photon beams that slow anything they hit to a crawl for 30 seconds.',
    users: [{ characterId: 'foxy', name: 'Foxy', from: 308 }] },
  { id: 'neko-neko-leopard', name: 'Cat-Cat Fruit, Model: Leopard', romaji: 'Neko Neko no Mi, Model: Leopard', meaning: 'Cat', type: 'zoan', revealChapter: 348, arcId: 'water-seven',
    power: 'Lets the user become a leopard or a leopard-human hybrid. Awakened, the hybrid form grows larger with a flaming mane and boosted strength and recovery.',
    users: [{ characterId: 'lucci', name: 'Rob Lucci', from: 348 }], awakened: [{ characterId: 'lucci', chapter: 1069 }] },
  { id: 'ushi-ushi-giraffe', name: 'Ox-Ox Fruit, Giraffe Model', romaji: 'Ushi Ushi no Mi, Model: Giraffe', meaning: 'Cow, Giraffe', type: 'zoan', revealChapter: 401, arcId: 'enies-lobby',
    power: 'Lets the user become a giraffe or giraffe-human hybrid with a long, powerful neck. Awakened, the neck grows longer and serpentine with a dark flaming mane.',
    users: [{ characterId: 'kaku', name: 'Kaku', from: 385 }], awakened: [{ characterId: 'kaku', chapter: 1072 }] },
  { id: 'yami-yami', name: 'Dark-Dark Fruit', romaji: 'Yami Yami no Mi', meaning: 'Darkness', type: 'logia', revealChapter: 440, arcId: 'post-enies-lobby',
    power: 'Lets the user create and control darkness with a gravity-like pull that draws everything in. Lets the user cancel another Devil Fruit user’s power by touching them.',
    users: [{ characterId: 'blackbeard', name: 'Marshall D. Teach', from: 440 }] },
  { id: 'horo-horo', name: 'Hollow-Hollow Fruit', romaji: 'Horo Horo no Mi', meaning: 'Hollow', type: 'paramecia', revealChapter: 442, arcId: 'thriller-bark',
    power: 'Lets the user create ghosts; the Negative Hollows sap the will of anyone they pass through. Lets the user project her spirit out of her body.',
    users: [{ name: 'Gill Bastar', from: 1165 }, { characterId: 'perona', name: 'Perona', from: 442 }] },
  { id: 'yomi-yomi', name: 'Revive-Revive Fruit', romaji: 'Yomi Yomi no Mi', meaning: 'Resurrection', type: 'paramecia', revealChapter: 442, arcId: 'thriller-bark',
    power: 'Brought the user’s soul back to life once, after his first death. Also grants soul powers such as leaving the body and freezing cold from the underworld.',
    users: [{ characterId: 'brook', name: 'Brook', from: 442 }] },
  { id: 'kage-kage', name: 'Shadow-Shadow Fruit', romaji: 'Kage Kage no Mi', meaning: 'Shadow', type: 'paramecia', revealChapter: 443, arcId: 'thriller-bark',
    power: 'Lets the user manipulate shadows, including cutting other people’s shadows away. Stolen shadows placed in corpses create obedient zombies.',
    users: [{ characterId: 'moria', name: 'Gecko Moria', from: 455 }] },
  { id: 'suke-suke', name: 'Clear-Clear Fruit', romaji: 'Suke Suke no Mi', meaning: 'See-through; Sheer', type: 'paramecia', revealChapter: 444, arcId: 'thriller-bark',
    power: 'Turns the user, and whatever they touch, invisible.',
    users: [{ name: 'Absalom', from: 444, until: 925 }, { characterId: 'shiryu', name: 'Shiryu', from: 925 }] },
  { id: 'nikyu-nikyu', name: 'Paw-Paw Fruit', romaji: 'Nikyu Nikyu no Mi', meaning: 'Paw', type: 'paramecia', revealChapter: 473, arcId: 'thriller-bark',
    power: 'Gives the user paw pads on the palms that repel anything they touch, including air. Can also push out intangible things such as pain, fatigue and memories.',
    users: [{ name: 'Bartholomew Kuma', from: 473 }] },
  { id: 'toshi-toshi', name: 'Age-Age Fruit', romaji: 'Toshi Toshi no Mi', meaning: 'Age; Year', type: 'paramecia', revealChapter: 499, arcId: 'sabaody-archipelago',
    power: 'Lets the user change her own age and the ages of others. With enough imagination she can take on imagined future forms, even mimicking Gear 5.',
    users: [{ characterId: 'bonney', name: 'Jewelry Bonney', from: 499 }] },
  { id: 'jiki-jiki', name: 'Magnet-Magnet Fruit', romaji: 'Jiki Jiki no Mi', meaning: 'Magnetism', type: 'paramecia', revealChapter: 504, arcId: 'sabaody-archipelago',
    power: 'Generates magnetic force to pull in and fling metal objects. Awakened, it can magnetize other things, even people, with a set polarity.',
    users: [{ name: 'John', from: 1163 }, { characterId: 'kid', name: 'Eustass Kid', from: 504 }], awakened: [{ characterId: 'kid', chapter: 1030 }] },
  { id: 'ope-ope', name: 'Op-Op Fruit', romaji: 'Ope Ope no Mi', meaning: 'Operation', type: 'paramecia', revealChapter: 504, arcId: 'sabaody-archipelago',
    power: 'Creates a spherical “Room” in which the user can cut, swap and rearrange anything without harm. Can grant eternal youth through an operation that costs the user’s life.',
    users: [{ characterId: 'law', name: 'Trafalgar D. Water Law', from: 504 }], awakened: [{ characterId: 'law', chapter: 1030 }] },
  { id: 'shiro-shiro', name: 'Castle-Castle Fruit', romaji: 'Shiro Shiro no Mi', meaning: 'Castle', type: 'paramecia', revealChapter: 508, arcId: 'sabaody-archipelago',
    power: 'Turns the user’s body into a living fortress that holds shrunken people and weapons inside.',
    users: [{ characterId: 'capone', name: 'Capone Bege', from: 508 }] },
  { id: 'wara-wara', name: 'Straw-Straw Fruit', romaji: 'Wara Wara no Mi', meaning: 'Straw', type: 'paramecia', revealChapter: 508, arcId: 'sabaody-archipelago',
    power: 'Lets the user create and control straw, including straw dolls and a giant straw form. Redirects damage the user takes onto people linked to straw dolls.',
    users: [{ characterId: 'hawkins', name: 'Basil Hawkins', from: 508 }] },
  { id: 'oto-oto', name: 'Tone-Tone Fruit', romaji: 'Oto Oto no Mi', meaning: 'Sound', type: 'paramecia', revealChapter: 509, arcId: 'sabaody-archipelago',
    power: 'Turns parts of the user’s body into musical instruments. Uses sound as attacks, such as notes that cut targets from a distance.',
    users: [{ characterId: 'apoo', name: 'Scratchmen Apoo', from: 509 }] },
  { id: 'ryu-ryu-allosaurus', name: 'Dragon-Dragon Fruit, Allosaurus Model', romaji: 'Ryu Ryu no Mi, Model: Allosaurus', meaning: 'Dragon, Dinosaur', type: 'ancient-zoan', revealChapter: 509, arcId: 'sabaody-archipelago',
    power: 'Lets the user become an allosaurus or an allosaurus-human hybrid with powerful jaws.',
    users: [{ characterId: 'drake', name: 'X Drake', from: 509 }] },
  { id: 'mero-mero', name: 'Love-Love Fruit', romaji: 'Mero Mero no Mi', meaning: 'Fall in love', type: 'paramecia', revealChapter: 516, arcId: 'amazon-lily',
    power: 'Turns anyone who feels attraction toward the user into stone. The user can also restore those she has petrified.',
    users: [{ characterId: 'hancock', name: 'Boa Hancock', from: 516 }] },
  { id: 'hebi-hebi-anaconda', name: 'Snake-Snake Fruit, Anaconda Model', romaji: 'Hebi Hebi no Mi, Model: Anaconda', meaning: 'Snake', type: 'zoan', revealChapter: 518, arcId: 'amazon-lily',
    power: 'Lets the user become an anaconda or a half-snake hybrid.',
    users: [{ characterId: 'sandersonia', name: 'Boa Sandersonia', from: 518 }] },
  { id: 'hebi-hebi-king-cobra', name: 'Snake-Snake Fruit, King Cobra Model', romaji: 'Hebi Hebi no Mi, Model: King Cobra', meaning: 'Snake', type: 'zoan', revealChapter: 518, arcId: 'amazon-lily',
    power: 'Lets the user become a king cobra or a half-snake hybrid.',
    users: [{ characterId: 'marigold', name: 'Boa Marigold', from: 518 }] },
  { id: 'horu-horu', name: 'Horm-Horm Fruit', romaji: 'Horu Horu no Mi', meaning: 'Hormones', type: 'paramecia', revealChapter: 537, arcId: 'impel-down',
    power: 'Lets the user inject hormones that change a person’s sex, body, emotions or stamina.',
    users: [{ characterId: 'ivankov', name: 'Emporio Ivankov', from: 537 }] },
  { id: 'gura-gura', name: 'Tremor-Tremor Fruit', romaji: 'Gura Gura no Mi', meaning: 'Sound of shaking', type: 'paramecia', revealChapter: 552, arcId: 'marineford',
    power: 'Creates shockwaves that crack the air like glass and cause earthquakes and tsunamis.',
    users: [{ characterId: 'whitebeard', name: 'Edward Newgate', from: 552, until: 576 }, { characterId: 'blackbeard', name: 'Marshall D. Teach', from: 577 }] },
  { id: 'tori-tori-phoenix', name: 'Bird-Bird Fruit, Model: Phoenix', romaji: 'Tori Tori no Mi, Model: Phoenix', meaning: 'Bird; Phoenix', type: 'mythical-zoan', revealChapter: 553, arcId: 'marineford',
    power: 'Lets the user become a phoenix of blue flames. The flames regenerate the user’s injuries and can heal others.',
    users: [{ characterId: 'marco', name: 'Marco', from: 553 }] },
  { id: 'magu-magu', name: 'Mag-Mag Fruit', romaji: 'Magu Magu no Mi', meaning: 'Magma', type: 'logia', revealChapter: 554, arcId: 'marineford',
    power: 'Lets the user create, control and become magma, which burns even fire.',
    users: [{ characterId: 'sakazuki', name: 'Sakazuki', from: 554 }] },
  { id: 'mato-mato', name: 'Mark-Mark Fruit', romaji: 'Mato Mato no Mi', meaning: 'Target', type: 'paramecia', revealChapter: 613, arcId: 'fish-man-island',
    power: 'Marks a target by touch so that anything the user throws homes in on it.',
    users: [{ characterId: 'vander-decken', name: 'Vander Decken IX', from: 613 }] },
  { id: 'soru-soru', name: 'Soul-Soul Fruit', romaji: 'Soru Soru no Mi', meaning: 'Soul', type: 'paramecia', revealChapter: 651, arcId: 'fish-man-island',
    power: 'Lets the user take or give portions of people’s lifespans. Soul fragments placed in objects bring them to life as “homies”.',
    users: [{ name: 'Carmel', from: 867, until: 867 }, { characterId: 'big-mom', name: 'Charlotte Linlin', from: 651 }] },
  { id: 'kame-kame', name: 'Turtle-Turtle Fruit', romaji: 'Kame Kame no Mi', meaning: 'Turtle', type: 'zoan', revealChapter: 652, arcId: 'fish-man-island',
    power: 'Lets the user become a turtle or turtle hybrid with a hard protective shell.',
    users: [{ characterId: 'pekoms', name: 'Pekoms', from: 652 }] },
  { id: 'gasu-gasu', name: 'Gas-Gas Fruit', romaji: 'Gasu Gasu no Mi', meaning: 'Gas', type: 'logia', revealChapter: 658, arcId: 'punk-hazard',
    power: 'Lets the user create, control and become gas. Can strip the oxygen from an area to suffocate people.',
    users: [{ name: 'Caesar Clown', from: 658 }] },
  { id: 'smile', name: 'SMILE', romaji: 'Sumairu', meaning: '', type: 'smile', revealChapter: 689, arcId: 'punk-hazard',
    power: 'Artificial Zoan fruits made with SAD that give an animal trait somewhere on the eater’s body. Failed fruits grant no power and leave the eater able to express only smiles and laughter.',
    users: [{ characterId: 'killer', name: 'Killer', from: 944 }] },
  { id: 'beta-beta', name: 'Stick-Stick Fruit', romaji: 'Beta Beta no Mi', meaning: 'Sticky', type: 'paramecia', revealChapter: 700, arcId: 'dressrosa',
    power: 'Lets the user produce and control sticky, flammable mucus.',
    users: [{ characterId: 'trebol', name: 'Trebol', from: 700 }] },
  { id: 'bari-bari', name: 'Barrier-Barrier Fruit', romaji: 'Bari Bari no Mi', meaning: 'Barrier', type: 'paramecia', revealChapter: 708, arcId: 'dressrosa',
    power: 'Lets the user create unbreakable barriers.',
    users: [{ name: 'Kurozumi Semimaru', from: 969 }, { characterId: 'bartolomeo', name: 'Bartolomeo', from: 708 }] },
  { id: 'nui-nui', name: 'Stitch-Stitch Power', romaji: 'Nui Nui no Mi', meaning: 'Sewing', type: 'paramecia', revealChapter: 711, arcId: 'dressrosa',
    power: 'Lets the user stitch anything together, including people to the ground, and unstitch it.',
    users: [{ characterId: 'leo', name: 'Leo', from: 711 }] },
  { id: 'nagi-nagi', name: 'Calm-Calm Fruit', romaji: 'Nagi Nagi no Mi', meaning: 'Calm', type: 'paramecia', revealChapter: 764, arcId: 'dressrosa',
    power: 'Creates soundproof fields that silence everything inside them. Can also mute a single person or object the user touches.',
    users: [{ characterId: 'corazon', name: 'Donquixote Rosinante', from: 764, until: 767 }] },
  { id: 'chiyu-chiyu', name: 'Heal-Heal Fruit', romaji: 'Chiyu Chiyu no Mi', meaning: 'Healing', type: 'paramecia', revealChapter: 774, arcId: 'dressrosa',
    power: 'Heals wounds using liquid from the user’s body, such as tears.',
    users: [{ characterId: 'mansherry', name: 'Mansherry', from: 774 }] },
  { id: 'pero-pero', name: 'Lick-Lick Fruit', romaji: 'Pero Pero no Mi', meaning: 'Sound of licking', type: 'paramecia', revealChapter: 834, arcId: 'whole-cake-island',
    power: 'Lets the user produce and shape hard candy, often from his tongue. Can encase people in candy that hardens around them.',
    users: [{ characterId: 'perospero', name: 'Charlotte Perospero', from: 834 }] },
  { id: 'mochi-mochi', name: 'Mochi-Mochi Fruit', romaji: 'Mochi Mochi no Mi', meaning: 'Mochi; Springy', type: 'paramecia', revealChapter: 863, arcId: 'whole-cake-island',
    power: 'Lets the user create, control and turn into mochi; a “Special Paramecia” that behaves like a Logia. Awakened, it turns surrounding ground into mochi.',
    users: [{ characterId: 'katakuri', name: 'Charlotte Katakuri', from: 863 }], awakened: [{ characterId: 'katakuri', chapter: 882 }] },
  { id: 'uo-uo-seiryu', name: 'Fish-Fish Fruit, Model: Azure Dragon', romaji: 'Uo Uo no Mi, Model: Seiryu', meaning: 'Fish, Azure Dragon', type: 'mythical-zoan', revealChapter: 921, arcId: 'wano',
    power: 'Lets the user become an enormous Eastern azure dragon that flies on clouds. The dragon breathes fiery blasts and creates whirlwinds.',
    users: [{ characterId: 'kaido', name: 'Kaidou', from: 921 }] },
  { id: 'ryu-ryu-pteranodon', name: 'Dragon-Dragon Fruit, Pteranodon Model', romaji: 'Ryu Ryu no Mi, Model: Pteranodon', meaning: 'Dragon, Pteranodon', type: 'ancient-zoan', revealChapter: 930, arcId: 'wano',
    power: 'Lets the user become a pteranodon or hybrid, allowing fast flight.',
    users: [{ characterId: 'king', name: 'King', from: 930 }] },
  { id: 'ryu-ryu-brachiosaurus', name: 'Dragon-Dragon Fruit, Model: Brachiosaurus', romaji: 'Ryu Ryu no Mi, Model: Brachiosaurus', meaning: 'Dragon, Brachiosaurus', type: 'ancient-zoan', revealChapter: 945, arcId: 'wano',
    power: 'Lets the user become a huge brachiosaurus or hybrid with a long neck and massive weight.',
    users: [{ characterId: 'queen', name: 'Queen', from: 945 }] },
  { id: 'batto-batto', name: 'Bat-Bat Fruit', romaji: 'Batto Batto no Mi', meaning: 'Bat', type: 'zoan', revealChapter: 1072, arcId: 'egghead',
    power: 'Gives the user bat wings and a vampire-like bite. Drinking a victim’s blood quickly puts them to sleep.',
    users: [{ characterId: 'stussy', name: 'Stussy', from: 1072 }] },
  { id: 'aro-aro', name: 'Arrow-Arrow Fruit', romaji: 'Aro Aro no Mi', meaning: 'Arrow', type: 'paramecia', revealChapter: 1135, arcId: 'elbaf',
    power: 'Lets the user create and control arrows that redirect the motion of what they strike. Her arrows mark the path her blows will follow.',
    users: [{ name: 'Manmayer Gunko', from: 1135 }] },
  { id: 'ryu-ryu-kirin', name: 'Dragon-Dragon Fruit, Model: Kirin', romaji: 'Ryu Ryu no Mi, Model: Kirin', meaning: 'Dragon, Kirin/Qilin', type: 'mythical-zoan', revealChapter: 1140, arcId: 'elbaf',
    power: 'Lets the user become a qilin or qilin hybrid. Puts people to sleep with ringed beams and makes their dreams take real form.',
    users: [{ name: 'Rimoshifu Killingham', from: 1140 }] },
  { id: 'iba-iba', name: 'Thorn-Thorn Fruit', romaji: 'Iba Iba no Mi', meaning: 'Thorn', type: 'paramecia', revealChapter: 1143, arcId: 'elbaf',
    power: 'Lets the user create and control thorns and thorny vines, which can be invisible and steel-hard.',
    users: [{ name: 'Shepherd Sommers', from: 1143 }] },
  { id: 'risu-risu-ratatoskr', name: 'Squirrel-Squirrel Fruit, Model: Ice Squirrel Ratatoskr', romaji: 'Risu Risu no Mi, Model: Ratatoskr', meaning: 'Squirrel, Ratatoskr', type: 'mythical-zoan', revealChapter: 1170, arcId: 'elbaf',
    power: 'Lets the user become Ratatoskr, a legendary ice squirrel, or a hybrid form. Gave the warhammer Ragnir a will of its own; it guarded the Nidhöggr fruit for centuries.',
    users: [{ name: 'Ragnir', from: 1170 }] },
  { id: 'ryu-ryu-nidhoggr', name: 'Dragon-Dragon Fruit, Model: Nidhoggr', romaji: 'Ryu Ryu no Mi, Model: Nidhöggr', meaning: 'Dragon, Nidhöggr', type: 'mythical-zoan', revealChapter: 1170, arcId: 'elbaf',
    power: 'Turns the user into Nidhöggr, said to be the largest dragon in existence. Elbaf guarded it as a national treasure for centuries.',
    users: [{ name: 'Warrior God', from: 1175 }, { name: 'Loki', from: 1170 }] },
];

/**
 * The fruits a reader at this progress may see. A fruit appears once the arc that reveals it is
 * finished; users, awakenings and a later true identity each wait for their own chapter, and a
 * user's loss of the fruit stays hidden until it happens.
 */
export function fruitsAtProgress(through: number | null): DevilFruit[] {
  if (through === null) return devilFruits;
  const arcById = new Map(arcs.map((a) => [a.id, a]));
  return devilFruits
    .filter((f) => f.revealChapter <= through && isArcVisible(arcById.get(f.arcId) ?? { chapters: [Infinity, Infinity] }, through))
    .map((f) => ({
      ...f,
      users: f.users.filter((u) => u.from <= through).map(({ until, ...u }) => until !== undefined && until <= through ? { ...u, until } : u),
      awakened: f.awakened?.filter((a) => a.chapter <= through),
      trueIdentity: f.trueIdentity && f.trueIdentity.chapter <= through ? f.trueIdentity : undefined,
    }));
}

/** The fruits a character has eaten, in the order they hold them. */
export const fruitsOf = (fruits: DevilFruit[], characterId: string) => fruits.filter((f) => f.users.some((u) => u.characterId === characterId));
