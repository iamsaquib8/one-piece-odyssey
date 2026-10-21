import { useId, useMemo, useRef, useState } from 'react';
import { shortBerries } from '../data/bounty-board';

export interface StepSeries { id: string; name: string; color: string; points: { chapter: number; value: number }[] }

interface Props {
  title: string;
  series: StepSeries[];
  /** The last chapter the reader may see; lines run flat to it. */
  through: number;
  /** One series reads better as a filled area. */
  area?: boolean;
}

const W = 720;
const H = 280;
const M = { top: 16, right: 150, bottom: 34, left: 58 };
const IW = W - M.left - M.right;
const IH = H - M.top - M.bottom;

/** Four or five gridlines at 1, 2 or 5 of a power of ten, so every tick is a figure people say aloud. */
function niceScale(value: number): { max: number; step: number } {
  if (value <= 0) return { max: 1, step: 1 };
  const rough = value / 4;
  const p = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * p).find((n) => n >= rough)!;
  return { max: Math.ceil(value / step) * step, step };
}

const valueAt = (s: StepSeries, chapter: number) => s.points.filter((p) => p.chapter <= chapter).at(-1)?.value;

/**
 * Bounties change in jumps when a new poster is printed, so each series is a step line: flat
 * until the chapter that shows the next figure. Hover or arrow keys move a crosshair between
 * the chapters where any figure changed; the table underneath carries the same numbers.
 */
export default function StepChart({ title, series, through, area = false }: Props) {
  const tableId = useId();
  const svg = useRef<SVGSVGElement>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const { max, step: yStep } = niceScale(Math.max(...series.flatMap((s) => s.points.map((p) => p.value)), 1));
  const minChapter = Math.max(1, Math.min(...series.flatMap((s) => s.points.map((p) => p.chapter))) - 40);
  const x = (chapter: number) => M.left + ((chapter - minChapter) / Math.max(1, through - minChapter)) * IW;
  const y = (value: number) => M.top + IH - (value / max) * IH;
  const stops = useMemo(() => [...new Set(series.flatMap((s) => s.points.map((p) => p.chapter)))].sort((a, b) => a - b), [series]);
  const ticks = Array.from({ length: Math.round(max / yStep) + 1 }, (_, i) => i * yStep);
  const span = through - minChapter;
  const step = span > 600 ? 200 : span > 250 ? 100 : 50;
  const chapterTicks = Array.from({ length: Math.floor(through / step) + 1 }, (_, i) => i * step).filter((c) => c >= minChapter);

  const path = (s: StepSeries) => {
    let d = `M${x(s.points[0].chapter)} ${y(s.points[0].value)}`;
    for (const p of s.points.slice(1)) d += `H${x(p.chapter)}V${y(p.value)}`;
    return `${d}H${x(through)}`;
  };

  // Direct labels sit at the line ends, nudged apart so two equal bounties never overprint.
  const labels = series.map((s) => ({ s, y: y(s.points.at(-1)!.value) })).sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 16) labels[i].y = labels[i - 1].y + 16;

  const nearest = (clientX: number) => {
    const box = svg.current?.getBoundingClientRect();
    if (!box || !stops.length) return null;
    const chapter = minChapter + (((clientX - box.left) / box.width) * W - M.left) / IW * span;
    return stops.reduce((best, c) => Math.abs(c - chapter) < Math.abs(best - chapter) ? c : best, stops[0]);
  };
  const onKey = (event: React.KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = focus === null ? -1 : stops.indexOf(focus);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? stops.length - 1 : event.key === 'ArrowLeft' ? Math.max(0, index - 1) : Math.min(stops.length - 1, index + 1);
    setFocus(stops[next] ?? null);
  };
  const tipLeft = focus === null ? 0 : (x(focus) / W) * 100;

  return <figure className="step-chart">
    <figcaption><strong>{title}</strong>{series.length > 1 ? <ul className="step-legend">{series.map((s) => <li key={s.id}><span style={{ background: s.color }} aria-hidden="true" />{s.name}</li>)}</ul> : null}</figcaption>
    <div className="step-plot">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. Step chart by chapter; the table below lists every figure.`} aria-describedby={tableId}
        tabIndex={0} onKeyDown={onKey} onPointerMove={(e) => setFocus(nearest(e.clientX))} onPointerLeave={() => setFocus(null)} onBlur={() => setFocus(null)}>
        {ticks.map((t) => <g key={t} className="step-grid"><line x1={M.left} x2={M.left + IW} y1={y(t)} y2={y(t)} /><text x={M.left - 8} y={y(t)} dy="0.32em" textAnchor="end">{shortBerries(t)}</text></g>)}
        {chapterTicks.map((c) => <text key={c} className="step-axis" x={x(c)} y={H - 10} textAnchor="middle">{c === 0 ? 'Ch. 1' : c}</text>)}
        {area && series[0] ? <path className="step-area" d={`${path(series[0])}V${y(0)}H${x(series[0].points[0].chapter)}Z`} fill={series[0].color} /> : null}
        {series.map((s) => <path key={s.id} className="step-line" d={path(s)} stroke={s.color} />)}
        {series.map((s) => s.points.map((p) => <circle key={`${s.id}:${p.chapter}:${p.value}`} className="step-dot" cx={x(p.chapter)} cy={y(p.value)} r={4.5} fill={s.color} />))}
        {labels.map(({ s, y: ly }) => <text key={s.id} className="step-label" x={x(through) + 8} y={ly} dy="0.32em">{s.name.length > 19 ? `${s.name.slice(0, 18)}…` : s.name}</text>)}
        {focus !== null ? <line className="step-cross" x1={x(focus)} x2={x(focus)} y1={M.top} y2={M.top + IH} /> : null}
      </svg>
      {focus !== null ? <div className="step-tip" style={{ left: `${tipLeft}%` }} role="status">
        <strong>Ch. {focus}</strong>
        {series.map((s) => { const v = valueAt(s, focus); return v === undefined ? null : <span key={s.id}><i style={{ background: s.color }} aria-hidden="true" />{s.name}<b>{shortBerries(v)}</b></span>; })}
      </div> : null}
    </div>
    <details className="step-table">
      <summary>Show as a table</summary>
      <table id={tableId}><thead><tr><th scope="col">Chapter</th>{series.map((s) => <th key={s.id} scope="col">{s.name}</th>)}</tr></thead>
        <tbody>{stops.map((c) => <tr key={c}><th scope="row">{c}</th>{series.map((s) => <td key={s.id}>{valueAt(s, c) === undefined ? '—' : `฿${valueAt(s, c)!.toLocaleString('en-US')}`}</td>)}</tr>)}</tbody></table>
    </details>
  </figure>;
}
