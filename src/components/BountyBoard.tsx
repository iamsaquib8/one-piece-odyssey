import { useMemo, useState } from 'react';
import { Coins, Plus, X } from 'lucide-react';
import type { Route } from '../types';
import { useReadingHorizon } from '../reading-horizon';
import { useReaderCatalog } from '../data/reader-catalog';
import { buildBountyBoard, crewTotal, shortBerries, type BountyRow } from '../data/bounty-board';
import { formatBerries } from '../data/crew-roster';
import { coverage } from '../data/coverage';
import CharacterPortrait from './CharacterPortrait';
import StepChart, { type StepSeries } from './StepChart';
import { focusReadingProgress } from './ReadingControls';
import '../bounties.css';

interface Props { onOpen: (kind: NonNullable<Route['kind']>, id: string, beat?: string) => void }

// Categorical slots validated together on the paper surface (scripts in the dataviz skill):
// at most three people are compared at once, which keeps every pair distinguishable.
const SLOTS = ['#2a78d6', '#eb6834', '#1baf7a'];
const FILTERS = [['all', 'Everyone'], ['crew', 'Straw Hats'], ['others', 'Everyone else']] as const;
type Filter = typeof FILTERS[number][0];

export default function BountyBoard({ onOpen }: Props) {
  const through = useReadingHorizon();
  const { characters } = useReaderCatalog();
  const rows = useMemo(() => buildBountyBoard(characters), [characters]);
  const [filter, setFilter] = useState<Filter>('all');
  // A person keeps their colour slot while compared; adding someone takes the lowest free slot.
  const [picked, setPicked] = useState<(string | null)[] | null>(null);
  // Open on the Worst Generation's three captains when the reader has reached them.
  const defaults = useMemo(() => {
    const grown = rows.filter((r) => r.history.length > 1).map((r) => r.character.id);
    const ids = [...new Set([...['luffy', 'law', 'kid'].filter((id) => grown.includes(id)), ...grown])].slice(0, 3);
    return [...ids, null, null, null].slice(0, 3);
  }, [rows]);
  const slots = (picked ?? defaults).map((id) => id && rows.some((r) => r.character.id === id) ? id : null);
  const horizon = through ?? coverage.coveredThrough;
  const visible = rows.filter((r) => filter === 'all' || (filter === 'crew' ? r.strawHat : !r.strawHat));
  const top = rows[0]?.current.value ?? 1;
  const total = useMemo(() => crewTotal(rows), [rows]);

  const toggle = (id: string) => setPicked(() => {
    const next = [...slots];
    const at = next.indexOf(id);
    if (at >= 0) next[at] = null;
    else { const free = next.indexOf(null); if (free < 0) return next; next[free] = id; }
    return next;
  });
  const compared: StepSeries[] = slots.flatMap((id, slot) => {
    const row = id ? rows.find((r) => r.character.id === id) : undefined;
    return row ? [{ id: row.character.id, name: row.character.name, color: SLOTS[slot], points: row.history }] : [];
  });

  return <section className="discovery-view bounty-view" aria-labelledby="bounty-title">
    <header className="discovery-hero bounty-hero">
      <div><span className="micro">BOUNTY BOARD · AS POSTED IN THE STORY</span><h1 id="bounty-title">Every price<br /><i>on every head.</i></h1><p>Bounties for everyone the story has posted, ranked by their latest figure. Each one appears in the chapter that first shows it, so your reading progress limits the board.</p></div>
      <Coins className="discovery-hero-mark" size={112} strokeWidth={1.25} aria-hidden="true" />
    </header>
    {rows.length ? <>
      <dl className="bounty-stats">
        <div><dt>Highest bounty</dt><dd><strong>{formatBerries(rows[0].current.amount)}</strong><span>{rows[0].character.name}</span></dd></div>
        {total.length ? <div><dt>Straw Hats combined</dt><dd><strong>{shortBerries(total.at(-1)!.total)}</strong><span>as of chapter {total.at(-1)!.chapter}</span></dd></div> : null}
        <div><dt>On the board</dt><dd><strong>{rows.length}</strong><span>{rows.length === 1 ? 'poster' : 'posters'}{through !== null ? `, through chapter ${through}` : ''}</span></dd></div>
      </dl>
      <div className="bounty-charts">
        {compared.length ? <StepChart title="Bounty growth" series={compared} through={horizon} /> : <p className="bounty-chart-empty">Pick up to three people on the board to compare how their bounties grew.</p>}
        {total.length > 1 ? <StepChart title="The Straw Hats' combined bounty" series={[{ id: 'crew', name: 'Straw Hats', color: SLOTS[0], points: total.map((t) => ({ chapter: t.chapter, value: t.total })) }]} through={horizon} area /> : null}
      </div>
      <div className="mystery-filters bounty-filters" aria-label="Filter the board">{FILTERS.map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}<small>{value === 'all' ? rows.length : rows.filter((r) => value === 'crew' ? r.strawHat : !r.strawHat).length}</small></button>)}</div>
      <ol className="wanted-list">{visible.map((row) => <BountyLine key={row.character.id} row={row} top={top} slot={slots.indexOf(row.character.id)} full={!slots.includes(null)} onToggle={toggle} onOpen={onOpen} />)}</ol>
    </> : <div className="discovery-empty"><Coins size={38} /><h2>No posters at this reading point yet.</h2><p>Bounties appear in the chapter that first shows them. Set your last completed arc to see the ones you have reached.</p><button className="button" type="button" onClick={focusReadingProgress}>Set reading progress</button></div>}
  </section>;
}

function BountyLine({ row, top, slot, full, onToggle, onOpen }: { row: BountyRow; top: number; slot: number; full: boolean; onToggle: (id: string) => void; onOpen: Props['onOpen'] }) {
  const { character, current, history } = row;
  const compared = slot >= 0;
  return <li className="bounty-line" style={{ '--bounty-share': `${Math.max(1, (current.value / top) * 100)}%`, '--bounty-slot': compared ? SLOTS[slot] : 'transparent' } as React.CSSProperties}>
    <span className="bounty-rank" aria-label={`Rank ${row.rank}`}>{row.rank}</span>
    <button className="bounty-person" type="button" onClick={() => onOpen('character', character.id)}>
      <CharacterPortrait characterId={character.id} name={character.name} color={character.color} />
      <span><strong>{character.name}</strong><small>{current.label} · Ch. {current.chapter}{history.length > 1 ? ` · ${history.length} posters` : ''}</small></span>
    </button>
    <span className="bounty-amount"><strong>{formatBerries(current.amount)}</strong><span className="bounty-bar" aria-hidden="true" /></span>
    <button className="bounty-compare" type="button" aria-pressed={compared} disabled={!compared && full} onClick={() => onToggle(character.id)} aria-label={compared ? `Stop comparing ${character.name}` : `Compare ${character.name}'s bounty growth`}>{compared ? <X size={16} /> : <Plus size={16} />}<span>{compared ? 'Comparing' : 'Compare'}</span></button>
  </li>;
}
