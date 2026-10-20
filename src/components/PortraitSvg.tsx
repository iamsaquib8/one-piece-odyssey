import type { PortraitRecipe, Effect } from './portrait-recipe';

const INK = '#10243a';
// The stylesheet sets --portrait-ink; the literal is what a build-time render without CSS sees.
const INK_VAR = `var(--portrait-ink, ${INK})`;

/** Particle colours the stylesheet gives each effect, written inline when no stylesheet is present. */
const PARTICLES: Record<Effect, { fill: string; opacity: number } | undefined> = {
  none: undefined,
  sun: undefined,
  embers: { fill: '#ff744d', opacity: 0.8 },
  snow: { fill: '#fff8e7', opacity: 0.9 },
  ghosts: { fill: '#d3a9ea', opacity: 0.75 },
  lightning: { fill: '#ffd34e', opacity: 0.9 },
  petals: { fill: '#ff9fbb', opacity: 0.8 },
  bubbles: { fill: '#8edce0', opacity: 0.7 },
};

function HairShape({ recipe }: { recipe: PortraitRecipe }) {
  if (recipe.hairStyle === 'bald') return null;
  if (recipe.hairStyle === 'long') return <path d="M28 71Q18 28 60 19Q103 27 92 82L79 101H37L27 77Z" fill={recipe.hair} stroke={INK_VAR} strokeWidth="4" />;
  if (recipe.hairStyle === 'round') return <path d="M25 60Q13 22 42 20Q59 5 73 19Q105 18 96 60L82 48H37Z" fill={recipe.hair} stroke={INK_VAR} strokeWidth="4" />;
  if (recipe.hairStyle === 'mohawk') return <path d="M43 39L45 12L54 29L63 8L69 30L83 15L78 45Z" fill={recipe.hair} stroke={INK_VAR} strokeWidth="4" />;
  if (recipe.hairStyle === 'flame') return <path d="M29 54Q19 32 35 12L43 29L54 7L62 30L77 9L80 31L99 23L88 58Z" fill={recipe.hair} stroke={INK_VAR} strokeWidth="4" />;
  if (recipe.hairStyle === 'swept') return <path d="M28 55Q27 22 57 20Q87 13 95 39L77 33L84 47L61 36L39 52Z" fill={recipe.hair} stroke={INK_VAR} strokeWidth="4" />;
  return <path d="M28 52L31 30L41 36L46 18L56 32L68 13L71 32L88 20L85 40L99 38L88 58Z" fill={recipe.hair} stroke={INK_VAR} strokeWidth="4" />;
}

function HatShape({ recipe }: { recipe: PortraitRecipe }) {
  const { hat } = recipe;
  if (!hat) return null;
  // Recipes without a fixed hat colour wear their hair colour; CSS can still override it.
  const hatFill = `var(--portrait-hat, ${recipe.hair})`;
  if (hat === 'straw') return <g><ellipse cx="60" cy="35" rx="43" ry="9" fill="#e6bd4b" stroke={INK_VAR} strokeWidth="4" /><path d="M35 35Q36 9 60 9Q84 9 86 35Z" fill="#e6bd4b" stroke={INK_VAR} strokeWidth="4" /><path d="M36 27H85" stroke="#d84b3c" strokeWidth="7" /></g>;
  if (hat === 'top') return <g><path d="M37 33L41 4H79L84 33Z" fill={hatFill} stroke={INK_VAR} strokeWidth="4" /><path d="M26 34H94" stroke={INK_VAR} strokeWidth="8" /></g>;
  if (hat === 'crown') return <path d="M32 36L27 10L45 23L60 5L75 23L94 9L88 38Z" fill="#ffd34e" stroke={INK_VAR} strokeWidth="4" />;
  if (hat === 'helmet') return <path d="M28 42Q29 10 60 10Q92 10 93 43L80 35H39Z" fill="#8b806a" stroke={INK_VAR} strokeWidth="5" />;
  if (hat === 'bandana') return <g><path d="M29 46Q31 15 60 15Q90 15 92 46Z" fill={hatFill} stroke={INK_VAR} strokeWidth="4" /><path d="M89 35L108 29L97 49Z" fill={hatFill} stroke={INK_VAR} strokeWidth="3" /></g>;
  if (hat === 'beanie') return <path d="M27 44Q28 10 60 10Q92 10 93 44Z" fill="#dfc13d" stroke={INK_VAR} strokeWidth="5" />;
  return <g><path d="M29 39Q32 12 60 12Q87 12 91 39Z" fill={hatFill} stroke={INK_VAR} strokeWidth="4" /><path d="M22 40H98" stroke={INK_VAR} strokeWidth="7" /></g>;
}

interface PortraitSvgProps {
  recipe: PortraitRecipe;
  /** Background disc colour. */
  color: string;
  clipId: string;
  label: string;
  /** The laboon portrait is drawn by hand rather than from a recipe. */
  laboon?: boolean;
  /**
   * A self-contained frame for build-time share images and downloads, where no stylesheet
   * applies: eyes open, effect particles coloured inline.
   */
  still?: boolean;
}

/** The portrait drawing itself. Every colour has a literal fallback, so it renders with or without crews.css. */
export function PortraitSvg({ recipe, color, clipId, label, laboon = false, still = false }: PortraitSvgProps) {
  const eyeY = recipe.kind === 'skull' ? 59 : 57;
  if (laboon) return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label={label}>
    <defs><clipPath id={clipId}><circle cx="60" cy="60" r="56" /></clipPath></defs>
    <g clipPath={`url(#${clipId})`} stroke="#10243a" strokeWidth="3" strokeLinecap="round">
      <circle cx="60" cy="60" r="58" fill="#78bac2" />
      <path d="M18 100Q8 30 54 20Q102 10 116 67L122 114Z" fill="#354b69" />
      <path d="M24 85Q60 112 116 88V116H32Z" fill="#a5bdc0" />
      <path d="M30 38l22 23m-5-27L30 65m33-26l11 17" stroke="#b9c6c7" fill="none" />
      <circle cx="35" cy="75" r="7" fill="#fff8e7" /><circle cx="33" cy="76" r="3" fill="#10243a" />
      <path d="M20 86Q44 98 69 88" fill="none" />
      <path d="M-5 106Q20 96 48 108T125 104" fill="none" stroke="#d2efe6" strokeWidth="5" />
    </g>
    <circle cx="60" cy="60" r="56" fill="none" stroke="#10243a" strokeWidth="4" />
  </svg>;
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" role="img" aria-label={label}>
    <defs><clipPath id={clipId}><circle cx="60" cy="60" r="56" /></clipPath></defs>
    <g clipPath={`url(#${clipId})`}>
      <circle cx="60" cy="60" r="58" fill={`var(--portrait-color, ${color})`} />
      <path className="portrait-current" d="M-10 100Q19 85 40 101T88 99T132 96V130H-10Z" fill="rgba(255,248,231,.18)" />
      <g className="portrait-aura" aria-hidden="true"><path d="M10 40L23 34M94 25L105 16M98 79L111 83M14 79L5 87" stroke="#ffd34e" strokeWidth="4" strokeLinecap="round" /></g>
      <g className="portrait-bust">
        {recipe.horns ? <path d="M34 39Q10 27 18 8Q29 27 43 29M85 35Q108 24 102 5Q90 26 78 29" fill="#e3d3aa" stroke={INK_VAR} strokeWidth="4" /> : null}
        <HairShape recipe={recipe} />
        <path d="M18 128Q20 85 44 80H76Q101 85 104 128Z" fill={recipe.coat} stroke={INK_VAR} strokeWidth="5" />
        {recipe.kind === 'skull' ? <g><path d="M31 47Q31 27 60 25Q89 27 89 54Q87 75 74 78V94L66 88L60 96L53 88L45 94V78Q32 72 31 47Z" fill="#eee5ca" stroke={INK_VAR} strokeWidth="5" /><path d="M49 73L45 82M70 73L75 82" stroke={INK_VAR} strokeWidth="4" /></g>
          : recipe.kind === 'reindeer' ? <g><path d="M34 39L20 20M37 37L32 14M85 40L100 21M82 35L88 13" stroke="#8b5a43" strokeWidth="7" strokeLinecap="round" /><path d="M31 45Q31 26 60 24Q89 26 89 57Q86 82 60 85Q34 82 31 45Z" fill={recipe.skin} stroke={INK_VAR} strokeWidth="5" /><ellipse cx="60" cy="71" rx="11" ry="8" fill="#77b8c6" stroke={INK_VAR} strokeWidth="3" /></g>
          : <g><ellipse cx="31" cy="59" rx="8" ry="11" fill={recipe.skin} stroke={INK_VAR} strokeWidth="4" /><ellipse cx="89" cy="59" rx="8" ry="11" fill={recipe.skin} stroke={INK_VAR} strokeWidth="4" /><path d="M31 43Q34 23 60 23Q87 24 90 45V65Q86 84 60 88Q34 83 30 64Z" fill={recipe.skin} stroke={INK_VAR} strokeWidth="5" /></g>}
        {recipe.kind === 'mink' ? <path d="M34 37L27 15L47 27M84 38L93 16L74 28" fill={recipe.skin} stroke={INK_VAR} strokeWidth="4" /> : null}
        {recipe.kind === 'fishman' ? <path d="M32 51L17 43L24 61M88 51L104 43L96 63" fill={recipe.skin} stroke={INK_VAR} strokeWidth="4" /> : null}
        <g className="portrait-eyes">
          <path d={`M40 ${eyeY}Q47 ${eyeY - 4} 53 ${eyeY}`} stroke={INK_VAR} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d={`M67 ${eyeY}Q74 ${eyeY - 4} 81 ${eyeY}`} stroke={INK_VAR} strokeWidth="4" strokeLinecap="round" fill="none" />
          {still ? null : <g className="portrait-lids"><path d={`M39 ${eyeY - 1}Q47 ${eyeY + 5} 54 ${eyeY - 1}`} stroke={recipe.skin} strokeWidth="6" fill="none" /><path d={`M66 ${eyeY - 1}Q74 ${eyeY + 5} 82 ${eyeY - 1}`} stroke={recipe.skin} strokeWidth="6" fill="none" /></g>}
        </g>
        {recipe.longNose ? <path d="M59 55Q72 65 58 69" fill="none" stroke={INK_VAR} strokeWidth="4" strokeLinecap="round" /> : <path d="M59 57L56 67L63 67" fill="none" stroke={INK_VAR} strokeWidth="3" strokeLinecap="round" />}
        {recipe.moustache ? <path d="M59 71Q45 60 31 70Q43 71 52 80Q58 80 60 74Q63 80 69 80Q78 71 91 70Q76 60 61 71Z" fill={recipe.hair} stroke={INK_VAR} strokeWidth="3" /> : null}
        {recipe.beard ? <path d="M39 75Q43 101 60 108Q78 100 82 74Q73 86 60 84Q48 86 39 75Z" fill={recipe.hair} stroke={INK_VAR} strokeWidth="3" /> : null}
        {!recipe.moustache && !recipe.beard ? <path d="M49 76Q60 83 71 76" fill="none" stroke={INK_VAR} strokeWidth="3" strokeLinecap="round" /> : null}
        {recipe.scar === 'eye' ? <path d="M43 37L49 69" stroke="#74362f" strokeWidth="3" strokeLinecap="round" /> : null}
        {recipe.scar === 'cheek' ? <path d="M67 67L77 74M69 72L75 68" stroke="#74362f" strokeWidth="2.5" strokeLinecap="round" /> : null}
        {recipe.scar === 'cross' ? <path d="M37 37L74 78M71 33L39 78" stroke="#74362f" strokeWidth="3" strokeLinecap="round" /> : null}
        {recipe.glasses ? <g fill="rgba(92,185,207,.3)" stroke={INK_VAR} strokeWidth="3"><circle cx="47" cy="57" r="10" /><circle cx="74" cy="57" r="10" /><path d="M57 56H64" /></g> : null}
        {recipe.earring ? <g fill="#ffd34e" stroke={INK_VAR} strokeWidth="2"><circle cx="29" cy="69" r="3" /><circle cx="28" cy="77" r="3" /><circle cx="30" cy="85" r="3" /></g> : null}
        <HatShape recipe={recipe} />
      </g>
      {still && !PARTICLES[recipe.effect ?? 'none'] ? null : <g className="portrait-particles" aria-hidden="true" {...(still ? PARTICLES[recipe.effect ?? 'none'] : {})}><circle cx="20" cy="69" r="4" /><circle cx="101" cy="47" r="3" /><circle cx="92" cy="92" r="5" /></g>}
    </g>
    <circle cx="60" cy="60" r="56" fill="none" stroke={INK_VAR} strokeWidth="4" />
  </svg>;
}
