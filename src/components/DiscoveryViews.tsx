import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, CircleHelp, Compass, Search, Sparkles, X } from 'lucide-react';
import type { Route } from '../types';
import { useReadingHorizon } from '../reading-horizon';
import { useReaderCatalog } from '../data/reader-catalog';
import { buildCharacterJourney } from '../data/character-journeys';
import { buildMysteries, type Mystery } from '../data/mysteries';
import CharacterPortrait from './CharacterPortrait';
import { focusReadingProgress } from './ReadingControls';
import '../discovery.css';

interface DiscoveryViewsProps {
  view: 'trails' | 'mysteries';
  onOpen: (kind: NonNullable<Route['kind']>, id: string, beat?: string) => void;
}

const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

function TrailsView({ onOpen }: Pick<DiscoveryViewsProps, 'onOpen'>) {
  const through = useReadingHorizon();
  const { characters } = useReaderCatalog();
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);
  const records = useMemo(() => characters.map((character) => ({
    character,
    entries: buildCharacterJourney(character.id, through),
  })).filter(({ character, entries }) => {
    const needle = normalize(deferredQuery.trim());
    return !needle || normalize(`${character.name} ${character.role} ${entries.map((entry) => `${entry.arcName} ${entry.title}`).join(' ')}`).includes(needle);
  }), [characters, deferredQuery, through]);

  return <section className="discovery-view trails-view" aria-labelledby="trails-title">
    <header className="discovery-hero">
      <div><span className="micro">CHARACTER TRAILS · CHRONOLOGICAL LOGS</span><h1 id="trails-title">Follow a name<br /><i>across the sea.</i></h1><p>Trace each character through story moments, battles, and dated bounty changes.</p></div>
      <Compass className="discovery-hero-mark" size={112} strokeWidth={1.25} aria-hidden="true" />
    </header>
    <div className="discovery-tools">
      <label className="discovery-search"><span className="sr-only">Search character trails</span><Search size={19} aria-hidden="true" /><input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Character, arc, or moment…" />{query ? <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} aria-label="Clear trail search"><X size={18} /></button> : null}</label>
      <p aria-live="polite"><strong>{records.length}</strong> {records.length === 1 ? 'trail' : 'trails'} charted</p>
    </div>
    {records.length ? <div className="trail-directory">
      {records.map(({ character, entries }) => <article className="trail-card" key={character.id} style={{ '--trail-accent': character.color } as React.CSSProperties}>
        <button className="trail-card-person" type="button" onClick={() => onOpen('character', character.id)}>
          <CharacterPortrait characterId={character.id} name={character.name} color={character.color} />
          <span><small>{character.role || 'Character'}</small><strong>{character.name}</strong></span><ArrowRight size={20} aria-hidden="true" />
        </button>
        {entries.length ? <ol className="trail-card-route" aria-label="First story entries">{entries.slice(0, 2).map((entry) => <li key={entry.id}><button type="button" aria-label={`Open ${entry.title} in ${entry.arcName}`} onClick={() => onOpen('arc', entry.arcId, entry.targetId)}><span className="trail-preview-mark" aria-hidden="true" /><span><small>{entry.arcName} · Ch. {entry.chapters}</small><strong>{entry.title}</strong></span><ArrowRight size={16} aria-hidden="true" /></button></li>)}</ol> : null}
        <footer><span>{entries.length} story {entries.length === 1 ? 'entry' : 'entries'}</span>{entries.length ? <button className="text-link" type="button" onClick={() => onOpen('character', character.id)}>Read the full trail <ArrowRight size={15} /></button> : <small>No story entries recorded yet.</small>}</footer>
      </article>)}
    </div> : <DiscoveryEmpty icon={<Search size={38} />} title={characters.length ? 'No matching character journeys.' : 'Choose where you are in the story.'} body={characters.length ? 'Try a shorter name or search for an arc.' : 'Set your last completed arc to reveal its character journeys.'} action={query ? () => { setQuery(''); inputRef.current?.focus(); } : focusReadingProgress} actionLabel={query ? 'Clear search' : 'Set reading progress'} />}
  </section>;
}

function MysteryCard({ mystery, onOpen }: { mystery: Mystery; onOpen: DiscoveryViewsProps['onOpen'] }) {
  return <details className={`mystery-card is-${mystery.status}`}>
    <summary><span className="mystery-seal" aria-hidden="true">{mystery.status === 'resolved' ? <Check size={19} /> : '?'}</span><span><small>{mystery.status} · {mystery.clues.length} {mystery.clues.length === 1 ? 'clue' : 'clues'}</small><h2>{mystery.question}</h2><em>{mystery.deck}</em></span><span className="mystery-fold" aria-hidden="true">+</span></summary>
    <ol className="clue-list">
      {mystery.clues.map((clue, index) => <li key={`${clue.arcId}:${clue.beatId}`}>
        <span className="clue-number">{String(index + 1).padStart(2, '0')}</span>
        <div><span className="micro">{clue.isResolution ? 'RESOLUTION · ' : ''}{clue.arcId.replaceAll('-', ' ')} · Ch. {clue.chapters}</span><h3>{clue.label}</h3><p>{clue.note}</p><button className="text-link" type="button" onClick={() => onOpen('arc', clue.arcId, clue.beatId)}>Open story moment <ArrowRight size={15} /></button></div>
      </li>)}
    </ol>
  </details>;
}

function MysteriesView({ onOpen }: Pick<DiscoveryViewsProps, 'onOpen'>) {
  const through = useReadingHorizon();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const mysteries = buildMysteries(through);
  const visible = filter === 'all' ? mysteries : mysteries.filter((mystery) => mystery.status === filter);
  return <section className="discovery-view mysteries-view" aria-labelledby="mysteries-title">
    <header className="discovery-hero mystery-hero"><div><span className="micro">MYSTERY BOARD · STORY CLUES ONLY</span><h1 id="mysteries-title">Questions leave<br /><i>a wake.</i></h1><p>Open a thread, inspect each story moment, and watch the answer change as your reading progress reveals new clues.</p></div><CircleHelp className="discovery-hero-mark" size={112} strokeWidth={1.25} aria-hidden="true" /></header>
    <div className="mystery-filters" aria-label="Filter mysteries">{(['all', 'open', 'resolved'] as const).map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}<small>{value === 'all' ? mysteries.length : mysteries.filter((item) => item.status === value).length}</small></button>)}</div>
    {visible.length ? <div className="mystery-board">{visible.map((mystery) => <MysteryCard key={mystery.id} mystery={mystery} onOpen={onOpen} />)}</div> : <DiscoveryEmpty icon={<Sparkles size={38} />} title={mysteries.length ? `No ${filter} questions at this reading point.` : 'No mysteries at this reading point yet.'} body={mysteries.length ? 'Choose another status to inspect the available threads.' : 'Return as you finish more arcs. You can update your reading progress above.'} action={mysteries.length ? () => setFilter('all') : focusReadingProgress} actionLabel={mysteries.length ? 'Show all mysteries' : 'Set reading progress'} />}
  </section>;
}

function DiscoveryEmpty({ icon, title, body, action, actionLabel }: { icon: React.ReactNode; title: string; body: string; action?: () => void; actionLabel: string }) {
  return <div className="discovery-empty">{icon}<h2>{title}</h2><p>{body}</p>{action ? <button className="button" type="button" onClick={action}>{actionLabel}</button> : null}</div>;
}

export default function DiscoveryViews({ view, onOpen }: DiscoveryViewsProps) {
  return view === 'trails' ? <TrailsView onOpen={onOpen} /> : <MysteriesView onOpen={onOpen} />;
}

export type { DiscoveryViewsProps };
