import { BOARD, LEVEL, normalize, type Level, type Vec } from './levels.ts';
export function pickRing(point: Vec, level: Level): number {
  const distance = Math.hypot(point.x-BOARD.center.x, point.y-BOARD.center.y);
  let selected = -1, best = 35;
  level.rings.forEach((ring,index) => { const difference = Math.abs(distance-ring.radius); if(difference<best){best=difference;selected=index;} });
  return selected;
}
export function rotationDelta(previous: number, current: number): number { return ((current-previous+540)%360)-180; }
/** Interpolate across 0° on the shortest arc, using the same clock as the balls. */
export function interpolateRotation(previous:number,current:number,alpha:number):number {
  return normalize(previous+rotationDelta(previous,current)*Math.max(0,Math.min(1,alpha)));
}
export class DeliveryCombo {
  private last=-Infinity;
  private count=0;
  reset(){this.last=-Infinity;this.count=0;}
  deliver(time:number,correct:boolean):number {
    if(!correct){this.reset();return 0;}
    this.count=time-this.last<=2.8?this.count+1:1;this.last=time;return this.count;
  }
}
export function snapRotation(angle: number,step=15): number { return normalize(Math.round(angle/step)*step); }
export function starRating(moves: number, thresholds:Level['stars']=LEVEL.stars): number { return moves <= thresholds.three ? 3 : moves <= thresholds.two ? 2 : 1; }
