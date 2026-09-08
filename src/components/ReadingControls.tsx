import { BookOpen, Route as RouteIcon, Search, ShieldCheck } from 'lucide-react';
import { arcSummaries } from '../data/arc-index';
import type { View } from '../types';

interface Props { through: number | null; view: View; onChange: (through: number | null) => void; onNavigate: (view: View) => void }

export function ReadingControls({ through, view, onChange, onNavigate }: Props) {
  const chosen = through === null ? 'all' : String([...arcSummaries].reverse().find(a => a.chapters[1] <= through)?.chapters[1] ?? 0);
  return <section className="reading-controls" aria-label="Reading progress and discoveries">
    <div className="reading-limit">
      <ShieldCheck size={21} aria-hidden="true" />
      <div><label htmlFor="reading-horizon">I’ve read through</label>
        <select id="reading-horizon" value={chosen} onChange={e => onChange(e.target.value === 'all' ? null : Number(e.target.value))}>
          <option value="all">All chapters · full spoilers</option>
          <option value="0">Not started yet</option>
          {arcSummaries.map((a, i) => <option key={a.id} value={a.chapters[1]}>{through === null || a.chapters[1] <= through ? a.name : `Arc ${i + 1}`} · Ch. {a.chapters[1]}</option>)}
        </select>
      </div>
      <span className="reading-limit-status">{through === null ? 'Choose your progress to hide later story details.' : 'Later story details are hidden. Profiles use only what you’ve read.'}</span>
    </div>
    <nav className="discovery-nav" aria-label="Story discoveries">
      <button className={view === 'trails' ? 'active' : ''} aria-current={view === 'trails' ? 'page' : undefined} onClick={() => onNavigate('trails')}><RouteIcon size={18} /> Character journeys</button>
      <button className={view === 'mysteries' ? 'active' : ''} aria-current={view === 'mysteries' ? 'page' : undefined} onClick={() => onNavigate('mysteries')}><Search size={18} /> Mystery board</button>
      <button className={view === 'saved' ? 'active' : ''} onClick={() => onNavigate('saved')}><BookOpen size={18} /> Logbook</button>
    </nav>
  </section>;
}
