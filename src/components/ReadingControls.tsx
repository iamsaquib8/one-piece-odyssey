import { useEffect, useRef } from 'react';
import { ChevronDown, Route as RouteIcon, Search, ShieldCheck, X } from 'lucide-react';
import { arcSummaries } from '../data/arc-index';
import type { View } from '../types';

interface Props { through: number | null; onChange: (through: number | null) => void }

export function focusReadingProgress() {
  const input = document.getElementById('reading-horizon');
  const disclosure = input?.closest('details');
  if (disclosure) disclosure.open = true;
  input?.focus();
}

export function ReadingControls({ through, onChange }: Props) {
  const host = useRef<HTMLDetailsElement>(null);
  function close() {
    if (!host.current) return;
    host.current.open = false;
    host.current.querySelector('summary')?.focus();
  }
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (host.current && event.target instanceof Node && !host.current.contains(event.target)) host.current.open = false;
    };
    const focusOutside = (event: FocusEvent) => {
      if (host.current && event.target instanceof Node && !host.current.contains(event.target)) host.current.open = false;
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusOutside);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', focusOutside); };
  }, []);
  const chosen = through === null ? 'all' : String([...arcSummaries].reverse().find(a => a.chapters[1] <= through)?.chapters[1] ?? 0);
  return <details className="reading-settings" ref={host} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); close(); } }}>
    <summary aria-label="Reading progress" title="Reading progress"><ShieldCheck size={19} aria-hidden="true" /><span>{through === null ? 'Full spoilers' : `Ch. ${chosen}`}</span><ChevronDown size={14} className="reading-chevron" aria-hidden="true" /></summary>
    <section className="reading-controls" aria-label="Reading settings">
    <div className="reading-settings-heading"><strong>Reading progress</strong><button className="icon-button" type="button" aria-label="Close reading settings" onClick={close}><X size={18} /></button></div>
    <p>Choose your last completed arc to hide later story details.</p>
    <div className="reading-limit">
      <div><label htmlFor="reading-horizon">I’ve read through</label>
        <select id="reading-horizon" aria-describedby="reading-limit-status" value={chosen} onChange={e => onChange(e.target.value === 'all' ? null : Number(e.target.value))}>
          <option value="all">All chapters · full spoilers</option>
          <option value="0">Not started yet</option>
          {arcSummaries.map((a, i) => <option key={a.id} value={a.chapters[1]}>{through === null || a.chapters[1] <= through ? a.name : `Arc ${i + 1}`} · Ch. {a.chapters[1]}</option>)}
        </select>
        <span id="reading-limit-status" className="reading-limit-status">{through === null ? 'Full spoilers are on. Choose your last completed arc.' : 'Later details hidden · saved on this device'}</span>
      </div>
    </div>
    </section>
  </details>;
}

export function DiscoveryNavigation({ view, onNavigate }: { view: View; onNavigate: (view: View) => void }) {
  return <nav className="discovery-nav" aria-label="Story discoveries">
      <button className={view === 'trails' ? 'active' : ''} aria-current={view === 'trails' ? 'page' : undefined} onClick={() => onNavigate('trails')}><RouteIcon size={18} /> Character journeys</button>
      <button className={view === 'mysteries' ? 'active' : ''} aria-current={view === 'mysteries' ? 'page' : undefined} onClick={() => onNavigate('mysteries')}><Search size={18} /> Mystery board</button>
    </nav>;
}
