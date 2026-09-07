import {atlasPlaces} from './atlas-model';
export interface GeoPoint{lat:number;lon:number}
// Display coordinates only. Geography is deliberately schematic and is not a canon coordinate dataset.
const main:Record<string,[number,number]>={
  'foosha-village':[44,-139],'shells-town':[32,-117],'orange-town':[50,-109],
  'syrup-village':[39,-92],'baratie':[21,-108],'cocoyasi-village':[29,-145],'loguetown':[18,-164],
  'reverse-mountain':[0,-170],'twin-cape':[-4,-164],'whisky-peak':[7,-147],
  'little-garden':[-8,-136],'drum-island':[7,-120],'alabasta':[-7,-107],
  'jaya':[6,-90],'white-sea':[31,-88],'angel-island':[40,-74],'upper-yard':[30,-59],
  'long-ring-long-land':[-7,-74],'water-seven':[7,-55],'enies-lobby':[-7,-36],
  'florian-triangle':[-13,-53],'thriller-bark':[-8,-15],'sabaody-archipelago':[7,-8],
  'amazon-lily':[-24,-44],'impel-down':[-22,-13],'marineford':[-4,0],
  'fish-man-island':[-8,10],'mary-geoise':[7,10],
  'punk-hazard':[7,31],'dressrosa':[-7,52],'zou':[8,75],'whole-cake-island':[-8,94],
  'wano-country':[7,114],'egghead':[-6,138],'elbaf':[9,157],
};
// God Valley's exact position is unrevealed: keep its field notes in the list, off the globe.
export const globePlaces=atlasPlaces.filter(p=>p.id!=='god-valley').map(p=>{
  const parent=main[p.parentId];
  const [lat,lon]=main[p.id]||(parent?[parent[0]+(p.y-(atlasPlaces.find(a=>a.id===p.parentId)?.y||p.y))*.025,parent[1]+(p.x-(atlasPlaces.find(a=>a.id===p.parentId)?.x||p.x))*.04]:[0,0]);
  return {...p,lat,lon};
});
export const globePlaceById=new Map(globePlaces.map(p=>[p.id,p]));
export function spherePoint({lat,lon}:GeoPoint,radius=2.5):[number,number,number]{
  const a=lat*Math.PI/180,b=lon*Math.PI/180;
  return [radius*Math.cos(a)*Math.sin(b),radius*Math.sin(a),radius*Math.cos(a)*Math.cos(b)];
}
export const regionViews:Record<string,GeoPoint>={all:{lat:23,lon:-28},'east-blue':{lat:34,lon:-127},paradise:{lat:19,lon:-74},'new-world':{lat:18,lon:95},sky:{lat:40,lon:-74}};
