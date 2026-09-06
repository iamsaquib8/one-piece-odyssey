import type { ReaderState, Route, View } from './types';
export const STORAGE_KEY='grand-line-logbook-v1';
const defaults=():ReaderState=>({version:1,saved:[],explored:[],motion:true,resume:{y:0}});
const strings=(value:unknown):string[]=>Array.isArray(value)?[...new Set(value.filter((x):x is string=>typeof x==='string'))]:[];
export function decodeReader(raw:string|null):ReaderState{
  try{
    const value=JSON.parse(raw||'null');
    if(!value||value.version!==1)return defaults();
    return {version:1,saved:strings(value.saved),explored:strings(value.explored),motion:typeof value.motion==='boolean'?value.motion:true,
      resume:{y:typeof value.resume?.y==='number'&&Number.isFinite(value.resume.y)?Math.max(0,value.resume.y):0,
      ...(typeof value.resume?.arcId==='string'?{arcId:value.resume.arcId}:{}),
      ...(typeof value.resume?.beat==='string'?{beat:value.resume.beat}:{})}};
  }catch{return defaults();}
}
export function readReader(storage:Pick<Storage,'getItem'>):ReaderState{try{return decodeReader(storage.getItem(STORAGE_KEY));}catch{return defaults();}}
export function saveReader(storage:Pick<Storage,'setItem'>,state:ReaderState):boolean{try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}}
export function toggleItem(items:string[],id:string):string[]{return items.includes(id)?items.filter(x=>x!==id):[...items,id];}
const views:View[]=['journey','world','search','saved','crew','legal'];
export function decodeRoute(search:string):Route{
  const params=new URLSearchParams(search); const view=params.get('view') as View;
  const route:Route={view:views.includes(view)?view:'journey'};
  for(const kind of ['arc','location','character','crew'] as const){
    if(params.has(kind)){route.kind=kind;route.id=params.get(kind)||'missing';break;}
  }
  if(params.get('beat')&&route.kind==='arc')route.beat=params.get('beat')!;
  const q=params.get('q')?.trim();
  if(q&&route.view==='search')route.q=q.slice(0,80);
  return route;
}
export function encodeRoute(route:Route):string{
  const params=new URLSearchParams();
  if(route.view!=='journey')params.set('view',route.view);
  if(route.kind&&route.id)params.set(route.kind,route.id);
  if(route.beat&&route.kind==='arc')params.set('beat',route.beat);
  if(route.q&&route.view==='search')params.set('q',route.q);
  return params.size?`?${params}`:'';
}
