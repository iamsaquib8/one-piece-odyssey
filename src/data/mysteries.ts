import { arcs } from './arcs';

export interface MysteryClue {
  arcId: string;
  beatId: string;
  label: string;
  note: string;
  chapters?: string;
  isResolution?: boolean;
}

export interface Mystery {
  id: string;
  question: string;
  deck: string;
  status: 'open' | 'resolved';
  clues: MysteryClue[];
}

type MysterySource = Omit<Mystery, 'status'>;

const sources: MysterySource[] = [
  {
    id: 'laboon-promise',
    question: 'Who is Laboon still waiting for?',
    deck: 'A promise made at Reverse Mountain survives fifty years of silence.',
    clues: [
      { arcId: 'reverse-mountain', beatId: 'inside-the-whale', label: 'A whale blocks the Grand Line', note: 'The crew enters Laboon and discovers a lighthouse keeper caring for an old wound.' },
      { arcId: 'reverse-mountain', beatId: 'fifty-years', label: 'A promise from a vanished crew', note: 'Laboon still believes the Rumbar Pirates will return from their voyage.' },
      { arcId: 'thriller-bark', beatId: 'the-last-song', label: 'The musician who survived', note: 'Brook carries his crew’s final song and the promise to return to Laboon.', isResolution: true },
    ],
  },
  {
    id: 'stone-language',
    question: 'Where do the Poneglyphs lead?',
    deck: 'Robin follows a language the World Government tried to erase.',
    clues: [
      { arcId: 'alabasta', beatId: 'the-royal-tomb', label: 'A stone beneath Alubarna', note: 'The royal tomb preserves writing Robin can read and Crocodile wants to exploit.' },
      { arcId: 'skypiea', beatId: 'the-city-of-gold', label: 'Another stone in Shandora', note: 'The lost city joins an ancient message to the history Robin is tracing.' },
      { arcId: 'skypiea', beatId: 'ring-the-bell', label: 'Roger left a message', note: 'An inscription beside the bell shows that Roger carried the ancient text onward.' },
      { arcId: 'zou', beatId: 'the-road-poneglyph', label: 'A red stone changes the route', note: 'Road Poneglyphs provide coordinates whose intersection marks the final island.' },
    ],
  },
  {
    id: 'merrys-voice',
    question: 'Whose voice does the Going Merry carry?',
    deck: 'The crew’s first ship keeps answering care with care of its own.',
    clues: [
      { arcId: 'skypiea', beatId: 'vearth-by-firelight', label: 'A ship repaired in the night', note: 'Someone unseen repairs the damaged Merry while the crew sleeps.' },
      { arcId: 'water-seven', beatId: 'the-merry-cannot-sail', label: 'The ship can go no farther', note: 'Water Seven’s shipwrights give the crew an answer none of them can accept.' },
      { arcId: 'enies-lobby', beatId: 'the-last-ship', label: 'One final rescue', note: 'The Merry reaches Enies Lobby for a last voyage and finally speaks to the crew.', isResolution: true },
    ],
  },
  {
    id: 'empty-throne',
    question: 'Is the Empty Throne truly empty?',
    deck: 'The symbol of shared rule hides a private act of obedience.',
    clues: [
      { arcId: 'levely', beatId: 'the-empty-throne', label: 'Someone sits above the world', note: 'Im takes the forbidden seat while the Five Elders kneel.', isResolution: true },
      { arcId: 'egghead', beatId: 'the-world-outside', label: 'A witness returns with the truth', note: 'Sabo reports what happened around the throne and Cobra’s final question.' },
    ],
  },
];

const arcById = new Map(arcs.map((arc) => [arc.id, arc]));

export function buildMysteries(through: number | null): Mystery[] {
  return sources.flatMap((source) => {
    const clues = source.clues.filter((clue) => {
      const arc = arcById.get(clue.arcId);
      return Boolean(arc && (through === null || arc.chapters[1] <= through));
    }).map((clue) => ({ ...clue, chapters: arcById.get(clue.arcId)?.beats.find((beat) => beat.id === clue.beatId)?.chapters }));
    if (!clues.length) return [];
    return [{ ...source, clues, status: clues.some((clue) => clue.isResolution) ? 'resolved' as const : 'open' as const }];
  });
}
