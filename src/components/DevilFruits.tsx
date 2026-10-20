import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, Sparkles, X } from 'lucide-react';
import type { Route } from '../types';
import { useReaderCatalog } from '../data/reader-catalog';
import { FRUIT_TYPES, fruitTypeLabel, fruitsOf, type DevilFruit, type FruitType } from '../data/devil-fruits';
import FruitIcon from './FruitIcon';
import { focusReadingProgress } from './ReadingControls';
import '../fruits.css';

type Open = (kind: NonNullable<Route['kind']>, id: string, beat?: string) => void;

const normalize = (value: string) => value.toLocaleLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
const holders = (fruit: DevilFruit) => fruit.users.map((u) => u.name).join(', ');

export default function DevilFruitsView({ onOpen }: { onOpen: Open }) {
  const { devilFruits } = useReaderCatalog();
  const [type, setType] = useState<FruitType | 'all'>('all');
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const input = useRef<HTMLInputElement>(null);
  const types = FRUIT_TYPES.filter((t) => devilFruits.some((f) => f.type === t.id));
  const visible = useMemo(() => {
    const needle = normalize(deferred.trim());
    return devilFruits.filter((f) => (type === 'all' || f.type === type)
      && (!needle || normalize(`${f.name} ${f.romaji} ${f.meaning} ${holders(f)} ${f.trueIdentity?.name ?? ''}`).includes(needle)));
  }, [devilFruits, type, deferred]);

  return <section className="discovery-view fruits-view" aria-labelledby="fruits-title">
    <header className="discovery-hero fruits-hero">
      <div><span className="micro">DEVIL FRUIT ENCYCLOPEDIA · SWIRLED, CURSED, ONE BITE</span><h1 id="fruits-title">Powers of the sea,<br /><i>at the cost of it.</i></h1><p>Every Devil Fruit eaten by someone in these profiles, and every one the story names on Elbaf: what it does, who has held it, and when it woke. Each record waits for the chapter that reveals it.</p></div>
      <FruitIcon id="hero" type="paramecia" className="discovery-hero-mark fruits-hero-mark" />
    </header>
    {devilFruits.length ? <>
      <div className="discovery-tools">
        <label className="discovery-search"><span className="sr-only">Search Devil Fruits</span><Search size={19} aria-hidden="true" /><input ref={input} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Fruit, romaji, or who ate it…" />{query ? <button type="button" onClick={() => { setQuery(''); input.current?.focus(); }} aria-label="Clear fruit search"><X size={18} /></button> : null}</label>
        <p aria-live="polite"><strong>{visible.length}</strong> {visible.length === 1 ? 'fruit' : 'fruits'}</p>
      </div>
      <div className="mystery-filters fruit-filters" aria-label="Filter by type">
        <button type="button" aria-pressed={type === 'all'} onClick={() => setType('all')}>All<small>{devilFruits.length}</small></button>
        {types.map((t) => <button key={t.id} type="button" aria-pressed={type === t.id} onClick={() => setType(t.id)}>{t.label}<small>{devilFruits.filter((f) => f.type === t.id).length}</small></button>)}
      </div>
      {visible.length ? <ul className="fruit-grid">{visible.map((f) => <li key={f.id}>
        <button type="button" className={`fruit-card is-${f.type}`} onClick={() => onOpen('fruit', f.id)}>
          <FruitIcon id={f.id} type={f.trueIdentity?.type ?? f.type} />
          <span className="fruit-card-copy"><small>{fruitTypeLabel(f.trueIdentity?.type ?? f.type)}</small><strong>{f.trueIdentity?.name ?? f.name}</strong><em>{f.trueIdentity?.romaji ?? f.romaji}</em><span>{holders(f) || 'User not yet shown'}</span></span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </li>)}</ul> : <div className="discovery-empty"><Search size={38} /><h2>No fruit matches that.</h2><p>Try a shorter name, the romaji, or the person who ate it.</p><button className="button" type="button" onClick={() => { setQuery(''); setType('all'); input.current?.focus(); }}>Clear filters</button></div>}
    </> : <div className="discovery-empty"><Sparkles size={38} /><h2>No Devil Fruits at this reading point yet.</h2><p>Each fruit appears once you finish the arc that reveals it. Set your last completed arc to see the ones you have reached.</p><button className="button" type="button" onClick={focusReadingProgress}>Set reading progress</button></div>}
  </section>;
}

/** The fruit's record inside the detail dialog. */
export function FruitDetail({ fruit, onOpen, arcName }: { fruit: DevilFruit; onOpen: Open; arcName: string }) {
  const shown = fruit.trueIdentity;
  return <article className="reading-copy fruit-detail">
    <section id="detail-overview">
      <div className="fruit-detail-head"><FruitIcon id={fruit.id} type={shown?.type ?? fruit.type} className="fruit-detail-icon" />
        <div><span className="micro">{fruitTypeLabel(shown?.type ?? fruit.type)} · {fruit.romaji}{fruit.meaning ? ` · “${fruit.meaning}”` : ''}</span><h2>{shown?.name ?? fruit.name}</h2>{shown ? <p className="fruit-alias">Long known as the {fruit.name}; its true identity is revealed in chapter {shown.chapter}.</p> : null}</div></div>
      <p className="lead">{fruit.power}</p>
      <p>First revealed in chapter {fruit.revealChapter}, during {arcName}.</p>
      <button className="text-link" type="button" onClick={() => onOpen('arc', fruit.arcId)}>Open {arcName} <ArrowRight size={16} /></button>
    </section>
    <section id="detail-users"><h2>Who has held it</h2>
      <ol className="fruit-users">{fruit.users.map((u) => <li key={`${u.name}:${u.from}`}>
        {u.characterId ? <button className="place-link" type="button" onClick={() => onOpen('character', u.characterId!)}>{u.name}<ArrowRight size={14} /></button> : <strong>{u.name}</strong>}
        <span>Shown with it from chapter {u.from}{u.until ? `; lost it in chapter ${u.until}` : ''}.</span>
      </li>)}</ol>
      {fruit.awakened?.length ? <><h3>Awakening</h3><ul className="fruit-users">{fruit.awakened.map((a) => <li key={a.characterId}><span>{fruit.users.find((u) => u.characterId === a.characterId)?.name ?? a.characterId} awakens it in chapter {a.chapter}.</span></li>)}</ul></> : null}
    </section>
  </article>;
}

/** The "Devil Fruit" lines in a character dossier. */
export function CharacterFruits({ characterId, fruits, onOpen }: { characterId: string; fruits: DevilFruit[]; onOpen: Open }) {
  const eaten = fruitsOf(fruits, characterId);
  if (!eaten.length) return null;
  return <div className="location-links character-fruits"><span className="micro">DEVIL FRUIT</span>{eaten.map((f) => <button className="place-link" type="button" key={f.id} onClick={() => onOpen('fruit', f.id)}><FruitIcon id={f.id} type={f.trueIdentity?.type ?? f.type} />{f.trueIdentity?.name ?? f.name}<ArrowRight size={14} /></button>)}</div>;
}
