import { ArrowRight, CircleDollarSign, MapPin, Swords } from 'lucide-react';
import type { Route } from '../types';
import { useReadingHorizon } from '../reading-horizon';
import { useReaderCatalog } from '../data/reader-catalog';
import { buildCharacterJourney, type JourneyEntryKind } from '../data/character-journeys';
import '../discovery.css';

interface CharacterJourneyProps {
  characterId: string;
  onOpen: (kind: NonNullable<Route['kind']>, id: string, beat?: string) => void;
}

const labels: Record<JourneyEntryKind, string> = { moment: 'Story moment', battle: 'Battle', bounty: 'Bounty' };

function EntryIcon({ kind }: { kind: JourneyEntryKind }) {
  return kind === 'battle' ? <Swords size={17} /> : kind === 'bounty' ? <CircleDollarSign size={17} /> : <MapPin size={17} />;
}

export function CharacterJourney({ characterId, onOpen }: CharacterJourneyProps) {
  const through = useReadingHorizon();
  const { characters } = useReaderCatalog();
  const character = characters.find((candidate) => candidate.id === characterId);
  const entries = character ? buildCharacterJourney(characterId, through) : [];

  return <section className="discovery-character-journey" aria-labelledby="character-journey-title">
    <header>
      <span className="micro">TRAIL LOG</span>
      <h3 id="character-journey-title">Course through the story</h3>
      <p>{entries.length ? `${entries.length} story moments, battles, and wanted-poster changes.` : 'No story moments are available at this reading point.'}</p>
    </header>
    {entries.length ? <ol className="discovery-timeline">
      {entries.map((entry) => <li key={entry.id} className={`discovery-timeline-entry is-${entry.kind}`}>
        <span className="discovery-route-mark" aria-hidden="true"><EntryIcon kind={entry.kind} /></span>
        <div>
          <span className="micro">{labels[entry.kind]} · {entry.arcName} · {entry.chapters}</span>
          <h4>{entry.title}</h4>
          <p>{entry.summary}</p>
          <button className="text-link" type="button" onClick={() => onOpen('arc', entry.arcId, entry.targetId)}>
            Open in story <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </li>)}
    </ol> : <div className="discovery-inline-empty"><MapPin size={28} aria-hidden="true" /><p>Advance your reading progress to reveal this trail.</p></div>}
  </section>;
}

export type { CharacterJourneyProps };
export default CharacterJourney;
