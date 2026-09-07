import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Anchor, ArrowDown, ArrowRight, Bookmark, BookmarkCheck, BookOpen, Building2, Cake, Check, ChevronDown, Cloud, Compass, Cpu, Crown, Fish, Flame, Ghost, Globe2, Map, MapPin, Mountain, Pause, Play, Search, Ship, Sparkles, Sun, Swords, TreePine, Users, Wind } from 'lucide-react';
import { AnimatePresence, motion as m, useReducedMotion } from 'motion/react';
import { arcSummaries as arcs, locationSummaries as locations, sagas, chapterLabel, type ArcSummary } from './data/arc-index';
import { coverage } from './data/coverage';
import { legalSections, legalUpdated } from './data/legal';
import { decodeReader, decodeRoute, encodeRoute, readReader, saveReader, toggleItem } from './state';
import type { ReaderState, Route, View } from './types';
import { Scene } from './components/Scene';
import { VoyageRoute } from './components/VoyageRoute';
import { PixelBurst, useBurst } from './components/PixelBurst';
const DetailOverlay = lazy(() => import('./components/DetailOverlay'));
const ExplorerViews = lazy(() => import('./components/ExplorerViews'));

const navItems = [{ id: 'journey', label: 'Journey', Icon: Compass }, { id: 'world', label: 'World', Icon: Globe2 }, { id: 'crew', label: 'Crews', Icon: Users }, { id: 'saved', label: 'Saved', Icon: Bookmark }] as const;
const sagaIcons: Record<string, typeof Compass> = { 'east-blue': Compass, alabasta: Sun, 'sky-island': Cloud, 'water-seven': Building2, 'thriller-bark': Ghost, 'summit-war': Swords, 'fish-man-island': Fish, 'punk-hazard': Flame, dressrosa: Crown, 'whole-cake-island': Cake, wano: Mountain, egghead: Cpu, elbaf: TreePine };
const stopLabels = ['ARRIVAL', 'NEXT STOP', 'THEN', 'ONWARD', 'FURTHER', 'BEYOND', 'AND THEN', 'AT LAST', 'STILL FURTHER'];
/** Chapter ticks for the voyage strip, ending on the last hundred this edition covers. */
const TRACK = ((last: number) => {
  const ticks = [1, 100];
  for (let n = 300; n < last; n += 200) ticks.push(n);
  if (last > 100) ticks.push(last);
  return ticks;
})(Math.floor(coverage.coveredThrough / 100) * 100);
function initialReader() { try { return readReader(window.localStorage); } catch { return decodeReader(null); } }

/** Sets data-seen once and toggles data-inview while on screen (attributes React never rewrites), so entrances run once and ambient loops pause off-screen. */
function useReveal(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { const el = e.target as HTMLElement; if (e.isIntersecting) { el.dataset.inview = ''; el.dataset.seen = ''; } else delete el.dataset.inview; }), { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    const tracked = new WeakSet<Element>();
    const observe = () => document.querySelectorAll('[data-reveal]').forEach((el) => { if (tracked.has(el)) return; tracked.add(el); io.observe(el); });
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [active]);
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => decodeRoute(window.location.search));
  const [reader, setReader] = useState<ReaderState>(initialReader);
  const [toast, setToast] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [activeSaga, setActiveSaga] = useState(sagas[0]?.id || 'east-blue');
  const [documentVisible, setDocumentVisible] = useState(!document.hidden);
  const [hasResume] = useState(() => initialReader().resume.y > 100 || !!initialReader().resume.arcId);
  const [hoverArc, setHoverArc] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const motion = reader.motion && !reduced && documentVisible;
  const origin = useRef<HTMLElement | null>(null);
  const routeRef = useRef(route); routeRef.current = route;
  const readerRef = useRef(reader); readerRef.current = reader;
  const pageY = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const openingDepth = useRef(0);
  const burst = useBurst();
  const activeArc = arcs.find((a) => a.sagaId === activeSaga);
  const shipName = (activeArc?.chapters[0] || 0) >= 435 ? 'Thousand Sunny' : 'Going Merry';
  const activeSagaRecord = sagas.find((s) => s.id === activeSaga);
  const progressChapter = activeArc?.chapters[0] || 1;
  useReveal(route.view === 'journey');
  function announce(message: string) { setToast(message); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 2800); }
  useEffect(() => { try { setStorageAvailable(saveReader(window.localStorage, reader)); } catch { setStorageAvailable(false); } }, [reader]);
  useEffect(() => { document.documentElement.dataset.motion = motion ? 'on' : 'off'; }, [motion]);
  useEffect(() => { const visibility = () => setDocumentVisible(!document.hidden); document.addEventListener('visibilitychange', visibility); return () => document.removeEventListener('visibilitychange', visibility); }, []);
  useEffect(() => {
    history.scrollRestoration = 'manual';
    if (!history.state?.odyssey) history.replaceState({ odyssey: true, depth: 0, pageY: 0 }, '', window.location.href);
    const onPop = () => { const next = decodeRoute(window.location.search); openingDepth.current = history.state?.depth || 0; setRoute(next); if (!next.kind) requestAnimationFrame(() => window.scrollTo({ top: history.state?.pageY || 0, behavior: 'instant' })); };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined; let frame = 0;
    const persist = () => { timeout = undefined; if (routeRef.current.view !== 'journey' || routeRef.current.kind) return; const y = window.scrollY; history.replaceState({ ...history.state, pageY: y }, '', window.location.href); setReader((r) => ({ ...r, resume: { ...r.resume, y } })); };
    const parallax = () => { frame = 0; document.documentElement.style.setProperty('--scroll', String(Math.min(window.scrollY, 900))); if (window.scrollY > 520) document.documentElement.dataset.scrolled = ''; else delete document.documentElement.dataset.scrolled; };
    const scroll = () => { if (!timeout) timeout = setTimeout(persist, 800); if (!frame) frame = requestAnimationFrame(parallax); };
    window.addEventListener('scroll', scroll, { passive: true });
    const leave = () => { persist(); try { saveReader(window.localStorage, { ...readerRef.current, resume: { ...readerRef.current.resume, y: routeRef.current.view === 'journey' && !routeRef.current.kind ? window.scrollY : readerRef.current.resume.y } }); } catch { /* Session remains usable. */ } };
    window.addEventListener('pagehide', leave);
    return () => { window.removeEventListener('scroll', scroll); window.removeEventListener('pagehide', leave); clearTimeout(timeout); if (frame) cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    if (route.view !== 'journey') return;
    const observer = new IntersectionObserver((entries) => { for (const entry of entries) if (entry.isIntersecting) setActiveSaga(entry.target.id.replace('saga-', '')); }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('[data-saga]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [route.view]);
  useEffect(() => { document.body.classList.toggle('details-open', !!route.kind); return () => document.body.classList.remove('details-open'); }, [route.kind]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { const t = e.target as HTMLElement; if (e.key === '/' && !routeRef.current.kind && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) { e.preventDefault(); navigate('search'); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const open = useCallback((kind: NonNullable<Route['kind']>, id: string, beat?: string) => {
    const current = routeRef.current;
    if (!current.kind) { origin.current = document.activeElement as HTMLElement; pageY.current = window.scrollY; history.replaceState({ ...history.state, pageY: pageY.current }, '', window.location.href); }
    const next: Route = { view: current.view, kind, id, ...(beat ? { beat } : {}), ...(current.q ? { q: current.q } : {}) };
    openingDepth.current = (current.kind ? openingDepth.current : 0) + 1;
    history.pushState({ odyssey: true, depth: openingDepth.current, pageY: pageY.current }, '', encodeRoute(next) || '/');
    setRoute(next);
    if (kind === 'arc') setReader((r) => ({ ...r, resume: { ...r.resume, arcId: id, ...(beat ? { beat } : { beat: undefined }) } }));
  }, []);
  function close() {
    if (openingDepth.current > 0) { history.go(-openingDepth.current); return; }
    const next: Route = { view: route.view, ...(route.q ? { q: route.q } : {}) }; history.replaceState({ odyssey: true, depth: 0, pageY: pageY.current }, '', encodeRoute(next) || window.location.pathname); setRoute(next);
    requestAnimationFrame(() => window.scrollTo({ top: pageY.current, behavior: 'instant' }));
  }
  function navigate(view: View) {
    if (routeRef.current.view === view && !routeRef.current.kind) { if (view === 'journey') window.scrollTo({ top: 0, behavior: motion ? 'smooth' : 'instant' }); return; }
    history.replaceState({ ...history.state, pageY: window.scrollY }, '', window.location.href);
    const next: Route = { view }; history.pushState({ odyssey: true, depth: 0, pageY: 0 }, '', encodeRoute(next) || window.location.pathname); openingDepth.current = 0; setRoute(next); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function jumpSaga(id: string) {
    const go = () => document.getElementById(`saga-${id}`)?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' });
    if (routeRef.current.view !== 'journey') { navigate('journey'); setTimeout(go, 80); } else go();
    setActiveSaga(id);
  }
  /** Legal sections live in the lazily loaded explorer chunk, so retry until the anchor mounts. */
  function jumpLegal(id: string) {
    navigate('legal');
    const deadline = performance.now() + 2000;
    const go = () => {
      const el = document.getElementById(`legal-${id}`);
      if (el) el.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'start' });
      else if (performance.now() < deadline) requestAnimationFrame(go);
    };
    requestAnimationFrame(go);
  }
  function jumpArc(id: string) { document.getElementById(`arc-stop-${id}`)?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant', block: 'center' }); }
  function jumpChapter(chapter: number) { const arc = [...arcs].reverse().find((a) => a.chapters[0] <= chapter) || arcs[0]; jumpSaga(arc.sagaId); setTimeout(() => jumpArc(arc.id), 120); }
  function save(id: string, at?: HTMLElement) { const adding = !reader.saved.includes(id); setReader((r) => ({ ...r, saved: toggleItem(r.saved, id) })); if (adding && at) burst.fire(at, 'gold'); announce(adding ? 'Saved to your logbook' : 'Removed from your logbook'); }
  function explore(id: string, at?: HTMLElement) { const adding = !reader.explored.includes(id); setReader((r) => ({ ...r, explored: toggleItem(r.explored, id) })); if (adding && at) burst.fire(at, 'coral'); announce(adding ? 'Arc marked explored' : 'Arc marked unexplored'); }
  function setBeat(id: string, beat: string) { setReader((r) => ({ ...r, resume: { ...r.resume, arcId: id, beat } })); history.replaceState(history.state, '', encodeRoute({ ...route, beat })); setRoute((r) => ({ ...r, beat })); announce('Reading position saved'); }
  function resume() { if (reader.resume.arcId) open('arc', reader.resume.arcId, reader.resume.beat); else window.scrollTo({ top: reader.resume.y, behavior: motion ? 'smooth' : 'instant' }); }
  const trackPercent = useMemo(() => { const max = TRACK[TRACK.length - 1]; const c = Math.min(progressChapter, max); const i = TRACK.findIndex((n) => n >= c); if (i <= 0) return 0; const a = TRACK[i - 1]; const b = TRACK[i]; return ((i - 1) + (c - a) / (b - a)) / (TRACK.length - 1) * 100; }, [progressChapter]);
  const heroWords = ['A grand adventure.', 'One island at a time.'];
  return <>
    <a className="skip-link" href="#main">Skip to the voyage</a>
    <header className="site-header">
      <button className="brand" onClick={() => navigate('journey')} aria-label="One Piece Odyssey home"><img src="/favicon.svg" width="44" height="44" alt="" /><span>ONE PIECE<span className="brand-divider"> / </span><b>ODYSSEY</b></span></button>
      <nav className="desktop-nav" aria-label="Main navigation">{navItems.map(({ id, label, Icon }) => <button key={id} className={route.view === id ? 'active' : ''} aria-current={route.view === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={17} />{label}{id === 'saved' && reader.saved.length > 0 ? <small>{reader.saved.length}</small> : null}{route.view === id ? <m.i layoutId="nav-ink" className="nav-ink" transition={{ type: 'spring', stiffness: 400, damping: 32 }} /> : null}</button>)}</nav>
      <button className="search-trigger" onClick={() => navigate('search')} aria-label="Search the explorer"><span>Search manga arcs, islands, characters…</span><kbd>/</kbd><Search size={18} /></button>
      <button className="icon-button motion-toggle" onClick={() => setReader((r) => ({ ...r, motion: !r.motion }))} aria-label={reader.motion ? 'Turn animations off' : 'Turn animations on'} aria-pressed={reader.motion} title={reader.motion ? 'Animations on' : 'Animations off'}>{reader.motion ? <Pause size={16} /> : <Play size={16} />}</button>
    </header>
    <aside className="saga-rail"><span className="micro rail-title">SAGA</span><nav aria-label="Saga navigation">{sagas.map((s) => { const Icon = sagaIcons[s.id] || Compass; const active = activeSaga === s.id && route.view === 'journey'; return <button key={s.id} className={active ? 'active' : ''} onClick={() => jumpSaga(s.id)} title={s.name} aria-current={active ? 'location' : undefined}>{active ? <m.i layoutId="rail-ink" className="rail-ink" transition={{ type: 'spring', stiffness: 380, damping: 34 }} /> : null}<Icon size={22} className="rail-icon" /><span>{s.name.replace(' Saga', '')}</span></button>; })}</nav><div className="rail-footer"><span className="rail-dash" aria-hidden="true" /><Anchor size={27} /><span>GRAND LINE<br />AWAITS…</span></div></aside>
    <main id="main" className={`main-shell view-${route.view}`}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div key={route.view} initial={motion ? { opacity: 0, y: 18 } : false} animate={{ opacity: 1, y: 0 }} exit={motion ? { opacity: 0, y: -10, transition: { duration: 0.16 } } : undefined} transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}>
          {route.view === 'journey' ? <>
            <section className="hero">
              <img className="hero-art" src="/art/hero.webp" alt="The Going Merry sails past a tropical coast under a bright blue sky" width="1536" height="1024" fetchPriority="high" />
              <div className="hero-copy">
                <h1>{heroWords.map((line, i) => <span className="hero-line-wrap" key={line}><m.span className="hero-line" initial={motion ? { y: '110%', rotate: 2 } : false} animate={{ y: 0, rotate: 0 }} transition={{ duration: 0.7, delay: 0.1 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}>{line}</m.span></span>)}</h1>
                <m.p initial={motion ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>Explore the world of One Piece chapter by chapter.<br className="desktop-break" /> Relive the manga. Track your journey. Create your legend.</m.p>
                <m.div className="hero-actions" initial={motion ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.62 }}>
                  <button className="button primary" onClick={() => jumpSaga(sagas[0].id)}>Begin the voyage <ArrowRight size={19} /></button>
                  {hasResume ? <button className="resume-link" onClick={resume}>Resume your journey <BookOpen size={16} /></button> : null}
                </m.div>
                <m.div className="spoiler-note" initial={motion ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.8 }}><span className="spoiler-badge">!</span><span><b>Spoiler notice:</b> you’re entering uncharted waters. Full manga spoilers ahead, nakama.</span></m.div>
              </div>
              <div className="hero-waves" aria-hidden="true" />
              <div className="hero-bottom"><span>AN UNOFFICIAL ONE PIECE EXPLORER</span><button onClick={() => jumpSaga(sagas[0].id)}>SCROLL TO SET SAIL <ArrowDown size={15} /></button></div>
            </section>
            <section className="voyage-strip" aria-label="Your voyage progress">
              <div className="voyage-range"><span className="round-icon"><BookOpen size={26} /></span><div><span className="micro">YOUR VOYAGE</span><strong>Ch. 1 – {coverage.coveredThrough}</strong><small>{activeSagaRecord?.name || 'East Blue'} saga</small></div></div>
              <div className="chapter-track" role="group" aria-label="Jump to a chapter"><span className="track-ship" style={{ left: `${trackPercent}%` }} aria-hidden="true"><Ship size={16} /></span>{TRACK.map((n, i) => <button key={n} className={progressChapter >= n ? 'reached' : ''} onClick={() => jumpChapter(n)} aria-label={`Jump to chapter ${n}`}><i />{i === TRACK.length - 1 ? `${n}+` : n}</button>)}</div>
              <button className="logbook-button" onClick={() => navigate('saved')}><span className="round-icon"><Bookmark size={22} /></span><span><strong>Your logbook</strong><small>{reader.explored.length} / {arcs.length} arcs explored · {reader.saved.length} saved</small></span><ArrowRight size={18} className="logbook-arrow" /></button>
            </section>
            <div className="mobile-saga-select"><label htmlFor="saga-select">CHOOSE A SAGA</label><div><select id="saga-select" value={activeSaga} onChange={(e) => jumpSaga(e.target.value)}>{sagas.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><ChevronDown size={17} /></div></div>
            {sagas.map((s, sagaIndex) => <SagaSection key={s.id} saga={s} index={sagaIndex} reader={reader} hoverArc={hoverArc} setHoverArc={setHoverArc} onOpen={open} onSave={save} onJumpArc={jumpArc} onNavigate={navigate} />)}
            <section className="horizon" data-reveal><Compass size={48} className="horizon-compass" /><h2>The adventure isn’t over.</h2><p>There are still dreams to chase and seas to cross.<br />Keep your Log Pose pointed toward the next story.</p><button className="button primary" onClick={() => navigate('world')}>Explore the whole world <ArrowRight size={18} /></button><span className="micro">LAUGH TALE · LOCATION UNREVEALED</span></section>
          </> : <Suspense fallback={<div className="loading-state"><Compass className="loading-icon" /><p>Unfolding the chart…</p></div>}><ExplorerViews motion={motion} view={route.view} route={route} reader={reader} onOpen={open} onNavigate={navigate} onJumpSaga={jumpSaga} onSave={(id) => save(id)} /></Suspense>}
        </m.div>
      </AnimatePresence>
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-col footer-identity">
            <div className="footer-brand"><Anchor size={22} /><strong>Every dream begins with a voyage.</strong></div>
            <p>An illustrated field guide to the manga, in reading order. Original summaries and original artwork — no scans, and no spoiler gating anywhere.</p>
          </div>
          <nav className="footer-col" aria-label="Explore this site">
            <h2 className="micro">EXPLORE</h2>
            <ul>{[...navItems, { id: 'search' as const, label: 'Search', Icon: Search }].map(({ id, label }) => <li key={id}><button className="footer-link" onClick={() => navigate(id)}>{label}</button></li>)}</ul>
          </nav>
          <div className="footer-col">
            <h2 className="micro">THIS EDITION</h2>
            <ul>
              <li>Story through Ch. {coverage.coveredThrough}</li>
              <li>Official release: Ch. {coverage.latestOfficialChapter}</li>
              <li><a className="footer-link" href={coverage.source} target="_blank" rel="noreferrer noopener">Verified {coverage.verifiedDate} at VIZ</a></li>
              <li>Full manga spoilers · Map is schematic</li>
            </ul>
          </div>
          <nav className="footer-col" aria-label="Notices">
            <h2 className="micro">LEGAL</h2>
            <ul>{legalSections.map((sec) => <li key={sec.id}><button className="footer-link" onClick={() => jumpLegal(sec.id)}>{sec.title}</button></li>)}</ul>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>ONE PIECE © Eiichiro Oda / Shueisha. An independent, non-commercial fan project with no affiliation to Shueisha, VIZ Media, Toei Animation, or Eiichiro Oda. Please support the official release.</p>
          <p className="footer-meta">Notices updated {legalUpdated} · <button className="footer-link" onClick={() => navigate('legal')}>Disclaimer &amp; terms</button></p>
        </div>
      </footer>
    </main>
    {route.view === 'journey' && !route.kind ? <aside className="floating-tools" aria-label="Voyage tools">
      <div className="voyage-position"><Ship size={19} /><span>{shipName}<small>{activeSagaRecord?.name || activeSaga}</small></span></div>
      <button className="world-pill" onClick={() => navigate('world')}>Explore the full world <span className="pill-icon"><Globe2 size={16} /></span></button>
    </aside> : null}
    <nav className="bottom-nav" aria-label="Mobile navigation">{[{ id: 'journey' as const, label: 'Journey', Icon: Compass }, { id: 'search' as const, label: 'Search', Icon: Search }, { id: 'world' as const, label: 'World', Icon: Map }, { id: 'saved' as const, label: 'Saved', Icon: Bookmark }].map(({ id, label, Icon }) => <button key={id} className={route.view === id ? 'active' : ''} aria-current={route.view === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={20} /><span>{label}</span></button>)}</nav>
    <div className={`toast ${toast ? 'visible' : ''}`} role="status">{toast ? <Check size={16} /> : null}{toast}</div>
    <PixelBurst burst={burst} />
    {!storageAvailable ? <div className="storage-note" role="status">Saves are available for this session. Device storage is unavailable.</div> : null}
    {route.kind ? <Suspense fallback={<div className="overlay-loading" role="status"><Compass className="loading-icon" /> Opening the logbook… <button className="button" onClick={close}>Cancel</button></div>}><DetailOverlay route={route} reader={reader} motion={motion} onClose={close} onOpen={open} onSave={save} onExplore={explore} onBeat={setBeat} origin={origin} /></Suspense> : null}
  </>;
}

interface SagaProps { saga: (typeof sagas)[number]; index: number; reader: ReaderState; hoverArc: string | null; setHoverArc: (id: string | null) => void; onOpen: (kind: NonNullable<Route['kind']>, id: string) => void; onSave: (id: string, at?: HTMLElement) => void; onJumpArc: (id: string) => void; onNavigate: (view: View) => void }
function SagaSection({ saga: s, index: sagaIndex, reader, hoverArc, setHoverArc, onOpen, onSave, onJumpArc, onNavigate }: SagaProps) {
  const sagaArcs = useMemo(() => arcs.filter((a) => a.sagaId === s.id), [s.id]);
  const voyage = useRef<HTMLDivElement>(null);
  const Icon = sagaIcons[s.id] || Compass;
  const hoverIndex = sagaArcs.findIndex((a) => a.id === hoverArc);
  const firstUnexplored = sagaArcs.findIndex((a) => !reader.explored.includes(a.id));
  const shipAt = hoverIndex >= 0 ? hoverIndex - 1 : firstUnexplored > 0 ? firstUnexplored - 1 : 0;
  const banner = s.id === 'alabasta' ? <div className="boundary-banner" data-reveal><Wind /><div><strong>Beyond the Red Line</strong><span>Reverse Mountain opens the way to Paradise. The Grand Line begins.</span></div><Compass /></div>
    : s.id === 'sky-island' ? <div className="boundary-banner sky" data-reveal><Wind /><div><strong>A voyage into the sky</strong><span>The Knock Up Stream carries the journey above the Blue Sea.</span></div><Sparkles /></div>
    : s.id === 'fish-man-island' ? <div className="boundary-banner underwater" data-reveal><span className="bubbles" aria-hidden="true"><i /><i /><i /><i /></span><MapPin /><div><strong>10,000 meters beneath the sea</strong><span>A coated ship, an underwater passage, and a route to the New World.</span></div><Wind /></div>
    : s.id === 'egghead' ? <div className="boundary-banner" data-reveal><Compass /><div><strong>The Final Saga begins</strong><span>Egghead opens the last chapter of the voyage. What follows is still being written.</span></div><Sparkles /></div>
    : s.id === 'elbaf' ? <div className="boundary-banner" data-reveal><Compass /><div><strong>Beyond the known horizon</strong><span>Elbaf is ongoing. This edition follows it through chapter {coverage.coveredThrough}; what comes after is still being drawn.</span></div><Globe2 /></div> : null;
  return <section id={`saga-${s.id}`} data-saga className={`saga-section saga-${s.id}`} style={{ '--saga-color': s.color } as CSSProperties}>
    {banner}
    <div className="saga-grid">
      <div className="saga-side" data-reveal>
        <span className="micro">SAGA {String(sagaIndex + 1).padStart(2, '0')} · {s.region.replaceAll('-', ' ').toUpperCase()}</span>
        <h2>{s.name.replace(' Saga', '')}</h2>
        <p className="saga-subtitle">{s.subtitle}</p>
        <span className="saga-rule" aria-hidden="true"><i /><Icon size={14} /><i /></span>
        <ol className="arc-index">{sagaArcs.map((a) => { const explored = reader.explored.includes(a.id); return <li key={a.id}><button className={hoverArc === a.id ? 'hover' : ''} onClick={() => onJumpArc(a.id)} onMouseEnter={() => setHoverArc(a.id)} onFocus={() => setHoverArc(a.id)} onMouseLeave={() => setHoverArc(null)}><span className="arc-index-icon">{explored ? <Check size={14} /> : <Anchor size={14} />}</span><span><small>ARC {String(arcs.indexOf(a) + 1).padStart(2, '0')}</small><strong>{a.name}</strong><em>{chapterLabel(a)}</em></span></button></li>; })}</ol>
        <span className="saga-chapters">CH. {sagaArcs[0]?.chapters[0]}—{sagaArcs.at(-1)?.status === 'ongoing' ? '' : sagaArcs.at(-1)?.chapters[1]}<small>{sagaArcs.length} {sagaArcs.length === 1 ? 'arc' : 'arcs'} to discover</small></span>
      </div>
      <div className="arc-voyage" ref={voyage}>
        <VoyageRoute container={voyage} shipAt={shipAt} deps={[sagaArcs.length]} />
        {sagaArcs.map((a, i) => <ArcStop key={a.id} arc={a} index={i} reader={reader} hovered={hoverArc === a.id} setHoverArc={setHoverArc} onOpen={onOpen} onSave={onSave} />)}
      </div>
    </div>
    <div className="saga-footer" data-reveal><span className="micro">✦ THE JOURNEY CONTINUES ✦</span>{sagaIndex === 0 ? <button className="text-link light" onClick={() => onNavigate('world')}>See the world overview <Globe2 size={16} /></button> : null}</div>
  </section>;
}

interface StopProps { arc: ArcSummary; index: number; reader: ReaderState; hovered: boolean; setHoverArc: (id: string | null) => void; onOpen: (kind: NonNullable<Route['kind']>, id: string) => void; onSave: (id: string, at?: HTMLElement) => void }
function ArcStop({ arc: a, index: i, reader, hovered, setHoverArc, onOpen, onSave }: StopProps) {
  const l = locations.find((x) => x.id === a.locationIds[0]);
  const isSaved = reader.saved.includes(`arc:${a.id}`);
  const explored = reader.explored.includes(a.id);
  const [peek, setPeek] = useState(false);
  return <article className={`arc-stop ${hovered ? 'hovered' : ''} ${explored ? 'explored' : ''}`} id={`arc-stop-${a.id}`} data-reveal data-route-stop style={{ '--stagger': i % 2 } as CSSProperties} onMouseEnter={() => setHoverArc(a.id)} onMouseLeave={() => { setHoverArc(null); setPeek(false); }}>
    <div className="island-block">
      <button className="island-hotspot" aria-label={`Explore ${a.name} arc`} onClick={() => onOpen('arc', a.id)} onFocus={() => setPeek(true)} onBlur={() => setPeek(false)} onPointerEnter={() => setPeek(true)} onPointerLeave={() => setPeek(false)}>
        <span data-route-anchor className="scene-frame"><Scene locationId={a.locationIds[0]} name={l?.name || a.name} eager={i < 2 && a.sagaId === 'east-blue'} /></span>
        <span className="island-tag"><MapPin size={13} />{l?.name || a.name}<span>+</span></span>
        <span className={`island-peek ${peek ? 'show' : ''}`} aria-hidden="true"><span className="micro">EXPLORE ARC</span><em>{a.name}</em><em>{chapterLabel(a)}</em></span>
      </button>
    </div>
    <div className="arc-copy">
      <button className="signboard" onClick={() => onOpen('arc', a.id)}><span className="micro">{i === 0 ? stopLabels[0] : stopLabels[Math.min(i, stopLabels.length - 1)]}</span><strong>{l?.name || a.name}</strong></button>
      <div className="arc-label"><span className="micro">ARC {String(arcs.indexOf(a) + 1).padStart(2, '0')}</span><span className="arc-chapters micro">{chapterLabel(a).toUpperCase()}</span>{explored ? <span className="explored-label micro"><Check size={12} /> Explored</span> : null}</div>
      <h3>{a.name}</h3>
      <p>{a.premise}</p>
      <div className="arc-actions"><button className="button paper" onClick={() => onOpen('arc', a.id)}>Explore arc <ArrowRight size={16} /></button><button className="icon-button light" aria-label={isSaved ? `Unsave ${a.name}` : `Save ${a.name}`} aria-pressed={isSaved} onClick={(e) => onSave(`arc:${a.id}`, e.currentTarget)}>{isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}</button><span className="place-count">{a.locationIds.length} {a.locationIds.length === 1 ? 'place' : 'places'}</span></div>
    </div>
  </article>;
}
