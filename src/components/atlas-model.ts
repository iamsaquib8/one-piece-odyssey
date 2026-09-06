import { locations } from '../data/locations';
import { arcSummaries } from '../data/arc-index';
export const ATLAS_WIDTH=2400;
export const ATLAS_HEIGHT=1400;
export interface Camera {x:number;y:number;zoom:number}
export const HOME_CAMERA:Camera={x:1200,y:700,zoom:1};
export function clampCamera(camera:Camera):Camera {
  const zoom=Math.min(4,Math.max(1,Number.isFinite(camera.zoom)?camera.zoom:1));
  const halfW=ATLAS_WIDTH/zoom/2,halfH=ATLAS_HEIGHT/zoom/2;
  return {zoom,x:Math.max(halfW,Math.min(ATLAS_WIDTH-halfW,Number.isFinite(camera.x)?camera.x:1200)),y:Math.max(halfH,Math.min(ATLAS_HEIGHT-halfH,Number.isFinite(camera.y)?camera.y:700))};
}
export function zoomAt(camera:Camera,zoom:number,point:{x:number;y:number}):Camera{
  const nextZoom=Math.min(4,Math.max(1,zoom));
  const ratio=camera.zoom/nextZoom;
  return clampCamera({zoom:nextZoom,x:point.x+(camera.x-point.x)*ratio,y:point.y+(camera.y-point.y)*ratio});
}
// Art-directed chart coordinates. These are neither distances nor canonical coordinates.
// Grand Line is unwrapped; the two visible Red Line crossings belong to one continent.
const anchors:Record<string,[number,number]>={
  'foosha-village':[130,800],'shells-town':[320,650],'orange-town':[175,515],
  'syrup-village':[405,420],'baratie':[350,910],'cocoyasi-village':[175,1095],
  'loguetown':[440,1120],'reverse-mountain':[600,730],'twin-cape':[680,820],
  'whisky-peak':[765,650],'little-garden':[850,850],'drum-island':[950,620],
  'alabasta':[1080,860],'jaya':[1125,625],'white-sea':[1050,300],'angel-island':[1200,200],
  'upper-yard':[1335,330],'long-ring-long-land':[1240,775],'water-seven':[1355,570],
  'enies-lobby':[1475,775],'florian-triangle':[1350,935],'thriller-bark':[1500,970],
  'sabaody-archipelago':[1600,595],'amazon-lily':[1480,1160],'impel-down':[1640,1110],
  'marineford':[1670,855],'fish-man-island':[1780,910],'mary-geoise':[1775,490],
  'punk-hazard':[1920,665],'dressrosa':[2075,550],'zou':[1950,870],
  'whole-cake-island':[2140,890],'wano-country':[2290,705],
  'egghead':[2220,420],'elbaf':[2280,220],
};
const parents:Record<string,string>={
  'mount-colubo':'foosha-village','gray-terminal':'foosha-village','going-merry':'syrup-village',
  'island-of-rare-animals':'orange-town','arlong-park':'cocoyasi-village','drum-castle':'drum-island',
  'nanohana':'alabasta','yuba-desert':'alabasta','rainbase':'alabasta','alubarna':'alabasta','royal-tomb-alabasta':'alabasta',
  'mock-town':'jaya','shandora':'upper-yard','giant-jack':'upper-yard','galley-la-headquarters':'water-seven','sea-train':'water-seven','thousand-sunny':'water-seven',
  'tower-of-justice':'enies-lobby','bridge-of-hesitation':'enies-lobby','hogback-mansion':'thriller-bark',
  'human-auctioning-house':'sabaody-archipelago','rusukaina':'amazon-lily','ryugu-palace':'fish-man-island',
  'green-bit':'dressrosa','cacao-island':'whole-cake-island','mirror-world':'whole-cake-island',
  'flower-capital':'wano-country','udon':'wano-country','ringo':'wano-country','onigashima':'wano-country',
};
const childOffsets:[[number,number],[number,number],[number,number],[number,number],[number,number]]=[[65,70],[-65,95],[70,-55],[-70,-60],[0,140]];
export const atlasPlaces=locations.map(l=>{
  const parentId=parents[l.id];
  const parent=anchors[parentId];
  const siblings=Object.keys(parents).filter(id=>parents[id]===parentId);
  const offset=childOffsets[Math.max(0,siblings.indexOf(l.id))%childOffsets.length];
  const [x,y]=anchors[l.id]||(parent?[Math.min(2340,parent[0]+offset[0]),parent[1]+offset[1]]:[l.map.x*24,l.map.y*14]);
  return {...l,x,y,major:!!anchors[l.id],parentId};
});
export type AtlasPlace=typeof atlasPlaces[number];
export const placeById=new Map(atlasPlaces.map(p=>[p.id,p]));
export const voyageStops=arcSummaries.map(arc=>({arc,place:placeById.get(arc.locationIds[0])!})).filter(s=>s.place);
export const regionCameras=[
  {id:'all',label:'All seas',camera:HOME_CAMERA},
  {id:'east-blue',label:'East Blue',camera:{x:400,y:800,zoom:2.8}},
  {id:'paradise',label:'Paradise',camera:{x:1150,y:740,zoom:2}},
  {id:'new-world',label:'New World',camera:{x:2100,y:650,zoom:2.5}},
  {id:'sky',label:'Sky islands',camera:{x:1170,y:300,zoom:3}},
] as const;
