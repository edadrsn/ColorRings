import type {PhysicsWorld} from './physics.ts';
/** Speed changes simulation time, not the fixed 1/120s collision step. */
export function advanceAtRate(world:PhysicsWorld,wallSeconds:number,rate:number){
  if(!Number.isFinite(wallSeconds)||wallSeconds<=0||!Number.isFinite(rate)||rate<=0)return;
  let remaining=Math.min(.1,wallSeconds)*rate;
  while(remaining>1e-10&&!world.finished){const chunk=Math.min(.1,remaining);world.advance(chunk);remaining-=chunk;}
}
export const liveRate=(id:number)=>[.65,.75,.85,.95,1][Math.max(0,Math.min(4,id-1))];
