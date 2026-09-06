import type { Connection } from '../types';

// Voyage edges follow the crew’s route between the primary island of each consecutive arc.
// Labels mark the chapter of departure → arrival; they are reading references, not panel citations.
const voyages: Connection[] = [
  { from: 'foosha-village', to: 'shells-town', kind: 'voyage', label: 'Ch. 1 → 3' },
  { from: 'shells-town', to: 'orange-town', kind: 'voyage', label: 'Ch. 7 → 8' },
  { from: 'orange-town', to: 'syrup-village', kind: 'voyage', label: 'Ch. 21 → 23' },
  { from: 'syrup-village', to: 'baratie', kind: 'voyage', label: 'Ch. 41 → 43' },
  { from: 'baratie', to: 'cocoyasi-village', kind: 'voyage', label: 'Ch. 68 → 69' },
  { from: 'cocoyasi-village', to: 'loguetown', kind: 'voyage', label: 'Ch. 95 → 96' },
  { from: 'loguetown', to: 'reverse-mountain', kind: 'voyage', label: 'Ch. 100 → 101' },
  { from: 'reverse-mountain', to: 'whisky-peak', kind: 'voyage', label: 'Ch. 105 → 106' },
  { from: 'whisky-peak', to: 'little-garden', kind: 'voyage', label: 'Ch. 114 → 115' },
  { from: 'little-garden', to: 'drum-island', kind: 'voyage', label: 'Ch. 130 → 131' },
  { from: 'drum-island', to: 'alabasta', kind: 'voyage', label: 'Ch. 154 → 158' },
  { from: 'alabasta', to: 'jaya', kind: 'voyage', label: 'Ch. 218 → 222' },
  { from: 'jaya', to: 'angel-island', kind: 'voyage', label: 'Ch. 236 → 239' },
  { from: 'angel-island', to: 'long-ring-long-land', kind: 'voyage', label: 'Ch. 302 → 303' },
  { from: 'long-ring-long-land', to: 'water-seven', kind: 'voyage', label: 'Ch. 321 → 322' },
  { from: 'water-seven', to: 'enies-lobby', kind: 'voyage', label: 'Ch. 374 → 375' },
  { from: 'enies-lobby', to: 'water-seven', kind: 'voyage', label: 'Ch. 430 → 431' },
  { from: 'water-seven', to: 'florian-triangle', kind: 'voyage', label: 'Ch. 441 → 442' },
  { from: 'florian-triangle', to: 'thriller-bark', kind: 'voyage', label: 'Ch. 442 → 443' },
  { from: 'thriller-bark', to: 'sabaody-archipelago', kind: 'voyage', label: 'Ch. 489 → 490' },
  // Luffy alone, scattered by Kuma
  { from: 'sabaody-archipelago', to: 'amazon-lily', kind: 'voyage', label: 'Ch. 513 → 514' },
  { from: 'amazon-lily', to: 'impel-down', kind: 'voyage', label: 'Ch. 524 → 525' },
  { from: 'impel-down', to: 'marineford', kind: 'voyage', label: 'Ch. 549 → 550' },
  { from: 'marineford', to: 'amazon-lily', kind: 'voyage', label: 'Ch. 580 → 581' },
  { from: 'amazon-lily', to: 'sabaody-archipelago', kind: 'voyage', label: 'Ch. 597 → 598' },
  // The crew reunited
  { from: 'sabaody-archipelago', to: 'fish-man-island', kind: 'voyage', label: 'Ch. 602 → 608' },
  { from: 'fish-man-island', to: 'punk-hazard', kind: 'voyage', label: 'Ch. 653 → 655' },
  { from: 'punk-hazard', to: 'dressrosa', kind: 'voyage', label: 'Ch. 699 → 701' },
  { from: 'dressrosa', to: 'zou', kind: 'voyage', label: 'Ch. 801 → 802' },
  { from: 'zou', to: 'whole-cake-island', kind: 'voyage', label: 'Ch. 824 → 825' },
  { from: 'whole-cake-island', to: 'wano-country', kind: 'voyage', label: 'Ch. 902 → 909' },
  { from: 'wano-country', to: 'egghead', kind: 'voyage', label: 'Ch. 1057 → 1061' },
  { from: 'egghead', to: 'elbaf', kind: 'voyage', label: 'Ch. 1125 → 1126' },
];

// Geographic edges describe physical adjacency rather than the crew’s route.
const geographic: Connection[] = [
  { from: 'sabaody-archipelago', to: 'fish-man-island', kind: 'geographic', label: '10,000 m beneath the Red Line' },
  { from: 'mary-geoise', to: 'reverse-mountain', kind: 'geographic', label: 'The Red Line' },
  { from: 'marineford', to: 'sabaody-archipelago', kind: 'geographic', label: 'Across the bay' },
  { from: 'zou', to: 'wano-country', kind: 'geographic', label: 'Zunesha walks toward Wano' },
];

// Narrative edges link places by promise, memory, or consequence.
const narrative: Connection[] = [
  { from: 'twin-cape', to: 'thriller-bark', kind: 'narrative', label: 'Laboon waits for Brook' },
  { from: 'foosha-village', to: 'marineford', kind: 'narrative', label: 'Shanks ends the war' },
  { from: 'water-seven', to: 'thriller-bark', kind: 'narrative', label: 'Merry’s farewell echoes' },
  { from: 'egghead', to: 'elbaf', kind: 'narrative', label: 'Vegapunk’s message reaches the giants' },
  { from: 'alabasta', to: 'mary-geoise', kind: 'narrative', label: 'Vivi at the Levely' },
];

export const connections: Connection[] = [...voyages, ...geographic, ...narrative];
