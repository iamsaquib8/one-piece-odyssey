import { useCallback, useState } from 'react';

type Particle = { id: number; x: number; y: number; color: 'gold' | 'coral' };
export interface BurstApi { particles: Particle[]; fire: (at: HTMLElement | { x: number; y: number }, color?: Particle['color']) => void; done: (id: number) => void }
let seq = 0;

/** Fires a short shower of pixel squares from a control; purely celebratory and skipped when motion is off. */
export function useBurst(): BurstApi {
  const [particles, setParticles] = useState<Particle[]>([]);
  const fire = useCallback((at: HTMLElement | { x: number; y: number }, color: Particle['color'] = 'gold') => {
    if (document.documentElement.dataset.motion !== 'on') return;
    const p = 'getBoundingClientRect' in at ? (() => { const r = at.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })() : at;
    const id = ++seq;
    setParticles((list) => [...list.slice(-3), { id, ...p, color }]);
  }, []);
  const done = useCallback((id: number) => setParticles((list) => list.filter((p) => p.id !== id)), []);
  return { particles, fire, done };
}

const OFFSETS = Array.from({ length: 14 }, (_, i) => { const angle = (i / 14) * Math.PI * 2; const dist = 46 + (i % 3) * 22; return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 20, size: 6 + (i % 3) * 3, delay: (i % 4) * 30 }; });

export function PixelBurst({ burst }: { burst: BurstApi }) {
  return <div className="pixel-bursts" aria-hidden="true">{burst.particles.map((p) => <span key={p.id} className={`burst burst-${p.color}`} style={{ left: p.x, top: p.y }} onAnimationEnd={() => burst.done(p.id)}>{OFFSETS.map((o, i) => <i key={i} style={{ '--dx': `${o.dx}px`, '--dy': `${o.dy}px`, '--size': `${o.size}px`, animationDelay: `${o.delay}ms` } as React.CSSProperties} />)}</span>)}</div>;
}
