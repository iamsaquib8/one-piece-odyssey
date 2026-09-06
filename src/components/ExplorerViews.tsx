import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowRight, Bookmark, BookOpen, Check, Compass, Mail, MapPin, Scale, Search, Users, X } from 'lucide-react';
import { arcSummaries as arcs, sagas, chapterLabel } from '../data/arc-index';
import { locations } from '../data/locations';
import { allCharacters as characters } from '../data/all-characters';
import { crews } from '../data/crews';
import CrewView from './CrewView';
import WorldAtlas from './WorldAtlas';
import { contactAddress, legalSections, legalUpdated } from '../data/legal';
import type { Location, ReaderState, Route, View } from '../types';
import { encodeRoute } from '../state';

type OpenFn = (kind: NonNullable<Route['kind']>, id: string, beat?: string) => void;
interface Props { view: View; route: Route; reader: ReaderState; onOpen: OpenFn; onNavigate: (view: View) => void; onJumpSaga: (id: string) => void; onSave: (id: string) => void }

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').toLowerCase();

export default function ExplorerViews(props: Props) {
  switch (props.view) {
    case 'world': return <WorldAtlas {...props} />;
    case 'search': return <SearchView {...props} />;
    case 'saved': return <SavedView {...props} />;
    case 'crew': return <CrewView {...props} />;
    case 'legal': return <LegalView {...props} />;
    default: return null;
  }
}

/* ----------------------------------------------------------------- Search */
type Hit = { kind: 'arc' | 'location' | 'character' | 'crew' | 'saga'; id: string; title: string; subtitle: string; text: string };
function highlight(text: string, q: string) {
  if (!q) return text;
  const i = normalize(text).indexOf(normalize(q));
  if (i < 0) return text;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}
function SearchView({ route, onOpen, onJumpSaga }: Props) {
  const [query, setQuery] = useState(route.q || '');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    const t = setTimeout(() => { const next = encodeRoute({ view: 'search', ...(query.trim() ? { q: query.trim() } : {}) }); if (window.location.search !== next) history.replaceState(history.state, '', next || window.location.pathname); }, 400);
    return () => clearTimeout(t);
  }, [query]);
  const index = useMemo<Hit[]>(() => [
    ...sagas.map((s) => ({ kind: 'saga' as const, id: s.id, title: s.name, subtitle: s.subtitle, text: `${s.name} ${s.subtitle} ${s.region}` })),
    ...arcs.map((a) => ({ kind: 'arc' as const, id: a.id, title: a.name, subtitle: `${chapterLabel(a)} · ${a.premise}`, text: `${a.name} ${a.premise} ${a.chapters.join(' ')} ${a.characterIds.map((id) => characters.find((c) => c.id === id)?.name || '').join(' ')} ${a.locationIds.map((id) => locations.find((l) => l.id === id)?.name || '').join(' ')}` })),
    ...locations.map((l) => ({ kind: 'location' as const, id: l.id, title: l.name, subtitle: `${l.kind} · ${l.chapters}`, text: `${l.name} ${l.description} ${l.landmarks.join(' ')} ${l.region}` })),
    ...crews.map(c=>({kind:'crew' as const,id:c.id,title:c.name,subtitle:c.description,text:`${c.name} ${c.description} ${c.memberIds.map(id=>characters.find(p=>p.id===id)?.name||'').join(' ')}`})),
    ...characters.map((c) => ({ kind: 'character' as const, id: c.id, title: c.name, subtitle: `${c.epithet} · ${c.role}`, text: `${c.name} ${c.epithet} ${c.role} ${c.dream}` })),
  ], []);
  const q = query.trim();
  const hits = useMemo(() => { const n = normalize(q); if (!n) return []; const words = n.split(/\s+/); return index.filter((h) => { const t = normalize(h.text); return words.every((w) => t.includes(w)); }).sort((a, b) => Number(normalize(b.title).includes(n)) - Number(normalize(a.title).includes(n))); }, [q, index]);
  const groups: Array<[Hit['kind'], string]> = [['arc', 'Arcs'], ['location', 'Places'], ['crew', 'Crews & factions'], ['character', 'Characters'], ['saga', 'Sagas']];
  function submit(e: FormEvent) { e.preventDefault(); const first = hits[0]; if (first) activate(first); }
  function activate(h: Hit) { if (h.kind === 'saga') onJumpSaga(h.id); else onOpen(h.kind, h.id); }
  return <section className="explorer search-view" aria-labelledby="search-title">
    <div className="explorer-heading"><div><span className="micro">FIND YOUR NEXT ADVENTURE</span><h1 id="search-title">Search the seas</h1><p>Arcs, islands, sagas and the crew. Results open in the logbook; the address bar keeps your search so you can share it.</p></div></div>
    <form className="search-form" role="search" onSubmit={submit}><Search size={20} /><input ref={input} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search manga arcs, islands, characters…" aria-label="Search the explorer" autoComplete="off" enterKeyHint="search" />{query ? <button type="button" className="clear" aria-label="Clear search" onClick={() => { setQuery(''); input.current?.focus(); }}><X size={18} /></button> : null}</form>
    {!q ? <div className="suggestions" aria-label="Suggested searches">{['Alabasta', 'Going Merry', 'Water Seven', 'Nico Robin', 'Skypiea', 'Wano', 'Sanji', 'Sabaody'].map((s) => <button key={s} className="chip" onClick={() => setQuery(s)}><Search size={14} />{s}</button>)}</div>
      : hits.length === 0 ? <div className="empty-state"><Compass size={44} /><h2>Nothing on the chart for “{q}”.</h2><p>Try a shorter word, an island name, or a crew member. Character names use the manga’s English spellings.</p><button className="button" onClick={() => setQuery('')}>Clear the search</button></div>
      : <div className="result-groups" aria-live="polite">{groups.map(([kind, label]) => { const items = hits.filter((h) => h.kind === kind); if (!items.length) return null; return <div className="result-group" key={kind}><h2>{kind === 'arc' ? <BookOpen size={14} /> : kind === 'location' ? <MapPin size={14} /> : kind === 'character' ? <Users size={14} /> : <Compass size={14} />}{label} · {items.length}</h2><ul>{items.map((h) => <li key={h.id}><button className="result-row" onClick={() => activate(h)}><span className="kind">{kind}</span><span><strong>{highlight(h.title, q)}</strong><small>{highlight(h.subtitle, q)}</small></span><ArrowRight size={18} /></button></li>)}</ul></div>; })}</div>}
  </section>;
}

/* ------------------------------------------------------------------ Saved */
function SavedView({ reader, onOpen, onNavigate }: Props) {
  const saved = reader.saved.map((key) => { const [kind, id] = key.split(':') as [Route['kind'], string]; const rec = kind === 'arc' ? arcs.find((a) => a.id === id) : kind === 'location' ? locations.find((l) => l.id === id) : kind === 'crew' ? crews.find(c=>c.id===id) : characters.find((c) => c.id === id); return rec && kind ? { kind, id, name: rec.name, sub: kind === 'arc' ? chapterLabel(rec as (typeof arcs)[number]) : kind === 'location' ? (rec as Location).chapters : kind==='crew' ? (rec as (typeof crews)[number]).description : (rec as (typeof characters)[number]).epithet } : null; }).filter((x): x is NonNullable<typeof x> => !!x);
  const explored = arcs.filter((a) => reader.explored.includes(a.id));
  const pct = Math.round((explored.length / arcs.length) * 100);
  const groups: Array<[Route['kind'], string]> = [['arc', 'Arcs'], ['location', 'Places'], ['crew','Crews & factions'], ['character', 'Characters']];
  return <section className="explorer saved-view" aria-labelledby="saved-title">
    <div className="explorer-heading"><div><span className="micro">YOUR LOGBOOK · SAVED ON THIS DEVICE</span><h1 id="saved-title">Your logbook</h1><p>Saved destinations and explored arcs. Nothing leaves this browser; clearing site data starts a fresh voyage.</p></div></div>
    <div className="progress-card"><Check size={36} /><div><strong>{explored.length} of {arcs.length} arcs explored · {pct}%</strong><small>Mark an arc explored from the end of its story. Colours follow the saga.</small><div className="progress-bar" aria-hidden="true">{sagas.map((s) => { const n = explored.filter((a) => a.sagaId === s.id).length; return n ? <span key={s.id} style={{ width: `${(n / arcs.length) * 100}%`, '--saga-color': s.color } as React.CSSProperties} /> : null; })}</div></div></div>
    {saved.length === 0 ? <div className="empty-state"><Bookmark size={44} /><h2>Your logbook is empty.</h2><p>Use the bookmark on any arc, island or crew member to keep it here for later.</p><button className="button primary" onClick={() => onNavigate('journey')}>Back to the voyage <ArrowRight size={18} /></button></div>
      : <div className="saved-groups">{groups.map(([kind, label]) => { const items = saved.filter((s) => s.kind === kind); if (!items.length) return null; return <div className="result-group" key={kind}><h2>{label} · {items.length}</h2><ul>{items.map((s) => <li key={s.id}><button className="result-row" onClick={() => onOpen(s.kind!, s.id)}><span className="kind">{s.kind}</span><span><strong>{s.name}</strong><small>{s.sub}</small></span><ArrowRight size={18} /></button></li>)}</ul></div>; })}</div>}
  </section>;
}

/* ------------------------------------------------------------------ Legal */
function LegalView({ onNavigate }: Props) {
  return <section className="explorer legal-view" aria-labelledby="legal-title">
    <div className="explorer-heading"><div><span className="micro">NOTICES · UPDATED {legalUpdated}</span><h1 id="legal-title">Disclaimer &amp; terms</h1><p>Plain-language notices for an independent, non-commercial fan project. Every claim here describes what the site actually does.</p></div></div>
    <nav className="legal-contents" aria-label="Notice contents"><ul>{legalSections.map((s) => <li key={s.id}><a href={`#legal-${s.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`legal-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><strong>{s.title}</strong><small>{s.summary}</small></a></li>)}</ul></nav>
    <div className="legal-body">
      {legalSections.map((s) => <article className="legal-section" id={`legal-${s.id}`} key={s.id}><h2><Scale size={22} aria-hidden="true" />{s.title}</h2>{s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</article>)}
      <article className="legal-section legal-contact" id="legal-contact"><h2><Mail size={22} aria-hidden="true" />Contact</h2><p>Rights holders, corrections, and takedown requests: <a href={`mailto:${contactAddress}`}>{contactAddress}</a>. Requests are handled promptly and in good faith.</p><p className="legal-fineprint"><Scale size={16} aria-hidden="true" /><span>These notices were written by the maintainer and reviewed by no lawyer. They are not legal advice.</span></p></article>
    </div>
    <button className="button" onClick={() => onNavigate('journey')}><Compass size={17} /> Back to the voyage</button>
  </section>;
}
