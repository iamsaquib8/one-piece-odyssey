import type { Location } from '../types';
import { place, visual } from './location-helpers';

// Route positions are schematic story topology, never canonical coordinates.
// The Red Line crossing at Sabaody sits near x 67; story progress runs left to right from there.
export const newWorldLocations: Location[] = [
  // Calm Belt and the Paramount War
  place({
    id: 'amazon-lily', name: 'Amazon Lily', region: 'calm-belt', kind: 'island',
    arcIds: ['amazon-lily', 'post-war'], chapters: 'Ch. 514–524; 581–597', map: [60, 78],
    description: 'The Kuja women’s island in the Calm Belt where a flung-away Luffy lands, and where he later grieves and recovers after the war.',
    landmarks: ['Kuja palace', 'combat arena', 'serpent-drawn ship'],
    art: visual('A ring of jungle-cloaked cliffs cradles a stone city with a palace crowning its highest tier', 'Break through jungle canopy into the cliff basin as the arena bowl opens below', 'terraced stone houses cut into cliff faces, an open combat arena, and the emperor’s palace on the summit tier', 'volcanic hollow ringed by rock walls, dense jungle, and a sheltered coast where Sea Kings idle', 'humid green light, carved stone, hanging vines, and heavy Calm Belt stillness', '#3f6b3b|#c86a7c|#e4d2a5|#7b5e3d', 'martial and ceremonial, then abruptly tender in its second visit', ['snake-bow drawn taut', 'stone arena rail', 'Luffy’s straw hat set on a coastal rock'], 'Two serpents draw the Kuja ship in a slow arc across the bay while cliff-shadow moves with the sun', 'Freeze the arena at the moment its stone floor cracks under an unwelcome guest', 'The Kuja tribe, the cliff-side city, the arena, the palace, and the island’s Calm Belt setting are canon anchors from Ch. 514–524; the post-war recovery on its coast is canon from Ch. 581–597.', 'The basin plan, tier count, and the arena-to-palace sightline are interpretive staging.'),
  }),
  place({
    id: 'impel-down', name: 'Impel Down', region: 'calm-belt', kind: 'island',
    arcIds: ['impel-down'], chapters: 'Ch. 525–549', map: [72, 80],
    description: 'The World Government’s undersea prison, a tower of descending hells that Luffy breaks into to reach his brother.',
    landmarks: ['surface tower', 'six descending levels', 'Gates of Justice'],
    art: visual('A squat fortress on the waves hides a tower that plunges downward, each level a wider, darker ring', 'Enter as a stowaway on a warship, then cut to a cross-section that drops level by level', 'concentric stone tiers, iron cell blocks, a central lift shaft, and warden offices near the surface', 'a rock plug in the Calm Belt sea, with the prison hollowed downward beneath the waterline', 'blade forest red, beast-pit dust, starvation gloom, boiling heat, killing frost, and the still black of the lowest floor', '#5a1f24|#c7502e|#7fa6c9|#1a1c22', 'oppressive and mythic, punctured by absurd hope', ['a bent cell bar', 'warden’s key ring', 'frost on a stone step'], 'The lift descends past each ring; heat shimmer above, drifting snow below, and one candle in the final dark', 'Hold the cross-section with every level lit in its own color', 'The undersea prison, its levels with their named hells, the surface tower, and the Gates of Justice are canon from Ch. 525–549.', 'The cut-away view with all levels visible at once and the relative ring widths are interpretive.'),
  }),
  place({
    id: 'marineford', name: 'Marineford', region: 'paradise', kind: 'island',
    arcIds: ['marineford', 'post-war'], chapters: 'Ch. 550–580; 590', map: [70, 64],
    description: 'Marine Headquarters, a crescent-shaped stronghold whose plaza and execution scaffold host the war between Whitebeard and the Navy.',
    landmarks: ['execution scaffold', 'crescent bay', 'headquarters keep'],
    art: visual('A crescent of white walls closes around a bay, with a tall scaffold standing before the headquarters keep', 'Rise from a frozen bay toward the plaza, letting the scaffold grow until it divides the frame', 'siege walls, a paved plaza, the headquarters keep, and a scaffold platform for public execution', 'a crescent-shaped island whose inner bay becomes a battlefield once it freezes', 'winter glare on ice, cannon smoke, torn banners, and a horizon full of sails', '#dfe7ee|#3c5a86|#b0332c|#f0c454', 'ceremonial order collapsing into grief', ['a cracked scaffold plank', 'flag halyard snapping', 'a straw hat on a pale stone floor'], 'Smoke drifts across the crescent, ice creaks in the bay, and the scaffold’s shadow shortens as the day burns on', 'Freeze the moment the plaza goes silent and every face turns toward the scaffold', 'The crescent shape, the plaza, the scaffold, the headquarters, the frozen bay, and the war’s outcome are canon from Ch. 550–580; the quiet return in Ch. 590 is canon.', 'Wall heights, the keep’s facade, and the bay-to-plaza camera route are interpretive.'),
  }),
  place({
    id: 'rusukaina', name: 'Rusukaina', region: 'calm-belt', kind: 'island',
    arcIds: ['post-war'], chapters: 'Ch. 597', map: [58, 86],
    description: 'An uninhabited Calm Belt island of extreme seasons and giant beasts where Luffy trains for two years with Rayleigh.',
    landmarks: ['beast jungle', 'seasonal cliffs', 'training clearing'],
    art: visual('A wild, unbuilt island whose forest, snow, and desert bands seem to change with the hour', 'Land on a raw shore with no dock, then let a beast’s shadow cross the beach', 'no architecture at all — only a campfire ring and a leaning marker post', 'jungle, scrub, snow line, and rock cliffs stacked on one hostile island', 'weather that shifts too quickly, animal calls, and thick Calm Belt silence between them', '#2f5a3a|#a8c1b3|#c9963f|#5e4432', 'lonely, harsh, and quietly purposeful', ['a footprint larger than a boat', 'campfire embers', 'a whetstone left in the grass'], 'Seasons cycle in the background as one figure keeps training in the foreground clearing', 'Hold a single dawn with the training ground empty and warm', 'The uninhabited island, its violent seasons, its giant animals, and the two-year training are canon from Ch. 597.', 'The stacked climate bands in one view and the campsite layout are interpretive.'),
  }),

  // Beneath the Red Line
  place({
    id: 'fish-man-island', name: 'Fish-Man Island', region: 'paradise', kind: 'island',
    arcIds: ['fish-man-island'], chapters: 'Ch. 608–653', map: [71, 54],
    description: 'The bubble-shielded kingdom ten thousand meters below the surface, lit by a great tree and shadowed by a history of prejudice.',
    landmarks: ['great bubble dome', 'Coral Hill', 'Sea Forest'],
    art: visual('A luminous double bubble clings beneath the Red Line, with a vast tree’s roots threading the city inside', 'Descend through black water toward a glow, then burst into pastel coral streets', 'coral-grown houses, a hilltop town, a walled palace dome, and the ruined Fish-Man District at the edge', 'a seabed plateau beneath the continent, wrapped in air-holding bubbles and lit by the Sunlight Tree’s roots', 'soft underwater light, drifting bubbles, coral pinks, and the deep dark pressing at the membrane', '#f2a7c3|#63c7d9|#f6e4a3|#1f3a5c', 'festive on the surface, haunted underneath', ['a bubble coral chime', 'a poster of the mermaid princess', 'a chained ark anchor'], 'Bubbles rise along the dome while shoals pass outside and the tree roots pulse with borrowed daylight', 'Freeze the whole island as a lit lantern under a black sea', 'The depth, the bubble dome, Coral Hill, the Sea Forest, the Fish-Man District, and the kingdom’s history are canon from Ch. 608–653.', 'The city plan inside the dome and the visible root network are interpretive.'),
  }),
  place({
    id: 'ryugu-palace', name: 'Ryugu Palace', region: 'paradise', kind: 'settlement',
    arcIds: ['fish-man-island'], chapters: 'Ch. 612–653', map: [73, 56],
    description: 'The royal palace of the Neptune line, a water-filled dome where the crew is welcomed, accused, and finally trusted.',
    landmarks: ['Hard-Shell Tower', 'throne hall', 'flooded corridors'],
    art: visual('A pale shell-and-coral palace sits in its own bubble, one tower standing apart like a sealed jewel box', 'Swim in through a water corridor, then break the surface into an air-filled throne hall', 'coral-white halls, a sea-king-scale throne room, water passages, and a tower built to keep one princess safe', 'a raised palace platform inside the greater island bubble', 'shifting blue light, gilt trim, wet stone, and the hush of very large rooms', '#f4f1e6|#7fb8d6|#d9b45a|#4c6f8f', 'stately, wary, and finally warm', ['a throne-hall trident', 'a tower door taller than a house', 'a tear on a coral floor'], 'Light ripples down the walls while a slow tide moves through the flooded corridors', 'Hold the tower door half open with light spilling from inside', 'The palace, its water passages, the throne hall, and the Hard-Shell Tower are canon from Ch. 612–653.', 'The exterior massing and the palace-to-tower route are interpretive.'),
  }),

  // New World
  place({
    id: 'punk-hazard', name: 'Punk Hazard', region: 'new-world', kind: 'island',
    arcIds: ['punk-hazard'], chapters: 'Ch. 655–699', map: [78, 44],
    description: 'A split island of fire and ice, scarred by an admirals’ duel and hiding a poison laboratory that steals children.',
    landmarks: ['burning half', 'frozen half', 'research laboratory'],
    art: visual('One island cut in two — flame on the left, glacier on the right — with a broken lab dome bridging the seam', 'Arrive through a dragon’s smoke on the burning shore, then pan to a wall of ice across the lake', 'a sprawling government laboratory with cracked domes, gas conduits, and a sealed central hall', 'a lava field and an ice sheet divided by a central lake', 'heat haze against snow flurries, chemical yellow spilling from vents, and a sky that cannot pick a season', '#c8442a|#9ed3e8|#e4d64a|#2b2b33', 'unstable, toxic, and darkly comic', ['a cracked lab window', 'a frozen sample flask', 'a giant’s candy wrapper'], 'Steam meets snow at the seam while a gas cloud spreads slowly from the lab', 'Freeze the island as two colors meeting at a single line', 'The fire-and-ice split, its cause, the laboratory, the lake, and the gas weapon are canon from Ch. 655–699.', 'The exact proportions of each half and the lab silhouette are interpretive.'),
  }),
  place({
    id: 'dressrosa', name: 'Dressrosa', region: 'new-world', kind: 'island',
    arcIds: ['dressrosa'], chapters: 'Ch. 700–801', map: [84, 40],
    description: 'A kingdom of dance, toys, and a smiling tyrant, where forgotten people fight to be remembered.',
    landmarks: ['Corrida Colosseum', 'royal palace plateau', 'Flower Hill'],
    art: visual('A sun-baked hill town climbs toward a palace on a flat-topped plateau, with a round colosseum at its foot', 'Enter through a market street of dancers and toys, then tilt up to the palace above', 'warm-plaster townhouses, the colosseum ring, the plateau palace, and a rusted bridge stretching toward the horizon', 'a hilly island crowned by a high plateau, with sunflower fields on its slopes', 'strong noon light, flamenco reds, toy paint, and later a cage of strings closing over everything', '#e2553c|#f3c967|#7d3f8a|#f7ecd6', 'passionate on the surface, grief-stricken beneath', ['a toy soldier’s wooden hand', 'a colosseum gate chain', 'a sunflower against a blue sky'], 'Dancers and toys pass in the streets while the palace shadow climbs the hill through the afternoon', 'Hold the whole kingdom as the strings of the cage come down', 'The colosseum, the plateau palace, the toys, Flower Hill, and the birdcage are canon from Ch. 700–801.', 'Street layout and the colosseum-to-palace sightline are interpretive.'),
  }),
  place({
    id: 'green-bit', name: 'Green Bit', region: 'new-world', kind: 'island',
    arcIds: ['dressrosa'], chapters: 'Ch. 710–724', map: [86, 36],
    description: 'A wild forested islet linked to Dressrosa by a broken iron bridge, sheltering a hidden kingdom of dwarves beneath its roots.',
    landmarks: ['iron bridge', 'giant-rooted forest', 'Tontatta Kingdom'],
    art: visual('A green dome of enormous trees rises across a channel, tethered to the mainland by a rusting bridge', 'Cross the bridge as fish leap at the girders, then drop between roots into a hidden village', 'a rusted iron bridge and, beneath the forest floor, a dwarf kingdom of leaf roofs and tiny stairways', 'a small island of colossal trees whose root systems hollow into caverns', 'dappled canopy, iron rust, fern damp, and the tiny scale shift underground', '#3d7a3b|#8a5a2f|#c4d88a|#6f7f8c', 'quiet and strange, hiding an unexpected loyalty', ['a bridge rivet worn smooth', 'a dwarf’s acorn helmet', 'a fern taller than a man'], 'Fighting fish break the channel’s surface while leaves drift down through the root caverns', 'Freeze the bridge mid-span with the forest looming ahead', 'The iron bridge, the forest island, and the dwarves’ hidden kingdom are canon from Ch. 710–724.', 'Tree scale and the layout of the underground village are interpretive.'),
  }),
  place({
    id: 'zou', name: 'Zou', region: 'new-world', kind: 'island',
    arcIds: ['zou'], chapters: 'Ch. 802–824', map: [90, 46],
    description: 'A living island carried on the back of the ancient elephant Zunesha, home to the Mink tribe and a damaged city.',
    landmarks: ['Zunesha', 'Whale Forest', 'Kurau City'],
    art: visual('A mountain-sized elephant walks the sea with a forested plateau balanced on its back', 'Climb the elephant’s leg from a rocking deck, then crest the rim into forest and rain', 'a hilltop city of curved wooden roofs and stone ramparts, with a hollow tree at the forest’s heart', 'a plateau of jungle, cliffs, and a great forest on the elephant’s back', 'trunk-drawn rain, mist on the canopy, moss, and the sway of the whole ground', '#5c7c8a|#3e6b4f|#b8a888|#e8eef0', 'grand, wounded, and welcoming', ['a mink’s paw print', 'a fallen rampart stone', 'a red-stone tablet in a tree hollow'], 'Zunesha lifts one leg every few seconds while rain sheets down and the canopy sways', 'Hold the elephant against the horizon with the island a green ridge along its spine', 'The elephant, the Mink tribe, the Whale Forest, Kurau City, and the tablet in the tree are canon from Ch. 802–824.', 'The plateau’s outline and the leg-to-rim climbing route are interpretive.'),
  }),
  place({
    id: 'whole-cake-island', name: 'Whole Cake Island', region: 'new-world', kind: 'island',
    arcIds: ['whole-cake-island'], chapters: 'Ch. 825–902', map: [93, 30],
    description: 'Big Mom’s capital, a confectionery kingdom of living homies whose sweetness hides a hunger that devours families.',
    landmarks: ['Whole Cake Chateau', 'Sweet City', 'Seducing Woods'],
    art: visual('A castle shaped like a tiered cake rises from a mountain, with a candy-colored city and a talking forest below', 'Enter through a forest whose trees have faces, then reveal the chateau layered above the rooftops', 'the tiered chateau, pastel townhouses with faces, a rooftop tea-party venue, and a library of living portraits', 'a sugar-soft island with woods, a moat of sweet syrup, and a central peak the chateau sits upon', 'pastel light, frosting textures, honeyed haze, and homies blinking from every surface', '#f7c4d4|#a76bc4|#ffe2a8|#5b2f5e', 'sugar-coated dread', ['a homie’s face in a doorframe', 'a wedding-cake tier', 'a torn family photograph'], 'Homies blink and murmur across the city while the chateau slowly tips and rights itself', 'Freeze the chateau at the instant its top tier begins to lean', 'The chateau, Sweet City, the Seducing Woods, the homies, and the tea party are canon from Ch. 825–902.', 'The island’s outline and the chateau’s exact tier count are interpretive.'),
  }),
  place({
    id: 'cacao-island', name: 'Cacao Island', region: 'new-world', kind: 'island',
    arcIds: ['whole-cake-island'], chapters: 'Ch. 826; 877–902', map: [95, 33],
    description: 'The chocolate-built island of Chocolat Town, where the crew first meets Pudding and later stages its desperate escape from Totto Land.',
    landmarks: ['Chocolat Town', 'harbor plaza', 'exit mirror'],
    art: visual('A harbor town of chocolate walls and cocoa roofs, ringed by warships in the closing chapters', 'Sail into a sweet-smelling harbor, then return to find the same square fenced by cannons', 'chocolate-brick townhouses, a wide harbor plaza, and a standing mirror at its center', 'a small food-themed island with a curved bay', 'cocoa browns, cream trims, torch smoke over the bay, and a red one-o’clock sky', '#6e3f25|#f0dcc4|#c1272d|#2c2a3a', 'delightful at first, then a trap sprung at a fixed hour', ['a chocolate cobblestone', 'a mirror frame lit from inside', 'a clock hand at one'], 'Waves lap at the plaza while torches flicker along the encircling ships', 'Hold the plaza as the mirror flashes and every gun turns toward it', 'Chocolat Town, the first meeting with Pudding, and the timed escape through the harbor are canon from Ch. 826 and 877–902.', 'Building count and the plaza’s exact shape are interpretive.'),
  }),
  place({
    id: 'mirror-world', name: 'Mirro-World', region: 'other', kind: 'referenced',
    arcIds: ['whole-cake-island'], chapters: 'Ch. 831–899', map: [92, 26],
    description: 'Brûlée’s reflected space, a corridor-realm reached through any mirror in Totto Land and used by both hunters and the hunted.',
    landmarks: ['mirror corridor', 'reflected copies', 'gate mirrors'],
    art: visual('An endless hall of frameless mirrors reflecting each other into a fog with no floor', 'Step through glass, then turn to see the room you left hanging behind you as a picture', 'no architecture — only standing mirrors, floating panes, and reflected fragments of Totto Land', 'a dimension without ground, where distance is measured in mirrors', 'silver mist, refracted pastel light, and stillness broken by footfalls that echo wrong', '#c9d3dc|#f2e6f7|#7a8ea8|#3b2f4a', 'dreamlike, disorienting, and claustrophobic in its emptiness', ['a cracked mirror edge', 'a reflection facing the wrong way', 'a mochi-splashed pane'], 'Reflections lag a half-second behind their subjects while panes drift slowly in the fog', 'Hold one figure surrounded by a dozen delayed reflections', 'Brûlée’s power, the mirror network across Totto Land, and its use for travel, ambush, and a long duel are canon from Ch. 831–899.', 'The realm’s look as an open mirror corridor is interpretive; the manga shows it mostly as gaps between panes.'),
  }),

  // Red Line summit
  place({
    id: 'mary-geoise', name: 'Mary Geoise', region: 'red-line', kind: 'settlement',
    arcIds: ['levely'], chapters: 'Ch. 903–908', map: [66, 22],
    description: 'The Holy Land on the Red Line’s summit, where kings convene for the Levely and a hidden throne is not as empty as it looks.',
    landmarks: ['Pangaea Castle', 'Empty Throne', 'Room of Flowers'],
    art: visual('A white castle city floats on a plateau above the clouds, with a domed hall at its center', 'Ascend a lift up the Red Line’s face, then walk a long avenue toward the castle gates', 'a colossal domed castle, marble avenues, gated residences, and a vaulted chamber holding a throne with weapons laid before it', 'the flat summit of the Red Line, higher than weather', 'thin bright air, marble glare, gilt, and a cold interior light where the flowers are', '#f4f4f0|#c9a45c|#5b7fb0|#2a2634', 'pomp above, secrecy below', ['a Levely nameplate', 'a lift chain', 'a straw hat in a frozen chamber'], 'Clouds pass beneath the plateau while banners settle along the avenue', 'Freeze the throne hall with light falling on weapons and an empty seat', 'The Holy Land’s summit location, Pangaea Castle, the Levely, the Empty Throne, and the Room of Flowers are canon from Ch. 903–908.', 'The city plan, avenue length, and the castle’s full exterior are interpretive.'),
  }),

  // Wano Country
  place({
    id: 'wano-country', name: 'Wano Country', region: 'new-world', kind: 'island',
    arcIds: ['wano'], chapters: 'Ch. 909–1057', map: [96, 52],
    description: 'A closed samurai country walled by cliffs and waterfalls, ruled from Mt. Fuji’s shadow by a usurper and his emperor patron.',
    landmarks: ['Mt. Fuji', 'waterfall gates', 'six regions'],
    art: visual('A single snow-capped peak rises behind sheer coastal walls, with a river plain of rooftops at its feet', 'Ride a carp up a waterfall, tumble over the wall, and wake in a forest of tall grass', 'tiled samurai towns, a castle at the capital’s heart, torii gates, and the bones of ruined domains', 'a walled island with a central mountain, a lush capital region, and outlying lands turned to waste', 'cherry blossom drift, festival lanterns, factory smoke, and a snowline that never melts', '#c93a3a|#f0e7d8|#5a6d84|#2a2a2a', 'proud and mournful, waiting on a promise twenty years old', ['a wanted-poster nail', 'a sake cup at a grave', 'lantern paper tearing'], 'Blossom and smoke drift across the mountain while lanterns climb into a festival sky', 'Hold the mountain over the capital with the Fire Festival lights below', 'The closed country, the cliff walls, the waterfall entrance, the mountain, the regions, and the Fire Festival are canon from Ch. 909–1057.', 'Region borders and the peak’s scale relative to the capital are interpretive.'),
  }),
  place({
    id: 'flower-capital', name: 'Flower Capital', region: 'new-world', kind: 'settlement',
    arcIds: ['wano'], chapters: 'Ch. 909–1057', map: [97, 50],
    description: 'Wano’s glittering capital, where Orochi’s castle looks down on festival streets, a prison town, and a slum that laughs through hunger.',
    landmarks: ['Orochi Castle', 'Rasetsu Town', 'Ebisu Town'],
    art: visual('A bright grid of tiled roofs climbs toward a many-storied castle, with a walled prison district and a shanty town at the edges', 'Enter with a festival crowd, then cut to the quiet outskirts where everyone smiles', 'a towering keep, merchant houses, a bathhouse, a walled prison quarter, and paper-and-board slums', 'a river plain on the mountain’s flank', 'lantern gold, blossom pink, prison gray, and slum dust', '#f4b6c2|#d99b3b|#4d5b6b|#7a6a5c', 'brilliant and cruel by turns', ['a bathhouse token', 'a prison-town gate bolt', 'a smiling face at a grave'], 'Festival banners sway while castle guards patrol the parapets and the slums keep still', 'Freeze the castle above the city as fireworks bloom', 'The castle, the prison district, Ebisu Town, and the festival are canon from Ch. 909–1057.', 'Street grid and the relative distances of districts are interpretive.'),
  }),
  place({
    id: 'udon', name: 'Udon', region: 'new-world', kind: 'settlement',
    arcIds: ['wano'], chapters: 'Ch. 924–949', map: [95, 55],
    description: 'Wano’s weapons-factory region, whose prisoner mine turns captured samurai into labor until Luffy turns it into an army.',
    landmarks: ['prisoner mine', 'sumo ring', 'factory chimneys'],
    art: visual('A quarry gouged into brown hills, ringed by watchtowers and chimneys venting black smoke', 'Enter shackled through a gate, then look up at the ring of towers and the sky beyond', 'a walled labor camp of wooden barracks, a central sumo ring, guard towers, and smelting works', 'stripped hills, stone terraces, and a barren river valley', 'dust, forge glow, iron rust, and cold morning fog in the pit', '#8a6a4a|#4b4b52|#d86c2c|#e8dcc8', 'grim and then defiantly hopeful', ['a stone block on a rope', 'a bowl of dumplings', 'a sea-prism cuff'], 'Smoke climbs the chimneys while lines of prisoners haul stone across the yard', 'Hold the ring at the moment the chains come off', 'The prisoner mine, the labor for weapons, and the sumo fights are canon from Ch. 924–949.', 'Camp layout and the number of watchtowers are interpretive.'),
  }),
  place({
    id: 'ringo', name: 'Ringo', region: 'new-world', kind: 'settlement',
    arcIds: ['wano'], chapters: 'Ch. 936–953', map: [98, 48],
    description: 'Wano’s snowbound northern region of graves and stolen swords, where Zoro meets a bridge-guarding monk and a princess in hiding.',
    landmarks: ['Northern Graveyard', 'Oihagi Bridge', 'Ryuma’s grave'],
    art: visual('A snowfield of grave markers stretches toward a lone arched bridge under a gray sky', 'Follow a sword-thief’s footprints across the snow to the bridge', 'wooden grave markers, a stone-arched bridge, a small shrine, and a lord’s ruined residence', 'a frozen highland of cemeteries and thin pine', 'snow light, ink-black timber, breath fog, and blood on white', '#e9edf1|#8a9db3|#2f2f38|#b83a3a', 'silent, sorrowful, and sharp', ['a grave marker with an offering', 'a bridge rail worn by naginata', 'a scarlet sash in the snow'], 'Snow falls steadily while a single crow crosses the bridge’s arch', 'Freeze the graveyard with one sword standing upright in the snow', 'The snowbound region, the graves, the bridge and its guardian, and the swordsman’s grave are canon from Ch. 936–953.', 'The grave count and the bridge’s architecture are interpretive.'),
  }),
  place({
    id: 'onigashima', name: 'Onigashima', region: 'new-world', kind: 'island',
    arcIds: ['wano'], chapters: 'Ch. 977–1049', map: [94, 58],
    description: 'Kaido’s skull-shaped island fortress off Wano’s coast, site of the raid and the night the island itself is lifted into the sky.',
    landmarks: ['Skull Dome', 'Live Floor', 'twin horns'],
    art: visual('A giant horned skull looms over a harbor, its eye sockets lit from within like windows', 'Sail through a torii gate into a harbor of drunken guards, then look up at the skull’s jaw', 'a castle built inside a skull-shaped rock, with a great performance hall, roof platforms, and inner cellars', 'a small rocky island shaped like a skull, later borne aloft on flame clouds', 'festival torches, storm clouds, lightning, and the red of a rising rooftop battle', '#2b2b35|#c8462b|#f2c14e|#6e7fa8', 'monstrous revelry turning into all-or-nothing war', ['a horn silhouette against lightning', 'a spilled sake barrel', 'a roof tile cracking'], 'Torches flicker along the harbor while clouds gather and the skull begins to rise', 'Freeze the skull lifting free of the sea with its jaw lit', 'The skull shape, the horns, the dome, the performance hall, the raid, and the island being lifted are canon from Ch. 977–1049.', 'The interior stacking of floors and the harbor layout are interpretive.'),
  }),

  // Future and myth
  place({
    id: 'egghead', name: 'Egghead', region: 'new-world', kind: 'island',
    arcIds: ['egghead'], chapters: 'Ch. 1058–1125', map: [88, 62],
    description: 'Dr. Vegapunk’s island of the future, a factory ground beneath the clouds and an egg-shaped laboratory above them.',
    landmarks: ['Labophase egg', 'Fabriophase', 'Frontier Dome'],
    art: visual('A giant egg rests on a tower above the clouds, with a chrome factory island spread far below', 'Approach a shimmering hemisphere of frozen sea, then ride a vacuum tube up into the egg', 'egg-shaped laboratories, factory halls, transparent tubes, lab-grown food stands, and a dome that walls the island in light', 'a warm rocky island with cloud-piercing towers and an artificial frontier', 'chrome glare, holographic blues, snow-white coats, and, later, a sky full of warships', '#e8f4ff|#3fb7e0|#f7a531|#3a3f4d', 'playful science turning into a siege', ['a holographic control ring', 'a robot’s dented plating', 'a satellite’s apple'], 'Tubes carry figures up and down while the dome flickers and ships gather on the horizon', 'Hold the egg above the clouds with the factory island in shadow below', 'The two phases, the egg, the Frontier Dome, the vacuum tube, the satellites, and the siege are canon from Ch. 1058–1125.', 'Exact tower height and the layout of the factory island are interpretive.'),
  }),
  place({
    id: 'elbaf', name: 'Elbaf', region: 'new-world', kind: 'island',
    arcIds: ['elbaf'], chapters: 'Ch. 1126–1191', map: [82, 70],
    description: 'The legendary land of the giants, built in three tiers around Treasure Tree Adam: the Underworld at its roots, the Sun World on its branches, and the Heaven World above.',
    landmarks: ['giant-scale coast', 'colossal tree', 'giants’ village'],
    art: visual('A coastline where every rock, root, and roof is built to a giant’s measure, with one enormous tree on the skyline', 'Come ashore under a giant-scale headland and let the tree grow over the horizon', 'a village of giant-scale timber halls, seen only from a distance at arrival', 'a cool northern island of forest, cliff, and a tree that dwarfs them all', 'crisp sea air, fir and moss, low sun, and the vertigo of scale', '#3a5c48|#a9c0b0|#c98b4c|#f3efe4', 'awe and long-awaited arrival', ['a footprint as long as a boat', 'a single fir cone the size of a barrel', 'a distant chimney taller than a mast'], 'Sea mist rolls past the headland while the tree’s canopy sways almost imperceptibly', 'Hold the crew small against the giant shoreline with the tree behind', 'The land of the giants, the crew’s arrival, the three-tier structure around Treasure Tree Adam, and the rainbow-bridge ascent are canon from Ch. 1126–1191.', 'The tree’s placement against the coast and the village silhouette at arrival are interpretive.'),
  }),
  place({
    id: 'elbaf-walrus-town', name: 'Western Village and Walrus School', region: 'new-world', kind: 'settlement',
    arcIds: ['elbaf'], chapters: 'Ch. 1134–1182', map: [85, 72],
    description: 'The giants’ port village on the Sun World where the feast is held, and the school Harald opened so that children would study rather than train for war; both are ordered burned by the Knights of God.',
    landmarks: ['Walrus School', 'feast hall of the Western Village', 'sea-cloud harbour', 'Branch Route 8'],
    art: visual('Timber halls the height of towers stand along a harbour of cloud, with a low schoolhouse ringed by drawings pinned to its walls', 'Ride the painted rainbow bridge up out of the mist and land among barrels the size of houses', 'giant-scale longhouses with carved gables, a school built with human-sized desks beside giant ones, and a harbour rail over sea clouds', 'a broad living branch of the world tree, floored with soil and grass, ending in cloud', 'roast smoke, cold bright air, children’s chalk, and later the orange of a village burning', '#8c5a3a|#e9d9b8|#5a7a4e|#d9542c', 'a homecoming feast that turns into a hostage siege', ['a child’s drawing of a dragon', 'a drinking horn as tall as a man', 'a snail phone with a stranger’s voice', 'thorns that cannot be seen'], 'Feast fires flicker along the harbour while a line of small figures walks, asleep, toward the cloud edge', 'Freeze the village at the moment the school roof takes flame against a snow sky', 'The Western Village feast, Walrus School and its founding, the sleepwalking children, and the burning of the school are canon from Ch. 1134–1182.', 'The village plan, the school’s position relative to the harbour, and the branch-route geometry are interpretive.'),
  }),
  place({
    id: 'elbaf-aurust-castle', name: 'Aurust Castle', region: 'new-world', kind: 'settlement',
    arcIds: ['elbaf'], chapters: 'Ch. 1135–1191', map: [84, 66],
    description: 'King Harald’s abandoned castle, empty for fourteen years since the night he died, its throne room marked by a magic circle and its floors still strewn with the bones of his guards.',
    landmarks: ['throne room', 'looted treasure room', 'magic circle', 'guards’ bones'],
    art: visual('A black stone keep with a broken crown of towers, one wall torn open by a fight between giants', 'Climb the cracked stair past skeletons in dented helmets until the throne room doors stand open', 'a giant-scale keep of dark stone, a throne hall with a circle burned into its floor, and a vault with its treasure long gone', 'a high ledge on the world tree where roots have begun to swallow the foundations', 'dust, cold, moss on gold, and later the black lightning of an Abyss opening', '#2a2530|#6f6a78|#b8974b|#7a3ae0', 'a mausoleum that becomes a throne again for the wrong king', ['a horned skull', 'a key on a stone floor', 'a torn-out horn', 'a circle glowing violet'], 'Dust drifts through the broken roof while lightning flickers in the circle on the throne room floor', 'Hold the throne hall with the circle lit and a single figure seated where Harald once sat', 'The castle’s abandonment, the ruins of Harald’s last fight, the guards’ remains, the throne room circle, the treasure room, and Imu’s arrival there are canon from Ch. 1135–1191.', 'The keep’s silhouette, tower count, and its position on the tree are interpretive.'),
  }),
  place({
    id: 'elbaf-owl-library', name: 'The Owl Library', region: 'new-world', kind: 'settlement',
    arcIds: ['elbaf'], chapters: 'Ch. 1133–1182', map: [80, 74],
    description: 'Saul’s library at Warrior Springs, where the salvaged books of Ohara are enlarged for giant hands by the owl Biblo, and where every book vanishes on the night the Knights burn it.',
    landmarks: ['reading hall', 'Ohara’s salvaged books', 'Biblo’s perch', 'hidden book room'],
    art: visual('A round tower of shelves rising through the canopy, its windows shaped like an owl’s eyes and lit from within', 'Walk in under a door built for giants and look up a spiral of shelves that never seems to end', 'a spiral library of giant-scale shelves with a human-sized reading gallery, an owl’s perch at the top, and a sealed room behind the stacks', 'a hollow in the world tree near hot springs, steam curling past the windows', 'paper, lamp oil, warm steam, and the hush of a place built to keep memory', '#c98b4c|#f3e9d2|#4e6b8c|#2f2a24', 'reunion and scholarship, then loss and a secret kept', ['a book taller than Robin', 'an owl’s eye catching lamplight', 'a page from Ohara', 'an empty shelf'], 'Lamps sway along the spiral while pages turn on their own and an owl’s eyes blink from the dark above', 'Freeze the reading hall at the instant every shelf stands bare', 'Saul’s post as history teacher, the Ohara books, Biblo and the gigantifying fruit, the burning of the library, and the hidden room where the books survive are canon from Ch. 1133–1182.', 'The tower shape, spiral plan, and owl-eye windows are interpretive.'),
  }),
  place({
    id: 'elbaf-underworld', name: 'The Underworld', region: 'new-world', kind: 'island',
    arcIds: ['elbaf'], chapters: 'Ch. 1130–1191', map: [82, 76],
    description: 'The forest of beasts at the roots of Treasure Tree Adam, Elbaf’s lowest tier and its prison, where Loki hangs chained to the trunk and where Ida once kept a bar.',
    landmarks: ['Loki’s chains on Treasure Tree Adam', 'beast forest', 'Ida’s bar', 'the bridge above'],
    art: visual('Roots the size of hills coil through a dark forest, and one giant hangs in chains against the trunk under a bridge far overhead', 'Drop off the bridge into the green dark and follow a pressure in the air toward the trunk', 'no buildings but a shuttered bar under a root and the Seastone shackles bolted into living wood', 'a root-tangled forest floor in permanent shade, fog pooling between trunks, beasts moving in it', 'damp bark, animal musk, distant surf, and a single shaft of light where the canopy fails', '#1f3324|#4f7a53|#8a8f96|#e2b04a', 'menace and exile, then an unlikely truce', ['a Seastone cuff', 'a blindfold', 'a hammer with eyes', 'a tavern sign in the roots'], 'Fog breathes between the roots while the chained figure’s head turns slowly toward the newcomer', 'Hold the trunk with the chains still hanging, empty, after the prince has gone', 'The Underworld as Elbaf’s lowest tier and prison, Loki’s six years chained to Adam with Seastone, the beasts, Ida’s bar, and the regroup there after Gaban’s fall are canon from Ch. 1130–1191.', 'The bridge’s height above the forest floor and the bar’s exact position are interpretive.'),
  }),
  place({
    id: 'god-valley', name: 'God Valley', region: 'other', kind: 'flashback',
    arcIds: ['elbaf'], chapters: 'Ch. 1158–1166', map: [92, 82],
    description: '[Flashback] The island the World Nobles chose for a hunting competition thirty-eight years ago, where the Rocks and Roger Pirates, Garp and the Knights of God collided, and which sank with its records erased.',
    landmarks: ['hunting grounds', 'nobles’ viewing walls', 'treasure hoard', 'the sinking shore'],
    art: visual('A green island ringed by high walls where spectators watch, its interior a hunting ground littered with treasure and bodies', 'Come in with the pirate ships under a sky full of broadcast snails, then look up at the nobles on the walls', 'stone viewing terraces for the nobles, a central hoard of prizes, and a scatter of native dwellings', 'valleys and ridges bounded by sea, all of it later swallowed by the water', 'gunsmoke, gold glare, blood in grass, and a violet sky as something not human takes the field', '#4a6b3d|#d8b24a|#8c2a2a|#5b3f8a', 'atrocity staged as sport, ended by rivals fighting side by side', ['a hunting rifle on a terrace rail', 'a treasure chest left ajar', 'a Marine cadet’s cap', 'a mountain split in two'], 'Snail-cameras drift over the field while the walls empty and the sea creeps inward', 'Freeze the moment two rivals raise one blow together against a smiling god', 'The competition, the pirate landing, the Knights, Garp and Roger’s alliance, Imu’s possession of Saturn, Rocks’ death and the island’s sinking are canon from Ch. 1158–1166.', 'The island’s true position is never given; its placement on this chart, the wall layout, and the terrain are interpretive.'),
  }),
];
