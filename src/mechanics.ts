import {BOARD,radians,type Level,type Vec} from './levels.ts';
import type {Segment} from './physics.ts';
export function mechanicPoint(point:Vec,ring:number|undefined,angles:readonly number[]):Vec{
  if(ring===undefined)return {...point};const a=radians(angles[ring]),x=point.x-BOARD.center.x,y=point.y-BOARD.center.y;
  return {x:BOARD.center.x+x*Math.cos(a)-y*Math.sin(a),y:BOARD.center.y+x*Math.sin(a)+y*Math.cos(a)};
}
export function passageSegments(level:Level,angles:readonly number[],unlocked:ReadonlySet<string>):Segment[]{
  const list:Segment[]=[];
  const add=(index:number,gapIndex:number,oneWay?:'outward'|'inward')=>{
    const ring=level.rings[index],gap=ring.gaps[gapIndex];if(!gap)return;
    const steps=Math.ceil(gap.size/2);
    const point=(a:number)=>({x:270+Math.cos(radians(a+angles[index]))*ring.radius,y:280+Math.sin(radians(a+angles[index]))*ring.radius});
    for(let i=0;i<steps;i++)list.push({a:point(gap.angle-gap.size/2+i*gap.size/steps),b:point(gap.angle-gap.size/2+(i+1)*gap.size/steps),radius:ring.width/2,ring:index,oneWay});
  };
  for(const lock of level.locks??[])if(lock.kind==='gate'&&!unlocked.has(lock.id))add(lock.ring,lock.gap??0);
  for(const gate of level.oneWays??[])add(gate.ring,gate.gap,gate.direction);
  return list;
}
export function movingSegments(level:Level,time:number):Segment[]{
  return (level.obstacles??[]).map(obstacle=>{
    const a=2*Math.PI*(time/obstacle.period+obstacle.phase),offset=Math.sin(a)*obstacle.amplitude,speed=Math.cos(a)*obstacle.amplitude*2*Math.PI/obstacle.period;
    const point={x:obstacle.x+(obstacle.axis==='x'?offset:0),y:obstacle.y+(obstacle.axis==='y'?offset:0)};
    return {a:point,b:point,radius:obstacle.radius,ring:-2,velocity:{x:obstacle.axis==='x'?speed:0,y:obstacle.axis==='y'?speed:0}};
  });
}
export const hasTimeTravelMechanics=(level:Level)=>!!(level.keys?.length||level.locks?.length||level.colorGates?.length||level.obstacles?.length||level.splitters?.length);
