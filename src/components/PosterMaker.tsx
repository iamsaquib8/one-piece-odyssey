import { useEffect, useId, useMemo, useRef, useState, type ReactElement } from 'react';
import { Dice5, Download, Link2, ScrollText } from 'lucide-react';
import { useReaderCatalog } from '../data/reader-catalog';
import { encodeRoute } from '../state';
import { EFFECTS, HAIR_STYLES, HATS, KINDS, recipeFor, type PortraitRecipe } from './portrait-recipe';
import { DEFAULT_POSTER, LIMITS, decodePoster, encodePoster, type PosterState } from '../art/poster';
import WantedPoster, { POSTER_H, POSTER_W } from './WantedPoster';
import '../poster.css';

const SKINS = ['#f1c7a4', '#e0ad88', '#d59a74', '#c9855d', '#a9674d', '#754735'];
const HAIRS = ['#18191b', '#5b3e2e', '#d3b747', '#e77d35', '#4a9c64', '#426e73'];
const COATS = ['#d9473f', '#315844', '#4a78a3', '#55436f', '#e6bd4b', '#2b2321'];
const BACKDROPS = ['#f2b33d', '#78bac2', '#ff9fbb', '#8edce0', '#c9a7e8', '#a9c97f'];
const FLAGS: [keyof PortraitRecipe, string][] = [['beard', 'Beard'], ['moustache', 'Moustache'], ['glasses', 'Glasses'], ['horns', 'Horns'], ['earring', 'Earrings'], ['longNose', 'Long nose']];
const label = (value: string) => value.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
const any = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];
const slug = (value: string) => value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pirate';

/** A label beside its control rather than around it, so a select's chosen option never becomes part of its name. */
function Field({ label: text, children }: { label: string; children: (id: string) => ReactElement }) {
  const id = useId();
  return <div className="poster-field"><label htmlFor={id}>{text}</label>{children(id)}</div>;
}

function initialPoster(): PosterState {
  const params = new URLSearchParams(window.location.search);
  const from = params.get('from');
  if (from) return { ...DEFAULT_POSTER, recipe: recipeFor(from) };
  return decodePoster(params.get('r'));
}

/**
 * Make your own wanted poster from the portrait recipe language. Everything happens in the
 * browser: the share link carries the whole poster in its query, and the PNG is drawn from the
 * preview SVG through a data: URL, which the content security policy already allows.
 */
export default function PosterMaker() {
  const { characters } = useReaderCatalog();
  const [poster, setPoster] = useState<PosterState>(initialPoster);
  const [status, setStatus] = useState('');
  const svg = useRef<SVGSVGElement>(null);
  const r = poster.recipe;
  const set = (patch: Partial<PosterState>) => setPoster((p) => ({ ...p, ...patch }));
  const setRecipe = (patch: Partial<PortraitRecipe>) => setPoster((p) => ({ ...p, recipe: { ...p.recipe, ...patch } }));
  const link = useMemo(() => `${encodeRoute({ view: 'poster' })}?r=${encodePoster(poster)}`, [poster]);
  const starters = useMemo(() => [...characters].sort((a, b) => a.name.localeCompare(b.name)), [characters]);

  // The address bar always holds the current poster, so copying it from the browser works too.
  useEffect(() => {
    const t = setTimeout(() => { if (window.location.pathname.startsWith('/poster')) history.replaceState(history.state, '', link); }, 400);
    return () => clearTimeout(t);
  }, [link]);

  function randomize() {
    setPoster((p) => ({ ...p, backdrop: any(BACKDROPS), recipe: {
      skin: any(SKINS), hair: any(HAIRS), coat: any(COATS), hairStyle: any(HAIR_STYLES), kind: Math.random() < .8 ? 'human' : any(KINDS),
      effect: any(EFFECTS), ...(Math.random() < .55 ? { hat: any(HATS) } : {}), ...(Math.random() < .3 ? { scar: any(['eye', 'cheek', 'cross'] as const) } : {}),
      ...Object.fromEntries(FLAGS.filter(() => Math.random() < .18).map(([flag]) => [flag, true])),
    } }));
    setStatus('A new face for the poster.');
  }

  async function download() {
    const node = svg.current;
    if (!node) return;
    setStatus('Drawing your poster…');
    const data = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(node))}`;
    const image = new Image();
    image.decoding = 'async';
    image.src = data;
    try { await image.decode(); } catch { setStatus('Your browser could not draw the poster. Try again, or take a screenshot of the preview.'); return; }
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = POSTER_W * scale; canvas.height = POSTER_H * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) { setStatus('Your browser could not save the poster.'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `wanted-${slug(poster.name)}.png`;
      document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('Poster saved as a PNG.');
    }, 'image/png');
  }

  async function copy() {
    const url = `${window.location.origin}${link}`;
    try { await navigator.clipboard.writeText(url); setStatus('Share link copied.'); }
    catch { window.prompt('Copy this link to share your poster', url); }
  }

  return <section className="discovery-view poster-view" aria-labelledby="poster-title">
    <header className="discovery-hero poster-hero">
      <div><span className="micro">WANTED POSTER MAKER · YOUR FACE, YOUR PRICE</span><h1 id="poster-title">Put a price<br /><i>on your own head.</i></h1><p>Build a pixel portrait from the same recipe every character on this site is drawn with, name your price, and download the poster. Nothing is uploaded: the link carries the whole poster.</p></div>
      <ScrollText className="discovery-hero-mark" size={112} strokeWidth={1.25} aria-hidden="true" />
    </header>
    <div className="poster-workbench">
      <div className="poster-preview"><WantedPoster ref={svg} poster={poster} />
        <div className="poster-actions">
          <button className="button" type="button" onClick={download}><Download size={18} /> Download PNG</button>
          <button className="button secondary" type="button" onClick={copy}><Link2 size={18} /> Copy share link</button>
          <button className="button secondary" type="button" onClick={randomize}><Dice5 size={18} /> Randomize</button>
        </div>
        <p className="poster-status" role="status">{status}</p>
      </div>
      <div className="poster-controls">
        <fieldset><legend>The words</legend>
          <Field label="Name">{(id) => <input id={id} value={poster.name} maxLength={LIMITS.name} onChange={(e) => set({ name: e.target.value })} />}</Field>
          <Field label="Epithet">{(id) => <input id={id} value={poster.epithet} maxLength={LIMITS.epithet} placeholder="Optional" onChange={(e) => set({ epithet: e.target.value })} />}</Field>
          <Field label="Bounty in berries">{(id) => <input id={id} inputMode="numeric" value={poster.bounty} maxLength={LIMITS.bounty} onChange={(e) => set({ bounty: e.target.value.replace(/\D/g, '') })} />}</Field>
          <div className="poster-choice" role="radiogroup" aria-label="Terms">{(['dead-or-alive', 'only-alive'] as const).map((value) => <label key={value} className="chip-option"><input type="radio" name="poster-alive" checked={poster.alive === value} onChange={() => set({ alive: value })} />{value === 'only-alive' ? 'Only alive' : 'Dead or alive'}</label>)}</div>
        </fieldset>
        <fieldset><legend>The face</legend>
          <Field label="Start from someone you have met">{(id) => <select id={id} value="" onChange={(e) => { const c = characters.find((x) => x.id === e.target.value); if (c) { setRecipe(recipeFor(c.id, c.color)); set({ backdrop: c.color }); setStatus(`Started from ${c.name}.`); } }}><option value="">Choose a character…</option>{starters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}</Field>
          <div className="poster-grid">
            <Field label="Build">{(id) => <select id={id} value={r.kind ?? 'human'} onChange={(e) => setRecipe({ kind: e.target.value as PortraitRecipe['kind'] })}>{KINDS.map((k) => <option key={k} value={k}>{label(k)}</option>)}</select>}</Field>
            <Field label="Hair">{(id) => <select id={id} value={r.hairStyle} onChange={(e) => setRecipe({ hairStyle: e.target.value as PortraitRecipe['hairStyle'] })}>{HAIR_STYLES.map((h) => <option key={h} value={h}>{label(h)}</option>)}</select>}</Field>
            <Field label="Hat">{(id) => <select id={id} value={r.hat ?? ''} onChange={(e) => setRecipe({ hat: (e.target.value || undefined) as PortraitRecipe['hat'] })}><option value="">None</option>{HATS.map((h) => <option key={h} value={h}>{label(h)}</option>)}</select>}</Field>
            <Field label="Scar">{(id) => <select id={id} value={r.scar ?? ''} onChange={(e) => setRecipe({ scar: (e.target.value || undefined) as PortraitRecipe['scar'] })}><option value="">None</option>{(['eye', 'cheek', 'cross'] as const).map((s) => <option key={s} value={s}>{label(s)}</option>)}</select>}</Field>
            <Field label="Aura">{(id) => <select id={id} value={r.effect ?? 'none'} onChange={(e) => setRecipe({ effect: e.target.value as PortraitRecipe['effect'] })}>{EFFECTS.map((f) => <option key={f} value={f}>{label(f)}</option>)}</select>}</Field>
          </div>
          <div className="poster-flags">{FLAGS.map(([flag, name]) => <label key={flag} className="chip-option"><input type="checkbox" checked={!!r[flag]} onChange={(e) => setRecipe({ [flag]: e.target.checked || undefined })} />{name}</label>)}</div>
        </fieldset>
        <fieldset><legend>The colours</legend>
          {([['Skin', 'skin', SKINS], ['Hair', 'hair', HAIRS], ['Coat', 'coat', COATS], ['Backdrop', 'backdrop', BACKDROPS]] as const).map(([name, key, presets]) => {
            const value = key === 'backdrop' ? poster.backdrop : r[key];
            const choose = (color: string) => key === 'backdrop' ? set({ backdrop: color }) : setRecipe({ [key]: color });
            return <div className="poster-colour" key={key}><Field label={name}>{(id) => <input id={id} type="color" value={value} onChange={(e) => choose(e.target.value)} />}</Field>
              <div className="poster-swatches" role="group" aria-label={`${name} presets`}>{presets.map((c, i) => <button key={c} type="button" style={{ background: c }} aria-label={`${name} preset ${i + 1}`} aria-pressed={value.toLowerCase() === c} onClick={() => choose(c)} />)}</div></div>;
          })}
        </fieldset>
      </div>
    </div>
  </section>;
}
