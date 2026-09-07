export interface LabelCandidate {id:string;x:number;y:number;width:number;height:number;priority:number}
export interface LabelBox {id:string;left:number;top:number;width:number;height:number}
export function labelsOverlap(a:LabelBox,b:LabelBox,gap=10){return a.left<b.left+b.width+gap&&a.left+a.width+gap>b.left&&a.top<b.top+b.height+gap&&a.top+a.height+gap>b.top;}
/** Place the highest-priority names first, within the canvas and clear of each other. */
export function layoutMapLabels(candidates:LabelCandidate[],width:number,height:number,limit:number):LabelBox[]{
  const result:LabelBox[]=[];
  for(const c of [...candidates].sort((a,b)=>b.priority-a.priority)){
    if(result.length>=limit)break;
    if(c.width>width-24||c.height>height-24)continue;
    const left=Math.max(12,Math.min(width-c.width-12,c.x-c.width/2));
    const top=Math.max(12,Math.min(height-c.height-12,c.y+14));
    const box={id:c.id,left,top,width:c.width,height:c.height};
    if(!result.some(other=>labelsOverlap(box,other)))result.push(box);
  }
  return result;
}
export function mapLabelBudget(width:number,zoom:number){return zoom<1.5?1:width<600?(zoom<2.5?2:3):(zoom<2.5?4:7);}
