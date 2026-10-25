import type { ReaderState, Route, View } from './types';
export const STORAGE_KEY='grand-line-logbook-v1';
const defaults=():ReaderState=>({version:1,saved:[],explored:[],motion:true,spoilerThrough:null,resume:{y:0}});
const strings=(value:unknown):string[]=>Array.isArray(value)?[...new Set(value.filter((x):x is string=>typeof x==='string'))]:[];
export function decodeReader(raw:string|null):ReaderState{
  try{
    const value=JSON.parse(raw||'null');
    if(!value||value.version!==1)return defaults();
    return {version:1,saved:strings(value.saved),explored:strings(value.explored),motion:typeof value.motion==='boolean'?value.motion:true,
      spoilerThrough:value.spoilerThrough == null ? null : typeof value.spoilerThrough==='number' && Number.isSafeInteger(value.spoilerThrough) && value.spoilerThrough>=0 ? value.spoilerThrough : 0,
      resume:{y:typeof value.resume?.y==='number'&&Number.isFinite(value.resume.y)?Math.max(0,value.resume.y):0,
      ...(typeof value.resume?.arcId==='string'?{arcId:value.resume.arcId}:{}),
      ...(typeof value.resume?.beat==='string'?{beat:value.resume.beat}:{})}};
  }catch{return defaults();}
}
export function readReader(storage:Pick<Storage,'getItem'>):ReaderState{try{return decodeReader(storage.getItem(STORAGE_KEY));}catch{return defaults();}}
export function saveReader(storage:Pick<Storage,'setItem'>,state:ReaderState):boolean{try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}}
export function toggleItem(items:string[],id:string):string[]{return items.includes(id)?items.filter(x=>x!==id):[...items,id];}
const views:View[]=['journey','world','search','saved','crew','legal','trails','mysteries','bounties','devil-fruits','poster','catch-up','discover'];
const kinds=['arc','location','character','crew','fruit'] as const;
const isView=(value:string|null|undefined):value is View=>views.includes(value as View);
const isKind=(value:string|null|undefined):value is NonNullable<Route['kind']>=>(kinds as readonly string[]).includes(value as string);
const segment=(value:string)=>{try{return decodeURIComponent(value);}catch{return value;}};
const split=(url:string):[string,URLSearchParams]=>{const at=url.indexOf('?');return [at<0?url:url.slice(0,at),new URLSearchParams(at<0?'':url.slice(at))];};
/** Bare query strings (`?arc=wano`) are the links shared before paths existed; they still decode. */
export function isLegacyUrl(url:string):boolean{
  const [path,params]=split(url);
  return path.split('/').filter(Boolean).length===0&&['view',...kinds].some(k=>params.has(k));
}
/** Takes a path with its query, as `location.pathname + location.search`. */
export function decodeRoute(url:string):Route{
  const [path,params]=split(url);
  const parts=path.split('/').filter(Boolean).map(segment);
  const route:Route={view:'journey'};
  if(parts.length===2&&isKind(parts[0])){
    route.kind=parts[0];route.id=parts[1];
    const from=params.get('view');if(isView(from))route.view=from;
  }else if(parts.length===1&&isView(parts[0])){
    route.view=parts[0];
  }else if(!parts.length){
    const view=params.get('view');if(isView(view))route.view=view;
    for(const kind of kinds){
      if(params.has(kind)){route.kind=kind;route.id=params.get(kind)||'missing';break;}
    }
  }
  if(params.get('beat')&&route.kind==='arc')route.beat=params.get('beat')!;
  const q=params.get('q')?.trim();
  if(q&&route.view==='search')route.q=q.slice(0,80);
  return route;
}
/** Always a full path. Pages end in a slash because the prerendered files are `<path>/index.html`. */
export function encodeRoute(route:Route):string{
  const params=new URLSearchParams();
  let path='/';
  if(route.kind&&route.id){
    path=`/${route.kind}/${encodeURIComponent(route.id)}/`;
    if(route.view!=='journey')params.set('view',route.view);
    if(route.beat&&route.kind==='arc')params.set('beat',route.beat);
  }else if(route.view!=='journey')path=`/${route.view}/`;
  if(route.q&&route.view==='search')params.set('q',route.q);
  return params.size?`${path}?${params}`:path;
}
/** The path form of a legacy link, keeping the atlas's own `mapPlace` parameter. */
export function canonicalUrl(url:string):string{
  const path=encodeRoute(decodeRoute(url));const mapPlace=split(url)[1].get('mapPlace');
  return mapPlace?`${path}${path.includes('?')?'&':'?'}${new URLSearchParams({mapPlace})}`:path;
}
