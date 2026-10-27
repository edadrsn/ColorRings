import type {Level} from './levels.ts';
import {BALL_RADIUS,type BallState} from './physics.ts';
/** Conservative presentation-only check. Suppress the cue whenever any remaining
 * wall, splitter, moving obstacle, ball or delivery-order rule could interfere. */
export function reliableCupIndex(level:Level,states:readonly BallState[],index:number,delivered:number):number{
 const ball=states[index];if(!ball||ball.done||ball.vy<=0)return -1;
 const next=level.rules?.deliveryOrder?.[delivered];if(next&&next!==ball.color)return -1;
 const cupIndex=level.cups.findIndex(c=>c.color===ball.color),cup=level.cups[cupIndex];if(!cup)return -1;
 const distance=cup.y-BALL_RADIUS-ball.y;if(distance<=0||distance>55)return -1;
 for(const ring of level.rings){let outside=ring.radius+ring.width/2;for(const wall of ring.baffles??[])if(wall.side==='outward')outside=Math.max(outside,ring.radius+wall.length+(wall.width??ring.width)/2);if(ball.y<=280+outside+BALL_RADIUS)return -1;}
 const t=(-ball.vy+Math.sqrt(ball.vy*ball.vy+2*650*distance))/650,x=ball.x+ball.vx*t;
 const margin=cup.width/2-BALL_RADIUS-5;if(Math.abs(ball.x-cup.x)>=margin||Math.abs(x-cup.x)>=margin)return -1;
 const left=Math.min(x,ball.x)-BALL_RADIUS,right=Math.max(x,ball.x)+BALL_RADIUS,bottom=cup.y;
 const overlaps=(x1:number,x2:number,y1:number,y2:number)=>x2>=left&&x1<=right&&y2>=ball.y-BALL_RADIUS&&y1<=bottom;
 for(const w of level.dividers??[])if(overlaps(Math.min(w.a.x,w.b.x)-w.radius,Math.max(w.a.x,w.b.x)+w.radius,Math.min(w.a.y,w.b.y)-w.radius,Math.max(w.a.y,w.b.y)+w.radius))return -1;
 // Legacy central dividers stop at y652, and remain far from the cup interiors.
 if(!level.dividers&&ball.y<652+BALL_RADIUS&&left<302&&right>238)return -1;
 for(const o of level.obstacles??[])if(overlaps(o.x-(o.axis==='x'?o.amplitude:0)-o.radius,o.x+(o.axis==='x'?o.amplitude:0)+o.radius,o.y-(o.axis==='y'?o.amplitude:0)-o.radius,o.y+(o.axis==='y'?o.amplitude:0)+o.radius))return -1;
 for(const s of level.splitters??[])if(overlaps(s.x-s.radius-BALL_RADIUS,s.x+s.radius+BALL_RADIUS,s.y-s.radius-BALL_RADIUS,s.y+s.radius+BALL_RADIUS))return -1;
 for(let i=0;i<states.length;i++){const other=states[i];if(i===index||other.done)continue;const dx=Math.abs(other.vx)*t+BALL_RADIUS,dy=Math.abs(other.vy)*t+325*t*t+BALL_RADIUS;if(overlaps(other.x-dx,other.x+dx,other.y-dy,other.y+dy))return -1;}
 return cupIndex;
}
