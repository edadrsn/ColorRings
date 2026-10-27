import {PhysicsWorld,DT} from './physics.ts';
import type {Level,Color,Vec} from './levels.ts';

export const PREVIEW_STEPS=54; // 0.45 seconds, never an entire solution.
export const PREVIEW_DISTANCE=64;
export type MotionPath={color:Color;points:Vec[]};
/** A separate world with the current angles. No live state, save, or solution data is read. */
export function createMotionPreview(level:Level,angles:readonly number[]):MotionPath[]{
  const world=new PhysicsWorld([...angles],level);
  const paths:MotionPath[]=level.balls.map(ball=>({color:ball.color,points:[{x:ball.x,y:ball.y}]}));
  const lengths=paths.map(()=>0);
  for(let step=0;step<PREVIEW_STEPS&&!world.finished;step++){
    world.advance(DT);
    world.states.forEach((state,i)=>{
      if(!paths[i]){paths[i]={color:state.color,points:[{x:world.previous[i].x,y:world.previous[i].y}]};lengths[i]=0;}
      if(lengths[i]>=PREVIEW_DISTANCE)return;
      const last=paths[i].points.at(-1)!,distance=Math.hypot(state.x-last.x,state.y-last.y);
      if(distance<.05)return;
      // Every endpoint is an actual solver position; do not extrapolate through a wall.
      if(lengths[i]+distance>PREVIEW_DISTANCE){lengths[i]=PREVIEW_DISTANCE;return;}
      paths[i].points.push({x:state.x,y:state.y});lengths[i]+=distance;
    });
  }
  return paths;
}
/** Cache unchanged poses and bound recalculation while a ring is being dragged. */
export class MotionPreviewCache {
  private key='';
  private last=-Infinity;
  private paths:MotionPath[]=[];
  private empty:MotionPath[]=[];
  get(level:Level,angles:readonly number[],time:number):MotionPath[]{
    const key=`${level.id}:${angles.join(',')}`;
    if(key!==this.key&&time-this.last>=180){this.paths=createMotionPreview(level,angles);this.key=key;this.last=time;}
    // A throttled old pose must not be mistaken for the current physical path.
    return key===this.key?this.paths:this.empty;
  }
  reset(){this.key='';this.last=-Infinity;this.paths=[];}
}
