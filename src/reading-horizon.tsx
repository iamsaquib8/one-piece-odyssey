import { createContext, useContext } from 'react';

const ReadingHorizon = createContext<number | null>(null);
export const ReadingHorizonProvider = ReadingHorizon.Provider;
export const useReadingHorizon = () => useContext(ReadingHorizon);

/** An arc opens only when its entire authored chapter span has been read. */
export function isArcVisible(arc: { chapters: [number, number] }, through: number | null) {
  return through === null || arc.chapters[1] <= through;
}
