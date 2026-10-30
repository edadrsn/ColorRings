import {rotationDelta} from './presentation.ts';
import {normalize,type Ring} from './levels.ts';
export type RingDrag={id:number;index:number;previous:number|null;startX:number;startY:number;moved:boolean;pending:number};
export type DragPoint={id:number;x:number;y:number;world:{x:number;y:number}};
/** CSS-pixel threshold; include movement before the threshold and the final up event. */
export function dragDelta(drag:RingDrag,pointer:DragPoint):number{
 if(pointer.id!==drag.id)return 0;
 const {x,y}=pointer.world;
 if(Math.hypot(x-270,y-280)<32){drag.previous=null;drag.pending=0;return 0;}
 const angle=Math.atan2(y-280,x-270)*180/Math.PI;
 if(drag.previous!==null)drag.pending+=rotationDelta(drag.previous,angle);
 drag.previous=angle;
 if(Math.hypot(pointer.x-drag.startX,pointer.y-drag.startY)>5)drag.moved=true;
 if(!drag.moved)return 0;
 const delta=drag.pending;drag.pending=0;return delta;
}
export function nextEditableRing(current:number,count:number,direction:1|-1,allowed:(ring:number)=>boolean){
 for(let step=1;step<=count;step++){const ring=((current+step*direction)%count+count)%count;if(allowed(ring))return ring;}
 return -1;
}
/** Visual wall arcs leave the actual openings empty, including overlapping/wrapped gaps. */
export function wallArcSpans(ring:Pick<Ring,'gaps'>,rotation=0):[number,number][]{
 if(ring.gaps.some(g=>g.size>=360))return [];
 const gaps:[number,number][]=[];
 for(const gap of ring.gaps){if(gap.size<=0)continue;const start=normalize(gap.angle+rotation-gap.size/2),end=start+gap.size;if(end>360)gaps.push([start,360],[0,end-360]);else gaps.push([start,end]);}
 gaps.sort((a,b)=>a[0]-b[0]);let cursor=0;const walls:[number,number][]=[];
 for(const [start,end] of gaps){if(start>cursor)walls.push([cursor,start]);cursor=Math.max(cursor,end);}
 if(cursor<360)walls.push([cursor,360]);return walls;
}
