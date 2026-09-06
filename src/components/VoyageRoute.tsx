import { useEffect, useState, type RefObject } from 'react';

type Point = { x: number; y: number };
type Segment = { d: string; mid: Point };

/** Same row: a gentle sag through the gap beneath the islands. New row: run along the gap, then dock straight down behind the next island. */
function segment(a: Point, b: Point): Segment {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dy) < 40) {
    const c1 = { x: a.x + dx * 0.33, y: a.y + 16 };
    const c2 = { x: b.x - dx * 0.33, y: b.y + 16 };
    const mid = { x: 0.125 * a.x + 0.375 * c1.x + 0.375 * c2.x + 0.125 * b.x, y: 0.125 * a.y + 0.375 * c1.y + 0.375 * c2.y + 0.125 * b.y };
    return { d: `M${a.x} ${a.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${b.x} ${b.y}`, mid };
  }
  const r = 36; const lane = a.y + 34;
  const dir = Math.sign(dx || 1);
  const d = `M${a.x} ${a.y} Q${a.x} ${lane} ${a.x + dir * 30} ${lane} L${b.x - dir * r} ${lane} Q${b.x} ${lane} ${b.x} ${lane + r} L${b.x} ${b.y}`;
  return { d, mid: { x: a.x + dx * 0.3, y: lane } };
}

/**
 * Draws the dashed gold voyage route beneath a saga's islands by measuring the rendered island cards.
 * Purely decorative: the reading order of the arcs is carried by the document, never by this drawing.
 */
export function VoyageRoute({ container, shipAt, deps }: { container: RefObject<HTMLElement | null>; shipAt: number; deps: unknown[] }) {
  const [state, setState] = useState<{ w: number; h: number; points: Point[] } | null>(null);
  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const root = el.getBoundingClientRect();
      const points: Point[] = [];
      el.querySelectorAll<HTMLElement>('[data-route-stop]').forEach((stop) => {
        const island = stop.querySelector<HTMLElement>('[data-route-anchor]') || stop;
        const r = island.getBoundingClientRect(); const s = stop.getBoundingClientRect();
        points.push({ x: r.left - root.left + r.width / 2, y: s.bottom - root.top + 20 });
      });
      setState({ w: root.width, h: root.height, points });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(el);
    el.querySelectorAll<HTMLElement>('[data-route-stop]').forEach((node) => observer.observe(node));
    window.addEventListener('resize', schedule);
    return () => { observer.disconnect(); window.removeEventListener('resize', schedule); if (frame) cancelAnimationFrame(frame); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container, ...deps]);
  if (!state || state.points.length < 1) return null;
  const segments: Segment[] = [];
  for (let i = 1; i < state.points.length; i++) segments.push(segment(state.points[i - 1], state.points[i]));
  const ship = segments[Math.min(Math.max(shipAt, 0), segments.length - 1)]?.mid ?? state.points[0];
  return (
    <svg className="voyage-route" aria-hidden="true" width={state.w} height={state.h} viewBox={`0 0 ${state.w} ${state.h}`}>
      {segments.map((s, i) => <path key={i} d={s.d} />)}
      {segments.map((s, i) => (
        <g key={`m${i}`} className="route-mark" transform={`translate(${s.mid.x} ${s.mid.y})`}>
          <circle r="11" />
          <path d="M-4.5 -4.5 4.5 4.5 M4.5 -4.5 -4.5 4.5" />
        </g>
      ))}
      <g className="route-ship" style={{ transform: `translate(${ship.x - 70}px, ${ship.y - 22}px)` }}>
        <path d="M-15 8h30l-5 8h-20z" className="hull" />
        <path d="M-1 8V-14" className="mast" />
        <path d="M-1 -14 12 -2H-1z" className="sail" />
        <path d="M-1 -14 -11 -4H-1z" className="sail" />
        <path d="M-1 -14v-5l6 2.5z" className="flag" />
      </g>
    </svg>
  );
}
