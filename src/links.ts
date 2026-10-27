import {normalize,type Level} from './levels.ts';
import {rotationDelta} from './presentation.ts';
/** Linked displacement is evaluated from the gesture start, never accumulated per event. */
export function linkedAngles(level:Level,start:readonly number[],ring:number,to:number,current:readonly number[]=start):number[]{
  const result=[...current],deltas=new Map<number,number>([[ring,rotationDelta(start[ring],to)]]),queue=[ring],seen=new Set<number>();
  result[ring]=normalize(to);
  while(queue.length){const driver=queue.shift()!;if(seen.has(driver))continue;seen.add(driver);
    for(const link of level.links??[])if(link.driver===driver&&!seen.has(link.follower)){const delta=deltas.get(driver)!*link.ratio;deltas.set(link.follower,delta);result[link.follower]=normalize(start[link.follower]+delta);queue.push(link.follower);}
  }
  return result;
}
