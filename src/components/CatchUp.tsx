import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Clapperboard, ExternalLink, MapPinned } from 'lucide-react';
import type { Route } from '../types';
import { useReadingHorizon } from '../reading-horizon';
import { useReaderCatalog } from '../data/reader-catalog';
import { coverage } from '../data/coverage';
import { LATEST_MAPPED_EPISODE } from '../data/anime-arcs';
import { buildCatchUp, chapterForEpisode, episodeForChapter } from '../data/where-am-i';
import { encodeRoute } from '../state';
import { focusReadingProgress } from './ReadingControls';
import '../catchup.css';

type Mode = 'anime' | 'manga';
const VIZ_INDEX = 'https://www.viz.com/shonenjump/chapters/one-piece';

function initial(): { mode: Mode; value: string } {
  const params = new URLSearchParams(window.location.search);
  if (params.get('ep')) return { mode: 'anime', value: params.get('ep')!.replace(/\D/g, '').slice(0, 5) };
  if (params.get('ch')) return { mode: 'manga', value: params.get('ch')!.replace(/\D/g, '').slice(0, 5) };
  return { mode: 'anime', value: '' };
}

/**
 * "Where am I?": turn an anime episode into a manga chapter, then recap the story so far. The
 * conversion is exact at arc level and interpolated inside an arc, and the page says so. The recap
 * only ever shows beats that end at or before the reader's chapter.
 */
export default function CatchUp({ onOpen }: { onOpen: (kind: NonNullable<Route['kind']>, id: string, beat?: string) => void }) {
  const through = useReadingHorizon();
  const { arcs } = useReaderCatalog();
  const [{ mode, value }, setInput] = useState(initial);
  const number = Number(value);
  const answer = useMemo(() => mode === 'anime' && value ? chapterForEpisode(number) : null, [mode, value, number]);
  const chapter = mode === 'manga' ? (value ? number : NaN) : answer && (answer.kind === 'canon' || answer.kind === 'filler') ? answer.chapter : NaN;
  const known = Number.isInteger(chapter) && chapter >= 1;
  const pastEdition = known && chapter > coverage.coveredThrough;
  const pastProgress = known && through !== null && chapter > through;
  const catchUp = useMemo(() => known && !pastEdition ? buildCatchUp(chapter, arcs) : null, [known, pastEdition, chapter, arcs]);
  const animeReach = mode === 'manga' && known && !pastEdition ? episodeForChapter(chapter) : null;

  // Keep the address shareable: /catch-up/?ep=1000 opens straight to that answer.
  useEffect(() => {
    const t = setTimeout(() => {
      const base = encodeRoute({ view: 'catch-up' });
      const next = value ? `${base}?${mode === 'anime' ? 'ep' : 'ch'}=${value}` : base;
      if (window.location.pathname.startsWith(base) && window.location.pathname + window.location.search !== next) history.replaceState(history.state, '', next);
    }, 400);
    return () => clearTimeout(t);
  }, [mode, value]);

  return <section className="discovery-view catchup-view" aria-labelledby="catchup-title">
    <header className="discovery-hero catchup-hero">
      <div><span className="micro">WHERE AM I? · ANIME TO MANGA, AND A RECAP</span><h1 id="catchup-title">Pick up the story<br /><i>where you left it.</i></h1><p>Tell us the last episode you watched or the last chapter you read. We’ll find the chapter to start from and recap the arc so far, with nothing past that point.</p></div>
      <MapPinned className="discovery-hero-mark" size={112} strokeWidth={1.25} aria-hidden="true" />
    </header>
    <div className="catchup-form">
      <div className="mystery-filters catchup-modes" role="group" aria-label="I follow the story in">
        <button type="button" aria-pressed={mode === 'anime'} onClick={() => setInput({ mode: 'anime', value })}><Clapperboard size={17} /> The anime</button>
        <button type="button" aria-pressed={mode === 'manga'} onClick={() => setInput({ mode: 'manga', value })}><BookOpen size={17} /> The manga</button>
      </div>
      <label className="catchup-input"><span>{mode === 'anime' ? 'Last episode I watched' : 'Last chapter I read'}</span>
        <input inputMode="numeric" placeholder={mode === 'anime' ? 'e.g. 1000' : 'e.g. 1044'} value={value} maxLength={5} onChange={(e) => setInput({ mode, value: e.target.value.replace(/\D/g, '') })} />
      </label>
    </div>

    {!value ? null : <div className="catchup-result" aria-live="polite">
      {answer?.kind === 'invalid' ? <p className="catchup-answer">Episodes start at 1.</p> : null}
      {answer?.kind === 'beyond' ? <p className="catchup-answer">Episode {value} is past the {answer.latest} episodes this chart maps so far.</p> : null}
      {answer?.kind === 'canon' ? <p className="catchup-answer">Episode {value} brings you to about <strong>chapter {answer.chapter}</strong>, in the {answer.animeArc} arc.</p> : null}
      {answer?.kind === 'filler' ? <p className="catchup-answer">Episode {value} is anime-original: the <strong>{answer.animeArc}</strong> filler arc adapts no chapters. The manga story stands at about <strong>chapter {answer.chapter}</strong>.</p> : null}
      {mode === 'manga' && known && !pastEdition ? <p className="catchup-answer">You’ve read through <strong>chapter {chapter}</strong>.{animeReach?.kind === 'episode' ? <> The anime reaches it around episode {animeReach.episode}.</> : animeReach?.kind === 'not-animated' ? <> The anime hasn’t got there yet; it is at episode {animeReach.latest}.</> : null}</p> : null}
      {known && pastEdition ? <p className="catchup-answer">Chapter {chapter} is past this edition, which narrates through chapter {coverage.coveredThrough}.</p> : null}

      {known && !pastEdition && pastProgress ? <div className="catchup-limited"><p>Your reading progress is set to chapter {through}, so the recap stops there. Update “I’ve read through” to see the rest.</p><button className="button" type="button" onClick={focusReadingProgress}>Set reading progress</button></div> : null}

      {known && !pastEdition && !pastProgress && catchUp ? <>
        <div className="catchup-next">
          <span className="micro">CONTINUE WITH</span>
          <strong>Chapter {Math.min(chapter + 1, coverage.coveredThrough)}</strong>
          <a className="button" href={VIZ_INDEX} target="_blank" rel="noreferrer">Read it on VIZ <ExternalLink size={16} /></a>
        </div>
        <article className="catchup-recap">
          <h2>The story so far in {catchUp.arc.name}</h2>
          <p className="catchup-premise">{catchUp.arc.premise}</p>
          {catchUp.read.length ? <ol className="catchup-beats">{catchUp.read.map((beat) => <li key={beat.id}>
            <span className="micro">CH. {beat.chapters}</span>
            <h3>{beat.title}</h3>
            <p>{beat.paragraphs[0]}</p>
            <button className="text-link" type="button" onClick={() => onOpen('arc', catchUp.arc.id, beat.id)}>Read this part <ArrowRight size={15} /></button>
          </li>)}</ol> : <p>You’re at the very start of this arc.</p>}
          {catchUp.current ? <p className="catchup-current"><span className="micro">YOU’RE PART-WAY THROUGH</span> {catchUp.current.title} <small>(ch. {catchUp.current.chapters})</small></p> : null}
        </article>
        {catchUp.earlier.length ? <details className="catchup-earlier"><summary>Earlier arcs ({catchUp.earlier.length})</summary>
          <ul>{catchUp.earlier.map((a) => <li key={a.id}><button className="place-link" type="button" onClick={() => onOpen('arc', a.id)}>{a.name} <small>Ch. {a.chapters[0]}–{a.chapters[1]}</small><ArrowRight size={14} /></button></li>)}</ul>
        </details> : null}
      </> : null}
      <p className="catchup-note">Episode numbers map to chapters exactly at arc level and are estimated within an arc{mode === 'anime' ? `; the chart covers episodes 1–${LATEST_MAPPED_EPISODE}` : ''}.</p>
    </div>}
  </section>;
}
