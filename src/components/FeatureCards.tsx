import { ArrowRight, Gamepad2, Cherry, Coins, MapPinned, Route as RouteIcon, ScrollText, Search, type LucideIcon } from 'lucide-react';
import type { View } from '../types';
import '../discover-hub.css';

interface Feature { view: View; title: string; line: string; Icon: LucideIcon; tone: string }

/** Every Discover tool, in the order a returning reader is most likely to want them. */
export const FEATURES: Feature[] = [
  { view: 'voyage', title: 'Grand Line Voyage', line: 'Play the story: recruit the crew, fight the arcs, sail the East Blue.', Icon: Gamepad2, tone: '#b23a2e' },
  { view: 'catch-up', title: 'Where am I?', line: 'From your last anime episode to the manga chapter, with a recap.', Icon: MapPinned, tone: '#1f5d57' },
  { view: 'bounties', title: 'Bounty board', line: 'Every posted bounty, ranked, and how each one grew.', Icon: Coins, tone: '#7a3a24' },
  { view: 'devil-fruits', title: 'Devil Fruits', line: 'Every fruit, who ate it, and when it awakened.', Icon: Cherry, tone: '#3d2a63' },
  { view: 'poster', title: 'Poster maker', line: 'Draw yourself a wanted poster and name your price.', Icon: ScrollText, tone: '#6b4a2b' },
  { view: 'trails', title: 'Character trails', line: 'Follow anyone through the story, moment by moment.', Icon: RouteIcon, tone: '#0b4f63' },
  { view: 'mysteries', title: 'Mystery board', line: 'Open questions whose clues unlock as you read.', Icon: Search, tone: '#463477' },
];

/** Cards for the Discover tools. Kept free of story data so the journey page can show them without loading it. */
export function FeatureCards({ onNavigate, compact = false, counts = {} }: { onNavigate: (view: View) => void; compact?: boolean; counts?: Partial<Record<View, string>> }) {
  const list = compact ? FEATURES.slice(0, 4) : FEATURES;
  return <ul className={`feature-cards ${compact ? 'is-compact' : ''}`}>{list.map(({ view, title, line, Icon, tone }) => <li key={view}>
    <button type="button" className="feature-card" style={{ '--feature-tone': tone } as React.CSSProperties} onClick={() => onNavigate(view)}>
      <span className="feature-icon" aria-hidden="true"><Icon size={compact ? 22 : 28} /></span>
      <span className="feature-copy"><strong>{title}</strong><span>{line}</span>{counts[view] ? <small>{counts[view]}</small> : null}</span>
      <ArrowRight size={18} aria-hidden="true" />
    </button>
  </li>)}</ul>;
}
