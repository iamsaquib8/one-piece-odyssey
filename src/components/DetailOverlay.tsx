import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Bookmark, BookmarkCheck, X, ArrowLeft, ArrowRight, MapPin, ExternalLink, BookOpen, Compass } from 'lucide-react';
import { motion as animate, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { arcs } from '../data/arcs';
import { locations } from '../data/locations';
import { characters } from '../data/characters';
import { coverage } from '../data/coverage';
import type { ReaderState, Route } from '../types';
import { Scene } from './Scene';
import { ArcDetail } from './arc/ArcDetail';

interface Props {route:Route;reader:ReaderState;motion:boolean;onClose:()=>void;onOpen:(kind:NonNullable<Route['kind']>,id:string,beat?:string)=>void;onSave:(id:string,at?:HTMLElement)=>void;onExplore:(id:string,at?:HTMLElement)=>void;onBeat:(id:string,beat:string)=>void; origin:React.RefObject<HTMLElement|null>}
export default function DetailOverlay({route,reader,motion,onClose,onOpen,onSave,onExplore,onBeat,origin}:Props){
  const arc=route.kind==='arc'?arcs.find(x=>x.id===route.id):undefined;
  const location=route.kind==='location'?locations.find(x=>x.id===route.id):undefined;
  const character=route.kind==='character'?characters.find(x=>x.id===route.id):undefined;
  const record=arc||location||character;
  const key=`${route.kind}:${route.id}`;
  const saved=reader.saved.includes(key);
  const [section,setSection]=useState('overview');
  const [activeBeat,setActiveBeat]=useState<string|null>(null);
  const [progress,setProgress]=useState(0);
  const scroller=useRef<HTMLDivElement>(null);
  const [node,setNode]=useState<HTMLDivElement|null>(null);
  const bindScroller=useCallback((n:HTMLDivElement|null)=>{scroller.current=n;setNode(n);},[]);
  const reduced=useReducedMotion();
  const live=motion&&!reduced;
  const positions=useRef(new Map<string,number>());
  useEffect(()=>{
    const el=node;
    if(!el)return;
    setSection(route.beat?'story':'overview');
    requestAnimationFrame(()=>{
      const beat=route.beat?document.getElementById(`beat-${route.beat}`):null;
      if(beat){el.scrollTop=beat.getBoundingClientRect().top-el.getBoundingClientRect().top+el.scrollTop-24;}else el.scrollTop=positions.current.get(key)||0;
    });
    return ()=>{positions.current.set(key,el.scrollTop);};
  },[key,route.beat,node]);
  useEffect(()=>{
    const el=node;
    if(!el)return;
    let frame=0;
    const ids=arc?['overview','characters','story','battles','legacy']:[];
    const update=()=>{
      frame=0;
      const max=el.scrollHeight-el.clientHeight;
      setProgress(max>0?el.scrollTop/max:0);
      if(!ids.length)return;
      const top=el.getBoundingClientRect().top;const line=el.clientHeight*0.35;
      let current=ids[0];
      for(const id of ids){const node=document.getElementById(`detail-${id}`);if(node&&node.getBoundingClientRect().top-top<=line)current=id;}
      setSection(current);
    };
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update);};
    el.addEventListener('scroll',onScroll,{passive:true});
    update();
    return ()=>{el.removeEventListener('scroll',onScroll);if(frame)cancelAnimationFrame(frame);};
  },[key,arc,node]);
  const onActiveBeat=useCallback((id:string|null)=>setActiveBeat(id),[]);
  const sections=arc?[['overview','Overview'],['characters','Cast'],['story','Voyage'],['battles','Battles'],['legacy','Legacy']]:location?[['overview','About this place'],['landmarks','Landmarks'],['connections','Story connections']]:[['overview','Crew profile'],['milestones','Milestones'],['bounties','Bounty history']];
  function goSection(id:string){setSection(id);document.getElementById(`detail-${id}`)?.scrollIntoView({behavior:live?'smooth':'instant',block:'start'});}
  function goBeat(id:string){document.getElementById(`beat-${id}`)?.scrollIntoView({behavior:live?'smooth':'instant',block:'center'});}
  return <Dialog.Root open onOpenChange={open=>{if(!open)onClose();}}>
    <Dialog.Portal><Dialog.Overlay asChild><animate.div className="dialog-backdrop" initial={live?{opacity:0}:false} animate={{opacity:1}} transition={{duration:.25}}/></Dialog.Overlay>
      <Dialog.Content asChild onOpenAutoFocus={e=>{e.preventDefault();scroller.current?.focus({preventScroll:true});}} onCloseAutoFocus={e=>{e.preventDefault();origin.current?.focus({preventScroll:true});}} aria-describedby="detail-description"><animate.div className="detail-dialog" initial={live?{opacity:0,y:40,scale:.96,rotate:-.6}:false} animate={{opacity:1,y:0,scale:1,rotate:0}} transition={{type:'spring',stiffness:260,damping:26,mass:.9}}>
        <Dialog.Title className="sr-only">{record?.name||'Uncharted destination'}</Dialog.Title>
        <Dialog.Description id="detail-description" className="sr-only">Manga spoilers. Read story details and save this destination to your logbook.</Dialog.Description>
        <header className="detail-header"><div><span className="micro">{route.kind==='arc'?'THE ARC LOG':route.kind==='location'?'ISLAND FIELD NOTES':'THE STRAW HAT CREW'}</span><strong>{record?.name||'Uncharted destination'}</strong></div><div className="detail-actions">{record&&<button className={`icon-button ${saved?'selected':''}`} aria-label={saved?`Unsave ${record.name}`:`Save ${record.name}`} aria-pressed={saved} onClick={e=>onSave(key,e.currentTarget)}>{saved?<BookmarkCheck/>:<Bookmark/>}</button>}<Dialog.Close asChild><button className="icon-button" aria-label="Close details"><X/></button></Dialog.Close></div></header>
        {arc?<div className="detail-progress" aria-hidden="true"><span style={{width:'100%',transform:`scaleX(${progress})`,transition:'none'}}/></div>:null}
        <div className="detail-layout"><nav className="detail-nav" aria-label="Detail sections">{sections.map(([id,label])=><Fragment key={id}><button className={section===id?'active':''} onClick={()=>goSection(id)}>{label}<ArrowRight size={14}/></button>{arc&&id==='story'&&arc.beats.length>1?<ol className="nav-beats">{arc.beats.map(b=><li key={b.id}><button className={activeBeat===b.id?'active':''} onClick={()=>goBeat(b.id)} aria-current={activeBeat===b.id?'true':undefined}>{b.title}</button></li>)}</ol>:null}</Fragment>)}{arc&&<div className="reader-chapters"><BookOpen size={20}/><span>CHAPTERS</span><strong>{arc.chapters[0]}–{arc.chapters[1]}</strong><a href={arc.sources[0]?.url||coverage.source} target="_blank" rel="noreferrer">Read officially <ExternalLink size={12}/></a></div>}</nav>
          <div className="detail-scroller" ref={bindScroller} tabIndex={-1}>
            <animate.div key={key} initial={live?{opacity:0,y:18,rotate:0.4}:false} animate={{opacity:1,y:0,rotate:0}} transition={{duration:.24}}>
              {!record?<div className="empty-state"><Compass size={48}/><h2>This destination isn’t on the chart.</h2><p>The link may be incomplete or refer to a place outside this edition.</p><button className="button" onClick={onClose}><ArrowLeft size={17}/> Back to the explorer</button></div>:null}
              {arc&&<ArcDetail arc={arc} route={route} reader={reader} motion={live} scroller={scroller} onOpen={onOpen} onExplore={onExplore} onBeat={onBeat} onActiveBeat={onActiveBeat}/>}
              {location&&<><div className="detail-panorama"><Scene locationId={location.id} name={location.name} eager/></div><article className="reading-copy"><section id="detail-overview"><span className="micro">{location.region.replaceAll('-',' ')} · {location.kind}</span><h2>{location.name}</h2><p className="lead">{location.description}</p><p>Chapter references: {location.chapters}. Map placement is schematic; it does not establish exact coordinates.</p></section><section id="detail-landmarks"><h2>Look a little closer</h2><ul className="landmark-list">{location.landmarks.map((l,i)=><animate.li key={l} initial={live?{opacity:0,x:-14}:false} animate={{opacity:1,x:0}} transition={{delay:.15+i*.08,duration:.4}}><MapPin size={18}/>{l}</animate.li>)}</ul><p>{location.art.canon}</p><aside className="editorial-note">Illustration: {location.art.interpretation}</aside></section><section id="detail-connections"><h2>Stories from this shore</h2>{location.arcIds.map(id=>{const a=arcs.find(x=>x.id===id);return a?<button className="result-row" key={id} onClick={()=>onOpen('arc',id)}><BookOpen/><span><strong>{a.name}</strong><small>Ch. {a.chapters.join('–')} · {a.premise}</small></span><ArrowRight/></button>:null;})}<div className="sources">{location.sources.map((s,i)=><a href={s.url} key={i} target="_blank" rel="noreferrer">{s.label}<ExternalLink size={13}/></a>)}</div></section></article></>}
              {character&&<article className="reading-copy crew-detail"><section id="detail-overview"><div className="wanted-portrait" style={{'--crew-color':character.color} as CSSProperties}><span>WANTED</span><div className="portrait-symbol">{character.role==='Captain'?'☠':character.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div><small>DEAD OR ALIVE</small><strong>{character.name}</strong></div><span className="micro">{character.role} · {character.epithet}</span><h2>{character.name}</h2><p className="lead">{character.description}</p><h3>The dream</h3><p>{character.dream}</p><h3>Joining the crew</h3><p>{character.recruitment}</p><button className="text-link" onClick={()=>onOpen('arc',character.arcId)}>Explore their recruitment arc <ArrowRight size={16}/></button></section><section id="detail-milestones"><h2>A life at sea</h2><ul className="milestone-list">{character.milestones.map(m=><li key={m}>{m}</li>)}</ul></section><section id="detail-bounties"><h2>Bounty history</h2><p>Known public bounties at this edition’s narrative cutoff. Bounties reflect the World Government’s assessment, not a measure of strength.</p><div className="bounty-list">{character.bounties.map((b,i)=><div key={i}><span>{b.after}</span><strong>฿ {b.amount}</strong></div>)}</div></section></article>}
            </animate.div>
          </div>
        </div>
      </animate.div></Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
