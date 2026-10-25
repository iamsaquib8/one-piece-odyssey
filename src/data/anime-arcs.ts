// Anime episodes against manga chapters, at story-arc level. Researched through the wiki API from
// each arc's episode and chapter categories (counts only, no wiki text). Within an arc the mapping
// is interpolated, so a converted chapter is approximate; filler arcs adapt no chapters at all.
export interface CanonAnimeArc { name: string; episodes: [number, number]; chapters: [number, number]; airing?: boolean }
export interface FillerAnimeArc { name: string; episodes: number[] }

/** The newest episode the research found; later episodes are past what this table can map. */
export const LATEST_MAPPED_EPISODE = 1180;

export const canonAnimeArcs: CanonAnimeArc[] = [
  { name: 'Romance Dawn', episodes: [1, 4], chapters: [1, 7] },
  { name: 'Orange Town', episodes: [4, 8], chapters: [8, 21] },
  { name: 'Syrup Village', episodes: [9, 18], chapters: [22, 41] },
  { name: 'Baratie', episodes: [19, 30], chapters: [42, 68] },
  { name: 'Arlong Park', episodes: [31, 44], chapters: [69, 95] },
  { name: 'Loguetown', episodes: [45, 53], chapters: [96, 100] },
  { name: 'Reverse Mountain', episodes: [62, 63], chapters: [101, 105] },
  { name: 'Whisky Peak', episodes: [64, 67], chapters: [106, 114] },
  { name: 'Little Garden', episodes: [70, 77], chapters: [115, 129] },
  { name: 'Drum Island', episodes: [78, 91], chapters: [130, 154] },
  { name: 'Alabasta', episodes: [92, 130], chapters: [155, 217] },
  { name: 'Jaya', episodes: [144, 152], chapters: [218, 236] },
  { name: 'Skypiea', episodes: [153, 195], chapters: [237, 302] },
  { name: 'Long Ring Long Land', episodes: [207, 219], chapters: [303, 321] },
  { name: 'Water Seven', episodes: [229, 263], chapters: [322, 374] },
  { name: 'Enies Lobby', episodes: [264, 312], chapters: [375, 430] },
  { name: 'Post-Enies Lobby', episodes: [313, 325], chapters: [431, 441] },
  { name: 'Thriller Bark', episodes: [337, 381], chapters: [442, 489] },
  { name: 'Sabaodyhipelago', episodes: [385, 405], chapters: [490, 513] },
  { name: 'Amazon Lily', episodes: [408, 421], chapters: [514, 524] },
  { name: 'Impel Down', episodes: [422, 452], chapters: [525, 549] },
  { name: 'Marineford', episodes: [457, 489], chapters: [550, 580] },
  { name: 'Post-War', episodes: [490, 516], chapters: [581, 597] },
  { name: 'Return to Sabaody', episodes: [517, 522], chapters: [598, 602] },
  { name: 'Fish-Man Island', episodes: [523, 574], chapters: [603, 653] },
  { name: 'Punk Hazard', episodes: [579, 625], chapters: [654, 699] },
  { name: 'Dressrosa', episodes: [629, 746], chapters: [700, 801] },
  { name: 'Zou', episodes: [751, 779], chapters: [802, 824] },
  { name: 'Whole Cake Island', episodes: [783, 877], chapters: [825, 902] },
  { name: 'Levely', episodes: [878, 889], chapters: [903, 908] },
  { name: 'Wano Country', episodes: [890, 1085], chapters: [909, 1057] },
  { name: 'Egghead', episodes: [1086, 1155], chapters: [1058, 1125] },
  // Still airing: the anime trails the manga, so chapters are estimated from the previous arc's pace.
  { name: 'Elbaf', episodes: [1156, 1180], chapters: [1126, 1196], airing: true },
];

export const fillerAnimeArcs: FillerAnimeArc[] = [
  { name: 'Warship Island', episodes: [54, 55, 56, 57, 58, 59, 60, 61] },
  { name: 'Post-Alabasta', episodes: [131, 132, 133, 134, 135] },
  { name: 'Goat Island', episodes: [136, 137, 138] },
  { name: 'Ruluka Island', episodes: [139, 140, 141, 142, 143] },
  { name: 'G-8', episodes: [196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206] },
  { name: 'Ocean’s Dream', episodes: [220, 221, 222, 223, 224] },
  { name: 'Foxy’s Return', episodes: [225, 226, 227, 228] },
  { name: 'Ice Hunter', episodes: [326, 327, 328, 329, 330, 331, 332, 333, 334, 335] },
  { name: 'Spa Island', episodes: [382, 383, 384] },
  { name: 'Little East Blue', episodes: [426, 427, 428, 429] },
  { name: 'Z’s Ambition', episodes: [575, 576, 577, 578] },
  { name: 'Silver Mine', episodes: [747, 748, 749, 750] },
  { name: 'Marine Rookie', episodes: [780, 781, 782] },
  { name: 'Cidre Guild', episodes: [895, 896] },
  { name: 'Uta’s Past', episodes: [1029, 1030] },
];
