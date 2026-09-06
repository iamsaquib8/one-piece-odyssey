import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {Compass} from 'lucide-react';
import {connections} from '../data/connections';
import {globePlaceById,globePlaces,regionViews,spherePoint,type GeoPoint} from './globe-model';
import {createLandmark,planetTexture} from './globe-art';
import {layoutMapLabels,mapLabelBudget,type LabelCandidate} from './map-labels';
import type {AtlasPlace} from './atlas-model';

interface Props{rotating:boolean;onRegionChange:(region:string)=>void;selected:string;onSelect:(place:AtlasPlace)=>void;onZoom:(zoom:number)=>void;zoom:number;region:string;focusToken:number;resetToken:number;motion:boolean;layers:{voyage:boolean;geography:boolean;story:boolean;labels:boolean};onFallback:()=>void}
interface Engine{focus:(p:GeoPoint)=>void;zoom:(zoom:number)=>void;invalidate:()=>void;setMotion:(motion:boolean)=>void;setLayers:(layers:Props['layers'])=>void;select:(id:string)=>void;rotate:(value:boolean)=>void}
export default function GlobeView(props:Props){
  const host=useRef<HTMLDivElement>(null),engine=useRef<Engine|null>(null),labelRefs=useRef(new Map<string,HTMLButtonElement>());
  const current=useRef(props);current.current=props;
  const [failed,setFailed]=useState(false),[ready,setReady]=useState(false);
  useEffect(()=>{
    const el=host.current;if(!el)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{setFailed(true);return;}
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(37,1,.1,100);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.65));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.setClearColor(0x071e2d,0);
    const canvas=renderer.domElement;canvas.className='globe-webgl';canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','3D globe of the One Piece world. Drag to rotate, pinch or scroll to zoom. Arrow keys rotate; plus and minus zoom. Illustrated islands can be selected.');
    el.prepend(canvas);
    const controls=new OrbitControls(camera,canvas);controls.enablePan=false;controls.enableDamping=props.motion;controls.dampingFactor=.09;controls.rotateSpeed=.6;controls.zoomSpeed=.8;controls.minDistance=4.25;controls.maxDistance=8.6;controls.autoRotateSpeed=.35;
    camera.position.set(...spherePoint(props.focusToken?(globePlaceById.get(props.selected)||regionViews.all):regionViews.all,8.6));controls.update();
    scene.add(new THREE.HemisphereLight('#ddf4ef','#406681',2.1));
    const sun=new THREE.DirectionalLight('#fff1cf',3);sun.position.set(-3,5,8);scene.add(sun);
    const fill=new THREE.DirectionalLight('#4daec3',1);fill.position.set(4,-1,-4);scene.add(fill);
    const planet=new THREE.Mesh(new THREE.SphereGeometry(2.5,96,64),new THREE.MeshPhongMaterial({map:planetTexture(),shininess:19,specular:'#346876'}));scene.add(planet);
    // Raised, continuous meridian continent: both crossings are parts of one Red Line.
    const ridgePoints=Array.from({length:321},(_,i)=>{const a=i/320*Math.PI*2,lon=10*Math.PI/180;return new THREE.Vector3(Math.cos(a)*Math.sin(lon)*2.51,Math.sin(a)*2.51,Math.cos(a)*Math.cos(lon)*2.51);});
    const ridge=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ridgePoints,true),320,.037,5,true),new THREE.MeshStandardMaterial({color:'#b56a4d',roughness:.94}));scene.add(ridge);
    const atmosphere=new THREE.Mesh(new THREE.SphereGeometry(2.57,64,48),new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,blending:THREE.AdditiveBlending,vertexShader:'varying vec3 vN; varying vec3 vP; void main(){vN=normalize(normalMatrix*normal); vP=(modelViewMatrix*vec4(position,1.0)).xyz; gl_Position=projectionMatrix*vec4(vP,1.0);}',fragmentShader:'varying vec3 vN; varying vec3 vP; void main(){float rim=pow(1.0-abs(dot(normalize(vN),normalize(-vP))),3.0); gl_FragColor=vec4(0.18,0.68,0.85,rim*0.8);}'}));scene.add(atmosphere);
    const grid=new THREE.Group();scene.add(grid);
    const lineMaterial=new THREE.LineBasicMaterial({color:'#92d1d3',transparent:true,opacity:.11});
    for(let lat=-60;lat<=60;lat+=30){const pts=Array.from({length:129},(_,i)=>new THREE.Vector3(...spherePoint({lat,lon:i/128*360},2.508)));grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMaterial));}
    for(let lon=0;lon<360;lon+=30){const pts=Array.from({length:65},(_,i)=>new THREE.Vector3(...spherePoint({lat:-90+i/64*180,lon},2.508)));grid.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),lineMaterial));}
    for(const lat of [-21,-14,14,21]){const pts=Array.from({length:193},(_,i)=>new THREE.Vector3(...spherePoint({lat,lon:i/192*360},2.51)));scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:Math.abs(lat)===14?'#bad9bb':'#579a9d',transparent:true,opacity:.4})));}
    const landmarks=new THREE.Group();scene.add(landmarks);
    const meshes=new Map<string,THREE.Group>();
    for(const p of globePlaces.filter(p=>p.major)){
      const landmark=createLandmark(p.id,p.art.palette[2]||'#d09666');
      const position=new THREE.Vector3(...spherePoint(p,p.region==='sky'?2.74:2.51));landmark.position.copy(position);landmark.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),position.clone().normalize());
      if(p.region==='sky'){const cloud=new THREE.Mesh(new THREE.SphereGeometry(.11,12,6),new THREE.MeshStandardMaterial({color:'#f0f1d9',transparent:true,opacity:.9}));cloud.scale.set(1.6,.23,1);landmark.add(cloud);}
      landmarks.add(landmark);meshes.set(p.id,landmark);
    }
    const selectedRing=new THREE.Mesh(new THREE.TorusGeometry(.135,.006,5,48),new THREE.MeshBasicMaterial({color:'#ffe598',transparent:true,opacity:.9}));selectedRing.rotation.x=Math.PI/2;scene.add(selectedRing);
    const routeGroups={voyage:new THREE.Group(),story:new THREE.Group(),geography:new THREE.Group()};
    Object.values(routeGroups).forEach(g=>scene.add(g));
    const routeData=[...connections.filter(c=>c.kind!=='geographic'),{from:'sabaody-archipelago',to:'fish-man-island',kind:'geographic' as const,label:'Underwater passage'},{from:'mary-geoise',to:'fish-man-island',kind:'geographic' as const,label:'Above and below the Red Line'}];
    routeData.forEach(c=>{
      const a=globePlaceById.get(c.from),b=globePlaceById.get(c.to);if(!a||!b)return;
      const v1=new THREE.Vector3(...spherePoint(a,1)),v2=new THREE.Vector3(...spherePoint(b,1));
      const points=Array.from({length:40},(_,i)=>{const t=i/39;return v1.clone().lerp(v2,t).normalize().multiplyScalar(2.53+Math.sin(t*Math.PI)*(c.kind==='narrative'?.22:.06));});
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineDashedMaterial({color:c.kind==='voyage'?'#ffda7e':c.kind==='narrative'?'#c4a8fa':'#8ef3cf',dashSize:.033,gapSize:.036,transparent:true,opacity:c.kind==='voyage'?.65:.8}));line.computeLineDistances();routeGroups[c.kind==='narrative'?'story':c.kind==='geographic'?'geography':'voyage'].add(line);
    });
    let layoutScale=1,width=600,height=560,raf=0,alive=true,inView=true,animateMotion=props.motion,autoRotate=false,transition:{from:THREE.Vector3;to:THREE.Vector3;start:number}|null=null,lastFront='';
    const projected=new THREE.Vector3();
    const labelSizes=new Map<string,{width:number;height:number}>();
    function labels(){
      const candidates:LabelCandidate[]=[];
      for(const p of globePlaces.filter(p=>p.major||p.id===current.current.selected)){
        const label=labelRefs.current.get(p.id);if(!label)continue;
        const active=p.id===current.current.selected;
        const v=new THREE.Vector3(...spherePoint(p,p.region==='sky'?2.88:2.67));
        const facing=v.clone().normalize().dot(camera.position.clone().sub(v).normalize());
        projected.copy(v).project(camera);
        const x=(projected.x*.5+.5)*width,y=(-projected.y*.5+.5)*height;
        label.style.visibility='hidden';label.dataset.active=String(active);
        if(!(active||current.current.layers.labels)||facing<.35||projected.z>=1||x<12||x>width-12||y<12||y>height-20)continue;
        let measured=labelSizes.get(p.id);
        if(!measured){measured={width:label.offsetWidth,height:label.offsetHeight};labelSizes.set(p.id,measured);}
        candidates.push({id:p.id,x,y,...measured,priority:active?100:Math.round(facing*10)});
      }
      const zoom=1+(8.6-camera.position.length()/layoutScale)/1.45;
      const limit=current.current.layers.labels?mapLabelBudget(width,zoom):1;
      // At the full-world scale, only the selected island gets a label.
      const eligible=zoom<1.5?candidates.filter(c=>c.id===current.current.selected):candidates;
      for(const box of layoutMapLabels(eligible,width,height,limit)){
        const label=labelRefs.current.get(box.id)!;label.style.visibility='visible';label.style.transform=`translate(${box.left}px,${box.top}px)`;
      }
      const lon=Math.atan2(camera.position.x,camera.position.z)*180/Math.PI;
      const side=lon>10||lon< -170?'New World':'Paradise';
      if(side!==lastFront){lastFront=side;current.current.onRegionChange(side);}
    }
    function render(){
      raf=0;if(!alive||!inView||document.hidden)return;
      if(transition){
        const t=Math.min(1,(performance.now()-transition.start)/700),k=1-(1-t)**3;
        // Great-circle camera movement keeps the orbit outside the planet.
        const radius=THREE.MathUtils.lerp(transition.from.length(),transition.to.length(),k);
        const from=transition.from.clone().normalize(),to=transition.to.clone().normalize();
        const q=new THREE.Quaternion().setFromUnitVectors(from,to),partial=new THREE.Quaternion().identity().slerp(q,k);
        camera.position.copy(from.applyQuaternion(partial).multiplyScalar(radius));
        if(t===1)transition=null;
      }
      controls.update();labels();renderer.render(scene,camera);
      if(transition||autoRotate&&animateMotion)invalidate();
    }
    function invalidate(){if(alive&&inView&&!document.hidden&&!raf)raf=requestAnimationFrame(render);}
    const controlStart=()=>{transition=null;};
    const reportZoom=()=>current.current.onZoom(Math.max(1,Math.min(4,1+(8.6-camera.position.length()/layoutScale)/1.45)));
    controls.addEventListener('end',reportZoom);
    controls.addEventListener('change',invalidate);controls.addEventListener('start',controlStart);
    const ro=new ResizeObserver(([entry])=>{width=entry.contentRect.width;height=entry.contentRect.height;labelSizes.clear();const nextScale=Math.max(1,height/Math.max(width,1));camera.position.multiplyScalar(nextScale/layoutScale);layoutScale=nextScale;controls.minDistance=4.25*layoutScale;controls.maxDistance=8.6*layoutScale;transition=null;camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();renderer.setSize(width,height);invalidate();});ro.observe(el);
    const io=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;controls.autoRotate=autoRotate&&animateMotion&&inView&&!document.hidden;if(inView)invalidate();else{cancelAnimationFrame(raf);raf=0;}});io.observe(el);
    const onVisibility=()=>{controls.autoRotate=autoRotate&&animateMotion&&inView&&!document.hidden;if(!document.hidden)invalidate();else{cancelAnimationFrame(raf);raf=0;}};document.addEventListener('visibilitychange',onVisibility);
    let pointerStart={x:0,y:0},wasDrag=false;
    const pointerDown=(e:PointerEvent)=>{pointerStart={x:e.clientX,y:e.clientY};wasDrag=false;};
    const pointerMove=(e:PointerEvent)=>{if(Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>5)wasDrag=true;};
    const click=(e:MouseEvent)=>{
      if(wasDrag)return;const rect=canvas.getBoundingClientRect();
      const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);
      const hits=ray.intersectObjects([planet,landmarks],true);if(!hits.length||hits[0].object===planet)return;
      let object:THREE.Object3D|null=hits[0].object;while(object&&!object.userData.placeId)object=object.parent;
      const p=object?globePlaceById.get(object.userData.placeId):null;if(p)current.current.onSelect(p);
    };
    const key=(e:KeyboardEvent)=>{
      const spherical=new THREE.Spherical().setFromVector3(camera.position);let handled=true;
      if(e.key==='ArrowLeft')spherical.theta-=.15;else if(e.key==='ArrowRight')spherical.theta+=.15;else if(e.key==='ArrowUp')spherical.phi=Math.max(.12,spherical.phi-.12);else if(e.key==='ArrowDown')spherical.phi=Math.min(Math.PI-.12,spherical.phi+.12);else if(e.key==='+'||e.key==='=')spherical.radius=Math.max(4.25*layoutScale,spherical.radius-.6*layoutScale);else if(e.key==='-')spherical.radius=Math.min(8.6*layoutScale,spherical.radius+.6*layoutScale);else handled=false;
      if(handled){e.preventDefault();transition=null;camera.position.setFromSpherical(spherical);controls.update();reportZoom();invalidate();}
      if(e.key==='0'||e.key==='Home'){e.preventDefault();engine.current?.focus(regionViews.all);}
    };
    const lost=(e:Event)=>{e.preventDefault();setFailed(true);};
    canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('click',click);canvas.addEventListener('keydown',key);canvas.addEventListener('webglcontextlost',lost);
    engine.current={
      focus(p){const to=new THREE.Vector3(...spherePoint(p,camera.position.length()));if(animateMotion){transition={from:camera.position.clone(),to,start:performance.now()};}else{transition=null;camera.position.copy(to);}controls.update();invalidate();},
      zoom(z){transition=null;camera.position.normalize().multiplyScalar((8.6-(z-1)*1.45)*layoutScale);controls.update();invalidate();},
      invalidate,
      setMotion(value){animateMotion=value;controls.enableDamping=value;controls.autoRotate=autoRotate&&value;if(!value&&transition){camera.position.copy(transition.to);transition=null;}invalidate();},
      setLayers(l){routeGroups.voyage.visible=l.voyage;routeGroups.story.visible=l.story;routeGroups.geography.visible=l.geography;invalidate();},
      select(id){const p=globePlaceById.get(id);if(p){selectedRing.visible=true;selectedRing.position.set(...spherePoint(p,p.region==='sky'?2.77:2.555));selectedRing.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),selectedRing.position.clone().normalize());}else selectedRing.visible=false;invalidate();},
      rotate(value){autoRotate=value;controls.autoRotate=value&&animateMotion;invalidate();}
    };
    engine.current.select(current.current.selected);engine.current.setLayers(current.current.layers);invalidate();setReady(true);
    return ()=>{
      alive=false;cancelAnimationFrame(raf);ro.disconnect();io.disconnect();controls.dispose();document.removeEventListener('visibilitychange',onVisibility);
      canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('click',click);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',lost);
      const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();
      scene.traverse(obj=>{if(obj instanceof THREE.Mesh||obj instanceof THREE.Line){geometries.add(obj.geometry);for(const material of Array.isArray(obj.material)?obj.material:[obj.material]){materials.add(material);Object.values(material).forEach(v=>{if(v instanceof THREE.Texture)textures.add(v);});}}});
      geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();canvas.remove();engine.current=null;
    };
  },[]);
  useEffect(()=>{engine.current?.setMotion(props.motion);},[props.motion]);
  useEffect(()=>engine.current?.setLayers(props.layers),[props.layers]);
  useEffect(()=>engine.current?.select(props.selected),[props.selected]);
  useEffect(()=>engine.current?.zoom(props.zoom),[props.zoom]);
  useEffect(()=>{const p=globePlaceById.get(props.selected);if(p&&props.focusToken)engine.current?.focus(p);},[props.focusToken]);
  useEffect(()=>{if(props.resetToken===0&&props.region==='all'&&props.focusToken>0)return;engine.current?.focus(regionViews[props.region]||regionViews.all);},[props.region,props.resetToken]);
  useEffect(()=>engine.current?.rotate(props.rotating),[props.rotating]);
  return <div className="globe-stage" ref={host} data-testid="earth-globe">
    <div className="globe-ambient-grid" aria-hidden="true"/>
    {globePlaces.filter(p=>p.major||p.id===props.selected).map(p=><button key={p.id} ref={el=>{if(el)labelRefs.current.set(p.id,el);else labelRefs.current.delete(p.id);}} className="globe-place-label" style={{visibility:'hidden'}} onClick={()=>props.onSelect(p)} aria-label={`Select ${p.name}`} aria-pressed={props.selected===p.id}>{p.name.replace('Kingdom of ','')}</button>)}
    {!ready&&!failed?<div className="globe-loading" role="status"><Compass size={32}/><span>Unfolding the world…</span></div>:null}
    {failed?<div className="globe-fallback"><Compass size={38}/><h2>Explore the illustrated chart</h2><p>3D rendering is unavailable in this browser. Every island, route and field note is also available in the flat atlas.</p><button className="button" onClick={props.onFallback}>Open flat atlas</button></div>:null}

  </div>;
}
