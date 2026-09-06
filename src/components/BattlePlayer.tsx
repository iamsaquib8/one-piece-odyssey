import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Swords, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion as m } from 'motion/react';
import type { Battle } from '../types';
let stopOther: (()=>void)|undefined;
export function BattlePlayer({battle,motion}:{battle:Battle;motion:boolean}){
  const [playing,setPlaying]=useState(false);
  const [frame,setFrame]=useState(0);
  const ref=useRef<HTMLDivElement>(null);
  const frames=battle.frames.length?battle.frames:[battle.stakes,battle.development,battle.outcome];
  useEffect(()=>{
    if(!motion)setPlaying(false);
  },[motion]);
  useEffect(()=>{
    if(!playing)return;
    const timeout=setTimeout(()=>{
      if(frame>=frames.length-1)setPlaying(false);
      else setFrame(x=>x+1);
    },5000/frames.length);
    return ()=>clearTimeout(timeout);
  },[playing,frame,frames.length]);
  useEffect(()=>{
    const stop=()=>{if(document.hidden)setPlaying(false);};
    document.addEventListener('visibilitychange',stop);
    const observer=new IntersectionObserver(([entry])=>{if(!entry.isIntersecting)setPlaying(false);});
    if(ref.current)observer.observe(ref.current);
    return ()=>{document.removeEventListener('visibilitychange',stop);observer.disconnect();};
  },[]);
  function step(delta:number){setPlaying(false);setFrame(f=>Math.min(frames.length-1,Math.max(0,f+delta)));}
  function onKey(e:React.KeyboardEvent){if(e.key==='ArrowRight'){e.preventDefault();step(1);}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1);}else if(e.key===' '||e.key==='Enter'){e.preventDefault();if(motion)playing?setPlaying(false):play();}}
  function play(restart=false){stopOther?.();stopOther=()=>setPlaying(false);if(restart||frame===frames.length-1)setFrame(0);setPlaying(true);}
  return <div className="battle" ref={ref}>
    <div className="battle-heading"><Swords size={22}/><div><span className="micro">BATTLE LOG · CH. {battle.chapters}</span><h3>{battle.title}</h3></div></div>
    <div className={`battle-stage frame-${frame} ${playing?'playing':''}`} role="group" aria-label="Illustrated battle sequence. Use the arrow keys to step through the frames." tabIndex={0} onKeyDown={onKey} onClick={()=>step(frame===frames.length-1?-(frames.length-1):1)}>
      <div className="battle-burst" aria-hidden="true"><span>✦</span><i/><b/></div>
      <span className="battle-frame">{String(frame+1).padStart(2,'0')} / {String(frames.length).padStart(2,'0')}</span>
      <AnimatePresence mode="wait" initial={false}><m.p key={frame} initial={motion?{opacity:0,scale:1.18,rotate:-2}:false} animate={{opacity:1,scale:1,rotate:0}} exit={motion?{opacity:0,y:-18,transition:{duration:.12}}:undefined} transition={{type:'spring',stiffness:420,damping:24}}>{frames[frame]}</m.p></AnimatePresence>
      <span className="battle-progress" aria-hidden="true">{frames.map((_,i)=><i key={i} className={i<frame?'done':i===frame?(playing?'live':'done'):''} style={{'--dur':`${5000/frames.length}ms`} as React.CSSProperties}/>)}</span>
    </div>
    <div className="battle-controls">
      <button className="button small" disabled={!motion} onClick={()=>playing?setPlaying(false):play()}>{playing?<Pause size={15}/>:<Play size={15}/>} {playing?'Pause':frame===frames.length-1?'Replay sequence':'Play sequence'}</button>
      <button className="icon-button" aria-label="Previous frame" disabled={frame===0} onClick={()=>step(-1)}><ChevronLeft size={17}/></button><button className="icon-button" aria-label="Next frame" disabled={frame===frames.length-1} onClick={()=>step(1)}><ChevronRight size={17}/></button><button className="icon-button" aria-label={`Replay ${battle.title}`} disabled={!motion} onClick={()=>play(true)}><RotateCcw size={17}/></button>
      <span>{motion?'5 SEC · NO AUDIO · TAP OR ← → TO STEP':'Animation off · step with ← → or read below'}</span>
    </div>
    <dl className="battle-copy"><dt>The stakes</dt><dd>{battle.stakes}</dd><dt>The turning point</dt><dd>{battle.development}</dd><dt>The outcome</dt><dd>{battle.outcome}</dd></dl>
  </div>;
}
