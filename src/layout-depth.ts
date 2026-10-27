import type {Level} from './levels.ts';

/** Insert a real colliding layer and remap every mechanic/solution ring index. */
export function addMazeLayer(source:Level):Level{
  const l:Level=JSON.parse(JSON.stringify(source));if(l.rings.length>=4)return l;
  let at=1;for(let i=2;i<l.rings.length;i++)if(l.rings[i].radius-l.rings[i-1].radius>l.rings[at].radius-l.rings[at-1].radius)at=i;
  const radius=(l.rings[at-1].radius+l.rings[at].radius)/2;
  const index=(old:number)=>old>=at?old+1:old;
  l.rings.splice(at,0,{radius,width:9,gaps:[{angle:90,size:144}],initial:180,baffles:[{angle:220,length:5,side:'inward',width:7},{angle:315,length:5,side:'outward',width:7}]});
  for(const key of l.keys??[])if(key.ring!==undefined)key.ring=index(key.ring);
  for(const item of [...l.locks??[],...l.colorGates??[],...l.oneWays??[]])item.ring=index(item.ring);
  for(const link of l.links??[]){link.driver=index(link.driver);link.follower=index(link.follower);}
  l.solution.splice(at,0,0);for(const step of l.sequence??[])step.angles.splice(at,0,0);
  if(l.plan){for(const action of l.plan)if(action.ring!==undefined)action.ring=index(action.ring);const play=l.plan.findIndex(action=>action.play);l.plan.splice(play<0?0:play,0,{ring:at,to:0});}
  if(l.ringLimits)l.ringLimits.splice(at,0,2);
  if(l.targetMoves!==undefined)l.targetMoves++;
  if(l.rules?.maxMoves!==undefined)l.rules.maxMoves++;
  l.stars.three++;l.stars.two++;if(l.perfect)l.perfect.moves++;
  return l;
}

export const DEEPER_CLASSIC=[4,6,7,8,12,16,21,23,26,27,29,33,35,36,39];
export const DEEPER_MASTERY=[2,5,8,9,10,12,14,15,16,18,19,20,22,24,25,26,28,31,34,38,40,43,44,58,59,60,61,62,70,71,72,74,79,82,83,84,92];
export function varyMazeDepth(levels:Level[]){
  for(let i=0;i<levels.length;i++){const l=levels[i];if(l.mastery?DEEPER_MASTERY.includes(l.mastery):DEEPER_CLASSIC.includes(l.id))levels[i]=addMazeLayer(l);}
}
