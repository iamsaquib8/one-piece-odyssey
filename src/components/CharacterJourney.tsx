import { ArrowRight, CircleDollarSign, MapPin, Swords } from 'lucide-react';
import { useMemo, useState } from 'react';
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

function CharacterJourneyContent({ characterId, onOpen }: CharacterJourneyProps) {
  const through = useReadingHorizon();
  const { characters } = useReaderCatalog();
  const character = characters.find((candidate) => candidate.id === characterId);
  const entries = useMemo(() => character ? buildCharacterJourney(characterId, through) : [], [character, characterId, through]);
  const [filter, setFilter] = useState<'all' | JourneyEntryKind>('all');
  const visible = filter === 'all' ? entries : entries.filter(entry => entry.kind === filter);

  return <section className="discovery-character-journey" aria-labelledby="character-journey-title">
    <header>
      <span className="micro">TRAIL LOG</span>
      <h3 id="character-journey-title">Course through the story</h3>
      <p>{entries.length ? `${entries.length} story moments, battles, and wanted-poster changes.` : 'No story moments are available at this reading point.'}</p>
    </header>
    {entries.length ? <>
      <div className="journey-filters" role="group" aria-label="Filter character journey">
        {([['all', 'All'], ['moment', 'Moments'], ['battle', 'Battles'], ['bounty', 'Bounties']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}<span>{value === 'all' ? entries.length : entries.filter(entry => entry.kind === value).length}</span></button>)}
      </div>
      <p className="journey-result-count" role="status">{visible.length} of {entries.length} entries shown</p>
      {visible.length ? <ol className="discovery-timeline">
      {visible.map((entry) => <li key={entry.id} className={`discovery-timeline-entry is-${entry.kind}`}>
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
      </ol> : <div className="discovery-inline-empty"><p>No {filter === 'bounty' ? 'bounty changes' : filter === 'battle' ? 'battles' : 'story moments'} recorded within your reading progress.</p><button className="button" type="button" onClick={() => setFilter('all')}>Show all entries</button></div>}
    </> : <div className="discovery-inline-empty"><MapPin size={28} aria-hidden="true" /><p>Advance your reading progress to reveal this trail.</p></div>}
  </section>;
}

export type { CharacterJourneyProps };
export function CharacterJourney(props: CharacterJourneyProps) {
  return <CharacterJourneyContent key={props.characterId} {...props} />;
}
export default CharacterJourney;
