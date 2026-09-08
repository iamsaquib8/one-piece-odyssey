import {lazy,Suspense,useEffect,useMemo,useRef,useState,type KeyboardEvent,type PointerEvent as ReactPointerEvent} from 'react';
import {ArrowLeft,ArrowRight,Bookmark,BookmarkCheck,BookOpen,Check,ChevronLeft,ChevronRight,Compass,Flag,Focus,Layers,MapPin,Maximize2,Minimize2,Minus,Pause,Play,Plus,RotateCw,Search,Ship,Wind,X} from 'lucide-react';
import type {ReaderState,Route,View} from '../types';
import {chapterLabel} from '../data/arc-index';
import {connections} from '../data/connections';
import {useReaderCatalog} from '../data/reader-catalog';
import {useReadingHorizon} from '../reading-horizon';
import {AtlasBackdrop} from './AtlasBackdrop';
import {MapIsland} from './PixelScene';
import {Scene} from './Scene';
import {ATLAS_HEIGHT,ATLAS_WIDTH,HOME_CAMERA,atlasPlaces as editionAtlasPlaces,clampCamera,regionCameras,zoomAt,type AtlasPlace,type Camera} from './atlas-model';
import '../atlas.css';

const GlobeView=lazy(()=>import('./GlobeView'));

interface Props {motion:boolean;reader:ReaderState;onOpen:(kind:NonNullable<Route['kind']>,id:string)=>void;onNavigate:(view:View)=>void;onSave:(id:string)=>void;route:Route}
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f’']/g,'').toLowerCase().replaceAll('-',' ');
const connectionPath=(a:{x:number;y:number},b:{x:number;y:number},bend=0)=>`M${a.x} ${a.y} Q${(a.x+b.x)/2} ${(a.y+b.y)/2-bend} ${b.x} ${b.y}`;
const regionLabel=(region:string)=>({'east-blue':'East Blue',paradise:'Paradise',sky:'Sky seas','red-line':'Red Line','calm-belt':'Calm Belt','new-world':'New World',other:'Elsewhere'}[region]||region);
export default function WorldAtlas({motion,reader,onOpen,onNavigate,onSave,route}:Props){
  const horizon=useReadingHorizon();
  const catalog=useReaderCatalog();
  const atlasPlaces=useMemo(()=>{
    const locationsById=new Map(catalog.locations.map(location=>[location.id,location]));
    return editionAtlasPlaces.flatMap(place=>{
      const location=locationsById.get(place.id);
      return location?[{...place,...location} as AtlasPlace]:[];
    });
  },[catalog.locations]);
  const placeById=useMemo(()=>new Map(atlasPlaces.map(place=>[place.id,place])),[atlasPlaces]);
  const voyageStops=useMemo(()=>catalog.arcs.flatMap(arc=>{
    const place=arc.locationIds.map(id=>placeById.get(id)).find(Boolean);
    return place?[{arc,place}]:[];
  }),[catalog.arcs,placeById]);
  const allowedPlaceIds=useMemo(()=>new Set(atlasPlaces.map(place=>place.id)),[atlasPlaces]);
  const routeConnections=useMemo(()=>connections.filter(connection=>{
    if(!allowedPlaceIds.has(connection.from)||!allowedPlaceIds.has(connection.to))return false;
    if(horizon===null)return true;
    if(connection.kind!=='voyage')return false;
    const chapters=[...connection.label.matchAll(/\d+/g)].map(match=>Number(match[0]));
    return chapters.length>0&&Math.max(...chapters)<=horizon;
  }),[allowedPlaceIds,horizon]);
  const [rotating,setRotating]=useState(false);
  const [front,setFront]=useState('Paradise');
  const [mode,setMode]=useState<'globe'|'chart'>('globe');
  const [focusToken,setFocusToken]=useState(()=>new URLSearchParams(location.search).has('mapPlace')?1:0);
  const [resetToken,setResetToken]=useState(0);
  const [camera,setCamera]=useState<Camera>(()=>clampCamera(history.state?.atlas?.camera||HOME_CAMERA));
  const [selected,setSelected]=useState(()=>{
    const requested=new URLSearchParams(location.search).get('mapPlace');
    if(horizon===null)return requested||'water-seven';
    return requested&&placeById.has(requested)?requested:atlasPlaces[0]?.id??'';
  });
  const [hovered,setHovered]=useState<string|null>(null);
  const [query,setQuery]=useState('');
  const [region,setRegion]=useState('all');
  const [tab,setTab]=useState<'place'|'list'>('place');
  const [layers,setLayers]=useState({voyage:true,geography:false,story:false,labels:true});
  const [layerMenu,setLayerMenu]=useState(false);
  const [expanded,setExpanded]=useState(false);
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [visible,setVisible]=useState(true);
  const [dragging,setDragging]=useState(false);
  const [size,setSize]=useState({width:1000,height:630});
  const svgRef=useRef<SVGSVGElement>(null);
  const panelRef=useRef<HTMLDivElement>(null);
  const layerButton=useRef<HTMLButtonElement>(null);
  const cameraRef=useRef(camera);cameraRef.current=camera;
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const gesture=useRef<{start:{x:number;y:number};camera:Camera;distance?:number}|null>(null);
  const moved=useRef(false);
  const frameRef=useRef(0);
  const place=placeById.get(selected);
  const stop=voyageStops[step];
  const effectiveMotion=motion&&visible&&!route.kind;
  const zoom=camera.zoom,w=ATLAS_WIDTH/zoom,h=ATLAS_HEIGHT/zoom;
  const scale=Math.min(size.width/w,size.height/h);
  const markerScale=Math.min(1.3,Math.max(.64,1/zoom));
  const filtered=useMemo(()=>atlasPlaces.filter(p=>{
    const inRegion=region==='all'||p.region===region;
    return inRegion&&(!query.trim()||normalize(`${p.name} ${p.description} ${p.region} ${p.landmarks.join(' ')}`).includes(normalize(query.trim())));
  }),[query,region]);
  const visiblePlaces=atlasPlaces.filter(p=>p.major||p.id===selected||(zoom>=2.5&&(!place||p.parentId===place.id||p.parentId===place.parentId)));
  const sublocations=place?atlasPlaces.filter(p=>p.parentId===(place.parentId||place.id)):[];
  useEffect(()=>{
    if(horizon===null||placeById.has(selected))return;
    setSelected(atlasPlaces[0]?.id??'');
    setStep(0);
    setPlaying(false);
  },[atlasPlaces,horizon,placeById,selected]);
  useEffect(()=>{
    if(!svgRef.current)return;
    const ro=new ResizeObserver(([e])=>setSize({width:e.contentRect.width,height:e.contentRect.height}));ro.observe(svgRef.current);
    const io=new IntersectionObserver(([e])=>setVisible(e.isIntersecting));io.observe(svgRef.current);
    return ()=>{ro.disconnect();io.disconnect();cancelAnimationFrame(frameRef.current);};
  },[mode]);
  useEffect(()=>{
    if(!selected)return;
    const t=setTimeout(()=>{
      const url=new URL(location.href);url.searchParams.set('mapPlace',selected);
      history.replaceState({...history.state,atlas:{camera,selected}},'',url);
    },180);
    return ()=>clearTimeout(t);
  },[camera,selected]);
  useEffect(()=>{
    if(!expanded)return;
    const previous=document.body.style.overflow;document.body.style.overflow='hidden';
    const esc=(e:globalThis.KeyboardEvent)=>{if(e.key==='Escape'&&!route.kind){setExpanded(false);}};
    window.addEventListener('keydown',esc);
    return ()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',esc);};
  },[expanded,route.kind]);
  useEffect(()=>{if(!effectiveMotion){setPlaying(false);setRotating(false);}},[effectiveMotion]);
  useEffect(()=>{
    if(!playing)return;
    const timer=setTimeout(()=>{
      if(step>=voyageStops.length-1){setPlaying(false);return;}
      chooseStop(step+1);
    },3200);
    return ()=>clearTimeout(timer);
  },[playing,step]);
  useEffect(()=>{
    const svg=svgRef.current;if(!svg)return;
    const wheel=(e:WheelEvent)=>{
      if(!(e.ctrlKey||e.metaKey))return;
      e.preventDefault();cancelAnimationFrame(frameRef.current);
      const world=worldPoint(e.clientX,e.clientY);
      setCamera(c=>zoomAt(c,c.zoom*Math.exp(-e.deltaY*.008),world));
    };
    svg.addEventListener('wheel',wheel,{passive:false});return ()=>svg.removeEventListener('wheel',wheel);
  },[mode]);
  function moveTo(next:Camera,animate=true){
    cancelAnimationFrame(frameRef.current);const target=clampCamera(next);
    if(mode==='globe'||!animate||!effectiveMotion){setCamera(target);return;}
    const from=cameraRef.current,start=performance.now();
    const frame=(now:number)=>{const t=Math.min(1,(now-start)/450),k=1-(1-t)**3;setCamera({x:from.x+(target.x-from.x)*k,y:from.y+(target.y-from.y)*k,zoom:from.zoom+(target.zoom-from.zoom)*k});if(t<1)frameRef.current=requestAnimationFrame(frame);};
    frameRef.current=requestAnimationFrame(frame);
  }
  function selectPlace(p:AtlasPlace,focus=true){setPlaying(false);setSelected(p.id);setTab('place');setHovered(null);if(focus){moveTo({x:p.x,y:p.y,zoom:mode==='globe'?1.7:Math.max(2.3,cameraRef.current.zoom)});setFocusToken(t=>t+1);}}
  function chooseStop(index:number){
    if(!voyageStops.length)return;
    const n=Math.max(0,Math.min(voyageStops.length-1,index));setStep(n);
    const p=voyageStops[n].place;setSelected(p.id);setTab('place');moveTo({x:p.x,y:p.y,zoom:mode==='globe'?1.6:2.1});setFocusToken(t=>t+1);
  }
  function worldPoint(clientX:number,clientY:number){
    const matrix=svgRef.current?.getScreenCTM();if(!matrix)return {x:1200,y:700};
    const point=new DOMPoint(clientX,clientY).matrixTransform(matrix.inverse());return {x:point.x,y:point.y};
  }
  function beginGesture(){
    const pts=[...pointers.current.values()];if(!pts.length){gesture.current=null;return;}
    const start=pts.length>1?{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2}:pts[0];
    gesture.current={start,camera:cameraRef.current,...(pts.length>1?{distance:Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y)}:{})};
  }
  function pointerDown(e:ReactPointerEvent<SVGSVGElement>){
    if(e.button!==0)return;
    cancelAnimationFrame(frameRef.current);setPlaying(false);pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});moved.current=false;beginGesture();
    // Capture only the background; capturing a landmark retargets its click to the canvas.
    if(!(e.target as Element).closest('[data-place]'))e.currentTarget.setPointerCapture(e.pointerId);
  }
  function pointerMove(e:ReactPointerEvent<SVGSVGElement>){
    if(!pointers.current.has(e.pointerId)||!gesture.current)return;
    pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const pts=[...pointers.current.values()],g=gesture.current;
    const point=pts.length>1?{x:(pts[0].x+pts[1].x)/2,y:(pts[0].y+pts[1].y)/2}:pts[0];
    const dx=point.x-g.start.x,dy=point.y-g.start.y;
    if(Math.hypot(dx,dy)>4||pts.length>1){moved.current=true;setDragging(true);}
    if(!moved.current)return;
    const baseScale=Math.min(size.width/(ATLAS_WIDTH/g.camera.zoom),size.height/(ATLAS_HEIGHT/g.camera.zoom));
    let next={...g.camera,x:g.camera.x-dx/baseScale,y:g.camera.y-dy/baseScale};
    if(pts.length>1&&g.distance){const distance=Math.hypot(pts[1].x-pts[0].x,pts[1].y-pts[0].y);next=zoomAt(next,g.camera.zoom*distance/g.distance,worldPoint(point.x,point.y));}
    setCamera(clampCamera(next));
  }
  function pointerUp(e:ReactPointerEvent<SVGSVGElement>){pointers.current.delete(e.pointerId);if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);beginGesture();if(!pointers.current.size)setDragging(false);}
  function chooseRegion(id:string){const preset=regionCameras.find(r=>r.id===id);if(!preset)return;setRegion(id);setPlaying(false);setResetToken(t=>t+1);moveTo(mode==='globe'?{...preset.camera,zoom:1}:preset.camera);}
  function keyDown(e:KeyboardEvent<SVGSVGElement>){
    if(e.target!==e.currentTarget)return;const c=cameraRef.current,delta=130/c.zoom;
    const keyMoves:Record<string,Camera>={ArrowLeft:{...c,x:c.x-delta},ArrowRight:{...c,x:c.x+delta},ArrowUp:{...c,y:c.y-delta},ArrowDown:{...c,y:c.y+delta},'+':{...c,zoom:c.zoom+.5},'=':{...c,zoom:c.zoom+.5},'-':{...c,zoom:c.zoom-.5},'0':HOME_CAMERA,Home:HOME_CAMERA};
    if(keyMoves[e.key]){e.preventDefault();moveTo(keyMoves[e.key]);}
  }
  if(!atlasPlaces.length||!stop)return <section className="atlas-page" aria-labelledby="world-title">
    <div className="atlas-page-heading"><div><span className="micro">THE WORLD AT YOUR FINGERTIPS</span><h1 id="world-title">The chart begins with your voyage.</h1><p>Choose a completed arc in the reading horizon to reveal its islands and route.</p></div><button className="button paper" onClick={()=>onNavigate('journey')}><Compass size={17}/> Back to the voyage</button></div>
    <div className="atlas-empty"><Compass size={42}/><h2>No places charted yet.</h2><p>Finish your first arc, then return to explore its field notes.</p><button className="button" onClick={()=>onNavigate('journey')}>Start the voyage</button></div>
  </section>;
  return <section className="atlas-page" aria-labelledby="world-title">
    <div className="atlas-page-heading"><div><span className="micro">THE WORLD AT YOUR FINGERTIPS</span><h1 id="world-title">Chart your own course.</h1><p>Follow a route. Find an island. Get a little lost.</p></div><button className="button paper" onClick={()=>onNavigate('journey')}><Compass size={17}/> Back to the voyage</button></div>
    <div ref={panelRef} className={`atlas-shell ${expanded?'atlas-expanded':''}`} data-moving={dragging||playing}>
      <div className="atlas-toolbar"><div className="atlas-title"><Compass size={21}/><strong>WORLD ATLAS</strong><span>VOL. 01</span></div><div className="atlas-projection" role="group" aria-label="Map projection"><button className={mode==='globe'?'active':''} aria-pressed={mode==='globe'} onClick={()=>{setMode('globe');setVisible(true);}}>3D globe</button><button className={mode==='chart'?'active':''} aria-pressed={mode==='chart'} onClick={()=>setMode('chart')}>Flat chart</button></div><nav aria-label="Map regions">{regionCameras.map(r=><button key={r.id} className={region===r.id?'active':''} aria-pressed={region===r.id} onClick={()=>chooseRegion(r.id)}>{r.label}</button>)}</nav><select className="atlas-region-select" aria-label="Sea region" value={region} onChange={e=>chooseRegion(e.target.value)}>{regionCameras.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select><button className="atlas-icon" aria-label={expanded?'Exit expanded map':'Expand map'} onClick={()=>setExpanded(x=>!x)}>{expanded?<Minimize2 size={18}/>:<Maximize2 size={18}/>}</button></div>
      <div className="atlas-body"><div className="atlas-canvas-column">
<div className="atlas-map-tools">          <div className="atlas-map-status"><strong>{mode==='globe'?front:'Flat chart'}</strong><span>Schematic world</span></div>
          <div className="atlas-tool-buttons"><button ref={layerButton} className={`atlas-icon ${layerMenu?'active':''}`} aria-label="Map layers" aria-expanded={layerMenu} onClick={()=>setLayerMenu(x=>!x)}><Layers size={18}/></button><button className="atlas-icon" aria-label="Zoom in" disabled={camera.zoom>=3.99} onClick={()=>moveTo({...cameraRef.current,zoom:Math.round((cameraRef.current.zoom+.5)*2)/2},false)}><Plus size={20}/></button><span className="atlas-zoom">{Math.round(zoom*100)}%</span><button className="atlas-icon" aria-label="Zoom out" disabled={camera.zoom<=1.01} onClick={()=>moveTo({...cameraRef.current,zoom:Math.round((cameraRef.current.zoom-.5)*2)/2},false)}><Minus size={20}/></button><button className="atlas-icon" aria-label="Reset view" onClick={()=>{setPlaying(false);setRegion('all');setResetToken(t=>t+1);moveTo(HOME_CAMERA,false);}}><Focus size={18}/></button>{mode==='globe'?<button className={`atlas-icon ${rotating?'active':''}`} aria-label={rotating?'Stop rotation':'Auto rotate'} aria-pressed={rotating} disabled={!effectiveMotion} onClick={()=>setRotating(v=>!v)}><RotateCw size={18}/></button>:null}</div>
</div>          {layerMenu?<div className="atlas-layers" onKeyDown={e=>{if(e.key==='Escape'){e.stopPropagation();setLayerMenu(false);layerButton.current?.focus();}}}><div><strong>Chart layers</strong><button aria-label="Close map layers" className="atlas-icon" onClick={()=>setLayerMenu(false)}><X size={15}/></button></div>{([['voyage','Voyage route'],['geography','Physical connections'],['story','Story connections'],['labels','Island labels']] as const).map(([key,label])=><label key={key}><span className={`layer-swatch ${key}`}/><span>{label}</span><input type="checkbox" checked={layers[key]} onChange={()=>setLayers(v=>({...v,[key]:!v[key]}))}/></label>)}</div>:null}
        <div className="atlas-canvas-wrap" data-ambient={effectiveMotion?'on':'off'}>
          {mode==='globe'?<Suspense fallback={<div className="globe-loading" role="status"><Compass/> Building the globe…</div>}><GlobeView key={[...allowedPlaceIds].join('|')} places={atlasPlaces} connections={routeConnections} fullEdition={horizon===null} rotating={rotating} onRegionChange={setFront} onZoom={z=>setCamera(c=>Math.abs(c.zoom-z)<.005?c:{...c,zoom:z})} selected={selected} onSelect={p=>selectPlace(p,false)} zoom={camera.zoom} region={region} focusToken={focusToken} resetToken={resetToken} motion={effectiveMotion} layers={layers} onFallback={()=>setMode('chart')}/></Suspense>:<svg ref={svgRef} className={`atlas-canvas ${dragging?'is-dragging':''}`} viewBox={`${camera.x-w/2} ${camera.y-h/2} ${w} ${h}`} tabIndex={0} role="group" aria-label="Interactive world map. Arrow keys to pan, plus and minus to zoom, zero to reset." onKeyDown={keyDown} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onPointerLeave={e=>{if(!e.currentTarget.hasPointerCapture(e.pointerId))pointerUp(e);}}>
            <title>Schematic map of the One Piece world</title><desc>The Grand Line is unwrapped with two crossings of the same Red Line. Positions, distances, island scales and narrative routes are illustrative. Sky and underwater scenes are inset views.</desc>
            <AtlasBackdrop/>
            <g fill="none" strokeLinecap="round" aria-hidden="true">
              {layers.voyage&&routeConnections.filter(c=>c.kind==='voyage').map((c,i)=>{const a=placeById.get(c.from),b=placeById.get(c.to);if(!a||!b)return null;return <path key={i} className="atlas-route" d={connectionPath(a,b,28)} stroke="#e8c774" strokeWidth={2.2/scale} strokeDasharray={`${5/scale} ${7/scale}`} opacity={selected===a.id||selected===b.id?1:.55}/>;})}
              {layers.story&&routeConnections.filter(c=>c.kind==='narrative').map((c,i)=>{const a=placeById.get(c.from),b=placeById.get(c.to);return a&&b?<path key={i} d={connectionPath(a,b,120)} stroke="#bb9cf6" strokeWidth={2/scale} strokeDasharray={`${2/scale} ${7/scale}`}><title>{c.label}</title></path>:null;})}
              {layers.geography&&horizon===null&&[['sabaody-archipelago','fish-man-island'],['mary-geoise','fish-man-island'],['water-seven','enies-lobby']].map(([aId,bId])=>{const a=placeById.get(aId),b=placeById.get(bId);return a&&b?<path key={aId} d={connectionPath(a,b)} stroke="#74e1cd" strokeWidth={2.5/scale}/>:null;})}
            </g>
            {visiblePlaces.map(p=>{
              const active=selected===p.id,hover=hovered===p.id;
              const matching=region==='all'||region===p.region;
              const label=active||hover||layers.labels&&zoom>=2.5&&p.major&&Math.hypot((p.x-camera.x)*scale,(p.y-camera.y)*scale)<100;
              const ms=(p.major?1:.72)*markerScale;
              const title=p.name.replace('Kingdom of ','').replace('Archipelago','Arch.').replace('White Sea and Heaven’s Gate','White Sea');
              return <g key={p.id} data-place={p.id} className={`atlas-pin ${active?'is-active':''}`} transform={`translate(${p.x} ${p.y})`} tabIndex={0} role="button" aria-label={`Select ${p.name}`} aria-pressed={active} opacity={matching?1:.35} onPointerEnter={()=>setHovered(p.id)} onPointerLeave={()=>setHovered(null)} onFocus={()=>setHovered(p.id)} onBlur={()=>setHovered(null)} onClick={e=>{e.stopPropagation();if(!moved.current)selectPlace(p,false);}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectPlace(p,false);}}}>
                <rect x={-Math.max(70*ms,22/scale)} y={-Math.max(70*ms,22/scale)} width={Math.max(140*ms,44/scale)} height={Math.max(90*ms,44/scale)} fill="transparent"/>
                <g className="atlas-island-art" transform={`translate(${-80*ms} ${-84*ms}) scale(${ms*.5})`} pointerEvents="none"><MapIsland locationId={p.id}/></g>
                <ellipse className="atlas-pin-ring" rx={(active?44:32)*ms} ry={9*ms} cy={-9*ms} fill="none" stroke={active?'#ffe18b':'#96d4be'} strokeWidth={active?2/scale:1/scale} strokeOpacity={active?1:.3}/>
                {reader.explored.some(id=>p.arcIds.includes(id))?<circle cx={32*ms} cy={-40*ms} r={6/scale} fill="#70ddba" stroke="#10243a" strokeWidth={1/scale}/>:null}
                {label?<g className="atlas-pin-label" transform={`translate(0 ${17/scale})`} pointerEvents="none"><text textAnchor="middle" fontSize={(active?12:10.5)/scale} fontWeight={active?900:800} stroke="#082e3e" strokeWidth={5/scale} paintOrder="stroke" fill={active?'#ffe18b':'#fff4d8'}>{title}</text>{active?<path d={`M${-30/scale} ${7/scale}h${60/scale}`} stroke="#e8c774" strokeWidth={1/scale}/>:null}</g>:null}
              </g>;
            })}
            <g className="atlas-voyage-ship" transform={`translate(${stop.place.x-35} ${stop.place.y+42}) scale(${1/zoom})`} aria-hidden="true"><path d="M-20 0h40L9 17H-10Z" fill="#c28a4e" stroke="#082b37" strokeWidth="3"/><path d="M0 0V-36H4V0" fill="#ecc98a"/><path d="M-2-32L-22-4H-2ZM5-30L26-4H5Z" fill={stop.arc.chapters[0]>=435?'#f7b565':'#fff8e7'}/><circle cx="5" cy="-15" r="4" fill="#10243a"/></g>
          </svg>}


        </div>
          <div className="atlas-map-help">{place?<button className="atlas-selection" aria-label={`Open ${place.name} notes`} onClick={()=>onOpen('location',place.id)}><MapPin size={16}/><strong>{place.name}</strong><ArrowRight size={16}/></button>:null}<span className="atlas-map-hint">{mode==='globe'?'Drag to orbit · pinch or scroll to zoom':'Drag to explore · pinch to zoom · Ctrl/⌘ + scroll'}</span><button className="atlas-find-place" onClick={()=>{setTab('list');document.querySelector<HTMLInputElement>('.atlas-search input')?.focus();}}><Search size={16}/> Find an island</button></div>
        <div className="atlas-voyage-player"><div className="voyage-player-controls"><button className="atlas-icon" aria-label="Previous voyage stop" disabled={step===0} onClick={()=>{setPlaying(false);chooseStop(step-1);}}><ChevronLeft size={20}/></button><button className="atlas-icon play-voyage" aria-label={playing?'Pause voyage':'Play voyage'} disabled={!effectiveMotion} onClick={()=>{if(!playing){chooseStop(step===voyageStops.length-1?0:step);}setPlaying(x=>!x);}}>{playing?<Pause size={19}/>:<Play size={19}/>}</button><button className="atlas-icon" aria-label="Next voyage stop" disabled={step===voyageStops.length-1} onClick={()=>{setPlaying(false);chooseStop(step+1);}}><ChevronRight size={20}/></button></div><div className="voyage-scrubber"><div><span><Ship size={13}/>{horizon!==null&&horizon<41?'VOYAGE':stop.arc.chapters[0]>=435?'THOUSAND SUNNY':'GOING MERRY'}<b>·</b><strong>{stop.arc.name}</strong></span><span>{step+1} / {voyageStops.length}</span></div><input aria-label="Voyage chapter stop" type="range" min="0" max={voyageStops.length-1} step="1" value={step} onChange={e=>{setPlaying(false);chooseStop(Number(e.target.value));}}/><div className="scrubber-labels"><span>ROMANCE DAWN</span><span>{chapterLabel(stop.arc)}</span><span>{voyageStops.at(-1)?.arc.name.toUpperCase()}</span></div></div><button className="atlas-read-stop" onClick={()=>onOpen('arc',stop.arc.id)}><BookOpen size={18}/><span>Read arc</span><ArrowRight size={15}/></button></div>
      </div>
      <aside className="atlas-inspector" aria-label="Atlas field notes"><div className="atlas-inspector-tabs"><button className={tab==='place'?'active':''} onClick={()=>setTab('place')}><MapPin size={15}/> Field notes</button><button className={tab==='list'?'active':''} onClick={()=>setTab('list')}><Search size={15}/> All places <small>{atlasPlaces.length}</small></button></div>
        <label className="atlas-search"><Search size={17}/><input type="search" placeholder="Find an island, a ship, a sea…" aria-label="Find a place" value={query} onChange={e=>{setQuery(e.target.value);setTab('list');}}/>{query?<button aria-label="Clear place search" onClick={()=>setQuery('')}><X size={16}/></button>:null}</label>
        <div className="atlas-inspector-scroll">
          {tab==='list'?<><p className="atlas-list-count">{filtered.length} places {region!=='all'?`in ${regionLabel(region)}`:'across the known seas'}</p><ul className="atlas-place-list">{filtered.map(p=><li key={p.id}><button className={selected===p.id?'active':''} onClick={()=>selectPlace(p)}><span className={`place-type-dot ${p.region}`}/><span><strong>{p.name}</strong><small>{regionLabel(p.region)} · {p.kind}</small></span><ChevronRight size={16}/></button></li>)}</ul>{!filtered.length?<div className="atlas-empty"><Compass size={36}/><h2>No place on this chart.</h2><p>Try a shorter name or search all seas.</p><button className="button small" onClick={()=>{setQuery('');setRegion('all');}}>Show all places</button></div>:null}</>:
          place?<div className="atlas-field-notes" key={place.id}><div className="atlas-note-title"><div><span className="micro">{regionLabel(place.region)}</span><h2>{place.name}</h2></div><button className="atlas-icon" aria-label={`${reader.saved.includes(`location:${place.id}`)?'Unsave':'Save'} ${place.name}`} aria-pressed={reader.saved.includes(`location:${place.id}`)} onClick={()=>onSave(`location:${place.id}`)}>{reader.saved.includes(`location:${place.id}`)?<BookmarkCheck size={19}/>:<Bookmark size={19}/>}</button></div><Scene locationId={place.id} name={place.name} eager/><p>{place.description}</p><dl className="atlas-location-meta"><div><dt><Compass size={14}/> Region</dt><dd>{regionLabel(place.region)}</dd></div><div><dt><Flag size={14}/> Setting</dt><dd>{place.kind}</dd></div><div><dt><BookOpen size={14}/> Chapters</dt><dd>{place.chapters.replace('Ch. ','')}</dd></div></dl><button className="atlas-primary" onClick={()=>onOpen('location',place.id)}><BookOpen size={17}/> Open field notes <ArrowRight size={17}/></button><button className="atlas-focus" disabled={mode==='globe'&&place.id==='god-valley'} onClick={()=>selectPlace(place)}><Focus size={15}/> Centre on this place</button><div className="atlas-landmarks"><span className="micro">LOOK FOR</span>{place.landmarks.map(l=><span key={l}><MapPin size={12}/>{l}</span>)}</div>{sublocations.length>0?<div className="atlas-nearby"><span className="micro">IN THIS SETTING</span>{sublocations.filter(p=>p.id!==place.id).map(p=><button key={p.id} onClick={()=>selectPlace(p)}>{p.name}<ChevronRight size={14}/></button>)}</div>:null}<div className="atlas-related-arcs"><span className="micro">IN THE MANGA</span>{place.arcIds.map(id=>{const a=catalog.arcs.find(x=>x.id===id);return a?<button key={id} onClick={()=>onOpen('arc',id)}><span>{a.name}<small>{chapterLabel(a)}</small></span>{reader.explored.includes(id)?<Check size={15}/>:<ArrowRight size={15}/>}</button>:null;})}</div></div>:<div className="atlas-empty"><Compass size={36}/><h2>Uncharted destination</h2><p>This place is outside the current reading horizon.</p><button className="button" onClick={()=>{setSelected(atlasPlaces[0]?.id??'');setTab('list');}}>Browse known places</button></div>}
        </div>
      </aside></div>
      <div className="atlas-bottom-note"><span><Wind size={14}/> Schematic geography · not canonical coordinates or scale</span><span>Gold = voyage · {reader.motion?'Motion follows your device settings':'Animations off'}</span></div>
    </div>
    {horizon===null?<div className="atlas-world-notes"><div><Compass size={24}/><h2>One planet. Extraordinary seas.</h2><p>The Red Line and Grand Line divide the world into four Blues. This chart unfolds the voyage; the two Red Line crossings belong to the same continent.</p></div><div><Wind size={24}/><h2>The sea has its own rules.</h2><p>Calm Belts flank the Grand Line. Sky routes, underwater passages, flashbacks and moving settings are shown as schematic connections, never precise coordinates.</p></div><div><Flag size={24}/><h2>Some horizons remain unknown.</h2><p>Laugh Tale has no confirmed position on this chart, and the seas past Elbaf are unmapped. The map leaves unrevealed geography to the manga.</p></div></div>:null}
    <button className="text-link light" onClick={()=>onNavigate('journey')}><ArrowLeft size={15}/> Follow the full manga journey</button>
  </section>;
}
