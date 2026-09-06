import { useDeferredValue, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import { ArrowRight, Bookmark, Compass, Search, ShipWheel, Users, X } from 'lucide-react';
import type { ReaderState } from '../types';
import { arcSummaries as arcs } from '../data/arc-index';
import { crews, crewCoverageThrough, crewCategories, crewFirstAppearance, type CrewCategory } from '../data/crews';
import { allCharactersWithPortraits } from '../data/other-characters';
import { sagas } from '../data/sagas';
import CharacterPortrait from './CharacterPortrait';
import '../crews.css';

interface CrewViewProps {
  reader: ReaderState;
  onOpen: (kind: 'arc' | 'location' | 'character' | 'crew', id: string) => void;
  onSave: (id: string) => void;
}

type StoryFilter = `saga:${string}` | `arc:${string}` | 'all';
type Sort = 'relevance' | 'appearance';

const characterById = new Map(allCharactersWithPortraits.map((character) => [character.id, character]));
const arcById = new Map(arcs.map((arc) => [arc.id, arc]));
const sagaById = new Map(sagas.map((saga) => [saga.id, saga]));
const arcIdsBySaga = new Map(sagas.map((saga) => [saga.id, new Set(arcs.filter((arc) => arc.sagaId === saga.id).map((arc) => arc.id))]));

const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

function Highlight({ children, query }: { children: string; query: string }) {
  const needle = normalize(query.trim());
  if (!needle) return children;
  const source = normalize(children);
  const index = source.indexOf(needle);
  if (index < 0) return children;
  return <>{children.slice(0, index)}<mark>{children.slice(index, index + query.trim().length)}</mark>{children.slice(index + query.trim().length)}</>;
}

function storyMatches(crewArcIds: string[], filter: StoryFilter) {
  if (filter === 'all') return true;
  const [kind, id] = filter.split(':');
  if (kind === 'arc') return crewArcIds.includes(id);
  const sagaArcs = arcIdsBySaga.get(id);
  return sagaArcs ? crewArcIds.some((arcId) => sagaArcs.has(arcId)) : false;
}

function MemberPortrait({ id, query, onOpen }: { id: string; query: string; onOpen: CrewViewProps['onOpen'] }) {
  const character = characterById.get(id);
  if (!character) return null;
  return <button className="crew-member" onClick={() => onOpen('character', character.id)} aria-label={`Open ${character.name}’s profile`}>
    <CharacterPortrait characterId={character.id} name={character.name} color={character.color} />
    <span><Highlight query={query}>{character.name}</Highlight></span>
  </button>;
}

export default function CrewView({ reader, onOpen, onSave }: CrewViewProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | CrewCategory>('all');
  const [story, setStory] = useState<StoryFilter>('all');
  const [sort, setSort] = useState<Sort>('relevance');
  const searchRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);

  const visibleCrews = useMemo(() => {
    const needle = normalize(deferredQuery.trim());
    return crews.filter((crew) => {
      if (category !== 'all' && crew.category !== category) return false;
      if (!storyMatches(crew.arcIds, story)) return false;
      if (!needle) return true;
      const memberNames = crew.memberIds.map((id) => characterById.get(id)?.name ?? id).join(' ');
      const captain = characterById.get(crew.captain)?.name ?? crew.captain;
      const arcNames = crew.arcIds.map((id) => arcById.get(id)?.name ?? id).join(' ');
      return normalize(`${crew.name} ${captain} ${memberNames} ${crew.description} ${arcNames}`).includes(needle);
    }).slice().sort((a, b) => sort === 'relevance'
      ? b.relevance - a.relevance
      : (crewFirstAppearance[a.id] ?? Number.MAX_SAFE_INTEGER) - (crewFirstAppearance[b.id] ?? Number.MAX_SAFE_INTEGER));
  }, [category, deferredQuery, sort, story]);

  function handleStory(event: ChangeEvent<HTMLSelectElement>) {
    setStory(event.target.value as StoryFilter);
  }

  return <section className="explorer fleet-view" aria-labelledby="crew-title">
    <header className="fleet-hero">
      <div className="fleet-hero-copy">
        <span className="micro">FIELD GUIDE 04 · THE PEOPLE WHO MOVE THE ERA</span>
        <h1 id="crew-title">A fleet of<br /><i>crossed courses.</i></h1>
        <p>From one borrowed hat to the powers contesting the final sea: {crews.length} crews and factions, ordered by their weight in the story. Relevance describes narrative reach, not strength. Profiles cover through chapter {crewCoverageThrough}.</p>
      </div>
      <div className="fleet-compass" aria-hidden="true">
        <Compass />
        <span>{crewCoverageThrough}</span>
        <small>CHAPTER<br />HORIZON</small>
      </div>
      <dl className="fleet-stats">
        <div><dt>{crews.filter((crew) => crew.category !== 'factions').length}</dt><dd>Pirate crews</dd></div>
        <div><dt>{crews.filter((crew) => crew.category === 'factions').length}</dt><dd>World factions</dd></div>
        <div><dt>7</dt><dd>Grand Fleet ships</dd></div>
      </dl>
    </header>

    <div className="fleet-tools" aria-label="Crew filters">
      <div className="fleet-search">
        <Search size={19} aria-hidden="true" />
        <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Crew, captain, member…" aria-label="Search crews, captains, and members" />
        {query ? <button type="button" onClick={() => { setQuery(''); searchRef.current?.focus(); }} aria-label="Clear crew search"><X size={18} /></button> : null}
      </div>
      <label className="fleet-select"><span>Story point</span><select value={story} onChange={handleStory} aria-label="Filter by saga or arc relevance">
        <option value="all">Every saga and arc</option>
        {sagas.map((saga) => <optgroup key={saga.id} label={saga.name}>
          <option value={`saga:${saga.id}`}>All of {saga.name}</option>
          {arcs.filter((arc) => arc.sagaId === saga.id).map((arc) => <option key={arc.id} value={`arc:${arc.id}`}>{arc.name}</option>)}
        </optgroup>)}
      </select></label>
      <label className="fleet-select"><span>Order</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)} aria-label="Sort crews">
        <option value="relevance">Story relevance</option>
        <option value="appearance">First appearance</option>
      </select></label>
    </div>

    <div className="fleet-categories" aria-label="Filter by relationship">
      {crewCategories.map((item) => {
        const count = item.id === 'all' ? crews.length : crews.filter((crew) => crew.category === item.id).length;
        return <button key={item.id} className={category === item.id ? 'active' : ''} aria-pressed={category === item.id} onClick={() => setCategory(item.id)}><span>{item.label}</span><small>{count}</small></button>;
      })}
    </div>

    <div className="fleet-result-meta" aria-live="polite">
      <span><ShipWheel size={18} /> Showing <strong>{visibleCrews.length}</strong> of {crews.length}</span>
      {story !== 'all' ? <button onClick={() => setStory('all')}>Clear story filter <X size={15} /></button> : null}
    </div>

    {visibleCrews.length ? <div className="fleet-grid">
      {visibleCrews.map((crew, index) => {
        const captain = characterById.get(crew.captain);
        const members = crew.memberIds.filter((id) => id !== crew.captain).slice(0, 2);
        const savedKey = `crew:${crew.id}`;
        const saved = reader.saved.includes(savedKey);
        const relatedArcs = crew.arcIds.map((id) => arcById.get(id)).filter((arc): arc is NonNullable<typeof arc> => Boolean(arc));
        return <article className="fleet-card" key={crew.id} style={{ '--crew-accent': crew.color, animationDelay: `${Math.min(index * 35, 350)}ms` } as CSSProperties}>
          <div className="fleet-card-topline"><span>{crew.category}</span><span>R.{String(crew.relevance).padStart(3, '0')}</span></div>
          <button className="fleet-card-heading" onClick={() => onOpen('crew', crew.id)}>
            <CharacterPortrait characterId={crew.captain} name={captain?.name} color={captain?.color ?? crew.color} className="captain-portrait" />
            <span><small>{captain?.role ?? 'Captain'}</small><strong><Highlight query={query}>{crew.name}</Highlight></strong><em>{crew.category==='factions'?'Featured: ':'Led by '}<Highlight query={query}>{captain?.name ?? crew.captain}</Highlight></em></span>
            <ArrowRight size={20} />
          </button>
          <p>{crew.description}</p>
          {crew.ship ? <div className="fleet-ship"><ShipWheel size={16} /><span><small>Vessel</small>{crew.ship}</span></div> : null}
          {members.length ? <div className="fleet-members"><span className="micro">KEY MEMBERS</span><div>{members.map((id) => <MemberPortrait key={id} id={id} query={query} onOpen={onOpen} />)}</div></div> : null}
          <div className="fleet-arcs"><span className="micro">CROSSES THE STORY AT</span><div>{relatedArcs.slice(0, 4).map((arc) => <button key={arc.id} onClick={() => onOpen('arc', arc.id)} style={{ '--arc-color': sagaById.get(arc.sagaId)?.color } as CSSProperties}><span>{arc.name}</span></button>)}{relatedArcs.length > 4 ? <small>+{relatedArcs.length - 4} more</small> : null}</div></div>
          <footer><button className="fleet-profile-button" onClick={() => onOpen('crew', crew.id)}>Open crew record <ArrowRight size={16} /></button><button className={`fleet-save ${saved ? 'selected' : ''}`} aria-pressed={saved} aria-label={saved ? `Remove ${crew.name} from saved records` : `Save ${crew.name} to the logbook`} onClick={() => onSave(savedKey)}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'} /></button></footer>
        </article>;
      })}
    </div> : <div className="fleet-empty"><Users size={42} /><h2>No crew crosses those coordinates.</h2><p>Try another story point or a shorter name.</p><button className="button" onClick={() => { setQuery(''); setCategory('all'); setStory('all'); }}>Reset the atlas</button></div>}
  </section>;
}

export type { CrewViewProps };
