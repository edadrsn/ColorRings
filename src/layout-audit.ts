import type {Level,Ring} from './levels.ts';
export const AUDIT_SECTORS=36;
export const MIN_MAZE_DISTANCE=.14;
const norm=(a:number)=>(a%360+360)%360;
const distance=(a:number,b:number)=>Math.abs(((a-b+540)%360)-180);
export function ringMask(ring:Ring):number[]{
  const mask:number[]=Array.from({length:AUDIT_SECTORS},(_,i)=>ring.gaps.some(g=>distance(i*10+5,g.angle)<g.size/2)?0:1);
  for(const b of ring.baffles??[]){if(ring.gaps.some(g=>distance(b.angle,g.angle)<g.size/2))continue;for(let i=0;i<AUDIT_SECTORS;i++){if(distance(i*10+5,b.angle)>5+1e-8||mask[i]===0)continue;const value=(b.side==='inward'?2:4)+(b.length>=12?1:0);mask[i]=mask[i]>1?6:value;}}
  return mask;
}
function rotations(mask:number[]){const result:string[]=[];for(const values of [mask,[...mask].reverse()])for(let i=0;i<mask.length;i++)result.push([...values.slice(i),...values.slice(0,i)].join(''));return result;}
export function canonicalRing(r:Ring):string{return rotations(ringMask(r)).sort()[0];}
function partitions(l:Level):string{
  const walls=l.dividers??[{a:{x:270,y:290},b:{x:270,y:517},radius:4},{a:{x:270,y:517},b:{x:242,y:652},radius:4},{a:{x:270,y:517},b:{x:298,y:652},radius:4}];
  return [false,true].map(flip=>JSON.stringify(walls.map(w=>[w.a,w.b].map(p=>[Math.round((flip?540-p.x:p.x)/20),Math.round(p.y/20)]).sort()).sort())).sort()[0];
}
export type MazeProfile={rings:string[];partitions:string;fingerprint:string};
export function mazeProfile(level:Level):MazeProfile{const rings=level.rings.map(canonicalRing),fixed=partitions(level);return {rings,partitions:fixed,fingerprint:JSON.stringify([rings,fixed])};}
const cache=new Map<string,number>();
function cellCost(a:number,b:number):number{if(a===b)return 0;if(!a||!b)return 1;if(a===1||b===1)return .85;return Math.floor(a/2)===Math.floor(b/2)?.35:1;}
function ringDistance(a:string,b:string){if(a===b)return 0;const key=a<b?a+'|'+b:b+'|'+a;if(cache.has(key))return cache.get(key)!;let best=Infinity;
  const aa=Array.from(a,c=>Number(c)),bb=Array.from(b,c=>Number(c));
  for(const values of [bb,[...bb].reverse()])for(let offset=0;offset<AUDIT_SECTORS;offset++){let cost=0;for(let i=0;i<AUDIT_SECTORS;i++){cost+=cellCost(aa[i],values[(i+offset)%AUDIT_SECTORS]);if(cost>=best)break;}if(cost<best)best=cost;}
  const result=best/AUDIT_SECTORS;if(cache.size>50000)cache.clear();cache.set(key,result);return result;
}
/** Invariant to independent ring rotation/reflection; ignores names, IDs, skins,
 * starting rotations, colors, rewards, tiny wall widths and radius differences. */
export function mazeDistance(a:MazeProfile,b:MazeProfile):number{if(a.rings.length!==b.rings.length)return 1;const rings=a.rings.reduce((n,r,i)=>n+ringDistance(r,b.rings[i]),0)/a.rings.length;return a.partitions===b.partitions?rings:.2+.8*rings;}
export function auditLayouts(levels:Level[]){const profiles=levels.map(mazeProfile),nearest=levels.map(()=>({index:-1,distance:Infinity})),pairs:{a:number;b:number;distance:number}[]=[];
  for(let i=0;i<levels.length;i++)for(let j=i+1;j<levels.length;j++){const distance=mazeDistance(profiles[i],profiles[j]);if(distance<nearest[i].distance)nearest[i]={index:j,distance};if(distance<nearest[j].distance)nearest[j]={index:i,distance};if(distance<MIN_MAZE_DISTANCE-1e-9)pairs.push({a:i,b:j,distance});}
  return {profiles,nearest,pairs,exactDuplicates:profiles.length-new Set(profiles.map(p=>p.fingerprint)).size};
}
