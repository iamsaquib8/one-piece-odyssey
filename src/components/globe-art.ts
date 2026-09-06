import * as THREE from 'three';
import {globePlaces} from './globe-model';

export function planetTexture(){
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=768;
  const ctx=canvas.getContext('2d')!;const data=ctx.createImageData(canvas.width,canvas.height);
  for(let y=0;y<768;y++)for(let x=0;x<1536;x++){
    const lat=90-y/768*180,lon=x/1536*360-90;
    const noise=Math.sin(x*.051+Math.sin(y*.026)*4)*Math.cos(y*.06)+Math.sin(x*.19+y*.07)*.35;
    const redDistance=Math.abs(Math.sin((lon-10)*Math.PI/180));
    const red=redDistance<.033+Math.sin(y*.075)*.01+Math.sin(y*.2)*.005;
    const calm=Math.abs(lat)>14&&Math.abs(lat)<21;
    const belt=Math.abs(lat)<14;
    let color=red?[155+noise*16,77+noise*11,48+noise*8]:calm?[12+noise*2,60+noise*4,77+noise*5]:belt?[15+noise*3,117+noise*9,138+noise*9]:[12+noise*3,78+noise*8,112+noise*10];
    if(Math.abs(lat)>74&&!red){color=[57+noise*5,113+noise*7,140+noise*8];}
    const i=(y*1536+x)*4;data.data[i]=color[0];data.data[i+1]=color[1];data.data[i+2]=color[2];data.data[i+3]=255;
  }
  ctx.putImageData(data,0,0);
  // Coast shelves and island terrain belong to the named destinations only.
  for(const p of globePlaces.filter(p=>p.major&&p.region!=='sky')){
    const x=(((p.lon+90)%360+360)%360)/360*1536,y=(90-p.lat)/180*768;
    if(p.kind==='ship'||p.kind==='sea'||p.kind==='boundary')continue;
    const seed=p.id.split('').reduce((n,c)=>n+c.charCodeAt(0),0),r=p.id==='alabasta'||p.id==='wano-country'?13:7;
    for(let layer=2;layer>=0;layer--){ctx.beginPath();for(let i=0;i<20;i++){const a=i/20*Math.PI*2;const radius=(r+layer*3)*(1+Math.sin(i*2.3+seed)*.19);const px=x+Math.cos(a)*radius,py=y+Math.sin(a)*radius*.6;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fillStyle=layer===2?'#168899':layer===1?'#b0ba79':p.id==='alabasta'?'#d4ad68':p.id==='drum-island'?'#d2e5dc':'#61966a';ctx.fill();}
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  return texture;
}

export function createLandmark(id:string,color:string){
  const group=new THREE.Group();group.userData.placeId=id;
  const ink=new THREE.MeshStandardMaterial({color:'#153b37',roughness:.85});
  const materials=new Map<string,THREE.MeshStandardMaterial>();
  function material(c:string){if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.85}));return materials.get(c)!;}
  function box(x:number,y:number,z:number,w:number,h:number,d:number,c:string){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(c));mesh.position.set(x,y+h/2,z);group.add(mesh);return mesh;}
  function cone(x:number,y:number,z:number,r:number,h:number,c:string,sides=6){const mesh=new THREE.Mesh(new THREE.ConeGeometry(r,h,sides),material(c));mesh.position.set(x,y+h/2,z);group.add(mesh);return mesh;}
  function cylinder(x:number,y:number,z:number,r:number,h:number,c:string,top=r,sides=12){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(top,r,h,sides),material(c));mesh.position.set(x,y+h/2,z);group.add(mesh);return mesh;}
  function ball(x:number,y:number,z:number,r:number,c:string){const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(r,1),material(c));mesh.position.set(x,y,z);group.add(mesh);return mesh;}
  function tree(x:number,z:number,h=.11){cylinder(x,.025,z,.008,h*.7,'#826148');cone(x,.025+h*.45,z,.035,h*.6,'#70a16a');}
  function house(x:number,z:number,c='#e9d49f',roof='#ba6750',scale=1){box(x,.032,z,.045*scale,.05*scale,.04*scale,c);cone(x,.032+.05*scale,z,.04*scale,.034*scale,roof,4);box(x,.046,z+.021*scale,.01,.016,.002,'#253f49');}
  const desert=/alabasta|alubarna|rainbase|nanohana/.test(id),snow=/drum|ringo/.test(id),ship=/baratie|thriller-bark/.test(id);
  if(!ship){const base=cylinder(0,0,0,.105,.04,desert?'#cda35f':snow?'#d8ddd0':'#618b55',.084,9);base.rotation.y=.4;}
  if(id==='reverse-mountain'){cone(0,.03,0,.115,.23,'#ac6245',5);cone(-.06,.02,.03,.065,.11,'#cc8154',5);box(0,.055,.052,.017,.15,.01,'#64c9de');}
  else if(id==='water-seven'){cylinder(0,.025,0,.1,.045,'#c6b486');cylinder(0,.07,0,.072,.05,'#e4cca5');cylinder(0,.12,0,.045,.052,'#e4d7b3');cylinder(0,.17,0,.057,.013,'#76c9cf');cylinder(0,.182,0,.02,.025,'#f4dfaa');for(let i=0;i<7;i++){let a=i*Math.PI*2/7;house(Math.cos(a)*.08,Math.sin(a)*.08,'#dfbc85','#c56944',.65);}box(0,.034,.074,.014,.12,.014,'#75d4df');}
  else if(id==='foosha-village'){house(-.043,.027);house(.045,.035,'#e6c79c','#5f7c71',.8);cylinder(0,.03,-.025,.024,.12,'#f1e6b8',.018);cone(0,.15,-.025,.028,.034,'#a75b46',5);const blades=box(0,.11,.002,.095,.008,.007,'#e8d5a1');blades.rotation.z=.6;const blades2=box(0,.07,.002,.008,.09,.007,'#e8d5a1');blades2.rotation.z=.6;tree(-.06,-.04);}
  else if(id==='baratie'){box(0,.005,0,.21,.045,.065,'#90613c');box(0,.05,0,.13,.064,.062,'#c0d3b4');cone(0,.11,0,.074,.026,'#528368',4);ball(-.119,.043,0,.026,'#d3aa57');cone(-.145,.04,0,.02,.04,'#daaf57',4).rotation.z=Math.PI/2;}
  else if(id==='drum-island'){for(let i=0;i<3;i++){cylinder((i-1)*.061,.035,0,.027,.1+i*.025,'#8eabb2',.022,6);cone((i-1)*.061,.13+i*.025,0,.03,.025,'#f3ebdc',6);}house(.03,.015,'#ddd9ce','#816087',.6);}
  else if(desert){for(let i=0;i<6;i++)house(Math.cos(i)*.07,Math.sin(i)*.06,'#d7b57b','#e1c488',.7);box(0,.05,0,.09,.07,.07,'#e5c58c');ball(0,.137,0,.043,'#e7d7a7');cylinder(-.063,.03,0,.015,.13,'#e8cda2');cylinder(.063,.03,0,.015,.13,'#e8cda2');}
  else if(/sabaody/.test(id)){[-.055,0,.055].forEach((x,i)=>{cylinder(x,.03,0,.014,.15+i*.02,'#896849',.011);ball(x,.2+i*.02,0,.055,'#629965');});}
  else if(id==='fish-man-island'){for(let i=0;i<5;i++)house(Math.cos(i)*.05,Math.sin(i)*.04,'#e4adc4','#5cacc0',.65);const bubble=new THREE.Mesh(new THREE.SphereGeometry(.135,24,16),new THREE.MeshPhysicalMaterial({color:'#81d9df',transparent:true,opacity:.28,roughness:.08,metalness:.3,side:THREE.DoubleSide,depthWrite:false}));bubble.position.y=.09;group.add(bubble);}
  else if(id==='whole-cake-island'){cylinder(0,.035,0,.088,.065,'#e8a5b2');cylinder(0,.1,0,.065,.06,'#edd4a1');cylinder(0,.16,0,.041,.05,'#db7898');cylinder(0,.21,0,.025,.02,'#f5ddc0');cone(0,.23,0,.012,.04,'#f5c960');}
  else if(/wano|onigashima/.test(id)){if(id==='onigashima'){ball(0,.08,0,.075,'#ab9c86');cone(-.065,.1,0,.022,.12,'#c6bda5').rotation.z=.5;cone(.065,.1,0,.022,.12,'#c6bda5').rotation.z=-.5;}else{for(let i=0;i<3;i++){box(0,.04+i*.043,0,.09-i*.02,.04,.065-i*.013,'#e2cfa7');cone(0,.08+i*.043,0,.075-i*.014,.025,'#686889',4);}ball(-.072,.083,.035,.042,'#d9a0b4');ball(.067,.09,-.025,.042,'#d18fa6');}}
  else if(id==='egghead'){const dome=ball(0,.088,0,.085,'#acd8d9');dome.scale.y=1.25;const ring=new THREE.Mesh(new THREE.TorusGeometry(.112,.006,5,40),material('#e8c879'));ring.rotation.x=1.3;ring.position.y=.11;group.add(ring);box(.035,.18,0,.008,.04,.008,'#db655a');}
  else if(id==='zou'){box(0,.036,0,.08,.075,.06,'#8b9691');box(-.052,.04,.015,.025,.095,.029,'#9caaa2');box(-.065,.023,.04,.017,.075,.015,'#9caaa2');ball(0,.137,0,.068,'#579064');house(.01,.006,'#dbba88','#867c56',.55);}
  else if(/elbaf|upper-yard|little-garden/.test(id)){tree(-.053,.025,.17);tree(.05,.045,.18);cylinder(0,.03,-.02,.028,id==='elbaf'?.25:.15,'#866448');ball(0,id==='elbaf'?.3:.2,-.02,.09,'#689269');if(id==='little-garden')cone(.02,.03,-.03,.07,.16,'#8b7853');else house(0,.05,'#d3b08a','#8c664f',.65);}
  else if(id==='punk-hazard'){cone(-.042,.035,0,.063,.145,'#aedbd9');cone(.042,.035,0,.065,.15,'#b96544');cone(.042,.14,0,.021,.07,'#f4a641');}
  else if(id==='thriller-bark'){cylinder(0,.01,0,.11,.046,'#604c49',.1,12);for(let i=0;i<3;i++){box((i-1)*.052,.05,0,.028,.08+i*.015,.034,'#736276');cone((i-1)*.052,.13+i*.015,0,.029,.07,'#283a4f');}}
  else if(id==='impel-down'){for(let i=0;i<3;i++)cylinder(0,.025+i*.04,0,.08-i*.015,.04,'#99a3a5',.08-i*.015,8);cone(0,.145,0,.057,.06,'#526c78',8);}
  else if(/marineford|enies-lobby|mary-geoise/.test(id)){box(0,.03,0,.115,.08,.07,'#d9d8c6');for(let i=0;i<3;i++){box((i-1)*.048,.07,-.015,.025,.08,.028,'#e6dcc4');cone((i-1)*.048,.15,-.015,.024,.04,'#56788c',4);}if(id==='marineford'){const wall=new THREE.Mesh(new THREE.TorusGeometry(.105,.012,4,20,Math.PI*1.4),material('#c7ccb7'));wall.rotation.x=Math.PI/2;wall.position.y=.04;group.add(wall);}}
  else if(/angel-island|white-sea/.test(id)){for(let i=0;i<4;i++)ball((i-1.5)*.04,.034,0,.045,'#e6e5d2');cone(0,.07,0,.03,.14,'#e0cc96',5);}
  else if(id==='dressrosa'){cylinder(0,.03,0,.065,.13,'#c19d80',.075,7);house(0,0,'#dfcfa7','#b77488');cone(0,.16,0,.045,.1,'#e7cfb2',6);}
  else if(id==='whisky-peak'){[-.05,0,.05].forEach((x,i)=>cylinder(x,.02,0,.026,.11+i*.015,'#789174',.02,6));}
  else{for(let i=0;i<3;i++)house((i-1)*.05,(i%2)*.04,'#e1c8a0',color,.8);tree(-.055,-.03);tree(.049,-.042);}
  ink.dispose();
  return group;
}
