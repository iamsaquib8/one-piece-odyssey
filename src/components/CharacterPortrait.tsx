import { useReadingHorizon } from '../reading-horizon';
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { recipeFor } from './portrait-recipe';
import { PortraitSvg } from './PortraitSvg';

interface CharacterPortraitProps {
  characterId: string;
  name?: string;
  color?: string;
  className?: string;
}

export default function CharacterPortrait({ characterId, name, color = '#087f91', className = '' }: CharacterPortraitProps) {
  const limited = useReadingHorizon() !== null;
  const host = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const rawId = useId();
  const clipId = `portrait-${rawId.replace(/:/g, '')}`;
  const recipe = useMemo(() => recipeFor(characterId, color), [characterId, color]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let intersecting = false;
    const sync = () => setActive(intersecting && document.visibilityState === 'visible');
    const observer = new IntersectionObserver(([entry]) => { intersecting = entry.isIntersecting; sync(); }, { rootMargin: '80px' });
    observer.observe(element);
    document.addEventListener('visibilitychange', sync);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', sync); };
  }, []);

  const style = {
    '--portrait-color': color,
    '--portrait-coat': recipe.coat,
    '--portrait-hat': recipe.hair,
  } as CSSProperties;

  if (limited) return <span ref={host} className={`character-portrait ${className}`.trim()} style={style}><svg viewBox="0 0 120 120" role="img" aria-label={`${name ?? 'Character'} — portrait hidden to avoid later appearance spoilers`}><circle cx="60" cy="60" r="56" fill="var(--paper)"/><circle cx="60" cy="44" r="20" fill="var(--ink)"/><path d="M22 107V94a38 38 0 0 1 76 0v13" fill="var(--ink)"/></svg></span>;
  const laboon = characterId === 'laboon';
  const label = `${name ?? (laboon ? 'Laboon' : characterId)} — original illustrated portrait`;
  return <span ref={host} className={`character-portrait ${className}`.trim()} data-active={active ? 'true' : 'false'} data-effect={laboon ? undefined : recipe.effect} style={style}>
    <PortraitSvg recipe={recipe} color={color} clipId={clipId} label={label} laboon={laboon} />
  </span>;
}

export type { CharacterPortraitProps };
