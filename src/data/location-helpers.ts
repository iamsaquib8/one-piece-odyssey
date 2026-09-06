import type { ArtBrief, Location, Source } from '../types';

const VIZ_ARCHIVE = 'https://www.viz.com/shonenjump/chapters/one-piece';
const OFFICIAL_STORY_ARCHIVE = 'https://one-piece.com/story/';

function officialSources(chapters: string): Source[] {
  return [
    { label: 'VIZ — official English chapter archive', url: VIZ_ARCHIVE, chapters },
    { label: 'ONE PIECE.com — official story archive', url: OFFICIAL_STORY_ARCHIVE, chapters },
  ];
}

export function visual(
  silhouette: string,
  arrival: string,
  architecture: string,
  terrain: string,
  environment: string,
  palette: string,
  atmosphere: string,
  closeups: string[],
  animation: string,
  staticAlternative: string,
  canon: string,
  interpretation: string,
): ArtBrief {
  return {
    silhouette,
    arrival,
    landmarks: [`Architecture — ${architecture}`, `Terrain — ${terrain}`],
    environment,
    palette: palette.split('|'),
    atmosphere,
    closeups,
    animation,
    staticAlternative,
    desktop: `16:9 establishing composition: preserve ${silhouette}; stage the route and supporting forms around ${architecture}.`,
    mobile: `9:16 portrait crop: anchor on ${architecture}; layer ${terrain} as foreground, middle distance, and sky.`,
    canon,
    interpretation,
  };
}

export type PlaceInput = Omit<Location, 'map' | 'sources'> & { map: [number, number] };

export function place(input: PlaceInput): Location {
  return {
    ...input,
    map: { x: input.map[0], y: input.map[1] },
    sources: officialSources(input.chapters),
  };
}
